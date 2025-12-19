import * as vscode from 'vscode';
import { scanHtmlHipaa } from './scanners/scanHtmlHipaa';
import { scanWcag } from './scanners/scanWcag';
import { scanGdpr } from './scanners/scanGdpr';
import { Finding } from './types';
import { QuickFixProvider } from './providers/QuickFixProvider';

let diagnosticCollection: vscode.DiagnosticCollection;

export function activate(context: vscode.ExtensionContext) {
    console.log('Accessibility Guardian: Active');

    diagnosticCollection = vscode.languages.createDiagnosticCollection('accessibility-guardian');
    context.subscriptions.push(diagnosticCollection);

    // --- REGISTER QUICK FIX ---
    context.subscriptions.push(
        vscode.languages.registerCodeActionsProvider(
            { language: 'html', scheme: 'file' },
            new QuickFixProvider(),
            { providedCodeActionKinds: [vscode.CodeActionKind.QuickFix] }
        )
    );

    // --- EVENTS ---
    if (vscode.window.activeTextEditor) {
        runScan(vscode.window.activeTextEditor.document);
    }

    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor) runScan(editor.document);
        })
    );

    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(event => {
            if (vscode.window.activeTextEditor && event.document === vscode.window.activeTextEditor.document) {
                runScan(event.document);
            }
        })
    );

    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(event => {
            if (event.affectsConfiguration('accessibilityGuardian')) {
                if (vscode.window.activeTextEditor) {
                    runScan(vscode.window.activeTextEditor.document);
                }
            }
        })
    );
}

function runScan(document: vscode.TextDocument) {
    diagnosticCollection.delete(document.uri);

    if (document.languageId !== 'html') return;

    const config = vscode.workspace.getConfiguration('accessibilityGuardian');
    const enableHipaa = config.get<boolean>('enableHipaa');
    const enableWcag = config.get<boolean>('enableWcag');
    const enableGdpr = config.get<boolean>('enableGdpr');

    const text = document.getText();
    const allFindings: Finding[] = [];

    if (enableHipaa) allFindings.push(...scanHtmlHipaa(text));
    if (enableWcag) allFindings.push(...scanWcag(text));
    if (enableGdpr) allFindings.push(...scanGdpr(text));

    const diagnostics = allFindings.map(finding => {
        const startPos = document.positionAt(finding.start);
        const endPos = document.positionAt(finding.end);
        
        const diagnostic = new vscode.Diagnostic(
            new vscode.Range(startPos, endPos),
            finding.message,
            mapSeverity(finding.severity)
        );
        diagnostic.code = finding.code;
        diagnostic.source = 'Accessibility Guardian';
        return diagnostic;
    });

    diagnosticCollection.set(document.uri, diagnostics);
}

function mapSeverity(severity: string): vscode.DiagnosticSeverity {
    switch (severity) {
        case 'error': return vscode.DiagnosticSeverity.Error;
        case 'warn': return vscode.DiagnosticSeverity.Warning;
        case 'info': return vscode.DiagnosticSeverity.Information;
        default: return vscode.DiagnosticSeverity.Information;
    }
}

export function deactivate() {}
