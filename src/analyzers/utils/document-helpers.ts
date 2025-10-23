export const PHI_PATTERNS: { type: string; re: RegExp }[] = [
  { type: 'SSN', re: /\b\d{3}-\d{2}-\d{4}\b/g },
  { type: 'DOB', re: /\b(?:dob|date of birth)\s*[:\-]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/gi },
  { type: 'MRN', re: /\b(?:mrn|medical\s*record\s*number)\s*[:\-]?\s*[\w-]{4,}\b/gi },
  { type: 'Email', re: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi },
  { type: 'Phone', re: /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}\b/g },
  { type: 'Address', re: /\b\d{1,5}\s+[A-Za-z0-9 .,-]+(?:Ave|Av|St|Street|Rd|Road|Blvd|Lane|Ln|Dr|Drive)\b/gi },
  { type: 'Diagnosis', re: /\b(diagnosis|diagnosed|bipolar|cancer|diabetes|hiv|depression|anxiety)\b/gi },
  { type: 'Insurance/Member ID', re: /\b(?:member\s*id|policy\s*id|insurance)\b[:\-]?\s*[\w-]{4,}\b/gi }
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
