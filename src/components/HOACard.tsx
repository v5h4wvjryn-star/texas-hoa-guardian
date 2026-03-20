import { useState } from "react";
import { Mail, Save, Building2, AlertTriangle, CheckCircle, Clock, Target, Globe, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { HOAData } from "@/pages/Index";
import { scoreCompliance, type RiskLevel } from "@/lib/compliance";

interface HOACardProps {
  hoa: HOAData;
  onSaveLead: (hoa: HOAData) => void;
  onGenerateOutreach: (hoa: HOAData) => void;
  isSaved?: boolean;
  index: number;
}

const riskConfig: Record<RiskLevel, { icon: typeof AlertTriangle; badgeClass: string; dotClass: string }> = {
  high: {
    icon: AlertTriangle,
    badgeClass: "bg-destructive/10 text-destructive",
    dotClass: "bg-destructive",
  },
  medium: {
    icon: Clock,
    badgeClass: "bg-warning/15 text-warning-foreground dark:text-warning",
    dotClass: "bg-warning",
  },
  opportunity: {
    icon: Target,
    badgeClass: "bg-[hsl(24_90%_50%/0.12)] text-[hsl(24_90%_40%)]",
    dotClass: "bg-[hsl(24_90%_50%)]",
  },
  compliant: {
    icon: CheckCircle,
    badgeClass: "bg-success/10 text-success",
    dotClass: "bg-success",
  },
};

export default function HOACard({ hoa, onSaveLead, onGenerateOutreach, isSaved, index }: HOACardProps) {
  const compliance = scoreCompliance(hoa);
  const config = riskConfig[compliance.riskLevel];
  const Icon = config.icon;
  const hasCertificate = !!hoa.certificate?.url && hoa.certificate.url.trim() !== "";

  return (
    <div
      className="group rounded-lg border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow opacity-0 animate-fade-up"
      style={{ animationDelay: `${Math.min(index * 80, 400)}ms` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
          <h3 className="font-semibold text-card-foreground truncate text-sm">
            {hoa.name || "Unknown HOA"}
          </h3>
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium shrink-0 ${config.badgeClass}`}>
          <Icon className="h-3 w-3" />
          {compliance.riskLabel}
        </span>
      </div>

      {/* Risk Score Bar */}
      <div className="mb-3 rounded-md bg-muted/60 px-3 py-2">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle ${config.dotClass}`} />
          {compliance.riskDescription}
        </p>
      </div>

      {/* Details */}
      <div className="space-y-1.5 text-sm text-muted-foreground mb-3">
        <p><span className="font-medium text-card-foreground">County:</span> {hoa.county || "N/A"}</p>
        <p><span className="font-medium text-card-foreground">City:</span> {hoa.city || "N/A"}</p>
        <p><span className="font-medium text-card-foreground">ZIP:</span> {hoa.zip || "N/A"}</p>
        <p><span className="font-medium text-card-foreground">Type:</span> {hoa.type || "N/A"}</p>
        <p className="flex items-center gap-1">
          <Globe className="h-3 w-3 shrink-0" />
          <span className="font-medium text-card-foreground">Website:</span>{" "}
          {hoa.website_address ? (
            <a href={hoa.website_address.startsWith("http") ? hoa.website_address : `https://${hoa.website_address}`} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 truncate">
              {hoa.website_address}
            </a>
          ) : (
            <span className="text-destructive font-medium">Missing — §207.006</span>
          )}
        </p>
        {hoa.management_company_name && (
          <p><span className="font-medium text-card-foreground">Mgmt Co:</span> {hoa.management_company_name}</p>
        )}
        {hoa.management_company_email && (
          <p><span className="font-medium text-card-foreground">Email:</span> {hoa.management_company_email}</p>
        )}
        {hasCertificate && (
          <a href={hoa.certificate!.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline underline-offset-2">
            View Certificate
          </a>
        )}
      </div>

      {/* Legality Check */}
      {compliance.legalityFlag && (
        <div className="mb-4 rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2">
          <p className="text-xs font-medium text-destructive flex items-start gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span>{compliance.legalityFlag}</span>
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={isSaved ? "secondary" : "default"}
          disabled={isSaved}
          onClick={() => onSaveLead(hoa)}
          className="text-xs"
        >
          <Save className="h-3 w-3 mr-1" />
          {isSaved ? "Saved" : "Save Lead"}
        </Button>
        {compliance.riskLevel !== "compliant" && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onGenerateOutreach(hoa)}
            className="text-xs"
          >
            <Mail className="h-3 w-3 mr-1" />
            Outreach
          </Button>
        )}
      </div>
    </div>
  );
}
