// Accessibility Guardian — Proprietary Evaluation License (30 Days)
// LicenseRef-EVALUATION
// © 2025 Richard Robert Wright — All rights reserved.

import * as vscode from 'vscode';
import { scanDocument } from './diagnostics';
import { registerHoverProvider } from './hover-provider';

// HIPAA analyzers
import { scanDocxHipaaCommand } from './analyzers/docx-hipaa';
import { scanPdfHipaaCommand } from './analyzers/pdf-hipaa';
import { scanHtmlHipaaCommand } from './analyzers/html-hipaa';
import { scanEmailHipaaCommand } from './analyzers/email-hipaa';

// Privacy analyzers
import { scanGdprEuCommand } from './analyzers/gdpr-eu';
import { scanPipedaCaCommand } from './analyzers/pipeda-ca';
import { scanAppAuCommand } from './analyzers/app-au';

export function activate(context: vscode.ExtensionContext) {
  const diagnostics = vscode.languages.createDiagnosticCollection('accessibilityGuardian');
  context.subscriptions.push(diagnostics);

  const scanActive = () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }
    const doc = editor.document;
    try {
      scanDocument(doc, diagnostics);
    } catch (err) {
      console.error('[AG] scanActive failed:', err);
    }
  };

  const handleDocEvent = (doc: vscode.TextDocument) => {
    // Live pipeline only for HTML / plaintext (HTML emails, templates, etc.)
    if (doc.languageId !== 'html' && doc.languageId !== 'plaintext') {
      return;
    }
    try {
      scanDocument(doc, diagnostics);
    } catch (err) {
      console.error('[AG] diagnostics pipeline failed:', err);
    }
  };

  // Hook document lifecycle
  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(handleDocEvent),
    vscode.workspace.onDidChangeTextDocument(e => handleDocEvent(e.document)),
    vscode.workspace.onDidSaveTextDocument(handleDocEvent)
  );

  // Initial scan on the current editor, if any
  if (vscode.window.activeTextEditor) {
    handleDocEvent(vscode.window.activeTextEditor.document);
  }

  // Hover tooltips for issues
  context.subscriptions.push(registerHoverProvider());

  // Explicit commands (these must match package.json exactly)
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'accessibilityGuardian.scanActiveFile',
      scanActive
    ),
    vscode.commands.registerCommand(
      'accessibilityGuardian.scanDocxHipaa',
      scanDocxHipaaCommand
    ),
    vscode.commands.registerCommand(
      'accessibilityGuardian.scanPdfHipaa',
      scanPdfHipaaCommand
    ),
    vscode.commands.registerCommand(
      'accessibilityGuardian.scanEmailHipaa',
      scanEmailHipaaCommand
    ),
    vscode.commands.registerCommand(
      'accessibilityGuardian.scanHtmlHipaa',
      scanHtmlHipaaCommand
    ),
    vscode.commands.registerCommand(
      'accessibilityGuardian.scanGdprEu',
      scanGdprEuCommand
    ),
    vscode.commands.registerCommand(
      'accessibilityGuardian.scanPipedaCa',
      scanPipedaCaCommand),
    vscode.commands.registerCommand(
      'accessibilityGuardian.scanAppAu',
      scanAppAuCommand
    )
  );
}

export function deactivate() {}
