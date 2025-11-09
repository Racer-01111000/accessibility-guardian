cd ~/accessibility-guardian
cat > README.md <<'EOF'
## Accessibility Guardian (VS Code Extension)

**HIPAA • GDPR • ADA Compliance Scanner for VS Code**  
Catch the “Big 5” accessibility and privacy risks **before they ship**.  

---

### ✨ Features

- **HIPAA Analyzer** — detects exposure of PHI (Protected Health Information) in DOCX, PDF, EML, and HTML files.  
- **GDPR Module (EU)** — scans data-handling text for cross-border compliance and consent requirements.  
- **PIPEDA (Canada) & APP (Australia)** — evaluates storage, processor, and consent alignment per region.  
- **ADA / WCAG Accessibility Checks** — flags missing alt tags, low contrast, and semantic violations in HTML.  
- **Unified Dashboard** — view risk summaries and recommendations directly in the VS Code Problems panel.  
- **Lightweight Build** — under 1 MB packaged, bundled with `esbuild` for performance and portability.  

---

### Dev

```bash
npm install
npm run build
# F5 in VS Code -> Extension Development Host

