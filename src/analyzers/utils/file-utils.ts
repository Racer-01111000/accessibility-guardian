import * as fs from 'fs/promises';

export async function readFileSafe(p: string): Promise<string> {
  try { return await fs.readFile(p, 'utf8'); }
  catch { return ''; }
}
