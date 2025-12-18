import * as vscode from 'vscode';
import { scanHtmlHipaa } from './scanners/scanHtmlHipaa'; // Import your scanner
import { Finding } from './types';

let diagnosticCollection: vscode.DiagnosticCollection;

export function activate(context: vscode.ExtensionContext) {
console.log('Accessibility Guardian: Active');

// Initialize the collection
diagnosticCollection = vscode.languages.createDiagnosticCollection('accessibility-guardian');
context.subscriptions.push(diagnosticCollection);

// --- LIVE LISTENER ---
// Trigger on document change (typing)
context.subscriptions.push(
vscode.workspace.onDidChangeTextDocument(event => {
if (vscode.window.activeTextEditor && event.document === vscode.window.activeTextEditor.document) {
runScan(event.document);
}
})
);

// Trigger on file open
if (vscode.window.activeTextEditor) {
runScan(vscode.window.activeTextEditor.document);
}
}

function runScan(document: vscode.TextDocument) {
// 1. Clear old issues
diagnosticCollection.delete(document.uri);

// 2. Filter: Only scan relevant files (e.g., HTML)
// You can expand this list later (jsx, tsx, php, etc.)
if (document.languageId !== 'html') {
return;
}

const text = document.getText();
const diagnostics: vscode.Diagnostic[] = [];

// 3. Run the Engine
const findings = scanHtmlHipaa(text);

// 4. Map Findings to Diagnostics
findings.forEach(finding => {
// CONVERSION MAGIC: Linear Offset -> Line/Col Position
const startPos = document.positionAt(finding.start);
const endPos = document.positionAt(finding.end);

const range = new vscode.Range(startPos, endPos);

const diagnostic = new vscode.Diagnostic(
range,
finding.message,
mapSeverity(finding.severity)
);

diagnostic.code = finding.code;
diagnostic.source = 'Accessibility Guardian';

diagnostics.push(diagnostic);
});

// 5. Update UI
diagnosticCollection.set(document.uri, diagnostics);
}

// Helper to map string severity to VS Code enum
function mapSeverity(severity: string): vscode.DiagnosticSeverity {
switch (severity) {
case 'error': return vscode.DiagnosticSeverity.Error;
case 'warn': return vscode.DiagnosticSeverity.Warning;
case 'info': return vscode.DiagnosticSeverity.Information;
default: return vscode.DiagnosticSeverity.Information;
}
}

export function deactivate() {}
