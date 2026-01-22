# Accessibility Guardian: Installation & Setup

Accessibility Guardian runs locally and never uploads source data.

## Install from Marketplace
1. Open VS Code.
2. Press `Ctrl+P` and run:
   ```bash
   ext install echocorelabs.accessibility-guardian
   ```

## Install from VSIX
1. Download the latest `.vsix`.
2. In VS Code, open Extensions -> `...` -> Install from VSIX.

## Configuration
Open Settings and search for "Accessibility Guardian" or add to `settings.json`:
```json
{
  "accessibilityGuardian.enableHipaa": true,
  "accessibilityGuardian.privacy.crossBorder.enabled": true,
  "accessibilityGuardian.privacy.highRiskVendors": ["google.com", "aws.amazon.com"],
  "accessibilityGuardian.privacy.complianceKeywords": ["SCC", "DPA", "Adequacy Decision"]
}
```

Workspace overrides (optional): `.accessibility-guardian.json`
