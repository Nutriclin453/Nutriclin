'use client';

import React from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Info, User, CheckCircle } from 'lucide-react';

export default function Sobre() {
  return (
    <DashboardLayout>
      <div id="sobre-container" className="space-y-8 max-w-7xl mx-auto">
        <div id="sobre-header" className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 id="sobre-title" className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Sobre o Sistema
            </h1>
            <p id="sobre-subtitle" className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Informações do consultório, termos de uso e créditos da plataforma.
            </p>
          </div>
        </div>

        <div id="sobre-grid" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div id="card-profissional" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-4 shadow-sm">
            <div className="p-3 bg-primary/10 text-primary w-fit rounded-xl border border-primary/20">
              <User size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Profissional Responsável</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Dr. Antonio Feitoza, Nutricionista Esportivo e Consultor de Alta Performance.
              </p>
            </div>
          </div>

          <div id="card-missao" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-4 shadow-sm">
            <div className="p-3 bg-primary/10 text-primary w-fit rounded-xl border border-primary/20">
              <Info size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Equipamentos & Tecnologia</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Utilizando protocolos validados cientificamente para prescrições seguras.
              </p>
            </div>
          </div>

          <div id="card-certificacoes" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-4 shadow-sm">
            <div className="p-3 bg-primary/10 text-primary w-fit rounded-xl border border-primary/20">
              <CheckCircle size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Segurança de Dados</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Dados protegidos por Row Level Security (RLS) e banco de dados Supabase criptografado.
              </p>
            </div>
          </div>
        </div>

        <div id="sobre-status-box" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-4 shadow-sm">
          <p className="text-sm font-bold text-emerald-500 uppercase tracking-wider">Versão Estável</p>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">Antonio Feitoza CRM v1.0.0</h2>
          <p className="text-slate-450 dark:text-slate-550 max-w-md mx-auto text-sm">
            Feito para oferecer as melhores metodologias e acompanhar cada passo da jornada do atleta com máxima eficiência.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
