// src/analyzers/utils/personal-data.ts
export type MatchHit = { type: string; index: number; value: string };

const EMAIL = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const PHONE = /\b(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{4}\b/g;
const IP = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;                 // IPv4
const NAME_LIKE = /\b(?:Patient|Member|User)\s*[A-Z][a-z]+(?:\s[A-Z][a-z]+)?\b/g;

const SSN_US = /\b\d{3}-\d{2}-\d{4}\b/g;
const MRN = /\bMRN[:\s]*[A-Z0-9-]{5,}\b/gi;
const DOB = /\b(?:DOB|Date of Birth)[:\s]*(?:\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})\b/gi;

export function findPII(text: string): MatchHit[] {
  return collect(text, [
    { type: 'email', re: EMAIL },
    { type: 'phone', re: PHONE },
    { type: 'ip', re: IP },
    { type: 'name_like', re: NAME_LIKE },
  ]);
}

export function findSpecialCategories(text: string): MatchHit[] {
  return collect(text, [
    { type: 'us_ssn', re: SSN_US },
    { type: 'mrn', re: MRN },
    { type: 'dob', re: DOB },
  ]);
}

function collect(text: string, regs: { type: string; re: RegExp }[]): MatchHit[] {
  const hits: MatchHit[] = [];
  for (const { type, re } of regs) {
    let m: RegExpExecArray | null;
    re.lastIndex = 0;
    while ((m = re.exec(text)) !== null) {
      hits.push({ type, index: m.index, value: m[0] });
    }
  }
  return hits;
}

