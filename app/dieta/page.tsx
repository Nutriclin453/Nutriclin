'use client';

import React from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { 
  Apple, 
  Flame, 
  Scale, 
  FileText
} from 'lucide-react';
import { motion } from 'motion/react';

export default function Dieta() {
  return (
    <DashboardLayout>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-on-surface tracking-tight">Plano Alimentar</h1>
            <p className="text-on-surface-variant text-sm font-medium mt-1">Prescrição nutricional atualizada.</p>
          </div>
          <button className="bg-primary text-on-primary px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-primary/20">
            <FileText size={18} />
            Exportar PDF
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           {/* Macro Summary */}
           <div className="lg:col-span-8 space-y-8">
             <section className="bg-surface-container border border-outline-variant rounded-3xl p-8">
               <h2 className="text-xl font-bold text-on-surface mb-8 flex items-center gap-2">
                 <Flame className="text-primary" size={20} />
                 Metas de Macronutrientes
               </h2>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 {[
                   { label: 'Proteínas', value: '220g', percent: 85, color: '#4edea3', desc: 'Essencial para reparação' },
                   { label: 'Carbos', value: '350g', percent: 60, color: '#facc15', desc: 'Energia para o treino' },
                   { label: 'Gorduras', value: '75g', percent: 40, color: '#f87171', desc: 'Equilíbrio hormonal' },
                 ].map((macro, i) => (
                   <div key={i} className="space-y-4">
                     <div className="flex justify-between items-end">
                       <div>
                         <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">{macro.label}</p>
                         <p className="text-2xl font-black text-on-surface">{macro.value}</p>
                       </div>
                       <p className="text-xs font-bold text-primary">{macro.percent}%</p>
                     </div>
                     <div className="h-2 w-full bg-surface-dim rounded-full overflow-hidden">
                       <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${macro.percent}%`, backgroundColor: macro.color }} />
                     </div>
                     <p className="text-[10px] font-bold text-on-surface-variant italic">{macro.desc}</p>
                   </div>
                 ))}
               </div>
               <div className="mt-10 p-4 bg-surface-container rounded-xl border border-outline-variant border-dashed">
                <p className="text-[11px] text-on-surface-variant italic font-medium leading-relaxed">
                  &quot;A constância na ingestão dos macronutrientes é o pilar fundamental para a sinalização hipertrófica.&quot;
                </p>
               </div>
             </section>

             <section className="space-y-4">
               <h2 className="text-lg font-bold text-on-surface uppercase tracking-widest px-2">Refeições do Dia</h2>
               {[
                 { name: 'Café da Manhã', time: '07:30', kcal: 450, items: ['4 Ovos', '2 fatias de pão integral', 'Meio abacate'] },
                 { name: 'Almoço', time: '12:30', kcal: 850, items: ['200g Frango', '250g Arroz', 'Salada à vontade'] },
                 { name: 'Pré-Treino', time: '16:00', kcal: 300, items: ['30g Whey', '50g Aveia', '1 Banana'] }
               ].map((meal, i) => (
                 <div key={i} className="bg-surface-container border border-outline-variant rounded-2xl p-6 hover:border-primary/30 transition-all cursor-pointer group">
                   <div className="flex justify-between items-center">
                     <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-surface-dim rounded-xl border border-outline-variant flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                         <Apple size={24} />
                       </div>
                       <div>
                         <p className="text-xs font-bold text-primary uppercase tracking-widest">{meal.time}</p>
                         <h3 className="text-lg font-black text-on-surface">{meal.name}</h3>
                       </div>
                     </div>
                     <div className="text-right">
                       <p className="text-xl font-black text-on-surface">{meal.kcal}</p>
                       <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Kcal</p>
                     </div>
                   </div>
                   <div className="mt-4 flex flex-wrap gap-2">
                     {meal.items.map(item => (
                       <span key={item} className="px-3 py-1 bg-surface-dim border border-outline-variant rounded-full text-[10px] font-bold text-on-surface-variant">
                         {item}
                       </span>
                     ))}
                   </div>
                 </div>
               ))}
             </section>
           </div>

           <div className="lg:col-span-4 space-y-8">
             <section className="bg-primary/10 border border-primary/20 rounded-3xl p-8 relative overflow-hidden group">
               <div className="relative z-10 space-y-6">
                 <div className="p-3 bg-primary text-on-primary w-fit rounded-2xl shadow-lg">
                   <Scale size={24} />
                 </div>
                 <div>
                   <h3 className="text-lg font-black text-on-surface">Peso Meta</h3>
                   <p className="text-on-surface-variant text-sm mt-2">Você está no caminho certo para atingir 85kg.</p>
                 </div>
                 <div className="flex items-baseline gap-2">
                   <span className="text-4xl font-black text-primary">88.5</span>
                   <span className="text-lg font-bold text-on-surface-variant">kg</span>
                 </div>
               </div>
             </section>
           </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
