import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Mail, ChevronDown, ChevronUp, ClipboardList, BookOpen, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import OutreachModal from "./OutreachModal";

interface Lead {
  id: string;
  hoa_name: string | null;
  mgmt_company: string | null;
  contact_email: string | null;
  city: string | null;
  status: string | null;
  created_at: string;
  compliance_details: string | null;
  compliance_howto: string | null;
}

interface LeadsViewProps {
  onLeadDeleted?: (hoaName: string) => void;
}

export default function LeadsView({ onLeadDeleted }: LeadsViewProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [outreach, setOutreach] = useState<{ name: string; email: string } | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchLeads = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("hoa_leads")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error("Failed to load leads");
    else setLeads((data as Lead[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchLeads(); }, []);

  const removeLead = async (id: string) => {
    const { error } = await supabase.from("hoa_leads").delete().eq("id", id);
    if (error) toast.error("Failed to remove lead");
    else {
      const lead = leads.find((l) => l.id === id);
      setLeads((prev) => prev.filter((l) => l.id !== id));
      toast.success("Lead removed");
      if (lead?.hoa_name && onLeadDeleted) onLeadDeleted(lead.hoa_name);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("hoa_leads").update({ status }).eq("id", id);
    if (error) toast.error("Failed to update status");
    else setLeads((prev) => prev.map((l) => l.id === id ? { ...l, status } : l));
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground text-sm">No leads saved yet. Search for HOAs and save prospects.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {leads.map((lead, i) => (
          <div
            key={lead.id}
            className="rounded-lg border border-border bg-card opacity-0 animate-fade-up overflow-hidden"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm text-card-foreground truncate">{lead.hoa_name || "Unknown"}</p>
                <p className="text-xs text-muted-foreground">{lead.city} · {lead.mgmt_company || "No Mgmt Co"}</p>
                <p className="text-xs text-muted-foreground">{lead.contact_email || "No email"}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={lead.status || "New"}
                  onChange={(e) => updateStatus(lead.id, e.target.value)}
                  className="text-xs rounded-md border border-input bg-background px-2 py-1"
                >
                  <option>New</option>
                  <option>Contacted</option>
                  <option>Replied</option>
                  <option>Closed</option>
                </select>
                {lead.compliance_details && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setExpandedId(expandedId === lead.id ? null : lead.id)}
                    title="Compliance details"
                  >
                    <ClipboardList className="h-3.5 w-3.5 mr-1" />
                    {expandedId === lead.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const query = encodeURIComponent(`${lead.hoa_name || ""} +contact +email`);
                    window.open(`https://www.google.com/search?q=${query}`, "_blank");
                  }}
                  title="Search for contact info"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setOutreach({ name: lead.hoa_name || "HOA", email: lead.contact_email || "" })}
                >
                  <Mail className="h-3.5 w-3.5" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => removeLead(lead.id)}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            </div>

            {expandedId === lead.id && (lead.compliance_details || lead.compliance_howto) && (
              <div className="border-t border-border bg-muted/40 px-4 py-3 space-y-4">
                {lead.compliance_details && (
                  <div>
                    <p className="text-xs font-medium text-card-foreground mb-2 flex items-center gap-1.5">
                      <ClipboardList className="h-3.5 w-3.5 text-primary" />
                      Compliance Action Items
                    </p>
                    <div className="space-y-1">
                      {lead.compliance_details.split("\n").map((line, idx) => (
                        <p key={idx} className="text-xs text-muted-foreground leading-relaxed">{line}</p>
                      ))}
                    </div>
                  </div>
                )}
                {lead.compliance_howto && (
                  <div className="border-t border-border pt-3">
                    <p className="text-xs font-semibold text-card-foreground mb-2 flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-primary" />
                      How-To Instructions
                    </p>
                    <div className="space-y-0.5">
                      {lead.compliance_howto.split("\n").map((line, idx) => {
                        const isHeader = line === line.toUpperCase() && line.includes(":");
                        return line.trim() === "" ? (
                          <div key={idx} className="h-2" />
                        ) : (
                          <p
                            key={idx}
                            className={`text-xs leading-relaxed ${
                              isHeader
                                ? "font-semibold text-card-foreground mt-2"
                                : "text-muted-foreground pl-1"
                            }`}
                          >
                            {line}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      {outreach && (
        <OutreachModal
          open={!!outreach}
          onOpenChange={(o) => !o && setOutreach(null)}
          hoaName={outreach.name}
          email={outreach.email}
        />
      )}
    </>
  );
}
