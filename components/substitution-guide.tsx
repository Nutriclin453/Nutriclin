'use client';

import React, { useState, useMemo } from 'react';
import { Scale, Check, Copy, Flame, Info, Apple } from 'lucide-react';
import { motion } from 'motion/react';

// We import these from dieta/page.tsx or define them fallback-safe
import { FOOD_OPTIONS, FOOD_DATABASE } from '../app/(painel)/dieta/page';

const SUBSTITUTION_GROUPS: Record<string, string[]> = {
  carbos: [
    "arroz_branco", 
    "arroz_integral", 
    "pão", 
    "pão_integral", 
    "pão_de_queijo", 
    "batata", 
    "batata_doce", 
    "mandioca", 
    "macarrão", 
    "cuscuz", 
    "tapioca", 
    "aveia", 
    "granola"
  ],
  proteins: [
    "frango", 
    "patinho", 
    "carne", 
    "contra_file", 
    "lombo_porco", 
    "tilapia", 
    "salmao", 
    "atum", 
    "ovo", 
    "clara", 
    "cottage"
  ],
  fats: [
    "castanha_para", 
    "castanha", 
    "amendoim", 
    "pasta_amendoim", 
    "azeite", 
    "abacate"
  ],
  fruits: [
    "banana", 
    "maçã", 
    "mamão", 
    "laranja", 
    "morango", 
    "melancia"
  ]
};

// Maps a food id to its primary macro
const PRIMARY_MACRO_MAP: Record<string, 'c' | 'p' | 'f'> = {
  // Carbos
  arroz_branco: 'c',
  arroz_integral: 'c',
  pão: 'c',
  pão_integral: 'c',
  pão_de_queijo: 'c',
  batata: 'c',
  batata_doce: 'c',
  mandioca: 'c',
  macarrão: 'c',
  cuscuz: 'c',
  tapioca: 'c',
  aveia: 'c',
  granola: 'c',
  // Proteins
  frango: 'p',
  patinho: 'p',
  carne: 'p',
  contra_file: 'p',
  lombo_porco: 'p',
  tilapia: 'p',
  salmao: 'p',
  atum: 'p',
  ovo: 'p',
  clara: 'p',
  cottage: 'p',
  // Fats
  castanha_para: 'f',
  castanha: 'f',
  amendoim: 'f',
  pasta_amendoim: 'f',
  azeite: 'f',
  abacate: 'f',
  // Fruits
  banana: 'c',
  maçã: 'c',
  mamão: 'c',
  laranja: 'c',
  morango: 'c',
  melancia: 'c',
};

export function SubstitutionGuide() {
  const [sourceId, setSourceId] = useState<string>('arroz_branco');
  const [sourceQty, setSourceQty] = useState<number>(100);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const selectedOption = useMemo(() => {
    return FOOD_OPTIONS.find((o) => o.id === sourceId) || FOOD_OPTIONS[0];
  }, [sourceId]);

  // Find database item
  const sourceDbFood = useMemo(() => {
    if (!selectedOption) return null;
    const lowerName = selectedOption.cleanName.toLowerCase();
    return FOOD_DATABASE.find((f) => 
      f.names.some((n) => lowerName.includes(n) || n.includes(lowerName) || selectedOption.id.includes(n))
    ) || null;
  }, [selectedOption]);

  // Calculate stats of source food
  const sourceStats = useMemo(() => {
    if (!sourceDbFood) return { p: 0, c: 0, f: 0, kcal: 0 };
    
    let p = 0, c = 0, f = 0;
    const isUnitType = selectedOption.unit !== 'g' && selectedOption.unit !== 'ml';

    if (sourceDbFood.isUnit) {
      let units = sourceQty;
      if (!isUnitType && sourceQty > 20) units = sourceQty / 50; // default fallback factor
      p = sourceDbFood.p * units;
      c = sourceDbFood.c * units;
      f = sourceDbFood.f * units;
    } else {
      let grams = sourceQty;
      if (isUnitType && sourceQty < 10) grams = sourceQty * 100; // default fallback factor
      p = sourceDbFood.p * grams;
      c = sourceDbFood.c * grams;
      f = sourceDbFood.f * grams;
    }

    const kcal = Math.round(p * 4 + c * 4 + f * 9);
    return { p, c, f, kcal };
  }, [sourceDbFood, sourceQty, selectedOption]);

  // Determine substitution group
  const currentGroup = useMemo(() => {
    for (const [groupName, ids] of Object.entries(SUBSTITUTION_GROUPS)) {
      if (ids.includes(sourceId)) return groupName;
    }
    return 'carbos';
  }, [sourceId]);

  // Match equivalents
  const equivalents = useMemo(() => {
    const groupFoodIds = SUBSTITUTION_GROUPS[currentGroup] || [];
    const primaryMacro = PRIMARY_MACRO_MAP[sourceId] || 'c';
    const sourceMacroValue = sourceStats[primaryMacro];

    if (sourceMacroValue <= 0) return [];

    const list: Array<{
      id: string;
      cleanName: string;
      equivalentQty: number;
      unit: string;
      kcal: number;
    }> = [];

    groupFoodIds.forEach((targetId) => {
      if (targetId === sourceId) return; // skip self

      const targetOpt = FOOD_OPTIONS.find((o) => o.id === targetId);
      if (!targetOpt) return;

      const lowerName = targetOpt.cleanName.toLowerCase();
      const targetDb = FOOD_DATABASE.find((f) => 
        f.names.some((n) => lowerName.includes(n) || n.includes(lowerName) || targetId.includes(n))
      );

      if (!targetDb) return;

      // Primary macro rate for target
      const targetMacroRate = targetDb[primaryMacro];
      if (targetMacroRate <= 0) return;

      let equivalentQty = 0;
      let targetKcal = 0;

      // Calculate translation based on unit / gram rate
      if (targetDb.isUnit) {
        // e.g. eggs, bread slices
        equivalentQty = Number((sourceMacroValue / targetMacroRate).toFixed(1));
        
        // Calorie calculation of this target qty
        const p = targetDb.p * equivalentQty;
        const c = targetDb.c * equivalentQty;
        const f = targetDb.f * equivalentQty;
        targetKcal = Math.round(p * 4 + c * 4 + f * 9);
      } else {
        // grams
        equivalentQty = Math.round(sourceMacroValue / targetMacroRate);
        
        const p = targetDb.p * equivalentQty;
        const c = targetDb.c * equivalentQty;
        const f = targetDb.f * equivalentQty;
        targetKcal = Math.round(p * 4 + c * 4 + f * 9);
      }

      list.push({
        id: targetId,
        cleanName: targetOpt.cleanName,
        equivalentQty,
        unit: targetOpt.unit,
        kcal: targetKcal,
      });
    });

    // Sort by similarity of calorie match
    return list.sort((a, b) => Math.abs(a.kcal - sourceStats.kcal) - Math.abs(b.kcal - sourceStats.kcal));
  }, [currentGroup, sourceId, sourceStats]);

  const handleCopy = (txt: string, id: string) => {
    navigator.clipboard.writeText(txt);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const getCleanLabel = (qty: number, unit: string, name: string) => {
    const formattedQty = unit === 'g' || unit === 'ml' ? `${qty}` : `${qty.toFixed(1).replace('.0', '')}`;
    return `${formattedQty}${unit} de ${name}`;
  };

  const macroTextMap = {
    c: 'Carboidratos',
    p: 'Proteínas',
    f: 'Gorduras'
  };

  return (
    <div className="bg-surface-container border border-outline-variant rounded-3xl p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
          <Scale size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-on-surface leading-tight">
            Substituições Equivalentes
          </h3>
          <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
            Calculadora Científica Integrada
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Source selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#38bdf8]">
              Alimento Prescrito
            </label>
            <select
              value={sourceId}
              onChange={(e) => {
                setSourceId(e.target.value);
                // Reset amount to standard values if unit type changes
                const opt = FOOD_OPTIONS.find((o) => o.id === e.target.value);
                if (opt) {
                  setSourceQty(opt.unit === 'g' || opt.unit === 'ml' ? 100 : 1);
                }
              }}
              className="w-full bg-surface-dim border border-outline-variant hover:border-primary/20 text-xs font-semibold text-on-surface rounded-xl p-3 outline-none focus:border-primary transition-all appearance-none cursor-pointer"
            >
              {FOOD_OPTIONS.filter((o) => o.id !== 'custom').map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label.replace(/\[.*?\]\s*/g, '')}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#38bdf8]">
              Quantidade
            </label>
            <div className="relative">
              <input
                type="number"
                min="0.1"
                step="any"
                value={sourceQty === 0 ? '' : sourceQty}
                onChange={(e) => setSourceQty(parseFloat(e.target.value) || 0)}
                className="w-full bg-surface-dim border border-outline-variant text-xs text-on-surface font-extrabold rounded-xl p-3 pr-10 outline-none focus:border-primary transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                {selectedOption?.unit || 'g'}
              </span>
            </div>
          </div>
        </div>

        {/* Source Food Nutrition Summary card */}
        <div className="p-3 bg-surface-dim/40 rounded-xl border border-outline-variant/30 text-center">
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <Flame size={12} className="text-amber-500 animate-pulse" />
            <span className="text-xs font-black text-on-surface tracking-tight">
              {sourceStats.kcal} Kcal ({selectedOption?.cleanName})
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1 divide-x divide-outline-variant/30">
            <div>
              <p className="text-[9px] font-black uppercase text-on-surface-variant leading-none">Carbo</p>
              <p className="text-xs font-extrabold text-on-surface mt-1">{sourceStats.c.toFixed(1)}g</p>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase text-on-surface-variant leading-none">Prot</p>
              <p className="text-xs font-extrabold text-emerald-400 mt-1">{sourceStats.p.toFixed(1)}g</p>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase text-on-surface-variant leading-none">Gord</p>
              <p className="text-xs font-extrabold text-[#38bdf8] mt-1">{sourceStats.f.toFixed(1)}g</p>
            </div>
          </div>
        </div>

        {/* List of Equivalent Substitutions */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#4edea3] flex items-center gap-1">
              <span>🔄</span> Equivale a (Grupo de {macroTextMap[PRIMARY_MACRO_MAP[sourceId] || 'c']}):
            </h4>
            <span className="text-[9px] text-on-surface-variant italic font-semibold">Tabela científica</span>
          </div>

          <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
            {equivalents.length === 0 ? (
              <p className="text-xs text-on-surface-variant italic text-center py-2">Sem substitutos equivalentes para esse item.</p>
            ) : (
              equivalents.map((eq) => {
                const copyText = getCleanLabel(eq.equivalentQty, eq.unit, eq.cleanName);
                const isCopied = copiedId === eq.id;

                return (
                  <div
                    key={eq.id}
                    onClick={() => handleCopy(copyText, eq.id)}
                    className="group/item flex items-center justify-between p-2.5 rounded-xl border border-outline-variant/30 bg-surface-dim/20 hover:bg-surface-dim hover:border-primary/30 transition-all cursor-pointer text-left select-none"
                    title="Clique para colar/copiar para o plano"
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="text-xs font-extrabold text-on-surface truncate">
                        {eq.equivalentQty}
                        <span className="text-on-surface-variant font-semibold text-[11px] ml-0.5">{eq.unit}</span>
                        <span className="text-on-surface font-medium text-xs ml-1.5">{eq.cleanName}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] text-[#38bdf8] font-bold">
                          {eq.kcal} Kcal
                        </span>
                        <span className="text-[8px] text-on-surface-variant/75 font-semibold">
                          (Diferença Kcal: {Math.abs(eq.kcal - sourceStats.kcal)} kcal)
                        </span>
                      </div>
                    </div>

                    <button className="p-1 px-2 rounded-lg bg-surface-container-high text-[9px] font-black uppercase tracking-wide text-on-surface-variant group-hover/item:text-primary group-hover/item:border-primary/20 hover:scale-105 border border-transparent transition-all shrink-0 flex items-center gap-1">
                      {isCopied ? (
                        <>
                          <Check size={10} className="text-[#4edea3]" />
                          <span className="text-[#4edea3]">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy size={10} />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 border-dashed flex items-start gap-2 text-[10px] text-emerald-300 font-semibold leading-relaxed">
          <Info size={14} className="shrink-0 text-[#4edea3] mt-0.5" />
          <p>
            <strong>Dica de uso:</strong> Ao prescrever dietas na esquerda, digite a quantidade correspondente aqui ao lado para ver fatias/gramas equivalentes e clique em <strong>Copiar</strong> para colá-los nas substituições diretas do cardápio!
          </p>
        </div>
      </div>
    </div>
  );
}
