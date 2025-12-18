import { Finding } from "../types";

export function scanWcag(text: string): Finding[] {
  const findings: Finding[] = [];

  // RULE 1: Images missing alt text
  const imgRegex = /<img[^>]*>/gi;
  let imgMatch: RegExpExecArray | null;
  while ((imgMatch = imgRegex.exec(text))) {
    const tagContent = imgMatch[0];
    const hasAltAttribute = /alt=/i.test(tagContent);

    if (!hasAltAttribute) {
      findings.push({
        code: "WCAG-1.1.1",
        message: "Image is missing an 'alt' attribute.",
        severity: "error",
        start: imgMatch.index,
        end: imgMatch.index + tagContent.length,
      });
    }
  }

  // RULE 2: Empty Buttons
  const btnRegex = /<button[^>]*>([\s\S]*?)<\/button>/gi;
  let btnMatch: RegExpExecArray | null;
  while ((btnMatch = btnRegex.exec(text))) {
    const fullTag = btnMatch[0];
    const innerContent = btnMatch[1].trim();
    const hasAriaLabel = /aria-label=/i.test(fullTag);

    if (innerContent.length === 0 && !hasAriaLabel) {
      findings.push({
        code: "WCAG-4.1.2",
        message: "Button is empty and has no aria-label.",
        severity: "error",
        start: btnMatch.index,
        end: btnMatch.index + fullTag.length,
      });
    }
  }

  return findings;
}
