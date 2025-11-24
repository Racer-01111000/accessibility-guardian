// Accessibility Guardian — Proprietary Evaluation License (30 Days)
// LicenseRef-EVALUATION
// © 2025 Richard Robert Wright — All rights reserved.
import * as vscode from 'vscode';

/**
 * Flags heading hierarchy issues:
 * - Jumps in levels (e.g., h1 -> h3)
 * - Multiple <h1> (subsequent h1s warned)
 * - First heading not h1 (soft warning)
 *
 * WCAG 1.3.1 (Info and Relationships)
 */
export const headingHierarchyRule = {
  id: 'heading-hierarchy',
  check(document: vscode.TextDocument): vscode.Diagnostic[] {
    const diags: vscode.Diagnostic[] = [];
    const text = document.getText();

    // Find opening heading tags in source order
    const re = /<h([1-6])[^>]*>/gi;
    const heads: Array<{ lvl: number; start: number; end: number }> = [];
    let m: RegExpExecArray | null;

    while ((m = re.exec(text)) !== null) {
      heads.push({
        lvl: parseInt(m[1], 10),
        start: m.index,
        end: m.index + m[0].length
      });
    }

    if (heads.length === 0) return diags;

    // First heading not h1 → gentle warning
    if (heads[0].lvl !== 1) {
      diags.push({
        range: new vscode.Range(
          document.positionAt(heads[0].start),
          document.positionAt(heads[0].end)
        ),
        message: `First heading is h${heads[0].lvl}. Prefer starting at h1 for a clear structure (WCAG 1.3.1).`,
        severity: vscode.DiagnosticSeverity.Hint,
        code: 'first-heading-not-h1',
        source: 'Accessibility Guardian'
      });
    }

    // Multiple h1s → warn on subsequent ones
    let seenH1 = false;
    for (const h of heads) {
      if (h.lvl === 1) {
        if (seenH1) {
          diags.push({
            range: new vscode.Range(
              document.positionAt(h.start),
              document.positionAt(h.end)
            ),
            message: 'Multiple <h1> elements found. Use a single page title (WCAG 1.3.1).',
            severity: vscode.DiagnosticSeverity.Warning,
            code: 'multiple-h1',
            source: 'Accessibility Guardian'
          });
        }
        seenH1 = true;
      }
    }

    // Level jumps (e.g., h2 -> h4)
    for (let i = 1; i < heads.length; i++) {
      const prev = heads[i - 1];
      const curr = heads[i];
      if (curr.lvl > prev.lvl + 1) {
        diags.push({
          range: new vscode.Range(
            document.positionAt(curr.start),
            document.positionAt(curr.end)
          ),
          message: `Heading level jumps from h${prev.lvl} to h${curr.lvl}. Avoid skipping levels (WCAG 1.3.1).`,
          severity: vscode.DiagnosticSeverity.Warning,
          code: 'heading-skip',
          source: 'Accessibility Guardian'
        });
      }
    }

    return diags;
  }
};
