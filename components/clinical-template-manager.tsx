'use client';

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Plus, 
  Trash2, 
  Check, 
  Bookmark, 
  ChevronDown, 
  AlertCircle,
  Clock,
  Dumbbell
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ClinicalTemplate, TemplateService } from '@/lib/template-service';

interface ClinicalTemplateManagerProps {
  type: 'diet' | 'workout';
  currentData: any; // Current meals/macros or exercises
  onApply: (data: any) => void;
  disabled?: boolean;
}

export function ClinicalTemplateManager({ 
  type, 
  currentData, 
  onApply,
  disabled = false 
}: ClinicalTemplateManagerProps) {
  const [templates, setTemplates] = useState<ClinicalTemplate[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [saveName, setSaveName] = useState<string>('');
  const [saveDesc, setSaveDesc] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [showConfirmApply, setShowConfirmApply] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load templates on mount / type change / action
  const loadTemplates = (autoSelectId?: string) => {
    const list = TemplateService.getTemplates(type);
    setTemplates(list);
    if (autoSelectId) {
      setSelectedId(autoSelectId);
    } else if (list.length > 0) {
      const exists = list.some(t => t.id === selectedId);
      if (!exists) {
        setSelectedId(list[0].id);
      }
    } else {
      setSelectedId('');
    }
  };

  useEffect(() => {
    const list = TemplateService.getTemplates(type);
    setTemplates(list);
    if (list.length > 0) {
      setSelectedId(list[0].id);
    } else {
      setSelectedId('');
    }
    setDeletingId(null);
    setShowConfirmApply(false);
  }, [type]);

  const selectedTemplate = templates.find(t => t.id === selectedId);

  // Apply template to workspace
  const handleApply = () => {
    if (!selectedTemplate) return;
    onApply(selectedTemplate.data);
    setShowConfirmApply(false);
    
    // Quick alert effect
    const btn = document.getElementById('apply-success-alert');
    if (btn) {
      btn.classList.remove('hidden');
      setTimeout(() => btn.classList.add('hidden'), 2000);
    }
  };

  // Save current active workspace as a new template
  const handleSaveAsTemplate = () => {
    setErrorMsg('');
    if (!saveName.trim()) {
      setErrorMsg('Digite um nome para o modelo.');
      return;
    }

    setIsSaving(true);
    
    try {
      // Build standard clinical template data
      let templateDataPayload: any = {};
      if (type === 'diet') {
        templateDataPayload = {
          meals: currentData.meals || [],
          macros: currentData.macros || { protein: 0, carbs: 0, fats: 0, proteinPct: 0, carbsPct: 0, fatsPct: 0 },
          notes: currentData.notes || '',
          goal: currentData.goal || 'Personalizado'
        };
      } else {
        templateDataPayload = {
          exercises: currentData.exercises || []
        };
      }

      const newTpl = TemplateService.saveTemplate({
        name: saveName.trim(),
        type,
        description: saveDesc.trim() || undefined,
        data: templateDataPayload
      });

      setSaveName('');
      setSaveDesc('');
      setIsSaving(false);
      setSaveSuccess(true);
      loadTemplates(newTpl.id);
      
      // Auto-focus selected template to the newly saved one
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (e: any) {
      console.error(e);
      setErrorMsg('Erro ao salvar modelo.');
      setIsSaving(false);
    }
  };

  // Delete template
  const handleDeleteTemplate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingId(id);
  };

  const proceedDelete = (id: string) => {
    TemplateService.deleteTemplate(id);
    const remaining = templates.filter(t => t.id !== id);
    setTemplates(remaining);
    setDeletingId(null);
    if (selectedId === id && remaining.length > 0) {
      setSelectedId(remaining[0].id);
    } else if (remaining.length === 0) {
      setSelectedId('');
    }
  };

  return (
    <div className="bg-surface-container border border-outline-variant rounded-3xl p-6 space-y-6">
      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-primary/10 text-primary border border-primary/20 rounded-xl">
          <BookOpen size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-on-surface leading-tight">
            Modelos de {type === 'diet' ? 'Dieta' : 'Treino'}
          </h3>
          <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
            Templates Clínicos Reutilizáveis
          </p>
        </div>
      </div>

      {/* Load Section */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-[#38bdf8]">
            Selecionar Modelo Clínico
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                disabled={disabled || templates.length === 0}
                className="w-full bg-surface-dim border border-outline-variant hover:border-primary/20 text-xs font-semibold text-on-surface rounded-xl p-3 pr-10 outline-none focus:border-primary transition-all appearance-none cursor-pointer disabled:opacity-50"
              >
                {templates.length === 0 ? (
                  <option>Nenhum modelo disponível</option>
                ) : (
                  templates.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.name} {tpl.id.startsWith('tpl-diet-') || tpl.id.startsWith('tpl-workout-') ? '★' : ''}
                    </option>
                  ))
                )}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                <ChevronDown size={14} />
              </div>
            </div>

            {selectedTemplate && (
              <button
                type="button"
                onClick={(e) => handleDeleteTemplate(selectedTemplate.id, e)}
                disabled={disabled}
                className="shrink-0 p-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 active:scale-95 text-xs rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                title="Excluir este modelo"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Selected Template Details Preview */}
        {selectedTemplate && (
          <div className="p-4 bg-surface-dim/40 rounded-2xl border border-outline-variant/30 space-y-3">
            <div>
              <p className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                <Sparkles size={12} className="text-amber-400" />
                {selectedTemplate.name}
              </p>
              {selectedTemplate.description && (
                <p className="text-[11px] text-on-surface-variant leading-relaxed mt-1 italic">
                  {selectedTemplate.description}
                </p>
              )}
            </div>

            {/* Diet details */}
            {type === 'diet' && selectedTemplate.data.meals && (
              <div className="grid grid-cols-2 gap-2 text-[11px] border-t border-outline-variant/20 pt-2.5">
                <div>
                  <span className="text-on-surface-variant font-medium">Refeições:</span>{' '}
                  <span className="text-on-surface font-extrabold">{selectedTemplate.data.meals.length} meal(s)</span>
                </div>
                {selectedTemplate.data.macros && (
                  <div>
                    <span className="text-on-surface-variant font-medium">Macros Target:</span>{' '}
                    <span className="text-emerald-400 font-extrabold">
                      {Math.round(selectedTemplate.data.macros.protein * 4 + selectedTemplate.data.macros.carbs * 4 + selectedTemplate.data.macros.fats * 9)} Kcal
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Workout details */}
            {type === 'workout' && selectedTemplate.data.exercises && (
              <div className="text-[11px] border-t border-outline-variant/20 pt-2.5">
                <span className="text-on-surface-variant font-medium">Exercícios Planejados:</span>{' '}
                <span className="text-on-surface font-extrabold">
                  {selectedTemplate.data.exercises.length} item(ns)
                </span>
              </div>
            )}

            {/* Quick Actions / Deletion Confirmation Inline */}
            {deletingId === selectedTemplate.id ? (
              <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl space-y-2 mt-2 animate-pulse text-center">
                <p className="text-[11px] text-red-400 font-bold flex items-center justify-center gap-1">
                  <AlertCircle size={10} /> Deseja excluir definitivamente este modelo?
                </p>
                <div className="flex gap-2 justify-center">
                  <button
                    type="button"
                    onClick={() => setDeletingId(null)}
                    className="flex-1 bg-surface-container-highest hover:bg-surface-container-high text-on-surface text-[10px] uppercase font-bold py-1.5 rounded-lg border border-outline-variant cursor-pointer"
                  >
                    Não, Voltar
                  </button>
                  <button
                    type="button"
                    onClick={() => proceedDelete(selectedTemplate.id)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white text-[10px] uppercase font-black py-1.5 rounded-lg cursor-pointer animate-none"
                  >
                    Sim, Excluir
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={(e) => handleDeleteTemplate(selectedTemplate.id, e)}
                className="text-[10px] text-red-400/80 hover:text-red-400 font-semibold flex items-center gap-1 mt-1 transition-all cursor-pointer"
              >
                <Trash2 size={10} />
                {selectedTemplate.id.startsWith('tpl-diet-') || selectedTemplate.id.startsWith('tpl-workout-')
                  ? 'Ocultar / Excluir este modelo padrão'
                  : 'Excluir este modelo personalizado'}
              </button>
            )}
          </div>
        )}

        {/* Apply Call To Action with single confirmation step */}
        <div className="space-y-2">
          {!showConfirmApply ? (
            <button
              onClick={() => {
                if (!selectedId) return;
                setShowConfirmApply(true);
              }}
              disabled={disabled || !selectedId}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              ⚡ Aplicar Modelo no Prontuário
            </button>
          ) : (
            <div className="bg-surface-dim/90 border border-amber-500/30 p-3 rounded-xl space-y-2 text-center animate-fade-in">
              <p className="text-[11px] text-amber-300 font-bold leading-normal flex items-center justify-center gap-1">
                <AlertCircle size={12} /> Deseja substituir a receita atual por este modelo?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowConfirmApply(false)}
                  className="flex-1 bg-surface-container-highest hover:bg-surface-container-high text-on-surface text-[10px] uppercase font-bold py-1.5 rounded-lg border border-outline-variant"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleApply}
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-black text-[10px] uppercase font-black py-1.5 rounded-lg"
                >
                  Sim, Substituir
                </button>
              </div>
            </div>
          )}

          {/* Quick Success Badge */}
          <div 
            id="apply-success-alert" 
            className="hidden p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-center rounded-xl text-[11px] font-bold"
          >
            ✓ Modelo aplicado com sucesso! Quantidades prontas para refino.
          </div>
        </div>
      </div>

      {/* Save Current as Template Section */}
      <div className="border-t border-outline-variant/30 pt-5 space-y-4">
        <div>
          <h4 className="text-xs font-bold text-on-surface flex items-center gap-1">
            <Bookmark size={13} className="text-[#38bdf8]" />
            Salvar Atual como Modelo
          </h4>
          <p className="text-[10px] text-on-surface-variant leading-relaxed">
            Crie novos modelos prontos baseados no paciente ativo.
          </p>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <input
              type="text"
              placeholder="Ex: Low Carb Avançado - 1800Kcal"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              disabled={disabled}
              className="w-full bg-surface border border-outline-variant text-xs text-on-surface font-semibold p-2.5 rounded-xl placeholder:text-on-surface-variant/40 outline-none focus:border-primary transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <input
              type="text"
              placeholder="Breve descrição ou observações do protocolo..."
              value={saveDesc}
              onChange={(e) => setSaveDesc(e.target.value)}
              disabled={disabled}
              className="w-full bg-surface border border-outline-variant text-xs text-on-surface font-semibold p-2.5 rounded-xl placeholder:text-on-surface-variant/40 outline-none focus:border-primary transition-all"
            />
          </div>

          {errorMsg && (
            <p className="text-[11px] font-semibold text-red-400 mt-1 flex items-center gap-1 leading-tight">
              <AlertCircle size={10} /> {errorMsg}
            </p>
          )}

          {saveSuccess && (
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-center rounded-xl text-[11px] font-bold">
              ✓ Modelo Clínico salvo na biblioteca!
            </div>
          )}

          <button
            onClick={handleSaveAsTemplate}
            type="button"
            disabled={disabled || isSaving || !saveName.trim()}
            className="w-full bg-surface-container-highest hover:bg-surface-dim text-on-surface hover:text-primary py-2 px-3 border border-outline-variant rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Plus size={14} />
            {isSaving ? 'Salvando...' : 'Salvar Novo Modelo'}
          </button>
        </div>
      </div>
    </div>
  );
}
