"use client";

import React from "react";
import {
  Bell,
  Search,
  Menu,
  Moon,
  Sun,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/components/supabase-provider";
import { useSidebar } from "@/components/sidebar-context";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { isMockEnabled } from "@/lib/mock-db";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";

export function TopNav() {
  const { user, logout } = useAuth();
  const { toggle } = useSidebar();
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [hasUnread, setHasUnread] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Current user clicks outside to close
    const handleOutsideClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    // Check initial unread notifications
    const fetchUnread = async () => {
      try {
        if (isMockEnabled()) {
          const stored = localStorage.getItem('mock_notifications');
          let list = [];
          if (stored) {
            list = JSON.parse(stored);
          } else {
            list = [
              {
                id: 'notif-1',
                title: 'Novo Lead do Instagram!',
                message: 'Mariana Costa quer marcar uma consulta.',
                read: false,
                created_at: new Date(Date.now() - 3600000).toISOString()
              },
              {
                id: 'notif-2',
                title: 'Atualização de Triagem',
                message: 'Felipe Melo preencheu o formulário.',
                read: false,
                created_at: new Date(Date.now() - 7200000).toISOString()
              }
            ];
            localStorage.setItem('mock_notifications', JSON.stringify(list));
          }
          setNotifications(list);
          const unreadCount = list.filter((n: any) => !n.read).length;
          setHasUnread(unreadCount > 0);
          return;
        }

        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);
          
        if (!error && data) {
          setNotifications(data);
          const unreadCount = data.filter(n => !n.read).length;
          setHasUnread(unreadCount > 0);
        }
      } catch (err) {
        console.error('Error fetching unread notifications:', err);
      }
    };
    fetchUnread();

    // Subscribe to realtime notification updates
    let channel: any;
    if (!isMockEnabled()) {
      channel = supabase
        .channel('notifications-changes')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications' },
          (payload) => {
            setNotifications(prev => [payload.new, ...prev].slice(0, 10));
            setHasUnread(true);
          }
        )
        .subscribe();
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const markAsRead = async (id: any) => {
    try {
      if (isMockEnabled()) {
        const stored = localStorage.getItem('mock_notifications');
        if (stored) {
          const list = JSON.parse(stored);
          const updated = list.map((n: any) => n.id === id ? { ...n, read: true } : n);
          localStorage.setItem('mock_notifications', JSON.stringify(updated));
          setNotifications(updated);
          setHasUnread(updated.some((n: any) => !n.read));
        }
        return;
      }

      await supabase.from('notifications').update({ read: true }).eq('id', id);
      setNotifications(prev => {
        const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
        setHasUnread(updated.some(n => !n.read));
        return updated;
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearAll = async () => {
    try {
      if (isMockEnabled()) {
        localStorage.setItem('mock_notifications', JSON.stringify([]));
        setNotifications([]);
        setHasUnread(false);
        return;
      }

      // We delete all non-read and read notifications in the Database or mark all of them as read.
      // To satisfy Both delete and mark as read requirements:
      // First, attempt to delete all items in our local notifications array or all items in DB entirely.
      // Let's delete all matching IDs first.
      if (notifications.length > 0) {
        const idsToClear = notifications.map(n => n.id);
        const { error: deleteError } = await supabase
          .from('notifications')
          .delete()
          .in('id', idsToClear);

        if (deleteError) {
          console.warn('Could not delete individual notifications, trying update filter:', deleteError);
          // Fallback, update them all to read: true
          await supabase
            .from('notifications')
            .update({ read: true })
            .in('id', idsToClear);
        }
      }

      // Also clean up any other ones by executing a delete on any unread notifications
      const { error: cleanAllError } = await supabase
        .from('notifications')
        .delete()
        .eq('read', false);

      if (cleanAllError) {
        // Fallback: update any unread to read in the DB
        await supabase
          .from('notifications')
          .update({ read: true })
          .eq('read', false);
      }
    } catch (err) {
      console.error('Error clearing notifications:', err);
    } finally {
      // Always empty the UI list immediately for instant user feedback
      setNotifications([]);
      setHasUnread(false);
    }
  };

  useEffect(() => {
    // Check initial theme preference, prioritizing localStorage
    const savedTheme = localStorage.getItem("theme");
    const isDark =
      savedTheme === "dark" ||
      (!savedTheme && document.documentElement.classList.contains("dark"));

    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    if (newTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 fixed top-0 right-0 left-0 lg:left-64 z-40 px-4 lg:px-8 flex items-center justify-between transition-all duration-300">
      <div className="flex items-center gap-4 lg:gap-6 w-full max-w-md">
        <button
          onClick={toggle}
          className="lg:hidden p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
        >
          <Menu size={20} />
        </button>

        <div className="relative w-full group hidden md:block">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 group-focus-within:text-primary transition-colors"
            size={18}
          />
          <input
            type="text"
            placeholder="Pesquisar..."
            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-full py-2 pl-10 pr-4 text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-1 lg:gap-6">
        {/* Language Toggle */}
        <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 rounded-full p-1 border border-slate-200 dark:border-slate-700">
          <button className="px-3 py-1 rounded-full text-[10px] font-black bg-primary text-on-primary shadow-sm">
            PT
          </button>
          <button className="px-3 py-1 rounded-full text-[10px] font-black text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
            EN
          </button>
        </div>

        <div className="flex items-center gap-1 relative" ref={notifRef}>
          <button 
            onClick={() => setIsNotifOpen((prev) => !prev)}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-all relative"
          >
            <Bell size={20} />
            {hasUnread && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-900 pointer-events-none" />
            )}
          </button>
          
          <AnimatePresence>
            {isNotifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full right-0 mt-4 w-72 md:w-80 bg-slate-900 border border-primary/50 shadow-2xl shadow-primary/20 rounded-2xl overflow-hidden z-50 flex flex-col"
              >
                <div className="p-4 border-b border-primary/20 flex items-center justify-between bg-slate-950/50 gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest">Notificações</h3>
                    {hasUnread && (
                      <span className="text-[10px] bg-primary text-slate-950 px-2 py-0.5 rounded-full font-black">Novas</span>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <button
                      onClick={handleClearAll}
                      className="text-[10px] font-black text-[#FF4545] hover:text-[#FFA0A0] transition-colors uppercase tracking-wider shrink-0 cursor-pointer"
                    >
                      Limpar Tudo
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto w-full flex flex-col overscroll-contain">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 text-xs">
                      Nenhuma notificação por enquanto.
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <button
                        key={notif.id}
                        onClick={async () => {
                          if (!notif.read) {
                            await markAsRead(notif.id);
                          }
                          setIsNotifOpen(false);
                          router.push('/pacientes');
                        }}
                        className={`w-full text-left p-4 border-b border-slate-800/50 transition-colors ${
                          notif.read ? 'bg-slate-900 opacity-60 hover:bg-slate-800/80 cursor-default' : 'bg-slate-800 hover:bg-slate-700 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 transition-colors ${notif.read ? 'bg-slate-600' : 'bg-primary shadow-glow shadow-primary/50'}`} />
                          <div>
                            <h4 className={`text-xs font-bold leading-tight ${notif.read ? 'text-slate-400' : 'text-slate-100'}`}>
                              {notif.title}
                            </h4>
                            <p className="text-[11px] text-slate-400 mt-1.5 leading-snug">
                              {notif.message}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={toggleTheme}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-all"
            title={
              isDarkMode ? "Mudar para modo claro" : "Mudar para modo escuro"
            }
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
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
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-error transition-all"
          >
            <LogOut size={20} />
          </button>
        </div>

        <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />

        <div className="flex items-center gap-3 pl-2">
          <div className="hidden lg:flex flex-col items-end">
            <span className="text-sm font-black text-slate-900 dark:text-slate-100 leading-tight">
              {user?.user_metadata?.full_name ||
                user?.email ||
                "Antonio Feitoza"}
            </span>
            <span className="text-[9px] font-bold text-primary uppercase tracking-tighter">
              Nutricionista Esportivo
            </span>
            <span className="text-[8px] font-medium text-slate-500 dark:text-slate-400 uppercase">
              CRN 16029
            </span>
          </div>
          <div className="relative">
            <div className="w-10 h-10 rounded-full border-2 border-primary/20 p-0.5 overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-slate-800">
              {user?.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt={user.user_metadata?.full_name || "Usuário"}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="font-black text-on-surface-variant uppercase">
                  {user?.email?.charAt(0) || "A"}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
