// Accessibility Guardian — Proprietary Evaluation License (30 Days)
// LicenseRef-EVALUATION
// © 2025 Richard Robert Wright — All rights reserved.
import * as vscode from 'vscode';

const HELP: Record<string, string> = {
  'missing-alt-text': 'Add descriptive alt text to <img>. Example: <img src="x.png" alt="Company logo">',
  'unlabeled-input': 'Give inputs accessible names: <label for="id">Email</label><input id="id"> or aria-label.',
  'heading-skip': 'Avoid skipping heading levels (h1→h2→h3...).',
  'color-contrast': 'Target ≥4.5:1 contrast for normal text (WCAG 1.4.3 AA).',
  'focus-outline-removed-inline': 'Do not remove :focus outlines; provide a visible custom focus style.',
  'focus-outline-removed-css': 'Your CSS removes outlines on :focus; add box-shadow/border as replacement.',
  'multiple-h1': 'Use a single <h1> as the page title.',
  'first-heading-not-h1': 'Prefer starting your structure at <h1>.'
};

export function registerHoverProvider() {
  return vscode.languages.registerHoverProvider({ language: 'html' }, {
    provideHover(doc, pos) {
      const diags = vscode.languages.getDiagnostics(doc.uri)
        .filter(d => d.range.contains(pos) && d.code);
      if (!diags.length) return;
      const md = new vscode.MarkdownString();
      md.isTrusted = true;
      for (const d of diags) {
        const code = String(d.code ?? '');
        const tip = HELP[code] ?? d.message;
        md.appendMarkdown(`**${code}** – ${tip}

`);
      }
      return new vscode.Hover(md);
    }
  });
}
