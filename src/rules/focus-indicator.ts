import * as vscode from 'vscode';

/**
 * Flags cases where keyboard focus indicators are removed or likely invisible.
 * Heuristics:
 *  1) Inline styles that set `outline:none|0` (always bad).
 *  2) <style> rules that target :focus (or :focus-visible) and remove outline
 *     *without* adding an obvious replacement (box-shadow/border).
 *
 * WCAG 2.4.7 (Focus Visible), WCAG 2.4.11/12 (Enhanced/Minimum Focus Appearance)
 */
export const focusIndicatorRule = {
  id: 'focus-indicator',
  check(document: vscode.TextDocument): vscode.Diagnostic[] {
    const diags: vscode.Diagnostic[] = [];
    const text = document.getText();

    // 1) Inline style cases like: <button style="outline:none">...</button>
    const withStyle = /<([a-z0-9-]+)\b[^>]*\sstyle=(["'])(.*?)\2[^>]*>/gis;
    let m: RegExpExecArray | null;

    while ((m = withStyle.exec(text)) !== null) {
      const style = m[3];
      if (/\boutline\s*:\s*(none|0)\b/i.test(style)) {
        diags.push({
          range: new vscode.Range(
            document.positionAt(m.index),
            document.positionAt(m.index + m[0].length)
          ),
          message:
            'Focus outline removed via inline style. Provide a visible custom focus style (e.g., outline or box-shadow).',
          severity: vscode.DiagnosticSeverity.Warning,
          code: 'focus-outline-removed-inline',
          source: 'Accessibility Guardian'
        });
      }
    }

    // 2) <style> blocks that remove focus outline without a visible replacement
    //    We consider "visible replacement" if rule includes box-shadow or a non-zero border.
    const styleBlock = /<style[^>]*>([\s\S]*?)<\/style>/gi;
    let s: RegExpExecArray | null;

    while ((s = styleBlock.exec(text)) !== null) {
      const css = s[1];

      // naive split by } to isolate blocks; keep simple and fast
      const blocks = css.split('}');

      for (const raw of blocks) {
        const block = raw.trim();
        if (!block) continue;

        // Separate selector and declarations
        const parts = block.split('{');
        if (parts.length < 2) continue;
        const selector = parts[0];
        const decls = parts.slice(1).join('{'); // in case { appears in content

        // Check selectors that affect focus states
        if (!/:(focus|focus-visible)\b/i.test(selector)) continue;

        const removesOutline = /\boutline\s*:\s*(none|0)\b/i.test(decls);
        if (!removesOutline) continue;

        // Does the block add a visible replacement?
        const addsShadow = /\bbox-shadow\s*:\s*[^;]+/i.test(decls);
        const addsBorder =
          /\bborder\s*:\s*(?!\s*none\b|0\b)[^;]+/i.test(decls) ||
          /\bborder-(top|right|bottom|left)\s*:\s*(?!\s*none\b|0\b)[^;]+/i.test(decls);

        if (!(addsShadow || addsBorder)) {
          diags.push({
            range: new vscode.Range(
              document.positionAt(s.index),
              document.positionAt(s.index + s[0].length)
            ),
            message:
              'Focus outline removed in CSS without a visible replacement. Add a clear focus indicator (e.g., box-shadow or border).',
            severity: vscode.DiagnosticSeverity.Warning,
            code: 'focus-outline-removed-css',
            source: 'Accessibility Guardian'
          });
        }
      }
    }

    return diags;
  }
};

