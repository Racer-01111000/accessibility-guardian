# GDPR Cross-Border Compliance Module

## Overview
The GDPR Cross-Border module flags potential EU GDPR cross-border transfer risks in scanned assets and checks whether privacy policy text includes required disclosures. It focuses on two signals:
- **High-risk vendor detection**: Finds vendor keywords and endpoints commonly associated with cross-border processing (e.g., US-based vendors).
- **Policy disclosure checks**: Verifies that policy text mentions international transfer disclosures and legal safeguards such as SCCs or Adequacy decisions.

This module runs during “Scan Active File” and “Deep Scan Workspace” when GDPR checks are enabled.

## Configuration
All settings live under the `accessibilityGuardian.privacy.crossBorder.*` namespace in VS Code settings.

### Settings
- `accessibilityGuardian.privacy.crossBorder.enabled` (boolean, default: `true`)
  - Toggle the module on or off.
- `accessibilityGuardian.privacy.crossBorder.highRiskVendors` (array of strings)
  - Vendor keywords or endpoints that should trigger cross-border risk findings.
  - Example defaults include: `google`, `google-analytics`, `facebook`, `meta`, `aws`, `amazonaws`, `azure`, `cloudfront`, `stripe`, `paypal`.
- `accessibilityGuardian.privacy.crossBorder.requireTransferMechanismDisclosure` (boolean, default: `true`)
  - Require disclosure language about international transfers in policy text.
- `accessibilityGuardian.privacy.crossBorder.requireSCCorAdequacyMention` (boolean, default: `true`)
  - Require mention of safeguards such as **Standard Contractual Clauses (SCCs)**, **Adequacy decisions**, or **BCRs**.
- `accessibilityGuardian.privacy.crossBorder.requireDPAControllerProcessorLanguage` (boolean, default: `false`)
  - Optional enforcement of controller/processor and DPA language when transfers are present.
- `accessibilityGuardian.privacy.crossBorder.severity` (enum: `info`, `warn`, `error`, default: `warn`)
  - Sets the severity level for cross-border findings.

### Example
```json
{
  "accessibilityGuardian.privacy.crossBorder.enabled": true,
  "accessibilityGuardian.privacy.crossBorder.highRiskVendors": [
    "google",
    "google-analytics",
    "facebook",
    "aws",
    "azure"
  ],
  "accessibilityGuardian.privacy.crossBorder.requireTransferMechanismDisclosure": true,
  "accessibilityGuardian.privacy.crossBorder.requireSCCorAdequacyMention": true,
  "accessibilityGuardian.privacy.crossBorder.requireDPAControllerProcessorLanguage": false,
  "accessibilityGuardian.privacy.crossBorder.severity": "warn"
}
```

## Findings and How to Fix Them

### AG-GDPR-XB-001: High-Risk Vendor Detected
**What it means:** A vendor keyword or endpoint was found that commonly implies cross-border processing.

**How to fix:**
- Confirm where the vendor processes data (EU vs. non-EU regions).
- Limit processing to EU regions where possible.
- Ensure your policy discloses international transfers and safeguards.

### AG-GDPR-XB-002: Missing Transfer Disclosure
**What it means:** Policy text does not mention international transfers or cross-border data processing.

**How to fix:**
- Add explicit language describing international data transfers.
- Include destinations (countries/regions) and a summary of safeguards.

### AG-GDPR-XB-003: Missing SCC/Adequacy Safeguards
**What it means:** Policy text does not reference standard transfer safeguards such as SCCs or Adequacy decisions.

**How to fix:**
- Add a clear reference to the legal mechanism used (e.g., **Standard Contractual Clauses (SCCs)**, **Adequacy Decision**, **BCRs**, or **UK IDTA**).
- Keep wording aligned with GDPR Article 44-49 requirements.

## Notes
- The analyzer searches for keywords and does not replace legal review.
- If your organization uses different wording, update `highRiskVendors` and other settings to match your policy language.
