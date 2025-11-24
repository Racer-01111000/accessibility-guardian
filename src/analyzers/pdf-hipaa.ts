// Accessibility Guardian — Proprietary Evaluation License (30 Days)
// LicenseRef-EVALUATION
// © 2025 Richard Robert Wright — All rights reserved.
import * as vscode from 'vscode';
// pdf-parse has no official TS types in many envs; 'any' keeps it simple.
const pdfParse: any = require('pdf-parse');

import { PHI_PATTERNS, sliceWithContext } from './utils/document-helpers';

export async function scanPdfHipaaCommand() {
  const pick = await vscode.window.showOpenDialog({
    canSelectMany: false,
    openLabel: 'Scan PDF for HIPAA risks',
    filters: { PDF: ['pdf'] }
  });
  if (!pick || !pick[0]) return;

  try {
    const uri = pick[0];
    const buf = Buffer.from(await vscode.workspace.fs.readFile(uri));
    const result = await (pdfParse as any)(buf); // { text, numpages, ... }
    const text: string = result.text || '';
    const numPages: number = result.numpages || 0;

    const findings: {
      type: string;
      match: string;
      index: number;
      context: string;
    }[] = [];

    for (const { type, re } of PHI_PATTERNS) {
      re.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = re.exec(text)) !== null) {
        const idx = m.index;
        const val = m[0];
        findings.push({
          type,
          match: val,
          index: idx,
          context: sliceWithContext(text, idx, val.length, 60),
        });
      }
    }

    const summary: Record<string, number> = {};
    for (const f of findings) summary[f.type] = (summary[f.type] || 0) + 1;

    const report = {
      file: uri.fsPath,
      kind: 'pdf',
      pages: numPages,
      totals: summary,
      findings,
      generatedAt: new Date().toISOString(),
    };

    const doc = await vscode.workspace.openTextDocument({
      language: 'json',
      content: JSON.stringify(report, null, 2),
    });
    await vscode.window.showTextDocument(doc, { preview: false });
    vscode.window.showInformationMessage('HIPAA PDF scan complete.');
  } catch (err: any) {
    vscode.window.showErrorMessage(`PDF scan failed: ${err?.message || err}`);
  }
}
