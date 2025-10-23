import * as vscode from 'vscode';
import { scanDocument } from './diagnostics';
import { registerHoverProvider } from './hover-provider';
import { scanDocxHipaaCommand } from './analyzers/docx-hipaa';

export function activate(context: vscode.ExtensionContext) {
  const diagnostics = vscode.languages.createDiagnosticCollection('accessibilityGuardian');
  context.subscriptions.push(diagnostics);

  const scanActive = () => {
    const doc = vscode.window.activeTextEditor?.document;
    if (doc) scanDocument(doc, diagnostics);
  };

  // scan on open/change/save for HTML (MVP scope)
  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(doc => scanDocument(doc, diagnostics)),
    vscode.workspace.onDidChangeTextDocument(e => scanDocument(e.document, diagnostics)),
    vscode.workspace.onDidSaveTextDocument(doc => scanDocument(doc, diagnostics))
  );

  // initial pass
  scanActive();

  // hover tips
  context.subscriptions.push(registerHoverProvider());

  // explicit command
  context.subscriptions.push(
    vscode.commands.registerCommand('accessibilityGuardian.scanActiveFile', scanActive),
    vscode.commands.registerCommand('accessibilityGuardian.scanDocxHipaa', scanDocxHipaaCommand)
  );
}

export function deactivate() {}

