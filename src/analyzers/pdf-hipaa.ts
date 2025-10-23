// Placeholder analyzer for PDFs. In Phase 2, add pdf-parse or pdf.js.
// Exporting a no-op command for future wiring to keep imports stable.
export async function scanPdfHipaaCommand() {
  throw new Error('PDF HIPAA scanning not implemented yet. (Planned: extract text → PHI regex)');
}
