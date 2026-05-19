-- Create diets table
CREATE TABLE diets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  patient_name TEXT,
  goal TEXT,
  meals JSONB,
  macros JSONB,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE diets ENABLE ROW LEVEL SECURITY;

-- Create policies for diets
CREATE POLICY "Users can only see diets of their patients" 
  ON diets FOR SELECT 
  USING (auth.uid() = created_by);

CREATE POLICY "Users can insert diets for their patients" 
  ON diets FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update diets for their patients" 
  ON diets FOR UPDATE 
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete diets of their patients" 
  ON diets FOR DELETE 
  USING (auth.uid() = created_by);
