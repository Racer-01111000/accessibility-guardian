import * as vscode from 'vscode';
import { PHI_PATTERNS, sliceWithContext } from './utils/document-helpers';

export async function scanHtmlHipaaCommand() {
  const pick = await vscode.window.showOpenDialog({
    canSelectMany: false,
    openLabel: 'Scan HTML for HIPAA risks',
    filters: { HTML: ['html', 'htm'] }
  });
  if (!pick?.[0]) return;

  try {
    const uri = pick[0];
    const buf = await vscode.workspace.fs.readFile(uri);
    const text = Buffer.from(buf).toString('utf8');

    const findings: { type: string; value: string; context: string }[] = [];

    for (const pattern of PHI_PATTERNS) {
      // ensure /g so we can iterate all matches
      const re = new RegExp(
        pattern.re.source,
        pattern.re.flags.includes('g') ? pattern.re.flags : pattern.re.flags + 'g'
      );

      let m: RegExpExecArray | null;
      while ((m = re.exec(text)) !== null) {
        findings.push({
          type: pattern.type,
          value: m[0],
          context: sliceWithContext(text, m.index, m[0].length)
        });
      }
    }

    if (findings.length === 0) {
      vscode.window.showInformationMessage('No obvious PHI indicators found in HTML.');
      return;
    }

    const report = {
      file: uri.fsPath,
      count: findings.length,
      findings
    };
    const doc = await vscode.workspace.openTextDocument({
      language: 'json',
      content: JSON.stringify(report, null, 2)
    });
    vscode.window.showTextDocument(doc, { preview: false });
  } catch (err: any) {
    vscode.window.showErrorMessage(`HTML scan failed: ${err?.message || err}`);
  }
}

