export type RGB = { r: number; g: number; b: number; a: number };

export function parseColor(input: string): RGB | null {
  const s = input.trim().toLowerCase();

  // basic named colors (extend as needed)
  if (NAMED[s]) return NAMED[s];

  // hex #rgb / #rrggbb
  const hex = s.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    const h = hex[1];
    if (h.length === 3) {
      const r = parseInt(h[0] + h[0], 16);
      const g = parseInt(h[1] + h[1], 16);
      const b = parseInt(h[2] + h[2], 16);
      return { r, g, b, a: 1 };
    }
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
      a: 1
    };
  }

  // rgb()/rgba()
  const rgb = s.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/);
  if (rgb) {
    const r = clamp255(+rgb[1]);
    const g = clamp255(+rgb[2]);
    const b = clamp255(+rgb[3]);
    const a = rgb[4] !== undefined ? clamp01(+rgb[4]) : 1;
    return { r, g, b, a };
  }

  return null;
}

export function contrastRatio(fg: RGB, bg: RGB): number {
  // flatten alpha over background
  const a = fg.a ?? 1;
  const r = Math.round(fg.r * a + bg.r * (1 - a));
  const g = Math.round(fg.g * a + bg.g * (1 - a));
  const b = Math.round(fg.b * a + bg.b * (1 - a));
  const L1 = relLum(r, g, b);
  const L2 = relLum(bg.r, bg.g, bg.b);
  const [hi, lo] = L1 >= L2 ? [L1, L2] : [L2, L1];
  return (hi + 0.05) / (lo + 0.05);
}

function relLum(r: number, g: number, b: number): number {
  const lin = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

const clamp255 = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

const NAMED: Record<string, RGB> = {
  black: { r: 0, g: 0, b: 0, a: 1 },
  white: { r: 255, g: 255, b: 255, a: 1 },
  red:   { r: 255, g: 0, b: 0, a: 1 },
  green: { r: 0, g: 128, b: 0, a: 1 },
  blue:  { r: 0, g: 0, b: 255, a: 1 },
  transparent: { r: 255, g: 255, b: 255, a: 0 }
};
