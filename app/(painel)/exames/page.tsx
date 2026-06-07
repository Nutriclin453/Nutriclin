'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Plus, Trash2, Printer, Search, X, Upload, FileText, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { useAuth } from '@/components/supabase-provider';
import { Patient, PatientService } from '@/lib/patient-service';

export default function ExamesPage() {
  const { user, loading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [loadingPatients, setLoadingPatients] = useState(false);

  // Mock data for exams
  const [exams, setExams] = useState<any[]>([
    { id: '1', date: '2025-05-15', type: 'Hemograma Completo', notes: 'Colesterol levemente alto.' },
    { id: '2', date: '2025-06-10', type: 'Testosterona Total', notes: 'Dentro dos padrões.' }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newExam, setNewExam] = useState<any>({ 
    date: new Date().toISOString().split('T')[0], 
    type: '', 
    notes: '', 
    mode: 'manual', 
    aiText: '',
    file: null,
    fileName: '',
    mimeType: ''
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleSaveExam = () => {
    if (!newExam.type?.trim()) return;

    setExams([{
      id: Date.now().toString(),
      date: newExam.date,
      type: newExam.type,
      notes: newExam.notes
    }, ...exams]);

    setIsModalOpen(false);
    resetNewExam();
  };

  const resetNewExam = () => {
    setNewExam({ 
      date: new Date().toISOString().split('T')[0], 
      type: '', 
      notes: '', 
      mode: 'manual', 
      aiText: '',
      file: null,
      fileName: '',
      mimeType: ''
    });
    setAiError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result?.toString().split(',')[1];
      setNewExam((prev: any) => ({
        ...prev,
        file: base64,
        fileName: file.name,
        mimeType: file.type
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzeExam = async () => {
    if (!newExam.aiText?.trim() && !newExam.file) return;
    setIsAnalyzing(true);
    setAiError(null);
    
    try {
      const response = await fetch('/api/analyze-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: newExam.aiText,
          file: newExam.file,
          mimeType: newExam.mimeType
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Falha na análise da IA');
      }

      const data = await response.json();
      
      setNewExam((prev: any) => ({
        ...prev,
        mode: 'manual',
        type: data.type || '',
        date: data.date || prev.date,
        notes: `Importado via IA ✨\n${data.notes || ''}`,
        aiText: '',
        file: null,
        fileName: ''
      }));
      
    } catch (error: any) {
      console.error(error);
      const msg = error.message || '';
      if (msg.includes('403') || msg.includes('Permission')) {
        setAiError('Acesso Negado (403): Sua chave de API do Gemini no AI Studio pode não ter permissão para este modelo ou requer faturamento ativado.');
      } else if (msg.includes('429')) {
        setAiError('Limite de Cota (429): Você atingiu o limite de requisições da sua chave de API.');
      } else {
        setAiError(msg || 'Houve um erro inesperado com a Inteligência Artificial Gemini.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFallbackFill = () => {
    if (!newExam.aiText?.trim()) return;
    const text = newExam.aiText.toLowerCase();
    
    let guessedType = 'Exame Laboratorial';
    if (text.includes('hemograma') || text.includes('plaquetas') || text.includes('leucocit')) {
      guessedType = 'Hemograma Completo';
    } else if (text.includes('glicemia') || text.includes('glicose') || text.includes('hba1c')) {
      guessedType = 'Glicemia de Jejum / HbA1c';
    } else if (text.includes('colesterol') || text.includes('ldl') || text.includes('hdl') || text.includes('vldl')) {
      guessedType = 'Perfil Lipídico (Colesterol)';
    } else if (text.includes('trigliceri')) {
      guessedType = 'Dosagem de Triglicerídeos';
    } else if (text.includes('testosterona')) {
      guessedType = 'Testosterona Total e Livre';
    } else if (text.includes('vitamina')) {
      guessedType = 'Dosagem de Vitaminas';
    } else if (text.includes('tsh') || text.includes('t3') || text.includes('t4')) {
      guessedType = 'Hormônios da Tireoide (TSH/T4)';
    } else if (text.includes('creatinina') || text.includes('ureia')) {
      guessedType = 'Função Renal (Creatinina/Ureia)';
    }

    setNewExam((prev: any) => ({
      ...prev,
      mode: 'manual',
      type: guessedType,
      notes: `Importado via rascunho de texto local:\n\n${prev.aiText}`
    }));
    setAiError(null);
  };

  useEffect(() => {
    if (user && !authLoading) {
      fetchPatients();
    }
  }, [user, authLoading]);

  const fetchPatients = async () => {
    setLoadingPatients(true);
    try {
      const data = await PatientService.getAll();
      setPatients(data || []);
      if (data && data.length > 0) {
        setSelectedPatientId(data[0].id || '');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPatients(false);
    }
  };

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-40 max-w-lg mx-auto bg-surface-container items-center justify-center rounded-3xl mt-20 animate-pulse">
            <p className="text-on-surface-variant font-bold text-sm tracking-widest uppercase">Carregando...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8 print:hidden"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-on-surface">Acompanhamento de Exames</h1>
            <p className="text-on-surface-variant text-sm mt-1">Registre e acompanhe os exames laboratoriais do paciente.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.print()}
              disabled={!selectedPatientId}
              type="button"
              className="bg-surface-container-high border border-outline-variant text-on-surface px-6 py-3 rounded-xl font-bold hover:bg-surface-dim active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Printer size={20} className="text-on-surface-variant" />
              Imprimir Histórico
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              disabled={!selectedPatientId}
              className="bg-primary px-6 py-3 rounded-xl text-on-primary font-bold hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Plus size={20} />
              Novo Exame
            </button>
          </div>
        </div>

        <div className="bg-surface-container p-4 md:p-6 rounded-xl border border-outline-variant">
           <div className="space-y-2 max-w-sm">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider px-1">Selecione o Paciente</label>
            <select 
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full bg-surface-container-high border border-outline-variant rounded-lg p-3 text-on-surface focus:border-primary transition-all outline-none"
              disabled={loadingPatients}
            >
              <option value="">{loadingPatients ? 'Carregando...' : 'Selecione...'}</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {selectedPatientId ? (
          <div className="bg-surface-container border border-outline-variant rounded-3xl overflow-hidden shadow-xl">
             <div className="p-6 md:p-8 border-b border-outline-variant bg-surface-dim/20">
               <h3 className="text-xl font-black text-on-surface tracking-tight uppercase">Histórico de Exames</h3>
             </div>
             <div className="p-0">
               <table className="w-full text-left">
                  <thead className="bg-surface-dim/80 backdrop-blur-sm text-[10px] font-black uppercase tracking-widest text-on-surface-variant border-b border-outline-variant">
                    <tr>
                      <th className="px-8 py-4">Data</th>
                      <th className="px-8 py-4">Tipo de Exame</th>
                      <th className="px-8 py-4">Anotações</th>
                      <th className="px-8 py-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {exams.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-8 py-20 text-center text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                          Nenhum exame registrado para este paciente.
                        </td>
                      </tr>
                    ) : (
                      exams.map((exam) => (
                        <tr key={exam.id} className="hover:bg-primary/5 transition-all">
                          <td className="px-8 py-5 text-sm font-bold text-on-surface">{new Date(exam.date).toLocaleDateString('pt-BR')}</td>
                          <td className="px-8 py-5 text-sm font-black text-on-surface">{exam.type}</td>
                          <td className="px-8 py-5 text-sm text-on-surface-variant">{exam.notes}</td>
                          <td className="px-8 py-5 text-right flex items-center justify-end gap-2">
                            <button className="p-2 text-on-surface-variant hover:text-primary bg-surface-container-high border border-outline-variant rounded-lg transition-all hover:scale-105">
                              <Search size={16} />
                            </button>
                            <button className="p-2 text-on-surface-variant hover:text-error bg-surface-container-high border border-outline-variant rounded-lg transition-all hover:scale-105">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
               </table>
             </div>
          </div>
        ) : (
          <div className="flex h-40 max-w-lg mx-auto bg-surface-container border border-dashed border-outline-variant items-center justify-center rounded-3xl mt-20">
              <p className="text-on-surface-variant font-bold text-sm tracking-widest uppercase">Selecione um paciente acima</p>
          </div>
        )}
      </motion.div>

      {/* Modal for New Exam */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface-container rounded-3xl p-6 w-full max-w-lg border border-outline-variant shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between mb-6 shrink-0">
                <h3 className="text-xl font-bold text-on-surface">Novo Exame</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 bg-surface-container-high rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-dim transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {/* TABS */}
              <div className="flex gap-2 p-1 bg-surface-dim/40 rounded-xl mb-6 shrink-0 inline-flex mx-auto">
                <button
                  onClick={() => setNewExam((prev: any) => ({ ...prev, mode: 'manual' as const }))}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${(!newExam.mode || newExam.mode === 'manual') ? 'bg-surface-container-high text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                  Registro Manual
                </button>
                <button
                  onClick={() => setNewExam((prev: any) => ({ ...prev, mode: 'ai' as const }))}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${(newExam.mode === 'ai') ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                  ✨ Analisar com IA
                </button>
              </div>

              <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
                {newExam.mode === 'ai' ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 font-medium leading-relaxed">
                      Importe o arquivo do exame (PDF ou Imagem) ou cole o texto do laudo. A IA irá identificar o tipo de exame, as datas e transcrever os resultados.
                    </div>

                    {aiError && (
                      <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-2xl text-xs space-y-3">
                        <div className="flex items-center gap-2 text-red-400 font-bold">
                          <span>⚠️ Erro na IA</span>
                        </div>
                        <p className="text-on-surface-variant leading-relaxed font-medium text-[11px]">
                          {aiError}
                        </p>
                        <div className="pt-2 border-t border-outline-variant/30 flex flex-wrap gap-2">
                          <button
                            onClick={() => setNewExam((prev: any) => ({ ...prev, mode: 'manual' }))}
                            className="px-3 py-1.5 bg-surface-container-high hover:bg-surface-dim hover:text-on-surface text-[10px] text-on-surface-variant font-bold rounded-lg uppercase tracking-wider transition-all"
                          >
                            Preenchimento Manual
                          </button>
                          {newExam.aiText?.trim() && (
                            <button
                              onClick={handleFallbackFill}
                              className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all"
                            >
                              💡 Extrair Texto Localmente
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider px-1">Upload do Arquivo</label>
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".pdf,image/*"
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-emerald-500/30 bg-emerald-500/5 rounded-2xl hover:bg-emerald-500/10 hover:border-emerald-500/50 transition-all group shrink-0"
                      >
                        {newExam.fileName ? (
                          <div className="flex flex-col items-center gap-2">
                             <FileText className="text-emerald-400" size={32} />
                             <span className="text-sm font-bold text-on-surface truncate max-w-[200px]">{newExam.fileName}</span>
                             <span className="text-[10px] text-emerald-400/60 uppercase font-black tracking-tighter">Clique para trocar</span>
                          </div>
                        ) : (
                          <>
                            <Upload className="text-on-surface-variant group-hover:text-emerald-400 group-hover:scale-110 transition-all mb-3" size={32} />
                            <span className="text-sm font-bold text-on-surface">Clique para selecionar PDF ou Foto</span>
                            <span className="text-[10px] text-on-surface-variant uppercase font-black tracking-tighter">Suporta PDF, JPG, PNG</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="relative pt-2 pb-2">
                      <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-outline-variant"></div>
                      </div>
                      <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
                        <span className="bg-surface-container px-4 text-on-surface-variant font-bold">Ou cole o texto</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider px-1">Texto do Exame</label>
                      <textarea
                        placeholder="Cole aqui os dados do laudo laboratorial..."
                        value={newExam.aiText || ''}
                        onChange={(e) => setNewExam({ ...newExam, aiText: e.target.value })}
                        rows={5}
                        className="w-full mt-1 bg-surface-container-high border border-outline-variant rounded-xl p-3 text-on-surface focus:border-primary transition-all outline-none resize-none font-mono text-sm leading-relaxed"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider px-1">Data do Exame</label>
                      <input
                        type="date"
                        value={newExam.date}
                        onChange={(e) => setNewExam({ ...newExam, date: e.target.value })}
                        className="w-full mt-1 bg-surface-container-high border border-outline-variant rounded-xl p-3 text-on-surface focus:border-primary transition-all outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider px-1">Tipo de Exame</label>
                      <input
                        type="text"
                        placeholder="Ex: Hemograma, Glicemia..."
                        value={newExam.type}
                        onChange={(e) => setNewExam({ ...newExam, type: e.target.value })}
                        className="w-full mt-1 bg-surface-container-high border border-outline-variant rounded-xl p-3 text-on-surface focus:border-primary transition-all outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider px-1">Anotações (Opcional)</label>
                      <textarea
                        placeholder="Observações sobre o resultado..."
                        value={newExam.notes}
                        onChange={(e) => setNewExam({ ...newExam, notes: e.target.value })}
                        rows={4}
                        className="w-full mt-1 bg-surface-container-high border border-outline-variant rounded-xl p-3 text-on-surface focus:border-primary transition-all outline-none resize-none"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 mt-8 shrink-0">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 rounded-xl font-bold text-on-surface-variant hover:text-on-surface transition-all"
                >
                  Cancelar
                </button>
                {newExam.mode === 'ai' ? (
                  <button
                    onClick={handleAnalyzeExam}
                    disabled={(!newExam.aiText?.trim() && !newExam.file) || isAnalyzing}
                    className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-6 py-3 rounded-xl font-bold hover:bg-emerald-500/30 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-emerald-400/30 border-t-emerald-400 animate-spin" />
                        Analisando...
                      </>
                    ) : (
                      <>✨ Analisar Métrica</>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleSaveExam}
                    disabled={!newExam.type?.trim()}
                    className="bg-primary px-6 py-3 rounded-xl text-on-primary font-bold hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Salvar Exame
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
