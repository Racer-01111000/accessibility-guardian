export const log = {
  info: (...a: any[]) => console.log('[AG]', ...a),
  warn: (...a: any[]) => console.warn('[AG]', ...a),
  error: (...a: any[]) => console.error('[AG]', ...a)
};
