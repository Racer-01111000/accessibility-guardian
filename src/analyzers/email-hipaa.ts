import * as vscode from 'vscode';
import { simpleParser } from 'mailparser';
import { PHI_PATTERNS, sliceWithContext } from './utils/document-helpers';

/**
 * Scan a .eml file for likely HIPAA/PHI disclosures.
 * Shows a quick summary and writes a JSON details blob to an output channel.
 */
export async function scanEmailHipaaCommand() {
  const pick = await vscode.window.showOpenDialog({
    canSelectMany: false,
    openLabel: 'Scan EML for HIPAA risks',
    filters: { Email: ['eml'] }
  });
  if (!pick || !pick[0]) return;

  try {
    const uri = pick[0];
    const buf = Buffer.from(await vscode.workspace.fs.readFile(uri));
    const parsed = await simpleParser(buf);

    // Collect searchable text
    const parts: string[] = [];
    if (parsed.subject) parts.push(`Subject: ${parsed.subject}`);
    if (parsed.text) parts.push(parsed.text);
    if (parsed.html) {
      // crude HTML strip to avoid adding a dependency
      const htmlText = parsed.html.replace(/<[^>]+>/g, ' ');
      parts.push(htmlText);
    }
    const text = parts.join('\n');

    type Finding = { type: string; value: string; context: string };
    const findings: Finding[] = [];

    for (const { type, re } of PHI_PATTERNS) {
      // run global regex safely
      let m: RegExpExecArray | null;
      (re as RegExp).lastIndex = 0;
      while ((m = re.exec(text)) !== null) {
        const value = m[0];
        const idx = m.index;
        findings.push({
          type,
          value,
          context: sliceWithContext(text, idx, value.length)
        });
        // avoid infinite loops on zero-length matches
        if (m.index === re.lastIndex) re.lastIndex++;
      }
    }

    const ch = vscode.window.createOutputChannel('Accessibility Guardian – EML Scan');
    ch.clear();
    ch.appendLine(`File: ${uri.fsPath}`);
    ch.appendLine(`Findings: ${findings.length}`);
    ch.appendLine(JSON.stringify(findings, null, 2));
    ch.show(true);

    if (findings.length === 0) {
      vscode.window.showInformationMessage('EML scan: No obvious HIPAA risks found.');
    } else {
      vscode.window.showWarningMessage(`EML scan: ${findings.length} potential HIPAA risk(s) found. See output for details.`);
    }
  } catch (err: any) {
    vscode.window.showErrorMessage(`EML scan failed: ${err?.message || String(err)}`);
  }
}

