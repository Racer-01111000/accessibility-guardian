import { Finding } from "../types";

export function scanHtmlHipaa(text: string): Finding[] {
    const findings: Finding[] = [];

    // RULE 1: Detect Explicit SSN/PHI Labels (Existing)
    const ssnRegex = /\b(ssn|social security|dob|date of birth)\b/gi;
    let m: RegExpExecArray | null;
    while ((m = ssnRegex.exec(text))) {
        findings.push({
            code: "HIPAA-HTML-001",
            message: "Possible PHI identifier found in text.",
            severity: "warn",
            start: m.index,
            end: m.index + m[0].length,
        });
    }

    // RULE 2: Detect Risky Filenames (New!)
    // Looks for images with underscores (e.g., john_doe.png) or medical terms
    const imgFileRegex = /src=["']([^"']+)["']/gi;
    while ((m = imgFileRegex.exec(text))) {
        const fullMatch = m[0];         // src="john_doe_mri.png"
        const filename = m[1];          // john_doe_mri.png
        const startPos = m.index;

        // Check A: "Name-like" patterns (word_word.ext)
        // This catches "john_doe", "patient_scan", etc.
        const hasUnderscoreName = /[a-zA-Z]+_[a-zA-Z]+/.test(filename);

        // Check B: Dangerous medical keywords in filename
        const hasMedicalTerm = /(mri|xray|scan|patient|diagnosis|chart)/i.test(filename);

        if (hasUnderscoreName || hasMedicalTerm) {
            findings.push({
                code: "HIPAA-IMG-001",
                message: `CRITICAL HIPAA RISK: Filename '${filename}' may contain PHI (Name or Condition). Rename to a random ID.`,
                severity: "error", // High severity!
                start: startPos,
                end: startPos + fullMatch.length,
            });
        }
    }

    return findings;
}
