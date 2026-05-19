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
import { useEffect, useState } from "react";

export function TopNav() {
  const { user, logout } = useAuth();
  const { toggle } = useSidebar();
  const [isDarkMode, setIsDarkMode] = useState(true);

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

        <div className="flex items-center gap-1">
          <button className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-all">
            <Bell size={20} />
          </button>
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
