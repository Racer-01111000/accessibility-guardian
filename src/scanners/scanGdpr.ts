import { Finding } from "../types";

export function scanGdpr(text: string): Finding[] {
  const findings: Finding[] = [];

  // RULE 1: High-Risk Data Processors
  const vendorPatterns = [
    { name: "Google Analytics", regex: /googletagmanager\.com|google-analytics\.com/gi },
    { name: "Facebook Pixel", regex: /connect\.facebook\.net|facebook\.com\/tr/gi },
    { name: "Google Fonts", regex: /fonts\.googleapis\.com/gi },
  ];

  vendorPatterns.forEach((vendor) => {
    const re = new RegExp(vendor.regex);
    let match;
    while ((match = re.exec(text))) {
      findings.push({
        code: "GDPR-VENDOR-001",
        message: `GDPR Warning: ${vendor.name} detected. Ensure DPA/Consent.`,
        severity: "warn",
        start: match.index,
        end: match.index + match[0].length,
      });
    }
  });

  // RULE 2: Cookie/Storage APIs
  const storageRegex = /document\.cookie|localStorage\.|sessionStorage\./gi;
  let storageMatch;
  while ((storageMatch = storageRegex.exec(text))) {
    findings.push({
      code: "GDPR-COOKIE-001",
      message: "Storage API detected. Requires Cookie Policy disclosure.",
      severity: "info",
      start: storageMatch.index,
      end: storageMatch.index + storageMatch[0].length,
    });
  }

  return findings;
}
