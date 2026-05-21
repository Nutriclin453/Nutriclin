'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { setForceMock } from '@/lib/mock-db';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  logout: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<User | null>;
  registerWithEmail: (email: string, pass: string) => Promise<User | null>;
}

const SupabaseAuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  logout: async () => {},
  loginWithEmail: async () => null,
  registerWithEmail: async () => null,
});

export const useAuth = () => useContext(SupabaseAuthContext);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hasEnv = process.env.NEXT_PUBLIC_SUPABASE_URL !== undefined && 
                   process.env.NEXT_PUBLIC_SUPABASE_URL !== '' && 
                   !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('example.supabase.co');
    if (!hasEnv) {
      if (typeof window !== 'undefined') {
        try {
          const storedUserJson = localStorage.getItem('mock_user_session');
          if (storedUserJson) {
            const parsed = JSON.parse(storedUserJson);
            setUser(parsed.user || null);
            setSession(parsed || null);
          } else {
            setUser(null);
            setSession(null);
          }
        } catch (e) {
          console.error('Error loading mock user session:', e);
        }
      }
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch((err) => {
      console.error('Error in getSession, setting forceMock:', err);
      const msg = err.message || String(err);
      if (msg.includes('Failed to fetch') || msg.includes('fetch') || msg.includes('NetworkError') || msg.includes('network') || msg.includes('TypeError')) {
        setForceMock(true);
        if (typeof window !== 'undefined') {
          try {
            const storedUserJson = localStorage.getItem('mock_user_session');
            if (storedUserJson) {
              const parsed = JSON.parse(storedUserJson);
              setUser(parsed.user || null);
              setSession(parsed || null);
            }
          } catch (e) {
            console.error('Error loading mock user session in getSession fallback:', e);
          }
        }
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (session?.user) {
        try {
          // Store dynamic nutritionist ID in a metadata record for public lead association
          const { data: existing } = await supabase
            .from('leads')
            .select('*')
            .eq('name', '__NUTRITIONIST_SYSTEM_METADATA_DO_NOT_DELETE__')
            .limit(1);

          if (!existing || existing.length === 0) {
            await supabase.from('leads').insert([{
              name: '__NUTRITIONIST_SYSTEM_METADATA_DO_NOT_DELETE__',
              email: session.user.id,
              phone: '0000000000',
              goal: 'SYSTEM'
            }]);
          } else if (existing[0].email !== session.user.id) {
            await supabase.from('leads')
              .update({ email: session.user.id })
              .eq('name', '__NUTRITIONIST_SYSTEM_METADATA_DO_NOT_DELETE__');
          }
        } catch (e) {
          console.error('Failed to register/update nutritionist metadata in leads:', e);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    
    // Check if using placeholder supabase
    if (process.env.NEXT_PUBLIC_SUPABASE_URL === undefined || 
        process.env.NEXT_PUBLIC_SUPABASE_URL === '' || 
        process.env.NEXT_PUBLIC_SUPABASE_URL.includes('example.supabase.co')) {
      // Mock login
      await new Promise(resolve => setTimeout(resolve, 500));
      const mockUser = { id: '1', email, app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: '' } as User;
      const mockSession = { user: mockUser, access_token: 'mock', refresh_token: 'mock', expires_in: 3600, expires_at: 0, token_type: 'bearer' } as Session;
      setUser(mockUser);
      setSession(mockSession);
      if (typeof window !== 'undefined') {
        localStorage.setItem('mock_user_session', JSON.stringify(mockSession));
      }
      setLoading(false);
      return mockUser;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
      setLoading(false);
      if (error) throw error;
      return data.user;
    } catch (err: any) {
      const msg = err.message || String(err);
      if (msg.includes('Failed to fetch') || msg.includes('fetch') || msg.includes('NetworkError') || msg.includes('network') || msg.includes('TypeError')) {
        console.warn('Login connection failed. Falling back to mock authentication.', err);
        setForceMock(true);
        const mockUser = { id: '1', email, app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: '' } as User;
        const mockSession = { user: mockUser, access_token: 'mock', refresh_token: 'mock', expires_in: 3600, expires_at: 0, token_type: 'bearer' } as Session;
        setUser(mockUser);
        setSession(mockSession);
        if (typeof window !== 'undefined') {
          localStorage.setItem('mock_user_session', JSON.stringify(mockSession));
        }
        setLoading(false);
        return mockUser;
      }
      setLoading(false);
      throw err;
    }
  };

  const registerWithEmail = async (email: string, pass: string) => {
    setLoading(true);

    if (process.env.NEXT_PUBLIC_SUPABASE_URL === undefined || 
        process.env.NEXT_PUBLIC_SUPABASE_URL === '' || 
        process.env.NEXT_PUBLIC_SUPABASE_URL.includes('example.supabase.co')) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const mockUser = { id: '1', email, app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: '' } as User;
      const mockSession = { user: mockUser, access_token: 'mock', refresh_token: 'mock', expires_in: 3600, expires_at: 0, token_type: 'bearer' } as Session;
      setUser(mockUser);
      setSession(mockSession);
      if (typeof window !== 'undefined') {
        localStorage.setItem('mock_user_session', JSON.stringify(mockSession));
      }
      setLoading(false);
      return mockUser;
    }

    try {
      const { data, error } = await supabase.auth.signUp({ email, password: pass });
      setLoading(false);
      if (error) throw error;
      return data.user;
    } catch (err: any) {
      const msg = err.message || String(err);
      if (msg.includes('Failed to fetch') || msg.includes('fetch') || msg.includes('NetworkError') || msg.includes('network') || msg.includes('TypeError')) {
        console.warn('Registration connection failed. Falling back to mock authentication.', err);
        setForceMock(true);
        const mockUser = { id: '1', email, app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: '' } as User;
        const mockSession = { user: mockUser, access_token: 'mock', refresh_token: 'mock', expires_in: 3600, expires_at: 0, token_type: 'bearer' } as Session;
        setUser(mockUser);
        setSession(mockSession);
        if (typeof window !== 'undefined') {
          localStorage.setItem('mock_user_session', JSON.stringify(mockSession));
        }
        setLoading(false);
        return mockUser;
      }
      setLoading(false);
      throw err;
    }
  };

  const handleSystemLogout = async () => {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL === undefined || 
        process.env.NEXT_PUBLIC_SUPABASE_URL === '' || 
        process.env.NEXT_PUBLIC_SUPABASE_URL.includes('example.supabase.co')) {
      setUser(null);
      setSession(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('mock_user_session');
      }
      return;
    }
    await supabase.auth.signOut();
  };

  return (
    <SupabaseAuthContext.Provider value={{ user, session, loading, loginWithEmail, registerWithEmail, logout: handleSystemLogout }}>
      {children}
    </SupabaseAuthContext.Provider>
  );
}
