// Accessibility Guardian — Proprietary Evaluation License (30 Days)
// LicenseRef-EVALUATION
// © 2025 Richard Robert Wright — All rights reserved.
// src/analyzers/utils/jurisdiction.ts
export type Severity = 'info' | 'warn' | 'error';

export interface PrivacyConfig {
  regionProfile: 'EU' | 'CA' | 'AU' | 'US';
  allowedRegions: string[];      // e.g., ["EU"]
  dataProcessors: string[];      // e.g., ["s3.amazonaws.com"]
  requireConsentBanner: boolean; // GDPR cookie/consent banner
  severityThreshold: Severity;
}

/**
 * Very lightweight “cross-border” heuristic:
 * - If profile is EU and we see obvious US domains (e.g., s3.amazonaws.com)
 *   that are NOT listed in dataProcessors, flag a warning.
 */
export function crossBorderWarning(cfg: PrivacyConfig, text: string): string[] {
  const warnings: string[] = [];
  if (cfg.regionProfile !== 'EU') return warnings;

  const suspects = ['s3.amazonaws.com', 'us-east-1', 'us-west-2', 'azure.com', 'blob.core.windows.net', 'googleapis.com'];
  for (const host of suspects) {
    if (text.includes(host) && !cfg.dataProcessors.includes(host)) {
      warnings.push(`Possible cross-border transfer risk detected: ${host} (not in configured dataProcessors).`);
    }
  }
  return warnings;
}

// ---- Stub: cross-border transfer checks for PIPEDA/APP (placeholder logic) ----
export function checkCrossBorder(_region: string, _text: string): string[] {
  // Minimal placeholder: no cross-border warnings yet.
  return [];
}
