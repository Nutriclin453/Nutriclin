'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  Mail, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Edit, 
  Trash2 
} from 'lucide-react';
import { Patient, PatientService } from '@/lib/patient-service';
import { PatientModal } from '@/components/patient-modal';
import { useAuth } from '@/components/supabase-provider';
import { motion } from 'motion/react';
import { supabase } from '@/lib/supabase';
import { isMockEnabled, setForceMock } from '@/lib/mock-db';

export default function Pacientes() {
  const { user, loading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loadingPatientId, setLoadingPatientId] = useState<string | null>(null);

  const formatLastVisitDate = (lastVisit: any) => {
    if (!lastVisit) return 'Sem registro';
    try {
      if (typeof lastVisit.toDate === 'function') {
        return lastVisit.toDate().toLocaleDateString('pt-BR');
      }
      const d = new Date(lastVisit);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('pt-BR');
      }
    } catch (e) {
      console.error(e);
    }
    return 'Sem registro';
  };

  const syncLeadsToPatients = async (currentPatients: Patient[]) => {
    try {
      let leads: any[] = [];
      if (!isMockEnabled() && typeof window !== 'undefined') {
        const { data: fetchedLeads } = await supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false });
        if (fetchedLeads) leads = fetchedLeads;
      }
      
      if (leads.length === 0) {
        try {
          const item = localStorage.getItem('mock_leads');
          if (item) leads = JSON.parse(item);
        } catch (_) {}
      }

      if (!leads || leads.length === 0) return false;

      const patientEmails = new Set(currentPatients.map(p => p.email?.toLowerCase().trim()).filter(Boolean));
      const patientNames = new Set(currentPatients.map(p => p.name?.toLowerCase().trim()).filter(Boolean));
      let mutated = false;

      for (const lead of leads) {
        if (lead.name === '__NUTRITIONIST_SYSTEM_METADATA_DO_NOT_DELETE__') continue;

        const emailKey = lead.email?.toLowerCase().trim();
        const nameKey = lead.name?.toLowerCase().trim();

        if (emailKey && patientEmails.has(emailKey)) continue;
        if (nameKey && patientNames.has(nameKey)) continue;

        try {
          const leadAge = lead.age !== undefined && lead.age !== null ? lead.age : lead.idade;
          const parsedLeadAge = leadAge !== undefined && leadAge !== null && leadAge !== '' ? parseInt(leadAge.toString(), 10) : undefined;

          await PatientService.create({
            name: lead.name,
            email: lead.email || '',
            phone: lead.phone || lead.whatsapp || lead.telefone || '',
            goal: lead.goal || lead.objetivo || 'Saúde',
            status: 'Ativo',
            weight: lead.weight || lead.peso,
            height: lead.height || lead.altura,
            age: isNaN(parsedLeadAge as any) ? undefined : parsedLeadAge,
            idade: isNaN(parsedLeadAge as any) ? undefined : parsedLeadAge,
            gender: lead.gender || lead.genero || undefined,
            createdAt: lead.created_at || new Date().toISOString()
          } as any);
          mutated = true;
        } catch (err) {
          console.error(`Error auto-importing lead ${lead.name}:`, err);
        }
      }
      return mutated;
    } catch (e) {
      console.error('Error in leads sync:', e);
      return false;
    }
  };

  const isNewPatient = (patient: Patient) => {
    const dateStr = patient.createdAt || (patient as any).created_at;
    if (!dateStr) return false;
    const createdTime = new Date(dateStr).getTime();
    if (isNaN(createdTime)) return false;
    const now = new Date().getTime();
    const diffHours = (now - createdTime) / (1000 * 60 * 60);
    return diffHours >= 0 && diffHours < 24;
  };

  const fetchPatients = async (retryCount = 0) => {
    if (!user) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await PatientService.getAll();
      setPatients(data);
      
      const didSync = await syncLeadsToPatients(data);
      if (didSync) {
        const updatedData = await PatientService.getAll();
        setPatients(updatedData);
      }
    } catch (error: any) {
      console.error("Error fetching patients:", error);
      const msg = error?.message || String(error);
      if ((msg.includes('Failed to fetch') || msg.includes('fetch') || msg.includes('network') || msg.includes('TypeError')) && retryCount < 1) {
        setForceMock(true);
        setTimeout(() => {
          fetchPatients(retryCount + 1);
        }, 50);
        return;
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchPatients();
    }
  }, [user, authLoading]);

  const filteredPatients = patients.filter(p => 
    (p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    (p.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    (p.phone?.includes(searchTerm) || false)
  );

  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedPatient(null);
    setIsModalOpen(true);
  };

  return (
    <DashboardLayout>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-on-surface tracking-tight">Meus Pacientes</h1>
            <p className="text-on-surface-variant text-sm font-medium mt-1">Gerencie sua base de clientes e acompanhamentos.</p>
          </div>
          <button 
            onClick={handleCreate}
            className="bg-primary text-on-primary px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-primary/20"
          >
            <Plus size={18} />
            Cadastrar Paciente
          </button>
        </div>

        {errorMsg && (
          <div className="bg-error/20 border-l-4 border-error p-4 rounded-r-lg mb-6 shadow-md">
            <p className="text-error font-bold text-lg mb-1">Problema de conexão com Supabase</p>
            <p className="text-on-surface-variant text-sm mb-2">{errorMsg}</p>
            {errorMsg.includes('Failed to fetch') ? (
              <p className="text-on-surface text-sm font-medium">Atenção! Preencha as variáveis <strong>NEXT_PUBLIC_SUPABASE_URL</strong> e <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY</strong> clicando no botão "Environment Variables" (ou "Secrets") na barra de tarefas do AI Studio/Vercel e, após isso, atualize a página.</p>
            ) : (
              <p className="text-on-surface text-sm font-medium">Se as tabelas não existirem, vá ao painel do Supabase, clique em "SQL Editor", cole o código de <code className="bg-surface-dim px-1 rounded text-primary">supabase/migrations/20240518000000_init.sql</code> e execute.</p>
            )}
          </div>
        )}

        <div className="bg-surface-container border border-outline-variant rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-outline-variant flex flex-col md:flex-row gap-4 justify-between items-center bg-surface-dim/30">
            <div className="relative w-full max-w-md group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Nome, e-mail ou telefone..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-surface-container-high/50 border border-outline-variant rounded-xl py-2 pl-10 pr-4 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 border border-outline-variant rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all">
                <Filter size={18} />
              </button>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest px-2">Mostrando {filteredPatients.length} pacientes</p>
            </div>
          </div>

          <div className="overflow-x-auto min-h-[400px]">
            {authLoading || (loading && patients.length === 0) ? (
              <div className="flex flex-col items-center justify-center p-20 space-y-4">
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="text-sm font-bold text-on-surface-variant uppercase tracking-widest animate-pulse">Carregando pacientes...</p>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="p-12 text-center space-y-4">
                <div className="w-16 h-16 bg-surface-dim rounded-full flex items-center justify-center mx-auto text-on-surface-variant">
                  <Users size={32} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-on-surface">Nenhum paciente encontrado</h3>
                  <p className="text-sm text-on-surface-variant">Comece cadastrando seu primeiro paciente.</p>
                </div>
                <button 
                  onClick={handleCreate}
                  className="bg-primary/10 text-primary px-6 py-2 rounded-xl font-bold text-sm hover:bg-primary/20 transition-all"
                >
                  Cadastrar agora
                </button>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-surface-dim/50 text-[10px] font-black uppercase tracking-widest text-on-surface-variant border-b border-outline-variant">
                  <tr>
                    <th className="px-4 lg:px-8 py-4">Paciente</th>
                    <th className="px-8 py-4 hidden lg:table-cell">Contato</th>
                    <th className="px-8 py-4 hidden md:table-cell">Última Consulta</th>
                    <th className="px-8 py-4 hidden sm:table-cell">Objetivo</th>
                    <th className="px-8 py-4">Status</th>
                    <th className="px-4 lg:px-8 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-surface-container-high/30 transition-colors group">
                      <td className="px-4 lg:px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                            {patient.name.charAt(0)}
                          </div>
                          <div className="overflow-hidden">
                             <div className="flex items-center gap-2 flex-wrap min-w-0">
                               <p className="text-sm font-bold text-on-surface truncate pr-1">{patient.name}</p>
                               {isNewPatient(patient) && (
                                 <span className="px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest bg-[#00FF55]/15 text-[#00FF66] border border-[#00FF55]/30 rounded shrink-0 animate-pulse">
                                   Novo
                                 </span>
                                )}
                             </div>
                             <div className="flex flex-col gap-0.5 mt-0.5">
                               <p className="text-[10px] text-on-surface-variant font-medium uppercase">ID: {patient.id?.slice(-6)}</p>
                               <div className="md:hidden flex items-center gap-1.5 font-bold text-xs text-primary mt-1">
                                 <Calendar size={11} />
                                 <span>Consulta: {formatLastVisitDate(patient.lastVisit || (patient as any).last_visit)}</span>
                               </div>
                             </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 space-y-1 hidden lg:table-cell">
                        <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                          <Mail size={12} className="text-primary" />
                          <span className="truncate">{patient.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                          <Phone size={12} className="text-primary" />
                          <span>{patient.phone}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 hidden md:table-cell">
                        <div className="flex items-center gap-2 text-xs text-on-surface">
                          <Calendar size={14} className="text-on-surface-variant" />
                          <span className="font-medium">
                            {formatLastVisitDate(patient.lastVisit || (patient as any).last_visit)}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 hidden sm:table-cell">
                        <span className="px-3 py-1 bg-surface-dim border border-outline-variant rounded-full text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                          {patient.goal}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${patient.status === 'Ativo' ? 'text-primary' : 'text-on-surface-variant'}`}>
                          {patient.status === 'Ativo' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                          {patient.status}
                        </div>
                      </td>
                      <td className="px-4 lg:px-8 py-6 text-right flex items-center justify-end gap-1">
                        {deletingId === patient.id ? (
                          <div className="flex items-center gap-1.5 bg-error/10 p-1.5 rounded-xl border border-error/20" onClick={(e) => e.stopPropagation()}>
                            <span className="text-[9px] font-black text-error uppercase tracking-wider px-1">Excluir?</span>
                            <button
                              disabled={loadingPatientId === patient.id}
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (!patient.id) return;
                                setLoadingPatientId(patient.id);
                                try {
                                  // First delete any matching leads to prevent sync-back (best-effort)
                                  try {
                                    if (!isMockEnabled()) {
                                      if (patient.email) {
                                        await supabase
                                          .from('leads')
                                          .delete()
                                          .eq('email', patient.email);
                                      }
                                      if (patient.name) {
                                        await supabase
                                          .from('leads')
                                          .delete()
                                          .eq('name', patient.name);
                                      }
                                    } else {
                                      // Clean mock leads too
                                      try {
                                        const mockLeadsStr = localStorage.getItem('mock_leads');
                                        if (mockLeadsStr) {
                                          const mockLeads = JSON.parse(mockLeadsStr);
                                          const updatedLeads = mockLeads.filter((l: any) => 
                                            (!patient.email || l.email?.toLowerCase().trim() !== patient.email?.toLowerCase().trim()) && 
                                            (!patient.name || l.name?.toLowerCase().trim() !== patient.name?.toLowerCase().trim())
                                          );
                                          localStorage.setItem('mock_leads', JSON.stringify(updatedLeads));
                                        }
                                      } catch (_) {}
                                    }
                                  } catch (leadDelErr) {
                                    console.warn("Could not delete associated lead during patient deletion:", leadDelErr);
                                  }

                                  await PatientService.delete(patient.id);
                                  setDeletingId(null);
                                  await fetchPatients();
                                } catch (err) {
                                  console.error(err);
                                } finally {
                                  setLoadingPatientId(null);
                                }
                              }}
                              className="px-2 py-1 bg-error text-white text-[9px] font-black rounded-lg hover:brightness-110 transition-all uppercase disabled:opacity-50"
                            >
                              {loadingPatientId === patient.id ? "..." : "Sim"}
                            </button>
                            <button
                              disabled={loadingPatientId === patient.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingId(null);
                              }}
                              className="px-2 py-1 bg-surface-container-high border border-outline-variant text-[9px] font-black text-on-surface-variant rounded-lg hover:bg-surface-container transition-all uppercase disabled:opacity-50"
                            >
                              Não
                            </button>
                          </div>
                        ) : (
                          <>
                            <button 
                              onClick={() => handleEdit(patient)}
                              className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                              title="Editar Paciente"
                            >
                              <Edit size={18} />
                            </button>
                            
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingId(patient.id || null);
                              }}
                              className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-xl transition-all"
                              title="Excluir Paciente"
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </motion.div>

      <PatientModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        patient={selectedPatient}
        onSuccess={fetchPatients}
      />
    </DashboardLayout>
  );
}