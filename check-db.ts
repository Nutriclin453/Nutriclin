import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

async function check() {
  const test1 = { name: 'Probe 1', email: '1@example.com', phone: '123', nutritionist_id: '11111111-1111-1111-1111-111111111111' };
  const { error: err1 } = await supabase.from('leads').insert([test1]);
  console.log('Result for nutritionist_id:', err1?.code, err1?.message);

  const test2 = { name: 'Probe 2', email: '2@example.com', phone: '123', created_by: '11111111-1111-1111-1111-111111111111' };
  const { error: err2 } = await supabase.from('leads').insert([test2]);
  console.log('Result for created_by:', err2?.code, err2?.message);

  const test3 = { name: 'Probe 3', email: '3@example.com', phone: '123', user_id: '11111111-1111-1111-1111-111111111111' };
  const { error: err3 } = await supabase.from('leads').insert([test3]);
  console.log('Result for user_id:', err3?.code, err3?.message);
}

check();
