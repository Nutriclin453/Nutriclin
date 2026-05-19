'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  Users, 
  Calendar, 
  Apple, 
  Dumbbell, 
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Info,
  X
} from 'lucide-react';
import { useAuth } from '@/components/supabase-provider';
import { useSidebar } from '@/components/sidebar-context';

const LOGO_URL = "/logo.png";

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { isOpen, setIsOpen } = useSidebar();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
    { icon: Users, label: 'Pacientes', href: '/pacientes' },
    { icon: Calendar, label: 'Avaliações', href: '/avaliacoes' },
    { icon: Apple, label: 'Dieta', href: '/dieta' },
    { icon: Dumbbell, label: 'Treinos', href: '/treinos' },
    { icon: Info, label: 'Sobre', href: '/sobre' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`fixed left-0 top-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-screen flex flex-col transition-transform duration-300 transform lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <Link href="/" className="flex items-center w-full group">
            <div className="relative w-full h-10 transition-transform duration-300 group-hover:scale-105">
              <Image 
                src={LOGO_URL} 
                alt="Antonio Feitoza Logo" 
                fill
                className="object-contain object-left"
                priority
                referrerPolicy="no-referrer"
              />
            </div>
          </Link>
          <button 
            className="lg:hidden p-2 text-on-surface-variant hover:text-on-surface transition-colors absolute top-3 right-4"
            onClick={() => setIsOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
          <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-4 px-3">Principal</p>
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between p-3 rounded-xl transition-all group ${
                  isActive 
                  ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} className={isActive ? 'text-on-primary' : 'text-primary'} />
                  <span className="text-sm font-bold">{item.label}</span>
                </div>
                <ChevronRight size={14} className={`transition-transform duration-300 ${isActive ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
          {user && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <img src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user.user_metadata?.full_name || 'User'}`} alt="User" className="w-10 h-10 rounded-lg" />
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{user.user_metadata?.full_name || 'Dr(a). Antonio Feitoza'}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
          )}
          <button onClick={logout} className="w-full flex items-center gap-3 p-3 text-slate-600 dark:text-slate-400 hover:text-error hover:bg-error/10 rounded-xl transition-all font-bold text-sm">
            <LogOut size={20} />
            <span>Sair do Sistema</span>
          </button>
        </div>
      </aside>
    </>
  );
}

