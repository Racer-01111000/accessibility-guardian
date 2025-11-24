// Accessibility Guardian — Proprietary Evaluation License (30 Days)
// LicenseRef-EVALUATION
// © 2025 Richard Robert Wright — All rights reserved.
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

export async function writeJsonReport(prefix: string, data: unknown): Promise<string> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), `${prefix}-`));
  const file = path.join(dir, 'report.json');
  await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf8');
  return file;
}
