'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    
    // Check if using placeholder supabase
    if (process.env.NEXT_PUBLIC_SUPABASE_URL === undefined || process.env.NEXT_PUBLIC_SUPABASE_URL === '') {
      // Mock login
      await new Promise(resolve => setTimeout(resolve, 500));
      const mockUser = { id: '1', email, app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: '' } as User;
      const mockSession = { user: mockUser, access_token: 'mock', refresh_token: 'mock', expires_in: 3600, expires_at: 0, token_type: 'bearer' } as Session;
      setUser(mockUser);
      setSession(mockSession);
      setLoading(false);
      return mockUser;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
    setLoading(false);
    if (error) throw error;
    return data.user;
  };

  const registerWithEmail = async (email: string, pass: string) => {
    setLoading(true);

    if (process.env.NEXT_PUBLIC_SUPABASE_URL === undefined || process.env.NEXT_PUBLIC_SUPABASE_URL === '') {
      await new Promise(resolve => setTimeout(resolve, 500));
      const mockUser = { id: '1', email, app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: '' } as User;
      const mockSession = { user: mockUser, access_token: 'mock', refresh_token: 'mock', expires_in: 3600, expires_at: 0, token_type: 'bearer' } as Session;
      setUser(mockUser);
      setSession(mockSession);
      setLoading(false);
      return mockUser;
    }

    const { data, error } = await supabase.auth.signUp({ email, password: pass });
    setLoading(false);
    if (error) throw error;
    return data.user;
  };

  const handleSystemLogout = async () => {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL === undefined || process.env.NEXT_PUBLIC_SUPABASE_URL === '') {
      setUser(null);
      setSession(null);
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
