// Accessibility Guardian — Proprietary Evaluation License (30 Days)
// LicenseRef-EVALUATION
// © 2025 Richard Robert Wright — All rights reserved.
import * as vscode from 'vscode';

export async function scanGdprEuCommand() {
  const doc = vscode.window.activeTextEditor?.document;
  if (!doc) {
    vscode.window.showWarningMessage('Open a file to run “Scan (GDPR/EU)”.');
    return;
  }
  vscode.window.showInformationMessage('GDPR/EU scan stub running (wired).');
}
