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
  
  const client = createClient(supabaseUrl || 'https://example.supabase.co', supabaseAnonKey || 'placeholder');

  const clearStaleSession = () => {
    if (typeof window !== 'undefined') {
      try {
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('sb-') || key.includes('supabase.auth.token'))) {
            localStorage.removeItem(key);
          }
        }
      } catch (e) {
        console.error('Error clearing stale session localStorage:', e);
      }
    }
  };

  const originalGetUser = client.auth.getUser.bind(client.auth);
  client.auth.getUser = async (jwt?: string) => {
    try {
      const res = await originalGetUser(jwt);
      if (res.error) {
        const msg = res.error.message || '';
        if (
          msg.includes('Invalid Refresh Token') || 
          msg.includes('Refresh Token Not Found') || 
          msg.includes('refresh_token_not_found')
        ) {
          console.warn('Stale session detected in wrapped getUser, clearing local storage:', msg);
          clearStaleSession();
          client.auth.signOut().catch(() => {});
          return { data: { user: null }, error: null };
        }
      }
      return res;
    } catch (err: any) {
      const msg = err?.message || String(err || '');
      if (
        msg.includes('Invalid Refresh Token') || 
        msg.includes('Refresh Token Not Found') || 
        msg.includes('refresh_token_not_found')
      ) {
         console.warn('Stale session exception in wrapped getUser, clearing local storage:', msg);
         clearStaleSession();
         client.auth.signOut().catch(() => {});
         return { data: { user: null }, error: null };
      }
      throw err;
    }
  };

  const originalGetSession = client.auth.getSession.bind(client.auth);
  client.auth.getSession = async () => {
    try {
      const res = await originalGetSession();
      if (res.error) {
        const msg = res.error.message || '';
        if (
          msg.includes('Invalid Refresh Token') || 
          msg.includes('Refresh Token Not Found') || 
          msg.includes('refresh_token_not_found')
        ) {
          console.warn('Stale session detected in wrapped getSession, clearing local storage:', msg);
          clearStaleSession();
          client.auth.signOut().catch(() => {});
          return { data: { session: null }, error: null };
        }
      }
      return res;
    } catch (err: any) {
      const msg = err?.message || String(err || '');
      if (
        msg.includes('Invalid Refresh Token') || 
        msg.includes('Refresh Token Not Found') || 
        msg.includes('refresh_token_not_found')
      ) {
         console.warn('Stale session exception in wrapped getSession, clearing local storage:', msg);
         clearStaleSession();
         client.auth.signOut().catch(() => {});
         return { data: { session: null }, error: null };
      }
      throw err;
    }
  };

  return client;
};

export const supabase = createBrowserSupabase();

