-- Create tables
CREATE TABLE patients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  goal TEXT,
  status TEXT DEFAULT 'active',
  last_visit TIMESTAMP WITH TIME ZONE,
  birth_date TIMESTAMP WITH TIME ZONE,
  gender TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE evaluations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  patient_name TEXT,
  gender TEXT,
  weight NUMERIC,
  height NUMERIC,
  age INTEGER,
  objective TEXT,
  waist NUMERIC,
  abdominal NUMERIC,
  neck NUMERIC,
  skinfolds JSONB,
  bmi NUMERIC,
  tdee NUMERIC,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE diets ENABLE ROW LEVEL SECURITY;

-- Create policies for patients
CREATE POLICY "Users can only see their own patients" 
  ON patients FOR SELECT 
  USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own patients" 
  ON patients FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own patients" 
  ON patients FOR UPDATE 
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own patients" 
  ON patients FOR DELETE 
  USING (auth.uid() = created_by);

-- Create policies for evaluations
CREATE POLICY "Users can only see evaluations of their patients" 
  ON evaluations FOR SELECT 
  USING (auth.uid() = created_by);

CREATE POLICY "Users can insert evaluations for their patients" 
  ON evaluations FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update evaluations for their patients" 
  ON evaluations FOR UPDATE 
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete evaluations of their patients" 
  ON evaluations FOR DELETE 
  USING (auth.uid() = created_by);

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
