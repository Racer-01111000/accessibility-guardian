// Accessibility Guardian — Proprietary Evaluation License (30 Days)
// LicenseRef-EVALUATION
// © 2025 Richard Robert Wright — All rights reserved.
export const PHI_REGEX = {
  SSN: /\d{3}-\d{2}-\d{4}/g,
  DOB: /(?:dob|date of birth)\s*[:\-]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/gi,
  MRN: /(?:mrn|medical\s*record\s*number)\s*[:\-]?\s*[\w-]{4,}/gi,
  Email: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
  Phone: /(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}/g
};
