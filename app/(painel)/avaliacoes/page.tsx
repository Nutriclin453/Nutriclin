'use client';

import React from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Activity, ClipboardList, TrendingUp } from 'lucide-react';

export default function Avaliacoes() {
  return (
    <DashboardLayout>
      <div id="avaliacoes-container" className="space-y-8 max-w-7xl mx-auto">
        <div id="avaliacoes-header" className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 id="avaliacoes-title" className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Avaliações Físicas
            </h1>
            <p id="avaliacoes-subtitle" className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Gerencie as avaliações antropométricas e percentuais dos seus pacientes.
            </p>
          </div>
        </div>

        <div id="avaliacoes-grid" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div id="card-avaliacoes-ativas" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-4 shadow-sm">
            <div className="p-3 bg-primary/10 text-primary w-fit rounded-xl border border-primary/20">
              <ClipboardList size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Avaliações Ativas</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Acompanhe as dobras cutâneas, IMC, RCQ e dados evolutivos.
              </p>
            </div>
          </div>

          <div id="card-graficos" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-4 shadow-sm">
            <div className="p-3 bg-primary/10 text-primary w-fit rounded-xl border border-primary/20">
              <TrendingUp size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Gráficos de Evolução</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Visualização clara das mudanças corporais ao longo do tempo.
              </p>
            </div>
          </div>

          <div id="card-protocolos" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-4 shadow-sm">
            <div className="p-3 bg-primary/10 text-primary w-fit rounded-xl border border-primary/20">
              <Activity size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Protocolos Antropométricos</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Fórmulas de Pollock (7 dobras), Guedes (3 dobras) e Faulkner de forma ágil.
              </p>
            </div>
          </div>
        </div>

        <div id="avaliacoes-status-box" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-4 shadow-sm">
          <p className="text-sm font-bold text-emerald-500 uppercase tracking-wider">Módulo Disponível</p>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">Tudo pronto para iniciar!</h2>
          <p className="text-slate-400 dark:text-slate-500 max-w-md mx-auto text-sm">
            Use as ferramentas de pacientes para registrar uma avaliação física integrada diretamente à ficha de cada um.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
