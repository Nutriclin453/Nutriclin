import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

async function check() {
  const { data, error } = await supabase.from('patients').select('*').limit(1);
  console.log('Patient record columns:', error, data);

  const { data: leadData, error: leadError } = await supabase.from('leads').select('*').limit(1);
  console.log('Lead record columns:', leadError, leadData);
}

check();
