'use client';

import React from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { 
  Dumbbell, 
  Zap, 
  Timer, 
  Repeat, 
  ChevronRight,
  TrendingUp,
  Plus
} from 'lucide-react';

export default function Treinos() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-on-surface tracking-tight">Prescrição de Treino</h1>
            <p className="text-on-surface-variant text-sm font-medium mt-1">Foco atual: Hipertrofia Miofibrilar.</p>
          </div>
          <button className="bg-primary text-on-primary px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-primary/20">
            <Plus size={18} />
            Novo Bloco
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Training Schedule */}
          <div className="lg:col-span-8 space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM'].map((day, i) => (
                <div key={day} className={`p-4 rounded-2xl border transition-all text-center space-y-2 ${
                  i === 0 || i === 1 || i === 3 || i === 4 
                  ? 'bg-primary/10 border-primary/30 text-primary' 
                  : 'bg-surface-container border-outline-variant text-on-surface-variant'
                }`}>
                  <p className="text-[10px] font-black tracking-widest">{day}</p>
                  <p className="text-xs font-bold">{i === 1 ? 'Treino B' : i === 0 ? 'Treino A' : 'Descanso'}</p>
                </div>
              ))}
            </div>

            <section className="space-y-4">
              <h2 className="text-lg font-black text-on-surface uppercase tracking-widest px-2">Ficha: Treino A (Push)</h2>
              {[
                { name: 'Supino Inclinado com Halteres', sets: '4', reps: '8-10', rest: '2min' },
                { name: 'Desenvolvimento Militar', sets: '3', reps: '10-12', rest: '90s' },
                { name: 'Tríceps na Polia Alta', sets: '4', reps: '12-15', rest: '60s' },
              ].map((ex, i) => (
                <div key={i} className="bg-surface-container border border-outline-variant rounded-2xl p-6 hover:border-primary/50 transition-all group cursor-pointer">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-6">
                      <div className="w-10 h-10 bg-surface-dim rounded-xl border border-outline-variant flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        {i + 1}
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-on-surface">{ex.name}</h3>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface-variant">
                            <Repeat size={14} className="text-primary" />
                            <span>{ex.sets} Séries</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface-variant">
                            <Zap size={14} className="text-primary" />
                            <span>{ex.reps} Reps</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface-variant">
                            <Timer size={14} className="text-primary" />
                            <span>{ex.rest} Descanso</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-on-surface-variant group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </section>
          </div>

          {/* Training Tips & Progression */}
          <div className="lg:col-span-4 space-y-8">
            <section className="bg-surface-container border border-outline-variant rounded-3xl p-8 space-y-8">
              <div className="flex items-center gap-3">
                <TrendingUp className="text-primary" size={24} />
                <h3 className="text-xl font-black text-on-surface">Evolução de Cargas</h3>
              </div>
              <div className="bg-surface-container-low p-5 rounded-xl border border-outline-variant italic">
                <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
                  &quot;O volume está atingindo o pico conforme planejado. Marcadores de recuperação estão ótimos. Faremos o deload em 2 semanas.&quot;
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
