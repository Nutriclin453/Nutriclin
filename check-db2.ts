import { createClient } from "@supabase/supabase-js";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('patients').insert([{ name: 'Test', goal: 'Test', email: 'b@b.com', phone: '123', status: 'Ativo' }]);
  console.log("Data:", data);
  console.log("Error:", error);
}
run();
