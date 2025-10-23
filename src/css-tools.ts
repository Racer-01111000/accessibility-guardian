export function hasInlineStyle(attrChunk: string, prop: string, value?: RegExp) {
  const re = new RegExp(`\\b${prop}\\s*:\\s*([^;]+)`, 'i');
  const m = re.exec(attrChunk);
  if (!m) return false;
  return value ? value.test(m[1]) : true;
}
