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
  const howTo: string[] = [];

  if (!hasCert) {
    steps.push("1. File a Certificate of Formation or Registration with the Texas Secretary of State per TX Property Code §207.006.");
    steps.push("2. Submit the Legacy Filing before the March 1, 2026 deadline to avoid penalties.");
    steps.push("3. Ensure the HOA's management certificate is uploaded to the TREC portal.");

    howTo.push("HOW TO FILE A CERTIFICATE OF FORMATION:");
    howTo.push("• Go to the Texas Secretary of State website: https://www.sos.state.tx.us");
    howTo.push("• Navigate to 'Business & Nonprofits' → 'Filing with the Secretary of State'");
    howTo.push("• Select 'Nonprofit Corporation' or 'Unincorporated Nonprofit Association' depending on your HOA structure");
    howTo.push("• Complete Form 202 (Certificate of Formation) — you'll need the HOA's legal name, registered agent info, and purpose statement");
    howTo.push("• Filing fee is $25 online or by mail");
    howTo.push("");
    howTo.push("HOW TO SUBMIT THE LEGACY FILING:");
    howTo.push("• Visit the TREC (Texas Real Estate Commission) portal at https://www.trec.texas.gov");
    howTo.push("• Log in or create an account for the HOA");
    howTo.push("• Navigate to 'HOA Registration' and select 'Legacy Filing'");
    howTo.push("• Upload the Certificate of Formation, current bylaws, and most recent financial statement");
    howTo.push("• Provide the HOA's physical address, mailing address, and management company details");
    howTo.push("• Submit before March 1, 2026 — late filings may result in inability to enforce deed restrictions");
  }

  if (filingYear !== null && filingYear < 2025) {
    steps.push(`${steps.length + 1}. Current filing is from ${filingYear} — re-file an updated certificate before March 1, 2026.`);
    steps.push(`${steps.length + 1}. Verify all management company details are current in the new filing.`);

    howTo.push("");
    howTo.push("HOW TO RE-FILE / UPDATE AN EXISTING CERTIFICATE:");
    howTo.push("• Log in to the TREC portal at https://www.trec.texas.gov");
    howTo.push("• Search for the existing HOA filing using the HOA name or certificate number");
    howTo.push("• Select 'Amend' or 'Renew' — you cannot simply re-submit; you must reference the prior filing");
    howTo.push("• Update all fields: management company name, address, phone, and email");
    howTo.push("• Upload any new or amended governing documents (bylaws, declarations)");
    howTo.push("• Confirm the registered agent information is current with the Secretary of State");
    howTo.push("• Submit and retain the confirmation number for your records");
  }

  if (!hoa.management_company_email) {
    steps.push(`${steps.length + 1}. Add a valid management company email to the TREC filing for SB 711 compliance.`);

    howTo.push("");
    howTo.push("HOW TO ADD A MANAGEMENT COMPANY EMAIL:");
    howTo.push("• SB 711 requires HOAs to provide a publicly accessible contact email for the management company");
    howTo.push("• Log in to the TREC portal and locate the HOA's filing");
    howTo.push("• Edit the 'Management Company Information' section");
    howTo.push("• Enter a monitored email address (not a no-reply) — this will be publicly visible");
    howTo.push("• If the HOA is self-managed, use the board president's email or create a dedicated HOA email (e.g., board@yourhoa.org)");
    howTo.push("• Save and confirm the update");
  }

  if (isSelfManaged(name)) {
    steps.push(`${steps.length + 1}. Self-managed HOA — consider engaging a professional management company or building a dedicated community website for transparency.`);
    steps.push(`${steps.length + 1}. Ensure all required documents (bylaws, financials) are publicly accessible per SB 711.`);

    howTo.push("");
    howTo.push("HOW TO BRING A SELF-MANAGED HOA INTO COMPLIANCE:");
    howTo.push("• Option A — Hire a Management Company: Request proposals from licensed Texas community association managers. They handle filings, financials, and compliance on your behalf.");
    howTo.push("• Option B — Build a Community Website: Create a site that hosts required documents (bylaws, meeting minutes, financials, insurance certificates). This satisfies SB 711 transparency requirements.");
    howTo.push("• Required public documents under SB 711: dedicatory instruments, bylaws, rules, current budget, most recent financial audit or review, insurance certificates");
    howTo.push("• Post meeting notices at least 72 hours in advance on the website and at a physical location in the community");
    howTo.push("• Maintain a current resident directory (opt-in) and provide an online portal for dues payment if possible");
  }

  if (steps.length === 0) {
    steps.push("This HOA appears compliant. Monitor for annual renewal requirements.");
    howTo.push("ONGOING COMPLIANCE CHECKLIST:");
    howTo.push("• Verify your TREC filing annually — certificates may need renewal depending on your filing date");
    howTo.push("• Keep management company contact info updated within 30 days of any change");
    howTo.push("• Ensure all governing documents remain publicly accessible per SB 711");
    howTo.push("• File any amendments to bylaws or declarations with the county clerk within 30 days");
  }

  const complianceDetails = steps.join("\n");
  const complianceHowTo = howTo.join("\n");

  return { riskLevel, riskLabel, riskDescription, legalityFlag, filingYear, complianceDetails, complianceHowTo };
}
