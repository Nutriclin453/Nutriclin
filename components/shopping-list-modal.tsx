'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingCart, Share2, Printer, CheckSquare, Square, ClipboardCopy } from 'lucide-react';
import { Meal } from '@/lib/diet-service';

interface ShoppingListModalProps {
  isOpen: boolean;
  onClose: () => void;
  meals: Meal[];
  patientName: string;
}

export function ShoppingListModal({ isOpen, onClose, meals, patientName }: ShoppingListModalProps) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const categorizedList = useMemo(() => {
    const proteinas: string[] = [];
    const carboidratos: string[] = [];
    const frutasVeg: string[] = [];
    const gorduras: string[] = [];
    const outros: string[] = [];

    const allItems = meals.flatMap(m => m.items || []);
    const uniqueItems = Array.from(new Set(allItems)).filter(Boolean);

    uniqueItems.forEach(item => {
      const normalized = item.toLowerCase();
      
      // Category 1: Proteins and dairy
      if (
        normalized.includes('ovo') ||
        normalized.includes('clara') ||
        normalized.includes('frango') ||
        normalized.includes('carne') ||
        normalized.includes('bife') ||
        normalized.includes('patinho') ||
        normalized.includes('boi') ||
        normalized.includes('alcatra') ||
        normalized.includes('peixe') ||
        normalized.includes('tilapia') ||
        normalized.includes('tilápia') ||
        normalized.includes('salmão') ||
        normalized.includes('salmao') ||
        normalized.includes('atum') ||
        normalized.includes('lombo') ||
        normalized.includes('suíno') ||
        normalized.includes('suino') ||
        normalized.includes('leite') ||
        normalized.includes('queijo') ||
        normalized.includes('cottage') ||
        normalized.includes('mussarela') ||
        normalized.includes('ricota') ||
        normalized.includes('requeijão') ||
        normalized.includes('requeijao') ||
        normalized.includes('iogurte') ||
        normalized.includes('whey') ||
        normalized.includes('suplemento de proteína') ||
        normalized.includes('presunto') ||
        normalized.includes('peru')
      ) {
        proteinas.push(item);
      }
      // Category 2: Carbs & Grains
      else if (
        normalized.includes('arroz') ||
        normalized.includes('pão') ||
        normalized.includes('pao') ||
        normalized.includes('integral') ||
        normalized.includes('macarrão') ||
        normalized.includes('macarrao') ||
        normalized.includes('batata') ||
        normalized.includes('mandioca') ||
        normalized.includes('aipim') ||
        normalized.includes('macaxeira') ||
        normalized.includes('aveia') ||
        normalized.includes('granola') ||
        normalized.includes('tapioca') ||
        normalized.includes('cuscuz') ||
        normalized.includes('crepioca') ||
        normalized.includes('biscoito') ||
        normalized.includes('farinha') ||
        normalized.includes('torrada') ||
        normalized.includes('feijão') ||
        normalized.includes('feijao') ||
        normalized.includes('lentilha') ||
        normalized.includes('milho')
      ) {
        carboidratos.push(item);
      }
      // Category 3: Fruits & Veggies
      else if (
        normalized.includes('banana') ||
        normalized.includes('mamão') ||
        normalized.includes('mamao') ||
        normalized.includes('maçã') ||
        normalized.includes('maca') ||
        normalized.includes('morango') ||
        normalized.includes('uva') ||
        normalized.includes('abacaxi') ||
        normalized.includes('limão') ||
        normalized.includes('limao') ||
        normalized.includes('laranja') ||
        normalized.includes('salada') ||
        normalized.includes('alface') ||
        normalized.includes('tomate') ||
        normalized.includes('brócolis') ||
        normalized.includes('brocolis') ||
        normalized.includes('cenoura') ||
        normalized.includes('vagem') ||
        normalized.includes('rúcula') ||
        normalized.includes('rucula') ||
        normalized.includes('abobrinha') ||
        normalized.includes('berinjela') ||
        normalized.includes('espinafre') ||
        normalized.includes('vegetais') ||
        normalized.includes('legumes')
      ) {
        frutasVeg.push(item);
      }
      // Category 4: Fats (Healthy) & Nuts
      else if (
        normalized.includes('azeite') ||
        normalized.includes('castanha') ||
        normalized.includes('nozes') ||
        normalized.includes('amendoim') ||
        normalized.includes('pasta de amendoim') ||
        normalized.includes('oleaginosas') ||
        normalized.includes('abacate') ||
        normalized.includes('coco') ||
        normalized.includes('manteiga') ||
        normalized.includes('semente') ||
        normalized.includes('chia') ||
        normalized.includes('linhaça') ||
        normalized.includes('linhaca')
      ) {
        gorduras.push(item);
      }
      // Category 5: Others
      else {
        outros.push(item);
      }
    });

    return { proteinas, carboidratos, frutasVeg, gorduras, outros };
  }, [meals]);

  const [copied, setCopied] = useState(false);

  const handleCopyText = () => {
    let text = `🛒 *LISTA DE COMPRAS - DIETA DE ${patientName.toUpperCase()}*\n`;
    text += `_Gerada automaticamente pelo CRM Dr. Antônio Feitoza_\n\n`;

    const { proteinas, carboidratos, frutasVeg, gorduras, outros } = categorizedList;

    if (proteinas.length > 0) {
      text += `🥩 *Proteínas e Laticínios*\n`;
      proteinas.forEach(item => { text += `• [ ] ${item}\n`; });
      text += `\n`;
    }

    if (carboidratos.length > 0) {
      text += `🌾 *Cereais, Carboidratos & Pães*\n`;
      carboidratos.forEach(item => { text += `• [ ] ${item}\n`; });
      text += `\n`;
    }

    if (frutasVeg.length > 0) {
      text += `🍎 *Frutas, Legumes & Hortaliças*\n`;
      frutasVeg.forEach(item => { text += `• [ ] ${item}\n`; });
      text += `\n`;
    }

    if (gorduras.length > 0) {
      text += `🥜 *Gorduras Saudáveis & Oleaginosas*\n`;
      gorduras.forEach(item => { text += `• [ ] ${item}\n`; });
      text += `\n`;
    }

    if (outros.length > 0) {
      text += `📦 *Outros / Suplementos / Temperos*\n`;
      outros.forEach(item => { text += `• [ ] ${item}\n`; });
      text += `\n`;
    }

    text += `_Lembre-se de priorizar alimentos frescos e manter-se hidratado/a!_`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleItem = (name: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const totalItemsCount = Object.keys(categorizedList).reduce(
    (acc, key) => acc + (categorizedList as any)[key].length, 
    0
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm print:hidden"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-surface-container border border-outline-variant rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] print:max-h-none print:shadow-none print:border-none print:inset-0 print:absolute print:w-full print:bg-white print:text-black"
          >
            {/* Header */}
            <div className="p-6 border-b border-outline-variant flex items-center justify-between bg-surface-dim/30 print:hidden">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl text-primary border border-primary/20">
                  <ShoppingCart size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-on-surface">Lista de Compras Inteligente</h2>
                  <p className="text-xs text-on-surface-variant font-medium">Cardápio do Paciente: <span className="text-primary font-bold">{patientName}</span></p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-surface-container-high rounded-full transition-colors text-on-surface-variant"
              >
                <X size={20} />
              </button>
            </div>

            {/* Print Header */}
            <div className="hidden print:block p-8 border-b border-slate-200 bg-white">
              <h1 className="text-2xl font-black text-slate-800 tracking-tight text-center uppercase">Lista de Compras</h1>
              <p className="text-sm font-bold text-slate-600 text-center mt-1">Plano Alimentar Prescrito - {patientName}</p>
              <p className="text-xs text-slate-400 text-center mt-2">Dr. Antônio Feitoza - CRN Nutrição</p>
            </div>

            {/* List Body */}
            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-6 bg-surface-container print:bg-white print:overflow-visible">
              {totalItemsCount === 0 ? (
                <div className="text-center py-12 text-on-surface-variant">
                  <ShoppingCart size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="font-bold text-sm">Nenhum alimento foi detectado neste cardápio.</p>
                  <p className="text-xs">Cadastre os alimentos nas refeições do plano alimentar primeiro.</p>
                </div>
              ) : (
                <>
                  {/* Category Sections */}
                  {Object.entries(categorizedList).map(([key, items]) => {
                    if (items.length === 0) return null;

                    let title = '';
                    let emoji = '';
                    let color = '';

                    if (key === 'proteinas') {
                      title = 'Proteínas e Laticínios';
                      emoji = '🥩';
                      color = 'text-emerald-500';
                    } else if (key === 'carboidratos') {
                      title = 'Cereais, Carboidratos & Pães';
                      emoji = '🌾';
                      color = 'text-amber-500';
                    } else if (key === 'frutasVeg') {
                      title = 'Frutas, Legumes & Hortaliças';
                      emoji = '🍎';
                      color = 'text-rose-500';
                    } else if (key === 'gorduras') {
                      title = 'Gorduras Saudáveis & Oleaginosas';
                      emoji = '🥜';
                      color = 'text-teal-500';
                    } else {
                      title = 'Outros / Suplementos / Temperos';
                      emoji = '📦';
                      color = 'text-indigo-500';
                    }

                    return (
                      <div key={key} className="space-y-3 [page-break-inside:avoid] border border-outline-variant/30 bg-surface-dim/20 p-4 rounded-xl print:border-none print:p-0">
                        <h3 className="text-xs font-black uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5 print:text-slate-800 print:text-sm print:font-bold">
                          <span>{emoji}</span>
                          <span className={color}>{title}</span>
                          <span className="text-[10px] text-on-surface-variant/75 font-bold print:hidden">({items.length})</span>
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-1">
                          {items.map((item, idx) => {
                            const isChecked = checkedItems[item] || false;
                            return (
                              <div 
                                key={idx}
                                onClick={() => toggleItem(item)}
                                className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer border transition-all select-none print:border-none print:p-1 ${
                                  isChecked 
                                  ? 'bg-primary/5 border-primary/20 text-on-surface/50 line-through' 
                                  : 'bg-surface-container-high/40 border-outline-variant/20 hover:border-primary/20 text-on-surface'
                                }`}
                              >
                                <span className="text-primary shrink-0 print:border print:border-slate-300 print:w-4 print:h-4 print:rounded">
                                  {isChecked ? (
                                    <CheckSquare size={16} className="print:hidden" />
                                  ) : (
                                    <Square size={16} className="print:hidden" />
                                  )}
                                </span>
                                <span className="text-xs font-semibold truncate leading-none print:text-black">{item}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>

            {/* Footer Control Bar */}
            <div className="p-6 border-t border-outline-variant bg-surface-dim/30 flex flex-col md:flex-row items-center justify-between gap-4 print:hidden">
              <p className="text-xs font-bold text-on-surface-variant">
                Total de <span className="text-primary font-black">{totalItemsCount}</span> itens únicos detectados
              </p>
              
              <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-end">
                <button 
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-on-surface-variant hover:bg-surface-dim transition-all mr-auto md:mr-0"
                >
                  Fechar
                </button>

                <button 
                  onClick={handleCopyText}
                  className="bg-surface-container-highest border border-outline-variant text-on-surface px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-surface-dim transition-all"
                >
                  <Share2 size={14} className="text-primary" />
                  {copied ? 'Copiado!' : 'Compartilhar (WhatsApp)'}
                </button>

                <button 
                  onClick={handlePrint}
                  className="bg-primary text-on-primary px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:brightness-110 shadow-lg shadow-primary/20 transition-all"
                >
                  <Printer size={14} />
                  Imprimir
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
