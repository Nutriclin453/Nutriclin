import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

async function check() {
  const dummyPayload = {
    name: 'Inspection Lead',
    email: 'inspect@example.com',
    phone: '123456789'
  };
  const { data, error } = await supabase.from('leads').insert([dummyPayload]).select();
  console.log('Insert Result:', error, data);
}

check();
