# Copilot / Agent instructions for Accessibility Guardian

Quick, focused guidance to help an AI coding agent be productive in this repository.

- Entry point & build
  - The extension entry is `src/extension.ts` and the compiled runtime is `dist/extension.js` (see `package.json` "main").
  - Build steps:
    - `npm install` to install deps.
    - `npm run build` runs `tsc -p ./` (type-check + emit). `npm run bundle` runs `node esbuild.config.js` to produce `dist/extension.js`.
    - For fast iteration use `npm run watch` (runs `tsc -w`) and reload the Extension Development Host (F5 in VS Code).
    - `esbuild.config.js` bundles `src/extension.ts` into `dist/extension.js` and marks `vscode` as external (the host provides it).
- Big-picture architecture
  - VS Code extension with live diagnostics for HTML files on open/change/save.
  - Three scanner modules: `src/scanners/scanHtmlHipaa.ts`, `scanWcag.ts`, `scanGdpr.ts` — each returns `Finding[]` for HTML text.
  - Analyzers in `src/analyzers/*` handle manual scans for DOCX, PDF, EML, and specific regulations (HIPAA, GDPR-EU, PIPEDA-CA, APP-AU).
  - `src/extension.ts` registers diagnostics collection, QuickFixProvider, and event listeners. Scans run based on config settings (`accessibilityGuardian.enableHipaa`, `enableWcag`, `enableGdpr`).
  - Findings are converted to VS Code diagnostics with `source: 'Accessibility Guardian'`.
- Key conventions and patterns (do not invent alternatives)
  - Scanner shape: functions export `scanXxx(text: string): Finding[]` where `Finding` has `code`, `message`, `severity` ('info'|'warn'|'error'), `start`, `end` (char indices).
  - Example: `src/scanners/scanWcag.ts` uses regex for img alt checks and button accessibility.
  - Diagnostics collection name is `accessibility-guardian`. Use the existing collection for setting/clearing diagnostics.
  - Quick fixes: `src/providers/QuickFixProvider.ts` provides code actions for HTML issues.
  - Language scope: live scans only for `html` (see `if (doc.languageId !== 'html') return;` in `runScan`).
  - If adding new scanners or analyzers, update `extension.ts` imports and `runScan` logic.
- Integration & external deps
  - Runtime deps: `mailparser` for email parsing, `pdf-parse` for PDF text extraction (used in analyzers).
  - Bundling: `esbuild` targets Node20, externalizes `vscode`. Do not bundle `vscode`.
  - Output: extension `main` points to `./dist/extension.js`. Always use bundled version for testing/running.
- Developer workflows & quick checks
  - Build and run: `npm install` → `npm run bundle` → F5 (Extension Development Host).
  - Quick iteration: `npm run watch` and reload host on changes.
  - Manual scans: Commands in `package.json` (e.g., `accessibilityGuardian.scanActiveFile`) — implementations may be in analyzers.
  - Sample inputs: `test-samples/` (hipaa-sample.html, test.html, etc.) — use for validating scanners.
- Best practices specific to this codebase
  - Keep scanners fast and regex-based for live diagnostics. Heavy parsing in analyzers or background.
  - Respect Finding contract: set `start`/`end` as char positions, `severity` as string, `code` for quick fixes.
  - When adding features: update `extension.ts` activation, add config in `package.json` if needed.
  - Errors in scanners are not caught (unlike old rules) — ensure robust regex to avoid crashes.
- Files to reference when coding or reviewing
  - Main wiring: `src/extension.ts`
  - Scanners: `src/scanners/*.ts` (scanHtmlHipaa.ts, scanWcag.ts, scanGdpr.ts)
  - Analyzers: `src/analyzers/*.ts` (html-hipaa.ts, pdf-hipaa.ts, etc.)
  - Types: `src/types.ts` (Finding interface)
  - Quick fixes: `src/providers/QuickFixProvider.ts`
  - Build: `esbuild.config.js`, `package.json` (scripts: `build`, `bundle`, `watch`)
  - Samples: `test-samples/`

If any section is unclear or you'd like me to include short code examples inline (e.g., the exact Finding interface or a template for a new scanner), tell me which part to expand and I will iterate.
