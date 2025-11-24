// Accessibility Guardian — Proprietary Evaluation License (30 Days)
// LicenseRef-EVALUATION
// © 2025 Richard Robert Wright — All rights reserved.
export const log = {
  info: (...a: any[]) => console.log('[AG]', ...a),
  warn: (...a: any[]) => console.warn('[AG]', ...a),
  error: (...a: any[]) => console.error('[AG]', ...a)
};
