import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Mail } from "lucide-react";
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
}

export default function LeadsView() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [outreach, setOutreach] = useState<{ name: string; email: string } | null>(null);

  const fetchLeads = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("hoa_leads")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error("Failed to load leads");
    else setLeads(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchLeads(); }, []);

  const removeLead = async (id: string) => {
    const { error } = await supabase.from("hoa_leads").delete().eq("id", id);
    if (error) toast.error("Failed to remove lead");
    else {
      setLeads((prev) => prev.filter((l) => l.id !== id));
      toast.success("Lead removed");
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
            className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4 opacity-0 animate-fade-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
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
