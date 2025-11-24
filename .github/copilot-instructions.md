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
  - VS Code extension structured around three responsibilities:
    1. UI / wiring: `src/extension.ts` — registers diagnostics, hover provider and commands.
    2. Diagnostics rules: `src/rules/*` — self-contained checks that return `vscode.Diagnostic[]`.
    3. File-type analyzers: `src/analyzers/*` — document-specific heavy-lifting (DOCX, PDF, EML, GDPR checks).
  - `src/diagnostics.ts` aggregates `RULES` and runs `rule.check(document)` for HTML documents. Errors inside individual rules are caught and logged: `console.error('[AG] rule failed:', rule.id, e)` — prefer non-fatal failures.

- Key conventions and patterns (do not invent alternatives)
  - Rule shape: every rule exports an object with `id` and `check(document: vscode.TextDocument): vscode.Diagnostic[]`.
    - Example: `src/rules/missing-alt.ts` (id: `missing-alt-text`) — regex-based HTML checks that return Diagnostics with `source: 'Accessibility Guardian'` and `code` values.
    - Example: `src/rules/color-contrast.ts` uses utilities in `src/utils` and returns `Warning` severity for ratios < 4.5.
  - Diagnostics collection name is `accessibilityGuardian` (see `createDiagnosticCollection('accessibilityGuardian')`). Use the existing collection when adding or clearing diagnostics.
  - Command registration: analyzers export command functions and are registered in `activate()` as `accessibilityGuardian.scanDocxHipaa`, `...scanPdfHipaa`, `...scanEmailHipaa`, `...scanHtmlHipaa`, `...scanGdprEu` etc. Match names exactly when adding or changing commands.
  - Language scope: the live diagnostic pipeline runs only for `html` (see `if (doc.languageId !== 'html') return;`). If you add rules for other languages, update the activation events and the scanning guard.

- Integration & external deps
  - Native/third-party: `mailparser`, `pdf-parse` are runtime deps used by analyzers. Ensure test/dev hosts can install and run them.
  - Bundling: `esbuild` targets Node and externalizes `vscode`. Do not bundle `vscode` into `dist/extension.js`.
  - Output: extension `main` field points to `./dist/extension.js`. Tests or extension host runs must use a built bundle.

- Developer workflows & quick checks
  - Build and run in VS Code: `npm install` → `npm run bundle` → F5 (Extension Development Host).
  - Quick iteration: `npm run watch` and reload the host when TypeScript emits new JS.
  - Manual scan commands: open a file and use the Command Palette entries (see `contributes.commands` in `package.json`) such as `Accessibility: Scan Active File` or run `accessibilityGuardian.scanHtmlHipaa`.
  - Sample inputs live in `test-samples/` (`hipaa-sample.eml`, `.html`, `.txt`) — use them when validating analyzers.

- Best practices specific to this codebase
  - Keep rule logic pure and fast: rules run on open/change/save. Heavy parsing belongs in `src/analyzers` or background tasks.
  - Respect the existing Diagnostic contract — set `range`, `message`, `severity`, `code`, and `source: 'Accessibility Guardian'` so the Problems panel groups and references issues consistently.
  - When adding commands or new analyzers: export a single `*Command` function and register that exact symbol in `src/extension.ts`.

- Files to reference when coding or reviewing
  - Wiring & activation: `src/extension.ts`
  - Diagnostic runner: `src/diagnostics.ts`
  - Rules: `src/rules/*.ts` (e.g. `missing-alt.ts`, `color-contrast.ts`)
  - Rule helpers: `src/rules/utils/*`, `src/utils/*`
  - Analyzers: `src/analyzers/*` (docx-hipaa.ts, pdf-hipaa.ts, email-hipaa.ts, html-hipaa.ts, gdpr-eu.ts)
  - Build: `esbuild.config.js`, `package.json` (scripts: `build`, `bundle`, `watch`)
  - Samples for manual testing: `test-samples/`

If any section is unclear or you'd like me to include short code examples inline (e.g., the exact `rule` interface or a template for a new analyzer), tell me which part to expand and I will iterate. 
