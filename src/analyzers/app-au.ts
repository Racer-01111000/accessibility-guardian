// Accessibility Guardian — Proprietary Evaluation License (30 Days)
// LicenseRef-EVALUATION
// © 2025 Richard Robert Wright — All rights reserved.

import * as vscode from 'vscode';
import { extractTextFromDocument } from './utils/document-helpers';
import { detectPersonalData } from './utils/personal-data';
import { checkCrossBorder } from './utils/jurisdiction';

/**
 * APP (Australia) — Privacy & Overseas Disclosure Scan
 */
export async function scanAppAuCommand() {
  const pick = await vscode.window.showOpenDialog({
    canSelectMany: false,
    openLabel: 'Scan for APP (Australia) risks',
    filters: { Documents: ['txt', 'html', 'eml', 'pdf'] }
  });

  if (!pick || !pick[0]) return;

  const uri = pick[0];
  const documentText = await extractTextFromDocument(uri);
  if (!documentText) {
    vscode.window.showWarningMessage('Could not read file for APP scan.');
    return;
  }

  const findings = detectPersonalData(documentText);
  const transfers = checkCrossBorder('AU', documentText);

  const panel = vscode.window.createOutputChannel('Accessibility Guardian — APP (Australia)');
  panel.appendLine('=== APP (Australia) Compliance Report ===');
  panel.appendLine(`File: ${uri.fsPath}\n`);

  if (findings.length === 0 && transfers.length === 0) {
    panel.appendLine('No APP risks detected.');
  } else {
    if (findings.length) {
      panel.appendLine('Possible personal information detected:');
      findings.forEach(f =>
        panel.appendLine(` • [${f.type}] ${f.value} (context: ${f.context})`)
      );
    }

    if (transfers.length) {
      panel.appendLine('\nPotential overseas disclosures:');
      transfers.forEach(t => panel.appendLine(` • ${t}`));
    }
  }

  panel.show(true);
}
