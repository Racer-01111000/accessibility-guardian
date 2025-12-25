# Change Log

All notable changes to the "Accessibility Guardian" extension will be documented in this file.

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
