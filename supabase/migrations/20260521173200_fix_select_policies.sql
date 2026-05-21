-- 1. Força a remoção de qualquer política antiga de SELECT que possa estar travando
DROP POLICY IF EXISTS "Users can only see their own patients" ON patients;
DROP POLICY IF EXISTS "Allow authenticated users to view patients" ON patients;
DROP POLICY IF EXISTS "Enable read access for all users" ON patients;

-- 2. Garante que a nova política universal esteja atualizada e ativa
DROP POLICY IF EXISTS "Users can see all patients" ON patients;

CREATE POLICY "Users can see all patients" 
  ON patients FOR SELECT 
  USING (auth.role() = 'authenticated');
