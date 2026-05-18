'use client';

import React from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { 
  Users, 
  CheckCircle2, 
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap,
  Calendar,
  Apple
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { motion } from 'motion/react';

const data = [
  { name: 'Jan', value: 400 },
  { name: 'Fev', value: 300 },
  { name: 'Mar', value: 500 },
  { name: 'Abr', value: 450 },
  { name: 'Mai', value: 600 },
  { name: 'Jun', value: 550 },
];

export default function Dashboard() {
  return (
    <DashboardLayout>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-on-surface tracking-tight">Bem-vindo, Antonio!</h1>
            <p className="text-on-surface-variant text-sm font-medium mt-1">Aqui está o resumo da sua clínica hoje.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-surface-container border border-outline-variant rounded-xl text-xs font-bold text-on-surface-variant hover:text-on-surface transition-all flex items-center gap-2">
              <Calendar size={14} />
              Últimos 30 Dias
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total de Pacientes', value: '1,284', trend: '+12%', color: 'primary', icon: Users },
            { label: 'Avaliações do Mês', value: '156', trend: '+5%', color: 'secondary', icon: Activity },
            { label: 'Dietas Ativas', value: '942', trend: '-2%', color: 'tertiary', icon: Apple },
            { label: 'Taxa de Retenção', value: '88%', trend: '+3%', color: 'primary', icon: CheckCircle2 },
          ].map((stat, i) => (
            <div key={i} className="bg-surface-container border border-outline-variant p-6 rounded-3xl hover:border-primary/50 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-surface-dim rounded-2xl border border-outline-variant group-hover:scale-110 transition-transform">
                  <stat.icon className="text-primary" size={24} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-black ${stat.trend.startsWith('+') ? 'text-primary' : 'text-error'}`}>
                  {stat.trend}
                  {stat.trend.startsWith('+') ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                </div>
              </div>
              <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest">{stat.label}</p>
              <p className="text-3xl font-black text-on-surface mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-surface-container border border-outline-variant rounded-3xl p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-on-surface">Crescimento de Pacientes</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary rounded-full" />
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Ativos</span>
                </div>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4edea3" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4edea3" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3c4a42" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#bbcabf', fontSize: 10}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#bbcabf', fontSize: 10}} dx={-10} />
                  <Tooltip 
                    contentStyle={{backgroundColor: '#171f33', border: '1px solid #3c4a42', borderRadius: '12px'}}
                    itemStyle={{color: '#4edea3'}}
                  />
                  <Area type="monotone" dataKey="value" stroke="#4edea3" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-surface-container border border-outline-variant rounded-3xl p-8 flex flex-col">
            <h2 className="text-xl font-black text-on-surface mb-8">Foco Clínico</h2>
            <div className="flex-1 space-y-6">
               {[
                { label: 'Hipertrofia', percent: 65, color: '#4edea3' },
                { label: 'Emagrecimento', percent: 25, color: '#ffb3af' },
                { label: 'Performance', percent: 10, color: '#31394d' },
               ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                    <span>{item.label}</span>
                    <span>{item.percent}%</span>
                  </div>
                  <div className="h-2 w-full bg-surface-dim rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-1000" 
                      style={{ width: `${item.percent}%`, backgroundColor: item.color }} 
                    />
                  </div>
                </div>
               ))}
            </div>
            <div className="mt-8 p-4 bg-primary/10 rounded-2xl border border-primary/20">
              <div className="flex items-center gap-3">
                <Zap className="text-primary" size={20} />
                <p className="text-xs font-bold text-on-surface">Insight: 60% dos pacientes atingiram o objetivo este mês.</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
