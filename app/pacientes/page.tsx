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

export default function Pacientes() {
  const { user, loading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const fetchPatients = async () => {
    if (!user) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await PatientService.getAll();
      setPatients(data);
    } catch (error: any) {
      console.error("Error fetching patients:", error);
      setErrorMsg(error?.message || String(error));
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
                             <p className="text-sm font-bold text-on-surface truncate">{patient.name}</p>
                             <p className="text-[10px] text-on-surface-variant font-medium uppercase">ID: {patient.id?.slice(-6)}</p>
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
                            {patient.lastVisit ? patient.lastVisit.toDate().toLocaleDateString('pt-BR') : 'Sem registro'}
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
                        <button 
                          onClick={() => handleEdit(patient)}
                          className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                          title="Editar Paciente"
                        >
                          <Edit size={18} />
                        </button>
                        
                        <button 
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (confirm(`Deseja realmente excluir o paciente ${patient.name} e todo o seu histórico de consultas?`)) {
                              try {
                                await PatientService.delete(patient.id);
                                fetchPatients();
                              } catch (err) {
                                alert('Erro ao excluir o paciente.');
                                console.error(err);
                              }
                            }
                          }}
                          className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-xl transition-all"
                          title="Excluir Paciente"
                        >
                          <Trash2 size={18} />
                        </button>
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