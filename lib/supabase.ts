import { createClient } from '@supabase/supabase-js';

export const createBrowserSupabase = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || '';
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL or Anon Key is missing. Check your environment variables.');
  } else {
    try {
      new URL(supabaseUrl);
    } catch (e) {
      console.error(`Invalid NEXT_PUBLIC_SUPABASE_URL: "${supabaseUrl}". Make sure it starts with https://`);
    }
  }
  
  return createClient(supabaseUrl || 'https://example.supabase.co', supabaseAnonKey || 'placeholder');
};

export const supabase = createBrowserSupabase();

