import { AlertTriangle, CheckCircle, Mail, Save, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HOAData {
  filing_entity_name?: string;
  management_company_name?: string;
  management_company_email?: string;
  website_address?: string;
  city?: string;
}

interface HOACardProps {
  hoa: HOAData;
  onSaveLead: (hoa: HOAData) => void;
  onGenerateOutreach: (hoa: HOAData) => void;
  isSaved?: boolean;
  index: number;
}

export default function HOACard({ hoa, onSaveLead, onGenerateOutreach, isSaved, index }: HOACardProps) {
  const isNonCompliant = !hoa.website_address || hoa.website_address.trim() === "";

  return (
    <div
      className="group rounded-lg border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow opacity-0 animate-fade-up"
      style={{ animationDelay: `${Math.min(index * 80, 400)}ms` }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
          <h3 className="font-semibold text-card-foreground truncate text-sm">
            {hoa.filing_entity_name || "Unknown HOA"}
          </h3>
        </div>
        {isNonCompliant ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive shrink-0">
            <AlertTriangle className="h-3 w-3" />
            Non-Compliant
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success shrink-0">
            <CheckCircle className="h-3 w-3" />
            Compliant
          </span>
        )}
      </div>

      <div className="space-y-1.5 text-sm text-muted-foreground mb-4">
        <p><span className="font-medium text-card-foreground">Mgmt Co:</span> {hoa.management_company_name || "N/A"}</p>
        <p><span className="font-medium text-card-foreground">Email:</span> {hoa.management_company_email || "N/A"}</p>
        <p><span className="font-medium text-card-foreground">City:</span> {hoa.city || "N/A"}</p>
        {isNonCompliant && (
          <p className="text-xs text-destructive mt-2">
            ⚠ Missing website — potential violation of TX Property Code §207.006 / SB 711
          </p>
        )}
      </div>

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
        {isNonCompliant && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onGenerateOutreach(hoa)}
            className="text-xs"
          >
            <Mail className="h-3 w-3 mr-1" />
            Generate Outreach
          </Button>
        )}
      </div>
    </div>
  );
}
