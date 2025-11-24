// Accessibility Guardian — Proprietary Evaluation License (30 Days)
// LicenseRef-EVALUATION
// © 2025 Richard Robert Wright — All rights reserved.
import * as vscode from 'vscode';

/**
 * Detects form inputs that lack accessible labels.
 * WCAG 1.3.1 (Info and Relationships)
 */
export const unlabeledInputRule = {
  id: 'unlabeled-input',
  check(document: vscode.TextDocument): vscode.Diagnostic[] {
    const diagnostics: vscode.Diagnostic[] = [];
    const text = document.getText();

    // Match input tags that don't have aria-label, aria-labelledby, or associated label
    const regex = /<input(?![^>]*(aria-label|aria-labelledby|type=["']hidden["']))[^>]*>/gi;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      const range = new vscode.Range(
        document.positionAt(match.index),
        document.positionAt(match.index + match[0].length)
      );

      diagnostics.push({
        range,
        message: 'Form input lacks a label or accessible name (WCAG 1.3.1).',
        severity: vscode.DiagnosticSeverity.Warning,
        code: 'unlabeled-input',
        source: 'Accessibility Guardian'
      });
    }

    return diagnostics;
  }
};
