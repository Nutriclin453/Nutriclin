'use client';

import React from 'react';
import { 
  Bell, 
  Search, 
  Menu,
  Moon,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '@/components/supabase-provider';
import { useSidebar } from '@/components/sidebar-context';

export function TopNav() {
  const { user, logout } = useAuth();
  const { toggle } = useSidebar();

  return (
    <header className="h-16 bg-surface-container border-b border-outline-variant fixed top-0 right-0 left-0 lg:left-64 z-40 px-4 lg:px-8 flex items-center justify-between transition-all duration-300">
      <div className="flex items-center gap-4 lg:gap-6 w-full max-w-md">
        <button 
          onClick={toggle}
          className="lg:hidden p-2 text-on-surface-variant hover:bg-surface-container-high rounded-xl transition-colors"
        >
          <Menu size={20} />
        </button>

        <div className="relative w-full group hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Pesquisar..." 
            className="w-full bg-surface-container-high/30 border border-outline-variant/30 rounded-full py-2 pl-10 pr-4 text-sm text-on-surface outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-1 lg:gap-6">
        {/* Language Toggle */}
        <div className="hidden sm:flex items-center bg-surface-container-high/50 rounded-full p-1 border border-outline-variant/30">
          <button className="px-3 py-1 rounded-full text-[10px] font-black bg-primary text-on-primary shadow-sm">PT</button>
          <button className="px-3 py-1 rounded-full text-[10px] font-black text-on-surface-variant hover:text-on-surface transition-colors">EN</button>
        </div>

        <div className="flex items-center gap-1">
          <button className="p-2 text-on-surface-variant hover:text-on-surface transition-all">
            <Bell size={20} />
          </button>
          <button className="p-2 text-on-surface-variant hover:text-on-surface transition-all">
            <Moon size={20} />
          </button>
          <button 
            onClick={async () => {
              console.log("Sair clicked");
              try {
                await logout();
                console.log("Sair success");
              } catch (e) {
                console.error("Sair error", e);
              }
            }}
            title="Sair"
            className="p-2 text-on-surface-variant hover:text-error transition-all"
          >
            <LogOut size={20} />
          </button>
        </div>

        <div className="w-px h-8 bg-outline-variant" />

        <div className="flex items-center gap-3 pl-2">
          <div className="hidden lg:flex flex-col items-end">
            <span className="text-sm font-black text-on-surface leading-tight">{user?.displayName || user?.email || 'Antonio Feitoza'}</span>
            <span className="text-[9px] font-bold text-primary uppercase tracking-tighter">Nutricionista Esportivo</span>
            <span className="text-[8px] font-medium text-on-surface-variant uppercase">CRN 16029</span>
          </div>
          <div className="relative">
            <div className="w-10 h-10 rounded-full border-2 border-primary/20 p-0.5 overflow-hidden flex items-center justify-center bg-surface-container-high">
              {user?.photoURL ? (
                <img 
                  src={user.photoURL}
                  alt={user.displayName || "Usuário"} 
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="font-black text-on-surface-variant uppercase">{user?.email?.charAt(0) || 'A'}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

