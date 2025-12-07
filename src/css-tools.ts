// Accessibility Guardian — Proprietary Evaluation License (30 Days)
// LicenseRef-EVALUATION
// © 2025 Richard Robert Wright — All rights reserved.

/**
* Lightweight CSS parser for inline style attributes.
* Used by rules such as color-contrast, focus indicators, etc.
*/

export interface CssMap {
[key: string]: string;
}

/**
* Parse a CSS inline style string into a key/value object.
*
* Example:
* "color: red; background-color: #fff"
* → { color: "red", "background-color": "#fff" }
*/
export function parseInlineStyle(style: string | undefined | null): CssMap {
const result: CssMap = {};
if (!style) return result;

// Split by semicolon, ignore empty pieces
const parts = style.split(";").map(s => s.trim()).filter(Boolean);

for (const part of parts) {
const idx = part.indexOf(":");
if (idx === -1) continue;

const key = part.slice(0, idx).trim().toLowerCase();
const value = part.slice(idx + 1).trim();

if (key && value) result[key] = value;
}

return result;
}

/**
* Extract a numeric pixel value from common CSS units.
*
* Supports:
* - px ("12px") → 12
* - unitless numbers ("0", "1.5") → number
* - ignores others (%, em, rem, vh, etc.) → null
*/
export function getNumericPx(value: string | undefined | null): number | null {
if (!value) return null;

const trimmed = value.trim().toLowerCase();

if (/^-?\d+(\.\d+)?px$/.test(trimmed)) {
return parseFloat(trimmed.replace("px", ""));
}

if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
return parseFloat(trimmed);
}

return null;
}

/**
* Convenience helper:
* getProperty(styleString, "background-color")
*/
export function getStyleProperty(
style: string | undefined | null,
prop: string
): string | undefined {
const parsed = parseInlineStyle(style);
return parsed[prop.toLowerCase()];
}

/**
* Quickly check if an inline style contains *any* of a set of keys.
* Used by focus indicator rules.
*/
export function containsAnyProperty(
style: string | undefined | null,
keys: string[]
): boolean {
if (!style) return false;

const css = parseInlineStyle(style);

return keys.some(k => k.toLowerCase() in css);
}
