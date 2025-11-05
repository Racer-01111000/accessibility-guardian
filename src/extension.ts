import * as vscode from 'vscode';
import { scanDocument } from './diagnostics';
import { registerHoverProvider } from './hover-provider';
import { scanDocxHipaaCommand } from './analyzers/docx-hipaa';
import { scanPdfHipaaCommand } from './analyzers/pdf-hipaa';
import { scanHtmlHipaaCommand } from './analyzers/html-hipaa';
import { scanEmailHipaaCommand } from './analyzers/email-hipaa';
import { scanGdprEuCommand } from './analyzers/gdpr-eu';

export function activate(context: vscode.ExtensionContext) {
  const diagnostics = vscode.languages.createDiagnosticCollection('accessibilityGuardian');
  context.subscriptions.push(diagnostics);

  const scanActive = () => {
    const doc = vscode.window.activeTextEditor?.document;
    if (doc) scanDocument(doc, diagnostics);
  };

  // Run scans on open/change/save for HTML files (MVP scope)
  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(doc => scanDocument(doc, diagnostics)),
    vscode.workspace.onDidChangeTextDocument(e => scanDocument(e.document, diagnostics)),
    vscode.workspace.onDidSaveTextDocument(doc => scanDocument(doc, diagnostics))
  );

  // Initial pass on the current active editor
  scanActive();

  // Hover tips
  context.subscriptions.push(registerHoverProvider());

  // Explicit commands (exactly once each)
  context.subscriptions.push(
    vscode.commands.registerCommand('accessibilityGuardian.scanActiveFile', scanActive),
    vscode.commands.registerCommand('accessibilityGuardian.scanDocxHipaa',  scanDocxHipaaCommand),
    vscode.commands.registerCommand('accessibilityGuardian.scanPdfHipaa',   scanPdfHipaaCommand),
    vscode.commands.registerCommand('accessibilityGuardian.scanEmailHipaa', scanEmailHipaaCommand),
    vscode.commands.registerCommand('accessibilityGuardian.scanHtmlHipaa',  scanHtmlHipaaCommand),
    vscode.commands.registerCommand('accessibilityGuardian.scanGdprEu',     scanGdprEuCommand)
  );
}

export function deactivate() {}

