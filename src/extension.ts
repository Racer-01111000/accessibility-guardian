// Accessibility Guardian — Proprietary Evaluation License (30 Days)
// LicenseRef-EVALUATION
// © 2025 Richard Robert Wright — All rights reserved.
import * as vscode from 'vscode';
import { scanDocument } from './diagnostics';
import { registerHoverProvider } from './hover-provider';

import { scanDocxHipaaCommand } from './analyzers/docx-hipaa';
import { scanPdfHipaaCommand } from './analyzers/pdf-hipaa';
import { scanHtmlHipaaCommand } from './analyzers/html-hipaa';
import { scanEmailHipaaCommand } from './analyzers/email-hipaa';

import { scanGdprEuCommand } from './analyzers/gdpr-eu';
import { scanPipedaCaCommand } from './analyzers/pipeda-ca';
import { scanAppAuCommand } from './analyzers/app-au';

export function activate(context: vscode.ExtensionContext) {
  const diagnostics = vscode.languages.createDiagnosticCollection('accessibilityGuardian');
  context.subscriptions.push(diagnostics);

  const scanActive = () => {
    const doc = vscode.window.activeTextEditor?.document;
    if (doc) scanDocument(doc, diagnostics);
  };

  // Run scans for HTML files (MVP scope)
  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(doc => scanDocument(doc, diagnostics)),
    vscode.workspace.onDidChangeTextDocument(e => scanDocument(e.document, diagnostics)),
    vscode.workspace.onDidSaveTextDocument(doc => scanDocument(doc, diagnostics))
  );

  // Initial scan
  scanActive();

  // Hover provider
  context.subscriptions.push(registerHoverProvider());

  // Commands
  context.subscriptions.push(
    vscode.commands.registerCommand('accessibilityGuardian.scanActiveFile', scanActive),
    vscode.commands.registerCommand('accessibilityGuardian.scanDocxHipaa',  scanDocxHipaaCommand),
    vscode.commands.registerCommand('accessibilityGuardian.scanPdfHipaa',   scanPdfHipaaCommand),
    vscode.commands.registerCommand('accessibilityGuardian.scanEmailHipaa', scanEmailHipaaCommand),
    vscode.commands.registerCommand('accessibilityGuardian.scanHtmlHipaa',  scanHtmlHipaaCommand),
    vscode.commands.registerCommand('accessibilityGuardian.scanGdprEu',     scanGdprEuCommand),
    vscode.commands.registerCommand('accessibilityGuardian.scanPipedaCa',   scanPipedaCaCommand),
    vscode.commands.registerCommand('accessibilityGuardian.scanAppAu',      scanAppAuCommand)
  );
}

export function deactivate() {}
