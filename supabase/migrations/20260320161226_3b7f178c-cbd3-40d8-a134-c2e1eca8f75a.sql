CREATE TABLE public.hoa_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  hoa_name TEXT,
  mgmt_company TEXT,
  contact_email TEXT,
  city TEXT,
  status TEXT DEFAULT 'New'
);

ALTER TABLE public.hoa_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read hoa_leads" ON public.hoa_leads FOR SELECT USING (true);
CREATE POLICY "Anyone can insert hoa_leads" ON public.hoa_leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update hoa_leads" ON public.hoa_leads FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete hoa_leads" ON public.hoa_leads FOR DELETE USING (true);