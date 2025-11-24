// Accessibility Guardian — Proprietary Evaluation License (30 Days)
// LicenseRef-EVALUATION
// © 2025 Richard Robert Wright — All rights reserved.
import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import * as path from 'path';
import JSZip from 'jszip';
import { PHI_PATTERNS, sliceWithContext, stripXml } from './utils/document-helpers';
import { writeJsonReport } from '../utils/report-generator';

export async function scanDocxHipaaCommand() {
  const pick = await vscode.window.showOpenDialog({
    title: 'Select DOCX to scan for HIPAA risks',
    canSelectMany: false,
    filters: { 'Word Document': ['docx'] }
  });
  if (!pick || pick.length === 0) return;

  const fileUri = pick[0];

  try {
    const buf = await fs.readFile(fileUri.fsPath);
    const zip = await JSZip.loadAsync(buf);
    const entry = zip.file('word/document.xml');
    if (!entry) {
      vscode.window.showWarningMessage('Not a valid DOCX (word/document.xml missing).');
      return;
    }
    const xml = await entry.async('text');
    const text = stripXml(xml);

    const findings: Array<{ type: string; match: string; context: string }> = [];
    for (const { type, re } of PHI_PATTERNS) {
      re.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = re.exec(text)) !== null) {
        findings.push({ type, match: m[0], context: sliceWithContext(text, m.index, m[0].length) });
      }
    }

    const summary = findings.reduce<Record<string, number>>((acc, f) => {
      acc[f.type] = (acc[f.type] || 0) + 1;
      return acc;
    }, {});

    const reportPath = await writeJsonReport('hipaa-docx', {
      file: fileUri.fsPath,
      summary,
      totalFindings: findings.length,
      findings
    });

    const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(reportPath));
    await vscode.window.showTextDocument(doc, { preview: false });
    vscode.window.showInformationMessage(`HIPAA DOCX scan: ${findings.length} potential items.`);
  } catch (err: any) {
    vscode.window.showErrorMessage(`DOCX scan failed: ${err?.message || String(err)}`);
    console.error('[AG] DOCX scan failed', err);
  }
}
