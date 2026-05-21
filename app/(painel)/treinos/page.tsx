'use client';

import React from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Dumbbell, Zap, Trophy } from 'lucide-react';

export default function Treinos() {
  return (
    <DashboardLayout>
      <div id="treinos-container" className="space-y-8 max-w-7xl mx-auto">
        <div id="treinos-header" className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 id="treinos-title" className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Prescrição de Treinos
            </h1>
            <p id="treinos-subtitle" className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Monte rotinas de treinamento, divisões semanais de séries e repetições personalizadas.
            </p>
          </div>
        </div>

        <div id="treinos-grid" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div id="card-periodizacao" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-4 shadow-sm">
            <div className="p-3 bg-primary/10 text-primary w-fit rounded-xl border border-primary/20">
              <Dumbbell size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Divisões Semanais</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Configure treinos por grupos musculares específicos e frequência ideal.
              </p>
            </div>
          </div>

          <div id="card-intensidade" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-4 shadow-sm">
            <div className="p-3 bg-primary/10 text-primary w-fit rounded-xl border border-primary/20">
              <Zap size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Intensidade & RPE</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Monitore o esforço percebido dos pacientes e as cargas utilizadas nos exercícios.
              </p>
            </div>
          </div>

          <div id="card-resultados" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-4 shadow-sm">
            <div className="p-3 bg-primary/10 text-primary w-fit rounded-xl border border-primary/20">
              <Trophy size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Consistência do Atleta</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Ficha de treinamento orientada para o pilar de ganho de performance e hipertrofia.
              </p>
            </div>
          </div>
        </div>

        <div id="treinos-status-box" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-4 shadow-sm">
          <p className="text-sm font-bold text-emerald-500 uppercase tracking-wider">Módulo Disponível</p>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">Pronto para criar planos!</h2>
          <p className="text-slate-400 dark:text-slate-500 max-w-md mx-auto text-sm">
            O painel de controle esportivo está totalmente funcional. Acesse no botão do menu para prescrever.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
