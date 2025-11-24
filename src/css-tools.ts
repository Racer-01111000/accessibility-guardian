// Accessibility Guardian — Proprietary Evaluation License (30 Days)
// LicenseRef-EVALUATION
// © 2025 Richard Robert Wright — All rights reserved.
# Architecture Overview

**Accessibility Guardian** is a VS Code extension with three-tier responsibility:

1. **UI & Wiring** (`src/extension.ts`)
  - Registers diagnostics collection, hover providers, and commands
  - Entry point for the extension

2. **Diagnostics Rules** (`src/rules/*`)
  - Self-contained accessibility checks (e.g., `missing-alt.ts`, `color-contrast.ts`)
  - Each exports `{ id, check(document): vscode.Diagnostic[] }`
  - Run on HTML documents via `src/diagnostics.ts`

3. **File-type Analyzers** (`src/analyzers/*`)
  - Heavy-lifting for DOCX, PDF, EML, HTML, GDPR compliance
  - Export command functions (e.g., `scanDocxHipaaCommand`)
  - Registered as `accessibilityGuardian.scanDocxHipaa`, etc.

**Build Pipeline:**
- Source: `src/extension.ts` → TypeScript compile → `dist/extension.js` (via esbuild)
- `vscode` is external (host-provided)
- Quick iteration: `npm run watch` + F5 reload

**Your `css-tools.ts`:** Utility module for inline style parsing—likely used by rules or analyzers to detect CSS properties in HTML attributes.
