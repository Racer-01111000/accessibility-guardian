import * as vscode from 'vscode';
import { LicenseManager } from './managers/LicenseManager';
import { RuleManager } from './ruleManager';
import Scanner from './scanner'; 
import { ContentExtractor } from './contentExtractor';
import { gdprCrossBorderAnalyzer } from './analyzers/privacy/gdprCrossBorderAnalyzer';
import { Finding, Severity } from './types';
import { scanDocumentForPHI } from './scanners/phiScanner'; 
import { PHI_PATTERNS } from './analyzers/utils/document-helpers';

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function createTextDocumentFromText(text: string): vscode.TextDocument {
    const lines = text.split(/\r?\n/);
    const lineOffsets: number[] = [];
    let offset = 0;
    for (const line of lines) {
        lineOffsets.push(offset);
        offset += line.length;
        if (offset < text.length) {
            if (text[offset] === '\r' && text[offset + 1] === '\n') {
                offset += 2;
            } else if (text[offset] === '\n') {
                offset += 1;
            }
        }
    }

    return {
        getText: () => text,
        lineCount: lines.length,
        lineAt: (lineNumber: number) => {
            if (lineNumber < 0 || lineNumber >= lines.length) {
                throw new Error(`Line out of range: ${lineNumber}`);
            }
            const lineText = lines[lineNumber];
            const start = new vscode.Position(lineNumber, 0);
            const end = new vscode.Position(lineNumber, lineText.length);
            const range = new vscode.Range(start, end);
            return {
                lineNumber,
                text: lineText,
                range,
                rangeIncludingLineBreak: range,
                firstNonWhitespaceCharacterIndex: lineText.search(/\S|$/),
                isEmptyOrWhitespace: lineText.trim().length === 0
            };
        },
        positionAt: (index: number) => {
            if (index < 0) {
                return new vscode.Position(0, 0);
            }
            let line = 0;
            while (line + 1 < lineOffsets.length && lineOffsets[line + 1] <= index) {
                line += 1;
            }
            const character = Math.max(0, index - lineOffsets[line]);
            return new vscode.Position(line, character);
        }
    } as unknown as vscode.TextDocument;
}

function dedupeDiagnostics(diagnostics: vscode.Diagnostic[]): vscode.Diagnostic[] {
    const seen = new Set<string>();
    const result: vscode.Diagnostic[] = [];

    for (const diagnostic of diagnostics) {
        const range = diagnostic.range;
        const key = [
            diagnostic.code ?? '',
            diagnostic.message,
            diagnostic.severity,
            range.start.line,
            range.start.character,
            range.end.line,
            range.end.character
        ].join('|');

        if (seen.has(key)) {
            continue;
        }
        seen.add(key);
        result.push(diagnostic);
    }

    return result;
}

function extractUrls(text: string): string[] {
    const urls: string[] = [];
    const urlRegex = /\bhttps?:\/\/[^\s"'<>]+/gi;
    let match: RegExpExecArray | null;
    while ((match = urlRegex.exec(text)) !== null) {
        urls.push(match[0]);
    }
    return urls;
}

function severityToDiagnostic(severity: Severity): vscode.DiagnosticSeverity {
    if (severity === 'error') return vscode.DiagnosticSeverity.Error;
    if (severity === 'info') return vscode.DiagnosticSeverity.Information;
    return vscode.DiagnosticSeverity.Warning;
}

function findRangeForFinding(
    document: vscode.TextDocument,
    finding: Finding
): vscode.Range {
    const text = document.getText().toLowerCase();
    const vendors = finding.evidence && Array.isArray(finding.evidence.vendors)
        ? finding.evidence.vendors
        : [];

    for (const vendor of vendors) {
        const needle = String(vendor).toLowerCase();
        const index = text.indexOf(needle);
        if (index >= 0) {
            const start = document.positionAt(index);
            const end = document.positionAt(index + needle.length);
            return new vscode.Range(start, end);
        }
    }

    return new vscode.Range(0, 0, 0, 0);
}

function findingsToDiagnostics(
    findings: Finding[],
    document: vscode.TextDocument
): vscode.Diagnostic[] {
    return findings.map((finding) => {
        const range = findRangeForFinding(document, finding);
        const message = `${finding.title}: ${finding.description}`;
        const diagnostic = new vscode.Diagnostic(
            range,
            message,
            severityToDiagnostic(finding.severity)
        );
        diagnostic.source = 'Accessibility Guardian (GDPR)';
        diagnostic.code = finding.id;
        return diagnostic;
    });
}

function phiTypeToSeverity(type: string): vscode.DiagnosticSeverity {
    const t = type.toLowerCase();
    if (t === 'ssn' || t === 'mrn' || t === 'insurance/member id') return vscode.DiagnosticSeverity.Error;
    if (t === 'dob' || t === 'address' || t === 'diagnosis') return vscode.DiagnosticSeverity.Warning;
    return vscode.DiagnosticSeverity.Information;
}

function phiPatternDiagnostics(text: string, document: vscode.TextDocument): vscode.Diagnostic[] {
    const diagnostics: vscode.Diagnostic[] = [];

    for (const { type, re } of PHI_PATTERNS) {
        re.lastIndex = 0;
        let match: RegExpExecArray | null;

        while ((match = re.exec(text)) !== null) {
            const start = document.positionAt(match.index);
            const end = document.positionAt(match.index + match[0].length);
            const diagnostic = new vscode.Diagnostic(
                new vscode.Range(start, end),
                `${type} detected: ${match[0]}`,
                phiTypeToSeverity(type)
            );
            diagnostic.source = 'Accessibility Guardian (HIPAA)';
            diagnostic.code = `hipaa:${type.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
            diagnostics.push(diagnostic);

            if (match.index === re.lastIndex) {
                re.lastIndex += 1;
            }
        }
    }

    return diagnostics;
}

// =============================================================================
// MAIN ACTIVATE FUNCTION
// =============================================================================

export function activate(context: vscode.ExtensionContext) {
    console.log('🔄 Accessibility Guardian: STARTING ACTIVATION...');

    const outputChannel = vscode.window.createOutputChannel("Accessibility Guardian Report");
    
    // 1. Setup Managers
    const licenseManager = new LicenseManager(context, {
        resetTrialOnStartup: context.extensionMode === vscode.ExtensionMode.Development
    });

    const diagnosticCollection = vscode.languages.createDiagnosticCollection('accessibility-guardian');
    context.subscriptions.push(diagnosticCollection);

    // 2. Register License Command
    console.log('✅ Registering: enterLicense');
    context.subscriptions.push(vscode.commands.registerCommand('accessibilityGuardian.enterLicense', () => {
        licenseManager.promptForLicense();
    }));
    
    if (context.extensionMode !== vscode.ExtensionMode.Production) {
        context.subscriptions.push(vscode.commands.registerCommand('accessibilityGuardian.__test.setTrialStart', (timestamp: number) => {
            return licenseManager.setTrialStart(timestamp);
        }));
    }

    // 3. Register Active Scan Command (Manual Trigger)
    console.log('✅ Registering: scanActiveFile');
    context.subscriptions.push(vscode.commands.registerCommand('accessibilityGuardian.scanActiveFile', async () => {
        // --- LICENSE CHECK REMOVED FOR TESTING ---
        
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No active file to scan.');
            return;
        }
        const ruleManager = new RuleManager();
        const activeRules = await ruleManager.getActiveRules();
        const extractor = new ContentExtractor();

        vscode.window.setStatusBarMessage('Scanning...', 2000);
        const scanner = new Scanner();

        let text = editor.document.getText();
        const ext = editor.document.uri.fsPath.toLowerCase();
        if (ext.endsWith('.pdf') || ext.endsWith('.docx') || ext.endsWith('.eml') || ext.endsWith('.msg') || ext.endsWith('.json') || ext.endsWith('.log')) {
            text = await extractor.extractText(editor.document.uri);
        }

        const workingDoc = createTextDocumentFromText(text);
        let diagnostics = scanner.scan(workingDoc, activeRules);

        if (activeRules.enableHipaa) {
            diagnostics.push(...phiPatternDiagnostics(text, workingDoc));
        }

        if (activeRules.enableGdpr) {
            const findings = gdprCrossBorderAnalyzer({
                htmlText: text,
                urls: extractUrls(text),
                policyText: text
            });
            diagnostics.push(...findingsToDiagnostics(findings, workingDoc));
        }
        diagnostics = dedupeDiagnostics(diagnostics);

        diagnosticCollection.set(editor.document.uri, diagnostics);

        if (diagnostics.length > 0) {
            vscode.window.showErrorMessage(`Found ${diagnostics.length} compliance issues.`);
        } else {
            vscode.window.showInformationMessage('✅ No issues found!');
        }
    }));

    // 4. Register Deep Scan Workspace
    console.log('✅ Registering: scanWorkspace');
    let deepScanCommand = vscode.commands.registerCommand('accessibilityGuardian.scanWorkspace', async () => {
        // --- LICENSE CHECK REMOVED FOR TESTING ---
        
        const ruleManager = new RuleManager();
        const activeRules = await ruleManager.getActiveRules();
        const scanner = new Scanner();
        const extractor = new ContentExtractor();

        const files = await vscode.workspace.findFiles('**/*.{pdf,docx,html,txt,md,eml,msg,log,json}', '**/node_modules/**');
        
        outputChannel.clear();
        outputChannel.show();
        outputChannel.appendLine(`🚀 Starting Enterprise Deep Scan on ${files.length} files...`);

        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Accessibility Guardian: Deep Scan",
            cancellable: true
        }, async (progress, token) => {
            
            let totalIssues = 0;
            const increment = 100 / files.length;

            for (const file of files) {
                if (token.isCancellationRequested) {
                    outputChannel.appendLine("🛑 Scan Cancelled by user.");
                    break;
                }

                const fileName = vscode.workspace.asRelativePath(file);
                progress.report({ message: `Scanning ${fileName}...`, increment: increment });
                outputChannel.appendLine(`Scanning: ${fileName}...`);
                
                try {
                    const textContent = await extractor.extractText(file);
                    const fakeDoc = createTextDocumentFromText(textContent);

                    let issues = scanner.scan(fakeDoc, activeRules);

                    if (activeRules.enableHipaa) {
                        issues.push(...phiPatternDiagnostics(textContent, fakeDoc));
                    }

                    if (activeRules.enableGdpr) {
                        const findings = gdprCrossBorderAnalyzer({
                            htmlText: textContent,
                            urls: extractUrls(textContent),
                            policyText: textContent
                        });
                        issues.push(...findingsToDiagnostics(findings, fakeDoc));
                    }
                    issues = dedupeDiagnostics(issues);
                    diagnosticCollection.set(file, issues);

                    if (issues.length > 0) {
                        totalIssues += issues.length;
                        outputChannel.appendLine(`   ❌ Found ${issues.length} issues.`);
                    } else {
                        outputChannel.appendLine(`   ✅ Clean`);
                    }
                } catch (err) {
                    outputChannel.appendLine(`   ⚠️ Error reading file: ${err}`);
                }
                
                await new Promise(r => setTimeout(r, 10)); 
            }

            outputChannel.appendLine(`\n🏁 Scan Complete. Total Issues: ${totalIssues}`);
            vscode.window.showInformationMessage(`Deep Scan Complete: Found ${totalIssues} issues.`);
        });
    });
    context.subscriptions.push(deepScanCommand);

    // =====================================================================
    // 5. Register Real-Time PHI Scanning
    // =====================================================================
    console.log('✅ Registering: Real-time PHI Scanner');
    
    if (vscode.window.activeTextEditor) {
        scanDocumentForPHI(vscode.window.activeTextEditor);
    }

    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor) {
                scanDocumentForPHI(editor);
            }
        })
    );

    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(event => {
            if (vscode.window.activeTextEditor && 
                event.document === vscode.window.activeTextEditor.document) {
                    scanDocumentForPHI(vscode.window.activeTextEditor);
            }
        })
    );

    // =====================================================================
    // 6. LIABILITY SHIELD: Scan on Save (Manual Only)
    // =====================================================================
    console.log('✅ Registering: Liability Shield (Save Guard)');
    context.subscriptions.push(
        vscode.workspace.onWillSaveTextDocument(event => {
            
            // 🛑 FILTER: Ignore background "Auto-Saves"
            if (event.reason === vscode.TextDocumentSaveReason.AfterDelay || 
                event.reason === vscode.TextDocumentSaveReason.FocusOut) {
                return;
            }

            // ✅ ACTIVE: This block ONLY runs on "Manual" saves.
            const editor = vscode.window.activeTextEditor;
            
            if (editor && event.document === editor.document) {
                const errorCount = scanDocumentForPHI(editor);
                if (errorCount > 0) {
                    // 🚨 LIABILITY WARNING - Forces Modal
                    vscode.window.showWarningMessage(
                        `⚠️ HIPAA COMPLIANCE WARNING: ${errorCount} potential PHI violations detected.`,
                        { 
                            modal: true, 
                            detail: "This document contains HIPAA errors. Do not email or otherwise disseminate it before resolving these errors." 
                        },
                        "I Understand"
                    );
                }
            }
        })
    );

    console.log('🚀 Accessibility Guardian: ACTIVATION COMPLETE.');
}

export function deactivate() {}
