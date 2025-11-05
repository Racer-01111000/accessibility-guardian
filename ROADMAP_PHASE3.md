# Phase 3 — Global Privacy Compliance Suite (GDPR + PIPEDA + APP)

## Goals
- Extend beyond HIPAA/PHI to full personal-data (PII) coverage.
- Add region profiles (EU, CA, AU) with cross-border transfer checks.
- One shared engine; light region-specific rules.

---
## Architecture

src/
├─ analyzers/
│  ├─ hipaa-us.ts                 (existing)
│  ├─ gdpr-eu.ts                  (NEW)
│  ├─ pipeda-ca.ts                (NEW)
│  ├─ app-au.ts                   (NEW)
│  └─ utils/
│     ├─ personal-data.ts         (NEW: shared PII detectors)
│     └─ jurisdiction.ts          (NEW: region profiles & transfers)
├─ utils/
│  └─ report-generator.ts         (existing, reuse)
└─ manifest/
   └─ settings-defaults.json      (extend with privacy.* keys)

---
## Region Profiles (jurisdiction.ts)

- **EU/GDPR**
  - Personal data = any info relating to an identifiable person.
  - Special categories (health, biometric, union membership, etc).
  - Requires lawful basis; limits cross-border (Art. 44–49).
- **Canada/PIPEDA**
  - Commercial context; consent & notice required.
- **Australia/APP**
  - 13 APPs; cross-border disclosure with reasonable steps.

> Strategy: *90% shared detection (personal-data.ts).* Region files add:
> - lawful basis/consent markers,
> - cross-border transfer warnings,
> - region-specific wording in findings.

---
## Detection Surface (personal-data.ts)

1) Identifiers: name, email, phone, address, DOB, device IDs, IP.
2) Government IDs: SSN/SIN (CA), TFN/Medicare (AU) – pattern gated by region.
3) Special categories: health terms, diagnoses, lab results, genetic/biometric.
4) Cookies & trackers in HTML (GDPR consent flags).
5) Cross-border hints: country codes, data-processor domains, cloud regions.

---
## Cross-Border Transfer Check (jurisdiction.ts)

Inputs:
- `privacy.regionProfile`: 'EU' | 'CA' | 'AU'
- `privacy.dataProcessors`: ['aws.com', 'gcp.com', 'azure.com', ...]
- `privacy.allowedRegions`: ['EU', 'CA', 'AU', 'US-adequate', ...]
- `privacy.requireDPA`: boolean (default true)

Logic:
- If profile = EU and processor domain resolves outside `allowedRegions`, flag:
  - “Potential restricted transfer (GDPR Art. 44–49). Add SCCs/DPA or use adequate region.”
- If profile = CA/AU, emit analogous cross-border disclosure warnings.

---
## Settings (package.json contributes > configuration)

- `privacy.regionProfile` (enum: EU, CA, AU, US)
- `privacy.allowedRegions` (array of strings)
- `privacy.dataProcessors` (array of domains)
- `privacy.requireConsentBanner` (bool; HTML scans)
- `privacy.scanEmailAttachments` (bool; future)
- `privacy.severityThreshold` (info|warn|error)

Defaults live in `src/manifest/settings-defaults.json`.

---
## Commands

- `accessibilityGuardian.scanGdprEu`
- `accessibilityGuardian.scanPipedaCa`
- `accessibilityGuardian.scanAppAu`

All mirror your HIPAA commands: open file picker → analyze → diagnostics + JSON report.

---
## Severity Model

- **error**: special-category data without lawful basis/consent; restricted transfer likely.
- **warning**: personal data + missing notice/consent; ambiguous transfer.
- **info**: transparency/doc requirements (policy link missing, DPA absent).

---
## Testing Matrix

| Doc type | EU | CA | AU |
|---------|----|----|----|
| HTML (webform w/ cookies) | consent + cookie banner | consent | consent |
| PDF (exported report) | special categories | commercial context | APP sensitive |
| DOCX (intake) | identifiers + purpose | identifiers + consent | identifiers + disclosure |
| TXT/EML (emails) | transfers + PII | transfers + PII | transfers + PII |

Add `/test-samples/privacy/*` per region with ground-truth JSON.

---
## Milestones

1) **Shared utils**: `personal-data.ts`, `jurisdiction.ts` ✅
2) **GDPR analyzer**: `gdpr-eu.ts` (HTML, TXT, PDF/DOCX via existing pipes)
3) **PIPEDA analyzer**: `pipeda-ca.ts` (reuse GDPR, add SIN & consent nuances)
4) **APP analyzer**: `app-au.ts` (add Medicare/TFN patterns + APP 8 transfers)
5) **Config UI** (package.json contributes.configuration)
6) **Batch scan** folder support (reuse Phase 2 plan)
7) **Docs**: README privacy section + sample reports

---
## Deliverables

- New analyzers + utils
- Config schema & defaults
- Sample docs & expected findings
- Changelog + version bump (0.3.0)
