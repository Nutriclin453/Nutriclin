'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/sidebar';
import { TopNav } from '@/components/top-nav';
import { useAuth } from '@/components/supabase-provider';
import { supabase } from '@/lib/supabase';
import { Lock, Loader2, Mail } from 'lucide-react';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading, loginWithEmail, registerWithEmail } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) return;
    
    setIsLoadingAuth(true);
    setAuthError('');
    
    if (cleanEmail !== 'nutriantoni660@gmail.com') {
      setAuthError('Usuário não autorizado.');
      setIsLoadingAuth(false);
      return;
    }

    try {
      await loginWithEmail(cleanEmail, password);
    } catch (err: any) {
      if (err.message && err.message.includes('Email not confirmed')) {
        setAuthError('E-mail não confirmado. Vá no Supabase > Authentication > Providers e desative "Confirm email", ou clique no link enviado para o seu e-mail.');
      } else if (err.message && err.message.includes('Invalid login credentials')) {
        setAuthError('Senha incorreta ou usuário não possui senha configurada.');
      } else {
        setAuthError('Falha: ' + (err.message || JSON.stringify(err)));
      }
    } finally {
      setIsLoadingAuth(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 space-y-4">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest animate-pulse">Autenticando...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-8 shadow-2xl">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-4 bg-primary/10 rounded-full text-primary border border-primary/20">
              <Lock size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">Acesso Restrito</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
                Faça login para acessar o sistema
              </p>
            </div>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">E-mail</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-slate-100 outline-none focus:border-primary transition-all"
                placeholder="nutriantoni660@gmail.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">Senha</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-slate-100 outline-none focus:border-primary transition-all"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {authError && (
              <p className="text-xs font-bold text-error text-center bg-error/10 p-2 rounded-lg">{authError}</p>
            )}

            <div className="flex flex-col gap-3 pt-2">
              <button 
                type="submit"
                disabled={isLoadingAuth}
                className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold hover:brightness-110 active:scale-95 transition-all shadow-lg flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {isLoadingAuth ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
                Entrar
              </button>
              
              <button 
                type="button"
                disabled={isLoadingAuth}
                onClick={async () => {
                  if (!email || !password) {
                    setAuthError("Preencha e-mail e senha para criar a conta.");
                    return;
                  }
                  setIsLoadingAuth(true);
                  setAuthError('');
                  try {
                    const user = await registerWithEmail(email.trim(), password);
                    if (user && !user.confirmed_at && process.env.NEXT_PUBLIC_SUPABASE_URL) {
                       setAuthError("Conta criada, mas requer confirmação. Vá ao console do Supabase > Authentication > Providers e desative 'Confirm email', ou verifique seu e-mail.");
                    } else if (user) {
                       setAuthError("Conta criada no sistema! Agora você pode logar.");
                       if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
                         // Mocking automatically logged in state is handled by registerWithEmail
                         // But if we want to just show the message, that's fine.
                         // Actually mock register sets user and session, so it should redirect instantly.
                       }
                    }
                  } catch (err: any) {
                    setAuthError("Erro ao criar: " + err.message);
                  } finally {
                    setIsLoadingAuth(false);
                  }
                }}
                className="w-full bg-transparent border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 py-3 rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all flex justify-center items-center gap-2 disabled:opacity-50 text-xs uppercase tracking-wider"
              >
                Primeiro acesso? Registrar senha
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 print:h-auto print:overflow-visible">
      <div className="print:hidden">
        <Sidebar />
      </div>
      <div className="flex-1 lg:ml-64 flex flex-col overflow-hidden relative print:ml-0 print:block print:overflow-visible">
        <div className="print:hidden">
          <TopNav />
        </div>
        <main className="mt-16 p-4 lg:p-8 overflow-y-auto h-full custom-scrollbar print:mt-0 print:p-0 print:overflow-visible print:h-auto">
          <div className="max-w-7xl mx-auto pb-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
