import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import { PHI_PATTERNS, sliceWithContext } from './utils/document-helpers';
import { writeJsonReport } from '../utils/report-generator';

export async function scanEmailHipaaCommand() {
  const pick = await vscode.window.showOpenDialog({
    title: 'Select .eml (email) to scan for HIPAA risks',
    canSelectMany: false,
    filters: { 'Email (.eml)': ['eml'], 'All Files': ['*'] }
  });
  if (!pick || pick.length === 0) return;

  const fileUri = pick[0];
  const text = await fs.readFile(fileUri.fsPath, 'utf8');

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

  const reportPath = await writeJsonReport('hipaa-email', {
    file: fileUri.fsPath,
    summary,
    totalFindings: findings.length,
    findings
  });

  const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(reportPath));
  await vscode.window.showTextDocument(doc, { preview: false });
  vscode.window.showInformationMessage(`HIPAA email scan: ${findings.length} potential items.`);
}
