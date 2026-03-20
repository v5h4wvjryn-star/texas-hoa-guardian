import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface OutreachModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hoaName: string;
  email: string;
}

export default function OutreachModal({ open, onOpenChange, hoaName, email }: OutreachModalProps) {
  const subject = `Website Compliance Notice — ${hoaName}`;
  const body = `Dear ${hoaName} Board Members,

I hope this message finds you well. I am reaching out regarding your HOA's compliance with Texas Property Code §207.006, as amended by SB 711.

Under current Texas law, homeowners associations are required to maintain a publicly accessible website that includes key governing documents, financial records, and contact information.

Our records indicate that ${hoaName} does not currently have a website address on file with the Texas Secretary of State, which may place the association out of compliance.

We specialize in helping HOAs meet these requirements quickly and affordably. I would welcome the opportunity to discuss how we can assist your community in becoming fully compliant.

Would you be available for a brief call this week?

Best regards,
[Your Name]
[Your Company]
[Your Phone]`;

  const handleCopy = () => {
    navigator.clipboard.writeText(body);
    toast.success("Email template copied to clipboard");
  };

  const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">Outreach Email — {hoaName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Subject</p>
            <p className="text-sm bg-muted rounded-md px-3 py-2">{subject}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Body</p>
            <pre className="text-sm bg-muted rounded-md px-3 py-3 whitespace-pre-wrap font-sans leading-relaxed">
              {body}
            </pre>
          </div>
          <div className="flex gap-2 pt-1">
            <Button size="sm" onClick={handleCopy} variant="outline">
              <Copy className="h-3 w-3 mr-1" /> Copy
            </Button>
            {email && email !== "N/A" && (
              <a href={mailtoLink} target="_blank" rel="noopener noreferrer">
                <Button size="sm">
                  <ExternalLink className="h-3 w-3 mr-1" /> Open in Email Client
                </Button>
              </a>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
