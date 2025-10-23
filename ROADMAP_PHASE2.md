# Phase 2 Roadmap — Accessibility Guardian Compliance Suite

## Overview
Phase 2 expands Accessibility Guardian beyond ADA/HTML auditing into full HIPAA and compliance-grade document analysis, batch scanning, and team visibility.

---

## 1️⃣ PDF & Email HIPAA Analyzers

### PDF Analyzer
- Parser: `pdf-parse` or `pdf.js`
- Extract text from each page → scan with PHI regex suite.
- Output: `hipaa-pdf-report.json` (page-level results).
- Future: OCR via `Tesseract.js` for scanned PDFs.

### Email Analyzer
- Formats: `.eml` / `.msg` (use `mailparser`).
- Extract headers + body → PHI regex → JSON report.
- Optional: scan attachments (handoff to PDF/DOCX analyzers).

---

## 2️⃣ Cross-File Batch Scanning
**Command:** `Accessibility: Scan Folder for Compliance`
- Recursively scan `.html`, `.docx`, `.pdf`, `.eml`.
- Async job queue; per-file + aggregate results.
- Unified `compliance-summary.json` with severity scores.
- Exports: CSV/HTML for client reporting.

---

## 3️⃣ Compliance Dashboard (Webview)
- `vscode.WebviewViewProvider` + Charting (Chart.js/Recharts).
- Views:
  - Violations by type and file
  - Heatmap of risk across workspace
  - Trend over time
- Actions:
  - Export as PDF
  - Share Summary
- Live updates via file watchers.

---

## 4️⃣ Optional Cloud Submission (Pilot)
- Secure uploads to private API.
- Endpoints:
  - `POST /api/uploadReport` (signed JSON)
  - `GET /api/summary` (team aggregates)
- Security:
  - HTTPS + JWT, AES-256 in transit
  - GPG/KMS at rest
  - PHI anonymized before transmission

---

## 5️⃣ Security & Compliance Hardening
- Add `LICENSE` (MIT or Apache-2.0).
- `.vscodeignore` to slim VSIX.
- Unit tests (Jest/Mocha) for regex accuracy.
- `.guardianrc.json` for custom patterns.
- Audit logging foundation (SOC 2 / HIPAA readiness).

---

## 6️⃣ Future Directions
- AI Auto-Fix suggestions for ADA rules.
- Live contrast preview / WCAG simulator.
- Accessibility + Privacy composite score.
- CLI for headless scans (Linux/CI).

---

**Maintainer Notes:**  
Modular design: ADA rules (editor) and HIPAA analyzers (on-demand) evolve independently. All detection is local-first for privacy.

© 2025 Accessibility Guardian Project — demonstration & research purposes.
