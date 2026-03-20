import type { HOAData } from "@/pages/Index";

export type RiskLevel = "high" | "medium" | "opportunity" | "compliant";

export interface ComplianceResult {
  riskLevel: RiskLevel;
  riskLabel: string;
  riskDescription: string;
  legalityFlag: string | null;
  filingYear: number | null;
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

  return { riskLevel, riskLabel, riskDescription, legalityFlag, filingYear };
}
