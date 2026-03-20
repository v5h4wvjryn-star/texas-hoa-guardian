import type { HOAData } from "@/pages/Index";

export type RiskLevel = "high" | "medium" | "opportunity" | "compliant";

export interface ComplianceResult {
  riskLevel: RiskLevel;
  riskLabel: string;
  riskDescription: string;
  legalityFlag: string | null;
  filingYear: number | null;
  complianceDetails: string;
}

/** Extract a 4-digit year from the certificate URL filename */
function extractYearFromUrl(url: string): number | null {
  // Match years in filenames like "2024 Edgemont" or "certificate 2022038306"
  const matches = url.match(/(?:^|\D)(20[1-2]\d)(?:\D|$)/g);
  if (!matches || matches.length === 0) return null;
  // Take the latest year found
  const years = matches.map((m) => parseInt(m.replace(/\D/g, "").slice(0, 4)));
  return Math.max(...years);
}

/** Detect if HOA name suggests self-managed or no management company */
function isSelfManaged(name: string): boolean {
  const lower = name.toLowerCase();
  return (
    lower.includes("self managed") ||
    lower.includes("self-managed") ||
    lower.includes("no management") ||
    lower.includes("owner managed") ||
    lower.includes("owner-managed") ||
    lower.includes("civic club") ||
    lower.includes("civic association")
  );
}

export function scoreCompliance(hoa: HOAData): ComplianceResult {
  const certUrl = hoa.certificate?.url?.trim() || "";
  const hasCert = certUrl.length > 0;
  const name = hoa.name || "";
  const filingYear = hasCert ? extractYearFromUrl(certUrl) : null;

  // --- Risk Level ---
  let riskLevel: RiskLevel;
  let riskLabel: string;
  let riskDescription: string;

  if (!hasCert) {
    riskLevel = "high";
    riskLabel = "High Risk";
    riskDescription = "No certificate on file — potential §207.006 violation";
  } else if (isSelfManaged(name)) {
    riskLevel = "opportunity";
    riskLabel = "Opportunity";
    riskDescription = "Self/civic-managed — prime lead for web build services";
  } else if (filingYear !== null && filingYear < 2024) {
    riskLevel = "medium";
    riskLabel = "Medium Risk";
    riskDescription = `Certificate dated ${filingYear} — may need renewal`;
  } else {
    riskLevel = "compliant";
    riskLabel = "Compliant";
    riskDescription = "Certificate on file and appears current";
  }

  // --- Legality Check ---
  let legalityFlag: string | null = null;

  if (!hasCert) {
    legalityFlag = "Missing Legacy Filing — March 1, 2026 deadline at risk";
  } else if (filingYear !== null && filingYear < 2025) {
    legalityFlag = `Outdated Filing (${filingYear}) — must re-file before March 1, 2026`;
  }

  // --- Actionable Compliance Instructions ---
  const steps: string[] = [];

  if (!hasCert) {
    steps.push("1. File a Certificate of Formation or Registration with the Texas Secretary of State per TX Property Code §207.006.");
    steps.push("2. Submit the Legacy Filing before the March 1, 2026 deadline to avoid penalties.");
    steps.push("3. Ensure the HOA's management certificate is uploaded to the TREC portal.");
  }

  if (filingYear !== null && filingYear < 2025) {
    steps.push(`${steps.length + 1}. Current filing is from ${filingYear} — re-file an updated certificate before March 1, 2026.`);
    steps.push(`${steps.length + 1}. Verify all management company details are current in the new filing.`);
  }

  if (!hoa.management_company_email) {
    steps.push(`${steps.length + 1}. Add a valid management company email to the TREC filing for SB 711 compliance.`);
  }

  if (isSelfManaged(name)) {
    steps.push(`${steps.length + 1}. Self-managed HOA — consider engaging a professional management company or building a dedicated community website for transparency.`);
    steps.push(`${steps.length + 1}. Ensure all required documents (bylaws, financials) are publicly accessible per SB 711.`);
  }

  if (steps.length === 0) {
    steps.push("This HOA appears compliant. Monitor for annual renewal requirements.");
  }

  const complianceDetails = steps.join("\n");

  return { riskLevel, riskLabel, riskDescription, legalityFlag, filingYear, complianceDetails };
}
