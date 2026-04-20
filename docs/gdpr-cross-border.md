# GDPR Cross-Border Compliance Module

## Overview
The GDPR Cross-Border module flags potential EU GDPR cross-border transfer risks in scanned assets and checks whether privacy policy text includes required disclosures and safeguards.

It focuses on three core signals:
- **High-risk vendor detection** (possible international data processing)
- **Policy disclosure checks** (transfer transparency)
- **Safeguards and legal basis checks** (SCCs, adequacy, BCRs)

This module runs during both active scans and deep workspace scans when GDPR checks are enabled.

---

## Configuration
All settings live under the `accessibilityGuardian.privacy.crossBorder.*` namespace.

### Key Settings
- `enabled`
- `highRiskVendors`
- `requireTransferMechanismDisclosure`
- `requireSCCorAdequacyMention`
- `requireDPAControllerProcessorLanguage`
- `severity`

---

## Detection Logic

### AG-GDPR-XB-001: Vendor / Endpoint Detection
Detects known vendors or endpoints associated with cross-border data transfer.

### AG-GDPR-XB-002: Missing Transfer Disclosure
Triggered when:
- vendor signal detected AND
- policy text exists AND
- no transfer disclosure language is found

### AG-GDPR-XB-003: Missing Safeguards (SCC / Adequacy)
Triggered when:
- vendor signal OR transfer disclosure exists AND
- no safeguard language is found

### AG-GDPR-XB-004: Missing Controller / Processor / DPA Language
Triggered when:
- vendor signal OR transfer disclosure exists AND
- no controller/processor or DPA references are found

---

## What This Means

The analyzer is **context-aware**:
- It avoids false positives when no transfer signals are present
- It escalates findings when vendor + policy mismatch occurs
- It links technical detection (endpoints) to legal obligations (policy text)

---

## Notes

- This module provides **risk signals**, not legal certification
- Always validate findings with legal/compliance review
- Custom vendor lists and keywords can be tuned for your organization

---

## Future Expansion

Planned improvements include:
- Region inference (EU vs US vs global)
- Data residency detection
- Consent flow correlation
- API-level data transfer tracing
