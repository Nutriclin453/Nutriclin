'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, User, Mail, Phone, Target, Trash2, Calendar } from 'lucide-react';
import { Patient, PatientService } from '@/lib/patient-service';

interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient?: Patient | null;
  onSuccess: () => void;
}

export function PatientModal({ isOpen, onClose, patient, onSuccess }: PatientModalProps) {
  const [formData, setFormData] = useState<Partial<Patient>>({
    name: '',
    email: '',
    phone: '',
    goal: '',
    status: 'Ativo'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (patient) {
      let dateValue = '';
      const lv = patient.lastVisit || (patient as any).last_visit;
      if (lv) {
        try {
          let d: Date;
          if (typeof lv.toDate === 'function') {
            d = lv.toDate();
          } else {
            d = new Date(lv);
          }
          if (!isNaN(d.getTime())) {
            dateValue = d.toISOString().split('T')[0];
          }
        } catch (_) {}
      }
      setFormData({
        ...patient,
        lastVisit: dateValue
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        goal: '',
        status: 'Ativo',
        lastVisit: ''
      });
    }
    setError(null);
    setConfirmDelete(false);
  }, [patient, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Clean data to send only required fields
    const cleanData = {
      name: formData.name || '',
      email: formData.email || '',
      phone: formData.phone || '',
      goal: formData.goal || '',
      status: formData.status || 'Ativo',
      birthDate: formData.birthDate || null,
      gender: formData.gender || null,
      lastVisit: formData.lastVisit ? new Date(formData.lastVisit).toISOString() : null
    };

    try {
      if (patient?.id) {
        await PatientService.update(patient.id, cleanData);
      } else {
        await PatientService.create(cleanData as any);
      }
      await onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error saving patient:", err);
      let errorMessage = "Erro ao salvar paciente. Verifique os dados.";
      try {
        const firestoreError = JSON.parse(err.message);
        errorMessage = `Erro de permissão: ${firestoreError.error}`;
      } catch {
        errorMessage = err.message || errorMessage;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInstant = async () => {
    if (!patient?.id) return;
    
    setLoading(true);
    setError(null);
    try {
      await PatientService.delete(patient.id);
      await onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error deleting patient:", err);
      let errorMessage = "Erro ao excluir paciente.";
      try {
        const firestoreError = JSON.parse(err.message);
        errorMessage = `Erro de permissão: ${firestoreError.error}`;
      } catch {
        errorMessage = err.message || errorMessage;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
      setConfirmDelete(false);
    }
  };

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
            className="relative w-full max-w-xl bg-surface-container border border-outline-variant rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-outline-variant flex items-center justify-between bg-surface-dim/30">
              <h2 className="text-xl font-bold text-on-surface">
                {patient ? 'Editar Paciente' : 'Cadastrar Paciente'}
              </h2>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-surface-container-high rounded-full transition-colors text-on-surface-variant"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {error && (
                <div className="p-4 bg-error/10 border border-error/20 rounded-xl text-error text-xs font-bold">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 col-span-1 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Nome Completo</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" size={18} />
                    <input 
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-surface-container-high border border-outline-variant rounded-xl py-3 pl-10 pr-4 text-on-surface outline-none focus:border-primary transition-all font-medium"
                      placeholder="Ex: João Silva"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">E-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" size={18} />
                    <input 
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-surface-container-high border border-outline-variant rounded-xl py-3 pl-10 pr-4 text-on-surface outline-none focus:border-primary transition-all font-medium"
                      placeholder="joao@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Telefone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" size={18} />
                    <input 
                      required
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-surface-container-high border border-outline-variant rounded-xl py-3 pl-10 pr-4 text-on-surface outline-none focus:border-primary transition-all font-medium"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Objetivo</label>
                  <div className="relative">
                    <Target className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" size={18} />
                    <select 
                      required
                      value={formData.goal}
                      onChange={(e) => setFormData({...formData, goal: e.target.value})}
                      className="w-full bg-surface-container-high border border-outline-variant rounded-xl py-3 pl-10 pr-4 text-on-surface outline-none focus:border-primary transition-all font-medium appearance-none"
                    >
                      <option value="">Selecione...</option>
                      <option value="Hipertrofia">Hipertrofia</option>
                      <option value="Emagrecimento">Emagrecimento</option>
                      <option value="Performance">Performance</option>
                      <option value="Saúde">Saúde</option>
                      <option value="Manutenção">Manutenção</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1 font-sans">Status</label>
                   <div className="flex gap-4">
                     {['Ativo', 'Inativo'].map(s => (
                       <button
                         key={s}
                         type="button"
                         onClick={() => setFormData({...formData, status: s as any})}
                         className={`flex-1 py-3 rounded-xl border font-bold text-xs transition-all ${
                           formData.status === s 
                           ? 'bg-primary/10 border-primary text-primary' 
                           : 'bg-surface-container-high border-outline-variant text-on-surface-variant hover:border-primary/50'
                         }`}
                       >
                         {s}
                       </button>
                     ))}
                   </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1 font-sans">Última Consulta</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" size={18} />
                    <input 
                      type="date"
                      value={formData.lastVisit || ''}
                      onChange={(e) => setFormData({...formData, lastVisit: e.target.value})}
                      className="w-full bg-surface-container-high border border-outline-variant rounded-xl py-3 pl-10 pr-4 text-on-surface outline-none focus:border-primary transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 pt-6">
                {confirmDelete ? (
                  <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-error/10 p-4 rounded-2xl border border-error/20">
                    <span className="text-xs font-bold text-error">Tem certeza de que deseja excluir este paciente permanentemente?</span>
                    <div className="flex gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(false)}
                        className="px-4 py-2 text-xs font-bold bg-surface-container-high hover:bg-surface-container rounded-xl border border-outline-variant text-on-surface-variant transition-colors"
                      >
                        Não, Voltar
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteInstant}
                        disabled={loading}
                        className="px-4 py-2 text-xs font-bold bg-error text-white hover:brightness-110 rounded-xl transition-all disabled:opacity-50 flex items-center gap-1"
                      >
                        {loading ? (
                          <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Trash2 size={12} />
                        )}
                        Sim, Excluir
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {patient && (
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(true)}
                        className="p-3 bg-error/10 text-error border border-error/20 rounded-xl hover:bg-error/20 transition-all disabled:opacity-50"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                    <div className="flex gap-3 flex-1 justify-end">
                      <button 
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl font-bold text-on-surface-variant hover:bg-surface-dim transition-all"
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit"
                        disabled={loading}
                        className="bg-primary text-on-primary px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                      >
                        {loading ? (
                          <div className="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                        ) : (
                          <Save size={18} />
                        )}
                        {patient ? 'Salvar Alterações' : 'Confirmar Cadastro'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
