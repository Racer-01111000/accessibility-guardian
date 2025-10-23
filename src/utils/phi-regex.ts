export const PHI_REGEX = {
  SSN: /\b\d{3}-\d{2}-\d{4}\b/g,
  DOB: /\b(?:dob|date of birth)\s*[:\-]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/gi,
  MRN: /\b(?:mrn|medical\s*record\s*number)\s*[:\-]?\s*[\w-]{4,}\b/gi,
  Email: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
  Phone: /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}\b/g
};
