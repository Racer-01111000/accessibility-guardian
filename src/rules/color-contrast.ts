// Accessibility Guardian — Proprietary Evaluation License (30 Days)
// LicenseRef-EVALUATION
// © 2025 Richard Robert Wright — All rights reserved.
import * as vscode from 'vscode';
import { parseColor, contrastRatio } from '../utils/colors';

/**
 * Flags low text/background contrast from inline styles.
 * Target: WCAG 1.4.3 AA (>= 4.5:1 for normal text)
 */
export const colorContrastRule = {
  id: 'color-contrast',
  check(document: vscode.TextDocument): vscode.Diagnostic[] {
    const diags: vscode.Diagnostic[] = [];
    const text = document.getText();

    // Find any tag with an inline style attribute
    const withStyle = /<([a-z0-9-]+)[^>]*\sstyle=(["'])(.*?)\2[^>]*>/gis;
    let m: RegExpExecArray | null;

    while ((m = withStyle.exec(text)) !== null) {
      const style = m[3];

      // pull potential text + background colors from the style declaration
      const colorMatch = /(?:^|;)\s*color\s*:\s*([^;]+)\s*;?/i.exec(style);
      const bgMatch =
        /(?:^|;)\s*background(?:-color)?\s*:\s*([^;]+)\s*;?/i.exec(style) ||
        /(?:^|;)\s*background\s*:\s*([^;]+)\s*;?/i.exec(style);

      if (!colorMatch) continue;

      const fg = parseColor(colorMatch[1]);
      const bg = parseColor(bgMatch ? bgMatch[1] : 'white'); // assume white bg if none given

      if (!fg || !bg) continue;

      const ratio = contrastRatio(fg, bg);
      if (ratio < 4.5) {
        diags.push({
          range: new vscode.Range(
            document.positionAt(m.index),
            document.positionAt(m.index + m[0].length)
          ),
          message: `Low color contrast (~${ratio.toFixed(2)}:1). Aim for ≥ 4.5:1 (WCAG 1.4.3 AA).`,
          severity: vscode.DiagnosticSeverity.Warning,
          code: 'color-contrast',
          source: 'Accessibility Guardian'
        });
      }
    }

    return diags;
  }
};
