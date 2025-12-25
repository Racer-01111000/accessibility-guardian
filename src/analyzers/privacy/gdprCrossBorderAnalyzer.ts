import { Finding, Severity } from "../../types";
import { getConfig } from "../../config";

const RULESET = {
  VENDOR_ENDPOINT_XB: "AG-GDPR-XB-001",
  MISSING_TRANSFER_DISCLOSURE: "AG-GDPR-XB-002",
  MISSING_SCC_ADEQUACY: "AG-GDPR-XB-003",
  MISSING_CONTROLLER_PROCESSOR: "AG-GDPR-XB-004",
};

function toSeverity(s: string): Severity {
  if (s === "error") return "error";
  if (s === "info") return "info";
  return "warn"; // default
}

function hasAny(text: string, needles: string[]) {
  const t = (text || "").toLowerCase();
  return needles.some((n) => t.includes(n.toLowerCase()));
}

export function gdprCrossBorderAnalyzer(input: {
  htmlText: string;
  urls: string[];
  policyText?: string;
}): Finding[] {
  const cfg = getConfig();

  // 1. Safety Check: Is module enabled?
  if (!cfg["privacy.crossBorder.enabled"]) return [];

  const findings: Finding[] = [];
  const baseSeverity = toSeverity(cfg["privacy.crossBorder.severity"] || "warn");
  const highRiskVendors: string[] = cfg["privacy.crossBorder.highRiskVendors"] || [];

  // Normalize inputs
  const urlsText = (input.urls || []).join("\n").toLowerCase();
  const htmlLower = (input.htmlText || "").toLowerCase();
  const combinedContent = urlsText + "\n" + htmlLower;

  // ---------------------------------------------------------
  // Rule 1: Third-party Vendor / Endpoint Detection (AG-GDPR-XB-001)
  // ---------------------------------------------------------
  if (hasAny(combinedContent, highRiskVendors)) {
    const matched = highRiskVendors
      .filter((v) => combinedContent.includes(v.toLowerCase()))
      .slice(0, 10);

    findings.push({
      id: RULESET.VENDOR_ENDPOINT_XB,
      severity: baseSeverity,
      title: "Potential cross-border data transfer via third-party vendor",
      description:
        "Detected third-party vendor keywords or endpoints that commonly involve cross-border data processing (e.g., US-based servers).",
      evidence: { vendors: matched },
      remediation:
        "Confirm vendor data regions. Ensure privacy policy discloses transfers and cites safeguards (e.g., SCCs/Adequacy).",
      tags: ["gdpr", "privacy", "cross-border"],
    });
  }

  // ---------------------------------------------------------
  // Policy Text Checks (Requires input.policyText)
  // ---------------------------------------------------------
  const policy = (input.policyText || "").toLowerCase();

  // Rule 2: Missing Transfer Disclosure (AG-GDPR-XB-002)
  if (cfg["privacy.crossBorder.requireTransferMechanismDisclosure"] && policy) {
    const transferTriggers = [
      "international transfer",
      "cross-border",
      "outside the eea",
      "outside of the eea",
      "outside the eu",
      "transfer of personal data",
      "data transfer",
      "third countries",
    ];

    if (!hasAny(policy, transferTriggers)) {
      findings.push({
        id: RULESET.MISSING_TRANSFER_DISCLOSURE,
        severity: baseSeverity,
        title: "Missing cross-border transfer disclosure language",
        description:
          "Policy text lacks common keywords indicating that international data transfers are disclosed.",
        evidence: { checked: transferTriggers },
        remediation:
          "Add a clear statement covering international transfers, destinations, and safeguards.",
        tags: ["gdpr", "privacy", "policy"],
      });
    }
  }

  // Rule 3: Missing SCC / Adequacy Mention (AG-GDPR-XB-003)
  // Note: We check config keys dynamically to allow easy updates
  if (policy && (!cfg["privacy.crossBorder.requireSCCorAdequacyMention"] === false)) {
    // defaulted to true in logic if undefined, or strictly check config
    const safeguards = [
      "standard contractual clauses",
      "scc",
      "adequacy decision",
      "adequacy",
      "binding corporate rules",
      "bcr",
      "uk idta",
    ];

    if (!hasAny(policy, safeguards)) {
      findings.push({
        id: RULESET.MISSING_SCC_ADEQUACY,
        severity: baseSeverity,
        title: "No SCC/Adequacy safeguard language detected",
        description:
          "Policy text does not reference standard GDPR transfer safeguards (SCCs, Adequacy, BCRs).",
        evidence: { checked: safeguards },
        remediation:
          "If transferring data, reference the specific legal safeguard used (e.g., Standard Contractual Clauses).",
        tags: ["gdpr", "privacy", "safeguards"],
      });
    }
  }

  return findings;
}
