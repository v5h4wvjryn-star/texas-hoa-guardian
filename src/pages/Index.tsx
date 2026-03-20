import { useState, useCallback, useEffect } from "react";
import { Search, Scale, BookOpen, AlertTriangle, Target, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import HOACard from "@/components/HOACard";
import OutreachModal from "@/components/OutreachModal";
import LeadsView from "@/components/LeadsView";
import { scoreCompliance } from "@/lib/compliance";
const API_URL = "https://data.texas.gov/resource/8auc-hzdi.json";

export interface HOAData {
  name?: string;
  county?: string;
  city?: string;
  zip?: string;
  type?: string;
  certificate?: { url?: string };
  management_company_name?: string;
  management_company_email?: string;
  website_address?: string;
}

type Tab = "search" | "leads";

export default function Index() {
  const [city, setCity] = useState("");
  const [results, setResults] = useState<HOAData[]>([]);
  const [loading, setLoading] = useState(false);
  const [savedNames, setSavedNames] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState<Tab>("search");
  const [outreach, setOutreach] = useState<{ name: string; email: string } | null>(null);

  const search = useCallback(async () => {
    if (!city.trim()) { toast.error("Enter a city to search"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}?$where=upper(city)='${city.trim().toUpperCase()}'&$limit=100`);
      if (!res.ok) throw new Error("API error");
      const data: HOAData[] = await res.json();
      setResults(data);
      if (data.length === 0) toast("No HOAs found for that city");
    } catch {
      toast.error("Failed to fetch data from Texas Data Portal");
    }
    setLoading(false);
  }, [city]);

  const saveLead = async (hoa: HOAData) => {
    const compliance = scoreCompliance(hoa);
    const { error } = await supabase.from("hoa_leads").insert({
      hoa_name: hoa.name || null,
      mgmt_company: hoa.management_company_name || null,
      contact_email: hoa.management_company_email || null,
      city: hoa.city || null,
      compliance_details: compliance.complianceDetails,
      compliance_howto: compliance.complianceHowTo,
    });
    if (error) { toast.error("Failed to save lead"); return; }
    setSavedNames((prev) => new Set(prev).add(hoa.name || ""));
    toast.success("Lead saved");
  };

  const riskCounts = results.reduce(
    (acc, h) => {
      const { riskLevel } = scoreCompliance(h);
      acc[riskLevel] = (acc[riskLevel] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container max-w-5xl py-6">
          <div className="flex items-center gap-3 mb-1">
            <Scale className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              TX HOA Compliance Auditor
            </h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-xl">
            Search Texas HOAs, flag non-compliant entities per{" "}
            <span className="font-medium text-foreground">TX Property Code §207.006</span> &{" "}
            <span className="font-medium text-foreground">SB 711</span>, and track outreach leads.
          </p>
        </div>
      </header>

      <main className="container max-w-5xl py-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-border">
          <button
            onClick={() => setTab("search")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === "search"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Search className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" />
            Search HOAs
          </button>
          <button
            onClick={() => setTab("leads")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === "leads"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" />
            My Leads
          </button>
        </div>

        {tab === "search" ? (
          <>
            {/* Search Bar */}
            <div className="flex gap-2 mb-6">
              <Input
                placeholder="Enter a Texas city (e.g. Houston, Austin)…"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && search()}
                className="max-w-sm"
              />
              <Button onClick={search} disabled={loading}>
                {loading ? "Searching…" : "Search"}
              </Button>
            </div>

            {/* Stats */}
            {results.length > 0 && (
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-4">
                <span>{results.length} results</span>
                {riskCounts.high > 0 && (
                  <span className="inline-flex items-center gap-1 text-destructive font-medium">
                    <AlertTriangle className="h-3 w-3" /> {riskCounts.high} High Risk
                  </span>
                )}
                {riskCounts.medium > 0 && (
                  <span className="inline-flex items-center gap-1 font-medium" style={{ color: "hsl(38 92% 50%)" }}>
                    <Clock className="h-3 w-3" /> {riskCounts.medium} Medium
                  </span>
                )}
                {riskCounts.opportunity > 0 && (
                  <span className="inline-flex items-center gap-1 font-medium" style={{ color: "hsl(24 90% 45%)" }}>
                    <Target className="h-3 w-3" /> {riskCounts.opportunity} Opportunity
                  </span>
                )}
              </div>
            )}

            {/* Results Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((hoa, i) => (
                <HOACard
                  key={`${hoa.name}-${i}`}
                  hoa={hoa}
                  index={i}
                  onSaveLead={saveLead}
                  onGenerateOutreach={(h) =>
                    setOutreach({
                      name: h.name || "HOA",
                      email: h.management_company_email || "",
                    })
                  }
                  isSaved={savedNames.has(hoa.name || "")}
                />
              ))}
            </div>
          </>
        ) : (
          <LeadsView />
        )}
      </main>

      {outreach && (
        <OutreachModal
          open={!!outreach}
          onOpenChange={(o) => !o && setOutreach(null)}
          hoaName={outreach.name}
          email={outreach.email}
        />
      )}
    </div>
  );
}
