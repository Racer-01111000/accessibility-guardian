import * as vscode from 'vscode';

export const missingAltRule = {
  id: 'missing-alt-text',
  check(document: vscode.TextDocument): vscode.Diagnostic[] {
    const diagnostics: vscode.Diagnostic[] = [];
    const text = document.getText();

    const imgRegex = /<img(?![^>]*\balt\s*=)[^>]*>/gi;
    let match: RegExpExecArray | null;

    while ((match = imgRegex.exec(text)) !== null) {
      diagnostics.push({
        range: new vscode.Range(
          document.positionAt(match.index),
          document.positionAt(match.index + match[0].length)
        ),
        message: 'Image missing alt text — ADA risk',
        severity: vscode.DiagnosticSeverity.Error,
        code: 'missing-alt-text',
        source: 'Accessibility Guardian'
      });
    }

    return diagnostics;
  }
};
