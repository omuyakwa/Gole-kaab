CREATE TABLE public.helplines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  phone_number TEXT,
  website TEXT,
  category TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.helplines ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read helplines
CREATE POLICY "Allow authenticated users to read helplines"
ON public.helplines FOR SELECT
TO authenticated
USING (true);

-- For demonstration, let's insert some sample data
INSERT INTO public.helplines (name, description, phone_number, category, location) VALUES
('National Emergency Hotline', 'For all emergencies (police, fire, medical).', '999', 'emergency-services', 'Nationwide'),
('Mental Health Support Line', 'Confidential support for emotional and mental distress.', '111', 'mental-health', 'Nationwide'),
('Legal Aid Clinic', 'Free legal advice for marginalized communities.', '222', 'legal-aid', 'Mogadishu');
