// Accessibility Guardian — Proprietary Evaluation License (30 Days)
// LicenseRef-EVALUATION
// © 2025 Richard Robert Wright — All rights reserved.
// src/analyzers/utils/personal-data.ts
export type MatchHit = { type: string; index: number; value: string };

const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const PHONE = /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{4}/g;
const IP = /(?:\d{1,3}\.){3}\d{1,3}/g;                 // IPv4
const NAME_LIKE = /(?:Patient|Member|User)\s*[A-Z][a-z]+(?:\s[A-Z][a-z]+)?/g;

const SSN_US = /\d{3}-\d{2}-\d{4}/g;
const MRN = /MRN[:\s]*[A-Z0-9-]{5,}/gi;
const DOB = /(?:DOB|Date of Birth)[:\s]*(?:\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/gi;

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

// ---- Stub: PII detection for PIPEDA/APP (placeholder logic) ----
export type PersonalDataFinding = {
  type: string;
  value: string;
  context: string;
};

export function detectPersonalData(_text: string): PersonalDataFinding[] {
  // Minimal placeholder: no-op detector for now.
  return [];
}
