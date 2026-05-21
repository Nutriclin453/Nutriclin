'use client';

import React from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Apple, Flame, Utensils } from 'lucide-react';

export default function Dieta() {
  return (
    <DashboardLayout>
      <div id="dieta-container" className="space-y-8 max-w-7xl mx-auto">
        <div id="dieta-header" className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 id="dieta-title" className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Planos de Dieta
            </h1>
            <p id="dieta-subtitle" className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Desenvolva cardápios e estratégias nutricionais personalizadas para seus pacientes.
            </p>
          </div>
        </div>

        <div id="dieta-grid" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div id="card-nutricao" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-4 shadow-sm">
            <div className="p-3 bg-primary/10 text-primary w-fit rounded-xl border border-primary/20">
              <Apple size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Alimentação Saudável</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Prescreva refeições balanceadas, alimentos equivalentes e quantidades corretas.
              </p>
            </div>
          </div>

          <div id="card-calorias" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-4 shadow-sm">
            <div className="p-3 bg-primary/10 text-primary w-fit rounded-xl border border-primary/20">
              <Flame size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Cálculo de Macronutrientes</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Acompanhe o balanço de proteínas, carboidratos, gorduras e calorias totais.
              </p>
            </div>
          </div>

          <div id="card-refeicoes" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-4 shadow-sm">
            <div className="p-3 bg-primary/10 text-primary w-fit rounded-xl border border-primary/20">
              <Utensils size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Rotina & Horários</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Parâmetros para café da manhã, almoço, lanches e shakes de suporte.
              </p>
            </div>
          </div>
        </div>

        <div id="dieta-status-box" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-4 shadow-sm">
          <p className="text-sm font-bold text-emerald-500 uppercase tracking-wider">Módulo Disponível</p>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">Tudo pronto para iniciar!</h2>
          <p className="text-slate-400 dark:text-slate-500 max-w-md mx-auto text-sm">
            Selecione o paciente desejado no painel principal ou de pacientes para começar a prescrever as metas nutricionais de forma imediata.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
