## Accessibility Guardian (VS Code Extension)

Local-first compliance scanning for HIPAA, GDPR, and ADA/WCAG in VS Code.

### Features
- HIPAA analyzers for PHI patterns in HTML, PDF, DOCX, and email.
- GDPR checks for EU personal data indicators and cross-border transfer risks.
- ADA/WCAG checks for common accessibility issues in HTML.
- Deep scan workspace with progress reporting.

### Commands
- `Accessibility Guardian: Scan Active File`
- `Accessibility Guardian: Deep Scan Workspace (PDF/DOCX)`
- `Accessibility Guardian: Enter License Key`

### Configuration
These live in VS Code settings:
- `accessibilityGuardian.enableHipaa`
- `accessibilityGuardian.privacy.crossBorder.enabled`
- `accessibilityGuardian.privacy.crossBorder.highRiskVendors`
- `accessibilityGuardian.privacy.crossBorder.requireTransferMechanismDisclosure`
- `accessibilityGuardian.privacy.crossBorder.requireSCCorAdequacyMention`
- `accessibilityGuardian.privacy.crossBorder.requireDPAControllerProcessorLanguage`
- `accessibilityGuardian.privacy.crossBorder.severity`
- `accessibilityGuardian.privacy.highRiskVendors`
- `accessibilityGuardian.privacy.complianceKeywords`

Workspace overrides (optional): `.accessibility-guardian.json`

### GDPR Cross-Border
Detects high-risk vendors and flags missing transfer safeguards in policy text.  
Guide: `docs/gdpr-cross-border.md`

### Docs
- `docs/gdpr-cross-border.md`

### Development
```bash
npm install
npm run bundle
# F5 in VS Code -> Extension Development Host
```
