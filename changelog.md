# Change Log

All notable changes to the "Accessibility Guardian" extension will be documented in this file.

## [0.3.8] - 2026-03-04
### Added
- Multi-format extraction pipeline for HIPAA/PHI scanning:
  - PDF text extraction hardened for `pdf-parse` module variants
  - DOCX extraction via `mammoth`
  - EML extraction via `mailparser` (headers + body + attachment names)
  - MSG extraction via `@kenjiuno/msgreader` (headers + recipients + attachment names)
  - JSON safe parse + flattened value stream normalization
  - LOG/TXT normalization for scan-friendly pattern detection
- Deep Scan Workspace now targets `pdf, docx, html, txt, md, eml, log, json`.
- Added HIPAA sample fixtures for `docx`, `eml`, `log`, and `json` in `test-samples/`.

### Improved
- Broadened DOB and medical-test-result detection reliability across extracted text.
- Added screenshot + synthetic-demo-data note in README.

## [0.3.7] - 2026-03-04
### Added
- Marketplace screenshot pack and README screenshot section.

## [0.3.6] - 2026-03-04
### Improved
- Marketplace metadata, keyword discoverability, and README conversion copy.

## [0.3.5] - 2026-01-20
### Added
- **Liability Shield:** Prevents accidental data leaks by blocking saves/quits when PHI is detected.
- **Context-Aware Scanning:** Scanner now recognizes medical terminology (e.g., "Diagnosis", "COPD") and context-specific names.
- **Smart Filters:** Visual warnings appear instantly, but popup warnings only interrupt on Manual Save/Quit.

## [0.3.4] - 2025-12-26
### Added
- **Verified Release**: Verified release with active 15-day trial and developer config fixes.

## [0.3.3] - 2025-12-26
### Added
- **Verified Release**: Verified release with active 15-day trial and developer config fixes.

## [0.3.2] - 2025-12-26
### Added
- **Free Trial**: Added 15-day free trial period.
- **Licensing**: After 15 days, a license key ($50 lifetime) is required to continue scanning.
- **Store Link**: Connected "Buy License" button to the live checkout page.

## [0.3.0] - 2025-12-25
### Added
- **GDPR Cross-Border Module**: New analyzer to detect data transfer risks.
- **Vendor Detection**: Flags US-centric vendors (Google, Meta, AWS) that may require SCCs.
- **Policy Scan**: Checks privacy policies for missing safeguards (SCC, Adequacy, BCR).
- **Configuration**: Added `privacy.crossBorder.enabled` and `privacy.crossBorder.highRiskVendors` settings.

### Fixed
- Reduced package size (excluded `node_modules` from VSIX).
- Fixed shell command typo in `README.md`.

## [0.2.6] - 2025-12-25
### Fixed
- Fixed typo in README (shell command visible on Marketplace).

## [0.2.5] - 2025-12-24
### Added
- Initial release of Accessibility Guardian.
- HIPAA Analyzer (PHI detection).
- Deep Scan Workspace feature.
