
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  cedula TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'cold',
  source TEXT NOT NULL DEFAULT 'WhatsApp',
  interest TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  is_high_value BOOLEAN NOT NULL DEFAULT false,
  contact_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth can read leads" ON public.leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth can manage leads" ON public.leads FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
