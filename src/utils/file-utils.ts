// Accessibility Guardian — Proprietary Evaluation License (30 Days)
// LicenseRef-EVALUATION
// © 2025 Richard Robert Wright — All rights reserved.
import * as fs from 'fs/promises';

export async function readFileSafe(p: string): Promise<string> {
  try { return await fs.readFile(p, 'utf8'); }
  catch { return ''; }
}
