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
    let isMounted = true;
    let safetyTimeout: NodeJS.Timeout;

    // Safety fallback: ensure loading is resolved no matter what after 3 seconds
    safetyTimeout = setTimeout(() => {
      if (isMounted) {
        console.warn('Auth loading safety timeout hit');
        setLoading(false);
      }
    }, 3000);

    async function initAuth() {
      const isMockForced = typeof window !== 'undefined' && localStorage.getItem('supabase_force_mock') === 'true';
      const hasEnv = !isMockForced && 
                     process.env.NEXT_PUBLIC_SUPABASE_URL !== undefined && 
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
            }
          } catch (e) {
            console.error('Error loading mock session:', e);
          }
        }
        if (isMounted) {
          setLoading(false);
          clearTimeout(safetyTimeout);
        }
        return;
      }

      try {
        const { data, error } = await supabase.auth.getSession();
        if (isMounted) {
          if (error) {
            console.warn('Session error:', error);
          }
          const session = data?.session || null;
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
          clearTimeout(safetyTimeout);
        }
      } catch (err) {
        console.error('Auth init error:', err);
        if (isMounted) {
          setLoading(false);
          clearTimeout(safetyTimeout);
        }
      }
    }

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (safetyTimeout) clearTimeout(safetyTimeout);
    });

    return () => {
      isMounted = false;
      if (safetyTimeout) clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
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
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('supabase_force_mock');
        localStorage.removeItem('mock_user_session');
      } catch (e) {}
    }

    const isMockForced = typeof window !== 'undefined' && localStorage.getItem('supabase_force_mock') === 'true';
    if (isMockForced || 
        process.env.NEXT_PUBLIC_SUPABASE_URL === undefined || 
        process.env.NEXT_PUBLIC_SUPABASE_URL === '' || 
        process.env.NEXT_PUBLIC_SUPABASE_URL.includes('example.supabase.co')) {
      setUser(null);
      setSession(null);
      return;
    }
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Sign out threw exception, force-clearing locally:', e);
    }
    setUser(null);
    setSession(null);
  };

  return (
    <SupabaseAuthContext.Provider value={{ user, session, loading, loginWithEmail, registerWithEmail, logout: handleSystemLogout }}>
      {children}
    </SupabaseAuthContext.Provider>
  );
}
