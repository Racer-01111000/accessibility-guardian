import { Finding } from "../types";

export function scanHtmlHipaa(text: string): Finding[] {
  const findings: Finding[] = [];
  // Example rule: Detect SSN references
  const re = /\b(ssn|social security)\b/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    findings.push({
      code: "HIPAA-HTML-001",
      message: "Possible PHI reference (SSN) in HTML content.",
      severity: "warn",
      start: m.index,
      end: m.index + m[0].length,
    });
  }
  return findings;
}
