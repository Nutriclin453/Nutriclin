ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS weight NUMERIC,
ADD COLUMN IF NOT EXISTS height NUMERIC;

-- Atualiza o cache do Supabase para reconhecer de imediato as novas colunas
NOTIFY pgrst, 'reload schema';
