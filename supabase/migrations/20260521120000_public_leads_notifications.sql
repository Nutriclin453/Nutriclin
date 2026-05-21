-- Create leads table if not exists with correct columns
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    goal TEXT,
    service_type TEXT,
    age INTEGER,
    weight NUMERIC,
    height NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Allow public anonymous inserts on leads
CREATE POLICY "Allow public inserts on leads" 
ON public.leads FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- Allow public select on the specific metadata row in leads to register dynamic nutritionist ID
CREATE POLICY "Allow public select on metadata leads" 
ON public.leads FOR SELECT 
TO anon, authenticated 
USING (name = '__NUTRITIONIST_SYSTEM_METADATA_DO_NOT_DELETE__');

-- Allow authenticated users (nutritionist) to select/delete leads
CREATE POLICY "Allow authenticated select on leads" 
ON public.leads FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Allow authenticated delete on leads" 
ON public.leads FOR DELETE 
TO authenticated 
USING (true);

-- Create notifications table if not exists
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Allow public anonymous inserts on notifications
CREATE POLICY "Allow public inserts on notifications" 
ON public.notifications FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- Allow authenticated users to select/update/delete notifications
CREATE POLICY "Allow authenticated select on notifications" 
ON public.notifications FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Allow authenticated update on notifications" 
ON public.notifications FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Allow authenticated delete on notifications" 
ON public.notifications FOR DELETE 
TO authenticated 
USING (true);
