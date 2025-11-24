// Accessibility Guardian — Proprietary Evaluation License (30 Days)
// LicenseRef-EVALUATION
// © 2025 Richard Robert Wright — All rights reserved.
export const PHI_PATTERNS: { type: string; re: RegExp }[] = [
  { type: 'SSN', re: /\d{3}-\d{2}-\d{4}/g },
  { type: 'DOB', re: /(?:dob|date of birth)\s*[:\-]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/gi },
  { type: 'MRN', re: /(?:mrn|medical\s*record\s*number)\s*[:\-]?\s*[\w-]{4,}/gi },
  { type: 'Email', re: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi },
  { type: 'Phone', re: /(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}/g },
  { type: 'Address', re: /\d{1,5}\s+[A-Za-z0-9 .,-]+(?:Ave|Av|St|Street|Rd|Road|Blvd|Lane|Ln|Dr|Drive)/gi },
  { type: 'Diagnosis', re: /(diagnosis|diagnosed|bipolar|cancer|diabetes|hiv|depression|anxiety)/gi },
  { type: 'Insurance/Member ID', re: /(?:member\s*id|policy\s*id|insurance)[:\-]?\s*[\w-]{4,}/gi }
];

export function stripXml(xml: string): string {
  let t = xml.replace(/<[^>]+>/g, ' ');
  t = t.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  return t.replace(/\s+/g, ' ').trim();
}

export function sliceWithContext(text: string, index: number, len: number, pad = 40): string {
  const start = Math.max(0, index - pad);
  const end = Math.min(text.length, index + len + pad);
  return text.slice(start, end);
}

// ---- Stub: extract text for PIPEDA/APP (placeholder logic) ----
export async function extractTextFromDocument(_resource: any): Promise<string> {
  // Minimal stub for Phase 3 analyzers; replace with real text extraction later.
  return '';
}
