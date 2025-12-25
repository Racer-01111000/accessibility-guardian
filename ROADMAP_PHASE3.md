# Phase 3 — EU GDPR Cross-Border Compliance Module

## Goal
Add a dedicated module that flags EU GDPR cross-border data transfer risks in scanned assets (HTML, JS) and verifies legal disclosures.

## Deliverables
1. **Documentation**
   - New guide: `docs/gdpr-cross-border.md`
   - Update `README.md` with a "GDPR Cross-Border" section.

2. **Configuration** (`package.json`)
   - `accessibilityGuardian.privacy.crossBorder.enabled` (boolean, default true)
   - `accessibilityGuardian.privacy.crossBorder.highRiskVendors` (array, default ["google", "facebook", "aws", ...])
   - `accessibilityGuardian.privacy.crossBorder.requireTransferMechanismDisclosure` (boolean, default true)
   - `accessibilityGuardian.privacy.crossBorder.severity` (enum: info, warn, error)

3. **Analyzer Module**
   - New file: `src/analyzers/privacy/gdprCrossBorderAnalyzer.ts`
   - Logic: Detect US-centric vendors (Rule AG-GDPR-XB-001).
   - Logic: Scan policy text for "SCC", "Adequacy" (Rules AG-GDPR-XB-002/003).

## Acceptance Criteria
- [ ] Findings appear with IDs `AG-GDPR-XB-xxx`.
- [ ] Toggling `.enabled` to false stops the checks.
