'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Save, 
  HeartPulse, 
  Droplet, 
  Moon, 
  Dumbbell, 
  ThumbsUp, 
  ThumbsDown, 
  FileText,
  ClipboardList,
  FlameKindling
} from 'lucide-react';
import { Patient } from '@/lib/patient-service';
import { Anamnesis, AnamnesisService } from '@/lib/anamnesis-service';

interface AnamnesisModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
}

type ActiveTab = 'clinico' | 'habitos' | 'alimentar';

export function AnamnesisModal({ isOpen, onClose, patient }: AnamnesisModalProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('clinico');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<Omit<Anamnesis, 'id' | 'patientId'>>({
    allergies: '',
    medications: '',
    diseases: '',
    waterIntake: 0,
    waterTarget: 0,
    sleepQuality: '',
    bowelHabit: '',
    physicalActivity: '',
    preferredFoods: '',
    dislikedFoods: '',
    notes: ''
  });

  // Calculate default water target based on patient weight if available (35ml * weight)
  useEffect(() => {
    if (patient) {
      const weight = patient.weight || (patient as any).peso || 0;
      if (weight > 0) {
        const calculated = Number(((weight * 35) / 1000).toFixed(2)); // in Liters
        setFormData(prev => ({
          ...prev,
          waterTarget: calculated
        }));
      }
    }
  }, [patient]);

  // Load existing anamnesis
  useEffect(() => {
    if (isOpen && patient?.id) {
      const loadAnamnesis = async () => {
        setFetching(true);
        setError(null);
        try {
          const data = await AnamnesisService.getByPatientId(patient.id);
          if (data) {
            setFormData({
              allergies: data.allergies || '',
              medications: data.medications || '',
              diseases: data.diseases || '',
              waterIntake: data.waterIntake || 0,
              waterTarget: data.waterTarget || formData.waterTarget || 0,
              sleepQuality: data.sleepQuality || '',
              bowelHabit: data.bowelHabit || '',
              physicalActivity: data.physicalActivity || '',
              preferredFoods: data.preferredFoods || '',
              dislikedFoods: data.dislikedFoods || '',
              notes: data.notes || ''
            });
          } else {
            // Reset to defaults if none found
            const weight = patient.weight || (patient as any).peso || 0;
            const calculatedTarget = weight > 0 ? Number(((weight * 35) / 1000).toFixed(2)) : 0;
            
            setFormData({
              allergies: '',
              medications: '',
              diseases: '',
              waterIntake: 0.5,
              waterTarget: calculatedTarget,
              sleepQuality: '',
              bowelHabit: '',
              physicalActivity: '',
              preferredFoods: '',
              dislikedFoods: '',
              notes: ''
            });
          }
        } catch (err) {
          console.error(err);
          setError('Não foi possível carregar a anamnese deste paciente.');
        } finally {
          setFetching(false);
        }
      };
      loadAnamnesis();
    }
  }, [isOpen, patient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient?.id) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await AnamnesisService.save(patient.id, formData);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
      setError('Erro ao salvar ficha de anamnese.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'clinico' as ActiveTab, label: 'Histórico Clínico', icon: HeartPulse },
    { id: 'habitos' as ActiveTab, label: 'Hábitos & Rotina', icon: Droplet },
    { id: 'alimentar' as ActiveTab, label: 'Perfil Alimentar', icon: ClipboardList },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-surface-container border border-outline-variant rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-outline-variant flex items-center justify-between bg-surface-dim/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl text-primary border border-primary/20">
                  <ClipboardList size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-on-surface">Anamnese & Hábitos</h2>
                  <p className="text-xs text-on-surface-variant font-medium">Paciente: <span className="text-primary font-bold">{patient?.name}</span></p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-surface-container-high rounded-full transition-colors text-on-surface-variant"
              >
                <X size={20} />
              </button>
            </div>

            {/* Tabs Selector */}
            <div className="flex border-b border-outline-variant bg-surface-dim/10 p-2 gap-1 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap focus:outline-none ${
                      isSelected 
                      ? 'bg-primary text-on-primary shadow-md shadow-primary/10' 
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                    }`}
                  >
                    <Icon size={14} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Content Form */}
            <form onSubmit={handleSubmit} className="p-6 min-h-[350px] max-h-[60vh] overflow-y-auto custom-scrollbar">
              {error && (
                <div className="p-4 bg-error/10 border border-error/20 rounded-xl text-error text-xs font-bold mb-6">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 text-xs font-bold mb-6 text-center animate-pulse">
                  ✓ Anamnese salva com sucesso! Fechando...
                </div>
              )}

              {fetching ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest leading-none">Buscando dados da anamnese...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* TAB 1: Clinical */}
                  {activeTab === 'clinico' && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-5"
                    >
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Patologias e Doenças (Histórico)</label>
                        <textarea
                          value={formData.diseases}
                          onChange={(e) => setFormData({...formData, diseases: e.target.value})}
                          className="w-full bg-surface-container-high border border-outline-variant rounded-xl py-3 px-4 text-sm text-on-surface outline-none focus:border-primary transition-all font-medium min-h-[80px]"
                          placeholder="Ex: Diabetes Tipo II, Hipertensão, Gastrite, histórico familiar..."
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Alergias ou Intolerâncias Alimentares</label>
                        <textarea
                          value={formData.allergies}
                          onChange={(e) => setFormData({...formData, allergies: e.target.value})}
                          className="w-full bg-surface-container-high border border-outline-variant rounded-xl py-3 px-4 text-sm text-on-surface outline-none focus:border-primary transition-all font-medium min-h-[80px]"
                          placeholder="Ex: Intolerância à lactose, alergia a glúten, frutos do mar ou amendoim..."
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 col-span-1 md:col-span-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Medicamentos e Suplementos em uso</label>
                          <textarea
                            value={formData.medications}
                            onChange={(e) => setFormData({...formData, medications: e.target.value})}
                            className="w-full bg-surface-container-high border border-outline-variant rounded-xl py-3 px-4 text-sm text-on-surface outline-none focus:border-primary transition-all font-medium min-h-[80px]"
                            placeholder="Ex: Metformina 850mg (almoço), Whey Protein (pós-treino)..."
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 2: Habits */}
                  {activeTab === 'habitos' && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-5"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-surface-container-low/50 p-5 rounded-2xl border border-outline-variant">
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">
                            <Droplet size={14} className="text-primary animate-pulse" />
                            <span>Consumo de Água Atual (L/dia)</span>
                          </div>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            value={formData.waterIntake}
                            onChange={(e) => setFormData({...formData, waterIntake: parseFloat(e.target.value) || 0})}
                            className="w-full bg-surface-container-high border border-outline-variant rounded-xl py-3 px-4 text-sm text-on-surface outline-none focus:border-primary transition-all font-bold"
                            placeholder="Ex: 1.5"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">
                            <FlameKindling size={14} className="text-primary" />
                            <span>Meta de Hidratação Calculada (L)</span>
                          </div>
                          <div className="relative">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              value={formData.waterTarget}
                              onChange={(e) => setFormData({...formData, waterTarget: parseFloat(e.target.value) || 0})}
                              className="w-full bg-surface-container-high border border-outline-variant rounded-xl py-3 px-4 text-sm text-on-surface outline-none focus:border-primary transition-all font-bold text-primary"
                              placeholder="Ex: 2.8"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase tracking-widest text-primary/80 bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
                              35 ml/kg
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">
                            <Moon size={14} className="text-indigo-400" />
                            <span>Qualidade do Sono</span>
                          </div>
                          <select
                            value={formData.sleepQuality}
                            onChange={(e) => setFormData({...formData, sleepQuality: e.target.value as any})}
                            className="w-full bg-surface-container-high border border-outline-variant rounded-xl py-3 px-4 text-sm text-on-surface outline-none focus:border-primary transition-all font-semibold appearance-none"
                          >
                            <option value="">Selecione...</option>
                            <option value="Excelente">Excelente (Acorda descansado/a)</option>
                            <option value="Boa">Boa (Qualidade satisfatória)</option>
                            <option value="Regular">Regular (Acorda cansado/a às vezes)</option>
                            <option value="Ruim">Ruim (Insônia / Sono intermitente)</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">
                            <HeartPulse size={14} className="text-emerald-500" />
                            <span>Funcionamento Intestinal</span>
                          </div>
                          <select
                            value={formData.bowelHabit}
                            onChange={(e) => setFormData({...formData, bowelHabit: e.target.value as any})}
                            className="w-full bg-surface-container-high border border-outline-variant rounded-xl py-3 px-4 text-sm text-on-surface outline-none focus:border-primary transition-all font-semibold appearance-none"
                          >
                            <option value="">Selecione...</option>
                            <option value="Regular">Regular (Diário)</option>
                            <option value="Constipado">Constipado (Ressecado / Pouco frequente)</option>
                            <option value="Diarreico">Diarreico (Solto)</option>
                            <option value="Irritável">Sintomas de Intolerância / Distensão</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">
                          <Dumbbell size={14} className="text-primary" />
                          <span>Prática de Exercícios Físicos</span>
                        </div>
                        <input
                          type="text"
                          value={formData.physicalActivity}
                          onChange={(e) => setFormData({...formData, physicalActivity: e.target.value})}
                          className="w-full bg-surface-container-high border border-outline-variant rounded-xl py-3 px-4 text-sm text-on-surface outline-none focus:border-primary transition-all font-medium"
                          placeholder="Ex: Musculação (4x por semana), Corrida aeróbica (2x por semana)..."
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 3: Food profiles */}
                  {activeTab === 'alimentar' && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-5"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">
                          <ThumbsUp size={14} className="text-emerald-400" />
                          <span>Preferências Alimentares (Gosta muito)</span>
                        </div>
                        <textarea
                          value={formData.preferredFoods}
                          onChange={(e) => setFormData({...formData, preferredFoods: e.target.value})}
                          className="w-full bg-surface-container-high border border-outline-variant rounded-xl py-3 px-4 text-sm text-on-surface outline-none focus:border-primary transition-all font-medium min-h-[70px]"
                          placeholder="Ex: Ovos, bananas, carne bovina, café preto, iogurte grego..."
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">
                          <ThumbsDown size={14} className="text-rose-400" />
                          <span>Aversões Alimentares (Não suporta / Não consome)</span>
                        </div>
                        <textarea
                          value={formData.dislikedFoods}
                          onChange={(e) => setFormData({...formData, dislikedFoods: e.target.value})}
                          className="w-full bg-surface-container-high border border-outline-variant rounded-xl py-3 px-4 text-sm text-on-surface outline-none focus:border-primary transition-all font-medium min-h-[70px]"
                          placeholder="Ex: Coentro, cebola crua, fígado, berinjela, leite puro..."
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">
                          <FileText size={14} className="text-slate-400" />
                          <span>Observações Gerais do Atendimento</span>
                        </div>
                        <textarea
                          value={formData.notes}
                          onChange={(e) => setFormData({...formData, notes: e.target.value})}
                          className="w-full bg-surface-container-high border border-outline-variant rounded-xl py-3 px-4 text-sm text-on-surface outline-none focus:border-primary transition-all font-medium min-h-[90px]"
                          placeholder="Ex: Paciente possui rotina de trabalho corrida, costuma beliscar à noite. Prefere planos de fácil preparo."
                        />
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              {!fetching && (
                <div className="flex items-center justify-end gap-3 pt-6 border-t border-outline-variant mt-6">
                  <button 
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-on-surface-variant hover:bg-surface-dim transition-all"
                  >
                    Fechar
                  </button>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="bg-primary text-on-primary px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                    ) : (
                      <Save size={14} />
                    )}
                    Salvar Dados
                  </button>
                </div>
              )}
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
