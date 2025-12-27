# Change Log

All notable changes to the "Accessibility Guardian" extension will be documented in this file.

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
