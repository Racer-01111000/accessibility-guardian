// Accessibility Guardian — Proprietary Evaluation License (30 Days)
// LicenseRef-EVALUATION
// © 2025 Richard Robert Wright — All rights reserved.

import * as vscode from 'vscode';
import { extractTextFromDocument } from './utils/document-helpers';
import { detectPersonalData } from './utils/personal-data';
import { checkCrossBorder } from './utils/jurisdiction';

/**
 * PIPEDA (Canada) — Personal Information & Consent Scan
 */
export async function scanPipedaCaCommand() {
  const pick = await vscode.window.showOpenDialog({
    canSelectMany: false,
    openLabel: 'Scan for PIPEDA (Canada) risks',
    filters: { Documents: ['txt', 'html', 'eml', 'pdf'] }
  });

  if (!pick || !pick[0]) return;

  const uri = pick[0];
  const documentText = await extractTextFromDocument(uri);
  if (!documentText) {
    vscode.window.showWarningMessage('Could not read file for PIPEDA scan.');
    return;
  }

  const findings = detectPersonalData(documentText);
  const transfers = checkCrossBorder('CA', documentText);

  const panel = vscode.window.createOutputChannel('Accessibility Guardian — PIPEDA');
  panel.appendLine('=== PIPEDA (Canada) Compliance Report ===');
  panel.appendLine(`File: ${uri.fsPath}\n`);

  if (findings.length === 0 && transfers.length === 0) {
    panel.appendLine('No PIPEDA risks detected.');
  } else {
    if (findings.length) {
      panel.appendLine('Possible personal information detected:');
      findings.forEach(f =>
        panel.appendLine(` • [${f.type}] ${f.value} (context: ${f.context})`)
      );
    }

    if (transfers.length) {
      panel.appendLine('\nPotential cross-border disclosures:');
      transfers.forEach(t => panel.appendLine(` • ${t}`));
    }
  }

  panel.show(true);
}
