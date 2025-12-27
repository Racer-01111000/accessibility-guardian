import * as vscode from 'vscode';
import { LicenseManager } from './managers/LicenseManager';
import { RuleManager } from './ruleManager';
import { Scanner } from './scanner';
import { ContentExtractor } from './contentExtractor';
import { gdprCrossBorderAnalyzer } from './analyzers/privacy/gdprCrossBorderAnalyzer';
import { Finding, Severity } from './types';

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

export function activate(context: vscode.ExtensionContext) {
    console.log('🔄 Accessibility Guardian: STARTING ACTIVATION...'); // Debug Log

    const outputChannel = vscode.window.createOutputChannel("Accessibility Guardian Report");
    const activationChannel = vscode.window.createOutputChannel("Accessibility Guardian");
    activationChannel.appendLine('Starting activation...');

    try {
        // 1. Setup Managers
        const licenseManager = new LicenseManager(context, {
            resetTrialOnStartup: context.extensionMode === vscode.ExtensionMode.Development
        });
        const status = licenseManager.getStatus();
        if (status.active && status.remainingDays <= 3) {
            vscode.window.showInformationMessage(`Accessibility Guardian Trial: ${status.remainingDays} days remaining.`);
        }
        
        const diagnosticCollection = vscode.languages.createDiagnosticCollection('accessibility-guardian');
        context.subscriptions.push(diagnosticCollection);

        // 2. Register License Command
        console.log('✅ Registering: enterLicense');
        context.subscriptions.push(vscode.commands.registerCommand('accessibilityGuardian.enterLicense', () => {
            licenseManager.promptForLicense();
        }));

        // 3. Register Active Scan
        console.log('✅ Registering: scanActiveFile');
        context.subscriptions.push(vscode.commands.registerCommand('accessibilityGuardian.scanActiveFile', async () => {
            // --- LICENSE CHECK START ---
            const currentStatus = licenseManager.getStatus();
            if (!currentStatus.active) {
                licenseManager.promptForLicense();
                return;
            }
            // --- LICENSE CHECK END ---
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showInformationMessage('No active file to scan.');
                return;
            }
            const ruleManager = new RuleManager();
            const activeRules = await ruleManager.getActiveRules();
            
            vscode.window.setStatusBarMessage('Scanning...', 2000);
            const scanner = new Scanner();
            let diagnostics = scanner.scan(editor.document, activeRules);
            if (activeRules.enableGdpr) {
                const text = editor.document.getText();
                const findings = gdprCrossBorderAnalyzer({
                    htmlText: text,
                    urls: extractUrls(text),
                    policyText: text
                });
                diagnostics.push(...findingsToDiagnostics(findings, editor.document));
            }
            diagnostics = dedupeDiagnostics(diagnostics);

            diagnosticCollection.set(editor.document.uri, diagnostics);

            if (diagnostics.length > 0) {
                vscode.window.showErrorMessage(`Found ${diagnostics.length} compliance issues.`);
            } else {
                vscode.window.showInformationMessage('✅ No issues found!');
            }
        }));

        // 4. Register Deep Scan Workspace (With Progress Bar)
        console.log('✅ Registering: scanWorkspace');
        let deepScanCommand = vscode.commands.registerCommand('accessibilityGuardian.scanWorkspace', async () => {
            // --- LICENSE CHECK START ---
            const currentStatus = licenseManager.getStatus();
            if (!currentStatus.active) {
                licenseManager.promptForLicense();
                return;
            }
            // --- LICENSE CHECK END ---

            const ruleManager = new RuleManager();
            const activeRules = await ruleManager.getActiveRules();
            const scanner = new Scanner();
            const extractor = new ContentExtractor();

            // Find files
            const files = await vscode.workspace.findFiles('**/*.{pdf,docx,html,txt,md}', '**/node_modules/**');
            
            outputChannel.clear();
            outputChannel.show();
            outputChannel.appendLine(`🚀 Starting Enterprise Deep Scan on ${files.length} files...`);

            // SHOW PROGRESS BAR
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Accessibility Guardian: Deep Scan",
                cancellable: true
            }, async (progress, token) => {
                
                let totalIssues = 0;
                const increment = 100 / files.length;

                for (const file of files) {
                    // Allow user to cancel if it takes too long
                    if (token.isCancellationRequested) {
                        outputChannel.appendLine("🛑 Scan Cancelled by user.");
                        break;
                    }

                    const fileName = vscode.workspace.asRelativePath(file);
                    progress.report({ message: `Scanning ${fileName}...`, increment: increment });
                    outputChannel.appendLine(`Scanning: ${fileName}...`);
                    
                    // Extract & Scan
                    try {
                        const textContent = await extractor.extractText(file);
                        const fakeDoc = createTextDocumentFromText(textContent);

                        let issues = scanner.scan(fakeDoc, activeRules);
                        if (activeRules.enableGdpr) {
                            const findings = gdprCrossBorderAnalyzer({
                                htmlText: textContent,
                                urls: extractUrls(textContent),
                                policyText: textContent
                            });
                            issues.push(...findingsToDiagnostics(findings, fakeDoc));
                        }
                        issues = dedupeDiagnostics(issues);

                        if (issues.length > 0) {
                            totalIssues += issues.length;
                            outputChannel.appendLine(`   ❌ Found ${issues.length} issues.`);
                        } else {
                            outputChannel.appendLine(`   ✅ Clean`);
                        }
                    } catch (err) {
                        outputChannel.appendLine(`   ⚠️ Error reading file: ${err}`);
                    }
                    
                    // tiny pause to let the UI breathe
                    await new Promise(r => setTimeout(r, 10)); 
                }

                outputChannel.appendLine(`\n🏁 Scan Complete. Total Issues: ${totalIssues}`);
                vscode.window.showInformationMessage(`Deep Scan Complete: Found ${totalIssues} issues.`);
            });
        });
        context.subscriptions.push(deepScanCommand);
        
        console.log('🚀 Accessibility Guardian: ACTIVATION COMPLETE.');
        activationChannel.appendLine('Activation complete.');
    } catch (err) {
        const message = err instanceof Error ? err.stack || err.message : String(err);
        activationChannel.appendLine(`Activation failed: ${message}`);
        activationChannel.show(true);
        vscode.window.showErrorMessage('Accessibility Guardian failed to activate. Check the output panel for details.');
        throw err;
    }
}

export function deactivate() {}
