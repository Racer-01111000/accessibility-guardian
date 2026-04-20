import { Finding, Severity } from '../../types';
import { getConfig } from '../../config';

const RULESET = {
  VENDOR_ENDPOINT_XB: 'AG-GDPR-XB-001',
  MISSING_TRANSFER_DISCLOSURE: 'AG-GDPR-XB-002',
  MISSING_SCC_ADEQUACY: 'AG-GDPR-XB-003',
  MISSING_CONTROLLER_PROCESSOR: 'AG-GDPR-XB-004'
};

const TRANSFER_DISCLOSURE_TRIGGERS = [
  'international transfer',
  'international transfers',
  'cross-border',
  'cross border',
  'outside the eea',
  'outside of the eea',
  'outside the eu',
  'transfer of personal data',
  'data transfer',
  'third countries'
];

const SAFEGUARD_TRIGGERS = [
  'standard contractual clauses',
  'scc',
  'adequacy decision',
  'adequacy',
  'binding corporate rules',
  'bcr',
  'uk idta',
  'international data transfer agreement',
  'data privacy framework',
  'dpf'
];

const ROLE_TRIGGERS = [
  'controller',
  'processor',
  'data processing agreement',
  'dpa',
  'sub-processor',
  'subprocessor'
];

function toSeverity(input: string): Severity {
  if (input === 'error') return 'error';
  if (input === 'info') return 'info';
  return 'warn';
}

function normalize(value: string): string {
  return (value || '').toLowerCase();
}

function hasAny(text: string, needles: string[]): boolean {
  const haystack = normalize(text);
  return needles.some((needle) => haystack.includes(normalize(needle)));
}

function matchedValues(text: string, needles: string[], limit = 10): string[] {
  const haystack = normalize(text);
  return needles.filter((needle) => haystack.includes(normalize(needle))).slice(0, limit);
}

export function gdprCrossBorderAnalyzer(input: {
  htmlText: string;
  urls: string[];
  policyText?: string;
}): Finding[] {
  const cfg = getConfig();
  if (!cfg['privacy.crossBorder.enabled']) return [];

  const findings: Finding[] = [];
  const baseSeverity = toSeverity(cfg['privacy.crossBorder.severity'] || 'warn');
  const highRiskVendors: string[] = cfg['privacy.crossBorder.highRiskVendors'] || [];

  const urlsText = (input.urls || []).join('\n');
  const htmlText = input.htmlText || '';
  const combinedContent = `${urlsText}\n${htmlText}`;
  const policyText = input.policyText || '';

  const matchedVendors = matchedValues(combinedContent, highRiskVendors);
  const vendorSignalDetected = matchedVendors.length > 0;
  const policyHasTransferDisclosure = hasAny(policyText, TRANSFER_DISCLOSURE_TRIGGERS);
  const policyHasSafeguards = hasAny(policyText, SAFEGUARD_TRIGGERS);
  const policyHasRoleLanguage = hasAny(policyText, ROLE_TRIGGERS);

  if (vendorSignalDetected) {
    findings.push({
      id: RULESET.VENDOR_ENDPOINT_XB,
      severity: baseSeverity,
      title: 'Potential cross-border data transfer via third-party vendor',
      description:
        'Detected vendor keywords or endpoints commonly associated with international data processing. Review transfer regions, legal basis, and safeguards.',
      evidence: {
        vendors: matchedVendors,
        urls: input.urls || []
      },
      remediation:
        'Confirm where each vendor processes personal data, document the transfer basis, and ensure disclosures and safeguards are reflected in policy text.',
      tags: ['gdpr', 'privacy', 'cross-border']
    });
  }

  if (cfg['privacy.crossBorder.requireTransferMechanismDisclosure'] && policyText && vendorSignalDetected && !policyHasTransferDisclosure) {
    findings.push({
      id: RULESET.MISSING_TRANSFER_DISCLOSURE,
      severity: baseSeverity,
      title: 'Missing cross-border transfer disclosure language',
      description:
        'Policy text does not appear to disclose international or cross-border transfers even though third-party vendor signals were detected.',
      evidence: {
        checked: TRANSFER_DISCLOSURE_TRIGGERS,
        vendors: matchedVendors
      },
      remediation:
        'Add clear disclosure covering international transfers, relevant regions/countries, and the legal basis used for those transfers.',
      tags: ['gdpr', 'privacy', 'policy']
    });
  }

  if (cfg['privacy.crossBorder.requireSCCorAdequacyMention'] && policyText && (vendorSignalDetected || policyHasTransferDisclosure) && !policyHasSafeguards) {
    findings.push({
      id: RULESET.MISSING_SCC_ADEQUACY,
      severity: baseSeverity,
      title: 'No SCC/adequacy safeguard language detected',
      description:
        'Policy text does not reference common GDPR transfer safeguards such as SCCs, adequacy decisions, BCRs, or the UK IDTA.',
      evidence: {
        checked: SAFEGUARD_TRIGGERS,
        vendors: matchedVendors
      },
      remediation:
        'Reference the specific safeguard used for cross-border transfers, such as Standard Contractual Clauses, an adequacy decision, BCRs, or the UK IDTA.',
      tags: ['gdpr', 'privacy', 'safeguards']
    });
  }

  if (cfg['privacy.crossBorder.requireDPAControllerProcessorLanguage'] && policyText && (vendorSignalDetected || policyHasTransferDisclosure) && !policyHasRoleLanguage) {
    findings.push({
      id: RULESET.MISSING_CONTROLLER_PROCESSOR,
      severity: baseSeverity,
      title: 'Controller/processor or DPA language not detected',
      description:
        'Policy text does not clearly define controller/processor roles or mention a data processing agreement even though external processing signals were detected.',
      evidence: {
        checked: ROLE_TRIGGERS,
        vendors: matchedVendors
      },
      remediation:
        'Clarify controller/processor roles and reference any DPA or sub-processor governance relevant to the detected vendors.',
      tags: ['gdpr', 'privacy', 'roles']
    });
  }

  return findings;
}
