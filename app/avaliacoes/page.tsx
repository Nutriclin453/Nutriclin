'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Save, 
  RefreshCw, 
  Scale, 
  Activity, 
  Info,
  Trash2,
  Loader2,
  TrendingUp,
  Edit
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  TooltipProps
} from 'recharts';
import { EvaluationService, Skinfolds, Evaluation } from '@/lib/evaluation-service';
import { Patient, PatientService } from '@/lib/patient-service';
import { useAuth } from '@/components/supabase-provider';
import { DashboardLayout } from '@/components/dashboard-layout';

const MOTIVATION_IMAGE = "https://lh3.googleusercontent.com/aida-public/AB6AXuDlLkbKAEgfjjKKsfGrf4TsLRIKnNSZgRCz1jdY3kztNZUeJevwzkrHVGqZVDF1d3fYcPZZZPZblmdeskGjD4LQmLX2rZOIdZaUsNBt0FzFfXFdbTOj6IUe4qB95WrwNXJrv-X_QBSyEFrkRh8dH0kBY5edhaTTtCOA7R0qWVojNlhDSTiVxPKAK1ivsmHAa4D3nPoYZvuOuWAVSfuSCV4xcBO3fKgUjq6JMtwMH_eDT8yePdHYDogpUaCb-mR2MsSkK2phWXmT6457";

export default function Avaliacoes() {
  const { user, loading: authLoading } = useAuth();
  
  // Form State
  const [patientName, setPatientName] = useState('');
  const [weight, setWeight] = useState<number | ''>('');
  const [height, setHeight] = useState<number | ''>('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [objective, setObjective] = useState('');
  const [waist, setWaist] = useState<number | ''>('');
  const [abdominal, setAbdominal] = useState<number | ''>('');
  const [neck, setNeck] = useState<number | ''>('');
  const [attendanceNote, setAttendanceNote] = useState('');
  
  const [folds, setFolds] = useState<Skinfolds>({});
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toLocaleDateString('en-CA'));

  // UI State
  const [loading, setLoading] = useState(false);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [selectedComparisons, setSelectedComparisons] = useState<Evaluation[]>([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Derived Values (BMI & TDEE)
  const bmiValue = (() => {
    if (weight && height) {
      const heightM = Number(height) / 100;
      return (Number(weight) / (heightM * heightM)).toFixed(1);
    }
    return '--.-';
  })();

  const tdeeValue = (() => {
    if (weight && height && age) {
      let bmr;
      if (gender === 'male') {
        bmr = (10 * Number(weight)) + (6.25 * Number(height)) - (5 * Number(age)) + 5;
      } else {
        bmr = (10 * Number(weight)) + (6.25 * Number(height)) - (5 * Number(age)) - 161;
      }
      return Math.round(bmr * 1.375).toLocaleString(); // Sedentário/Levemente ativo
    }
    return '----';
  })();

  const bodyFatValue = (() => {
    const { tricipital, subescapular, subaxilar, peitoral, abdomen, suprailiaca, coxa } = folds;
    if (tricipital && subescapular && subaxilar && peitoral && abdomen && suprailiaca && coxa && age) {
      const sum7 = tricipital + subescapular + subaxilar + peitoral + abdomen + suprailiaca + coxa;
      let density;
      if (gender === 'male') {
        density = 1.112 - (0.00043499 * sum7) + (0.00000055 * sum7 * sum7) - (0.00028826 * Number(age));
      } else {
        density = 1.097 - (0.00046971 * sum7) + (0.00000056 * sum7 * sum7) - (0.00012828 * Number(age));
      }
      const bf = ((4.95 / density) - 4.50) * 100;
      return bf.toFixed(1);
    }
    return '--.-';
  })();

  const fetchEvaluations = async () => {
    setFetchLoading(true);
    setErrorMsg('');
    try {
      const data = await EvaluationService.getAll();
      setEvaluations(data || []);
    } catch (error: any) {
      console.error(error);
      const msg = error?.message || String(error);
      if (!msg.toLowerCase().includes('failed to fetch')) {
        setErrorMsg(msg);
      }
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchPatients = async () => {
    setLoadingPatients(true);
    try {
      const data = await PatientService.getAll();
      setPatients(data || []);
    } catch (error: any) {
      console.error("Error fetching patients:", error);
      const msg = error?.message || String(error);
      if (!msg.toLowerCase().includes('failed to fetch')) {
        setErrorMsg(msg);
      }
    } finally {
      setLoadingPatients(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchEvaluations();
      fetchPatients();
    }
  }, [user]);

  const handleSave = async () => {
    if (!weight || !height) {
      alert('Por favor, insira peso e altura.');
      return;
    }
    
    try {
      setLoading(true);
      // Gerar PDF localmente usando html2pdf
      const element = document.getElementById('evaluation-form');
      if (element) {
        try {
          // O import dinâmico evita erros no SSR (Server Side Rendering) do Next.js
          const html2pdf = (await import('html2pdf.js')).default;
          const opt = {
            margin:       [15, 15, 15, 15] as [number, number, number, number],
            filename:     `avaliacao_${patientName || 'paciente'}.pdf`,
            image:        { type: 'jpeg' as const, quality: 1 },
            pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] },
            html2canvas:  { scale: 2, useCORS: true, letterRendering: true, windowWidth: 1200, logging: false },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
          };
          await html2pdf().set(opt).from(element).save();
        } catch (pdfErr) {
          console.error('PDF Generation Error:', pdfErr);
          // Don't block the save if only PDF fails, but notify user
          alert('Aviso: O PDF não pôde ser gerado, mas os dados serão salvos no banco.');
        }
      }

      const evaluationData = {
        patientName,
        gender,
        weight: Number(weight),
        height: Number(height),
        age: age ? Number(age) : undefined,
        objective,
        waist: waist ? Number(waist) : undefined,
        abdominal: abdominal ? Number(abdominal) : undefined,
        neck: neck ? Number(neck) : undefined,
        skinfolds: folds,
        bmi: Number(bmiValue),
        bodyFat: bodyFatValue !== '--.-' ? Number(bodyFatValue) : undefined,
        tdee: Number(tdeeValue.replace(/\./g, '')),
        attendanceNote,
        createdAt: selectedDate
      };
      
      await EvaluationService.create(evaluationData);
      
      // Clear form
      setWeight('');
      setHeight('');
      setAge('');
      setObjective('');
      setWaist('');
      setAbdominal('');
      setNeck('');
      setFolds({});
      setAttendanceNote('');
      setSelectedComparisons([]);
      
      alert('Avaliação salva com sucesso!');
      await fetchEvaluations();
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar avaliação.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearForm = () => {
    setWeight('');
    setHeight('');
    setAge('');
    setObjective('');
    setWaist('');
    setAbdominal('');
    setNeck('');
    setFolds({});
    setAttendanceNote('');
    setSelectedComparisons([]);
    setSelectedDate(new Date().toLocaleDateString('en-CA'));
  };

  const handleLoadEvaluation = (ev: Evaluation) => {
    setPatientName(ev.patientName || '');
    setGender(ev.gender || 'male');
    setWeight(ev.weight || '');
    setHeight(ev.height || '');
    setAge(ev.age || '');
    setObjective(ev.objective || '');
    setWaist(ev.waist || '');
    setAbdominal(ev.abdominal || '');
    setNeck(ev.neck || '');
    setFolds(ev.skinfolds || {});
    setAttendanceNote(ev.attendanceNote || '');
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    if (!confirm('Deseja excluir esta avaliação?')) return;
    
    try {
      await EvaluationService.delete(id);
      setEvaluations(prev => prev.filter(ev => ev.id !== id));
      fetchEvaluations();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSelect = (ev: Evaluation) => {
    let next = [...selectedComparisons];
    const exists = next.findIndex(e => e.id === ev.id);
    if (exists !== -1) {
      next.splice(exists, 1);
    } else {
      if (next.length >= 2) next = [next[1], ev];
      else next.push(ev);
    }
    setSelectedComparisons(next);
    handleLoadEvaluation(ev);
  };

  const tableEvaluations = React.useMemo(() => {
    if (!patientName) return [];
    return evaluations
      .filter(ev => ev.patientName === patientName)
      .sort((a, b) => {
        const dateA = new Date(a.createdAt?.toDate?.() || a.createdAt).getTime();
        const dateB = new Date(b.createdAt?.toDate?.() || b.createdAt).getTime();
        return dateB - dateA;
      });
  }, [evaluations, patientName]);

  // Derived data for chart
  const patientEvaluations = React.useMemo(() => {
    if (selectedComparisons.length === 2) {
      return [...selectedComparisons].sort((a, b) => {
        const dateA = new Date(a.createdAt?.toDate?.() || a.createdAt).getTime();
        const dateB = new Date(b.createdAt?.toDate?.() || b.createdAt).getTime();
        return dateA - dateB;
      });
    }
    
    return evaluations
      .filter(ev => ev.patientName === patientName && patientName !== '')
      .sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() ? a.createdAt.toDate().getTime() : 0;
        const dateB = b.createdAt?.toDate?.() ? b.createdAt.toDate().getTime() : 0;
        return dateA - dateB;
      });
  }, [evaluations, patientName, selectedComparisons]);

  const chartData = patientEvaluations.map(ev => {
    const dateLabel = ev.createdAt?.toDate?.() 
      ? (() => {
          const d = ev.createdAt.toDate();
          const day = d.getDate().toString().padStart(2, '0');
          const month = d.toLocaleDateString('pt-BR', { month: 'short' }).slice(0, 3);
          const formattedMonth = month.charAt(0).toUpperCase() + month.slice(1);
          return `${day}/${formattedMonth}`;
        })()
      : 'Nov';
    return {
      date: dateLabel,
      peso: ev.weight,
      bf: ev.bodyFat !== undefined && ev.bodyFat !== null ? Number(Number(ev.bodyFat).toFixed(1)) : 0,
      fullDate: ev.createdAt?.toDate?.() ? ev.createdAt.toDate().toLocaleDateString('pt-BR') : ''
    };
  });

  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface-dim border border-outline-variant p-4 rounded-xl shadow-2xl backdrop-blur-md">
          <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-2 border-b border-outline-variant pb-1">
            {label} | Extrato
          </p>
          <div className="space-y-1">
            {payload.map((entry, index) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: entry.color }}>
                  {entry.name}
                </span>
                <span className="text-sm font-black text-on-surface">
                  {entry.value}{entry.name === 'Peso' ? 'kg' : '%'}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const handleFoldChange = (field: keyof Skinfolds, value: string) => {
    setFolds(prev => ({
      ...prev,
      [field]: value === '' ? undefined : Number(value)
    }));
  };

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <Loader2 className="animate-spin text-primary" size={48} />
          <p className="text-sm font-bold text-on-surface-variant uppercase tracking-widest animate-pulse">Sincronizando avaliações...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-on-surface">Formulário de Avaliação Nutricional</h1>
                <p className="text-on-surface-variant text-sm mt-1">Registre uma nova sessão antropométrica e de composição corporal.</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleClearForm}
                  type="button"
                  className="bg-surface-container-high border border-outline-variant text-on-surface px-6 py-3 rounded-xl font-bold hover:bg-surface-dim active:scale-95 transition-all flex items-center gap-2"
                >
                  <RefreshCw size={20} className="text-on-surface-variant" />
                  Limpar Campos
                </button>
                <button 
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-primary px-6 py-3 rounded-xl text-on-primary font-bold hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                  Salvar Avaliação
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="bg-error/20 border-l-4 border-error p-4 rounded-r-lg shadow-md mb-6">
                <p className="text-error font-bold text-lg mb-1">Problema de conexão com Supabase</p>
                <p className="text-on-surface-variant text-sm mb-2">{errorMsg}</p>
                {errorMsg.includes('Failed to fetch') ? (
                  <p className="text-on-surface text-sm font-medium">Atenção! Preencha as variáveis <strong>NEXT_PUBLIC_SUPABASE_URL</strong> e <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY</strong> clicando no botão "Environment Variables" (ou "Secrets") na barra de tarefas do AI Studio/Vercel e, após isso, atualize a página.</p>
                ) : (
                  <p className="text-on-surface text-sm font-medium">Se as tabelas não existirem, vá ao painel do Supabase, clique em "SQL Editor", cole o código de <code className="bg-surface-dim px-1 rounded text-primary">supabase/migrations/20240518000000_init.sql</code> e execute.</p>
                )}
              </div>
            )}

            <div id="evaluation-form" className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-8 space-y-8">
                <div className="bg-surface-container p-4 md:p-6 rounded-xl border border-outline-variant grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                   <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider px-1">Seleção do Paciente</label>
                    <select 
                      value={patientName}
                      onChange={(e) => {
                        setPatientName(e.target.value);
                        handleClearForm();
                      }}
                      className="w-full bg-surface-container-high border border-outline-variant rounded-lg p-3 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none disabled:opacity-50"
                      disabled={loadingPatients}
                    >
                      <option value="">{loadingPatients ? 'Carregando pacientes...' : 'Selecione um paciente...'}</option>
                      {patients.map(p => (
                        <option key={p.id} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider px-1">Gênero</label>
                    <div className="flex bg-surface-container-high p-1 rounded-lg border border-outline-variant">
                      <button 
                        onClick={() => setGender('male')}
                        className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${gender === 'male' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'}`}
                      >
                        Masculino
                      </button>
                      <button 
                        onClick={() => setGender('female')}
                        className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${gender === 'female' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'}`}
                      >
                        Feminino
                      </button>
                    </div>
                  </div>
                  <div className="col-span-full space-y-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider px-1">Objetivo</label>
                    <select 
                      value={objective}
                      onChange={(e) => setObjective(e.target.value)}
                      className="w-full bg-surface-container-high border border-outline-variant rounded-lg p-3 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none" 
                    >
                      <option value="">Selecione um objetivo...</option>
                      <option value="Hipertrofia">Hipertrofia</option>
                      <option value="Emagrecimento">Emagrecimento</option>
                      <option value="Perda de Gordura (Cutting)">Perda de Gordura (Cutting)</option>
                      <option value="Recomposição Corporal">Recomposição Corporal</option>
                      <option value="Performance Esportiva">Performance Esportiva</option>
                      <option value="Saúde e Bem-estar (Manutenção)">Saúde e Bem-estar (Manutenção)</option>
                      <option value="Ganho de Peso (Bulking)">Ganho de Peso (Bulking)</option>
                      {objective && !["", "Hipertrofia", "Emagrecimento", "Perda de Gordura (Cutting)", "Recomposição Corporal", "Performance Esportiva", "Saúde e Bem-estar (Manutenção)", "Ganho de Peso (Bulking)"].includes(objective) && (
                        <option value={objective}>{objective}</option>
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider px-1">Peso (kg)</label>
                    <input 
                      value={weight}
                      onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-surface-container-high border border-outline-variant rounded-lg p-3 text-on-surface outline-none focus:border-primary transition-all font-bold text-primary" 
                      placeholder="0.0" type="number" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider px-1">Altura (cm)</label>
                    <input 
                      value={height}
                      onChange={(e) => setHeight(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-surface-container-high border border-outline-variant rounded-lg p-3 text-on-surface outline-none focus:border-primary transition-all" 
                      placeholder="0" type="number" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider px-1">Idade</label>
                    <input 
                      value={age}
                      onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-surface-container-high border border-outline-variant rounded-lg p-3 text-on-surface outline-none focus:border-primary transition-all" 
                      placeholder="0" type="number" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider px-1">Data</label>
                    <input 
                      className="w-full bg-surface-container-high border border-outline-variant rounded-lg p-3 text-on-surface outline-none focus:border-primary transition-all" 
                      type="date" 
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="bg-surface-container p-4 md:p-6 rounded-xl border border-outline-variant space-y-4 md:space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h3 className="text-sm font-black text-on-surface uppercase tracking-widest">Perímetros (cm)</h3>
                    <div className="hidden sm:block h-px flex-1 bg-outline-variant mx-4" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider px-1">Cintura (cm)</label>
                      <input 
                        value={waist}
                        onChange={(e) => setWaist(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-surface-container-high border border-outline-variant rounded-lg p-3 text-on-surface outline-none focus:border-primary transition-all" 
                        placeholder="0.0" type="number" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider px-1">Abdominal (cm)</label>
                      <input 
                        value={abdominal}
                        onChange={(e) => setAbdominal(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-surface-container-high border border-outline-variant rounded-lg p-3 text-on-surface outline-none focus:border-primary transition-all" 
                        placeholder="0.0" type="number" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider px-1">Pescoço (cm)</label>
                      <input 
                        value={neck}
                        onChange={(e) => setNeck(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-surface-container-high border border-outline-variant rounded-lg p-3 text-on-surface outline-none focus:border-primary transition-all" 
                        placeholder="0.0" type="number" 
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-surface-container p-4 md:p-6 rounded-xl border border-outline-variant space-y-4 md:space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h3 className="text-sm font-black text-on-surface uppercase tracking-widest">Dobras Cutâneas (mm)</h3>
                    <span className="bg-[#4edea31a] text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-[#4edea333] self-start sm:self-auto">Adipômetro Ativo</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {[
                      { label: 'Tricipital', key: 'tricipital' },
                      { label: 'Subescapular', key: 'subescapular' },
                      { label: 'Subaxilar', key: 'subaxilar' },
                      { label: 'Peitoral', key: 'peitoral' },
                      { label: 'Abdômen', key: 'abdomen' },
                      { label: 'Suprailíaca', key: 'suprailiaca' },
                      { label: 'Coxa', key: 'coxa' }
                    ].map((fold) => (
                      <div key={fold.key} className="space-y-2">
                        <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider px-1">{fold.label}</label>
                        <input 
                          value={folds[fold.key as keyof Skinfolds] || ''}
                          onChange={(e) => handleFoldChange(fold.key as keyof Skinfolds, e.target.value)}
                          className="w-full bg-surface-container-high border border-outline-variant rounded-lg p-3 text-on-surface outline-none focus:border-primary transition-all" 
                          placeholder="0.0" 
                          type="number" 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="md:col-span-4 space-y-8">
                <div className="sticky top-24 space-y-8">
                  <div className="bg-surface-container p-8 rounded-3xl border border-outline-variant relative overflow-hidden group shadow-2xl">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform group-hover:opacity-20">
                      <Scale size={120} />
                    </div>
                    
                    <div className="space-y-8 relative z-10">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">Resultado IMC</span>
                        </div>
                        <span className="text-3xl font-black text-primary group-hover:scale-110 transition-transform">{bmiValue}</span>
                      </div>

                      <div className="bg-surface-dim p-6 rounded-2xl border border-outline-variant space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">Estimativa de BF</span>
                          <Activity size={16} className="text-primary" />
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-black text-on-surface">{bodyFatValue}</span>
                          <span className="text-sm font-bold text-on-surface-variant">%</span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">Gasto Calórico (TDEE)</span>
                        </div>
                        <div className="text-right">
                          <span className="text-3xl font-black text-primary block">{tdeeValue}</span>
                          <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest">kcal/dia</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface-container border border-outline-variant p-6 rounded-3xl relative overflow-hidden group">
                    <img 
                      src={MOTIVATION_IMAGE} 
                      className="absolute inset-0 w-full h-full object-cover opacity-20 filter grayscale group-hover:scale-110 transition-transform duration-700" 
                      alt="" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-[#171f33cc] to-transparent" />
                    <div className="relative z-10 space-y-4">
                      <div className="p-2 bg-[#4edea333] w-fit rounded-lg">
                        <Info size={16} className="text-primary" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-on-surface uppercase tracking-widest">Nota do Atendimento</h4>
                        <textarea 
                          value={attendanceNote}
                          onChange={(e) => setAttendanceNote(e.target.value)}
                          className="w-full bg-transparent border-none p-0 text-sm text-on-surface-variant h-32 resize-none focus:ring-0 mt-2 font-medium" 
                          placeholder="Digite aqui as observações desta sessão..." 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Evolution Grid - History and Chart */}
            <div data-html2canvas-ignore="true" className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12 pb-20">
              {/* History Table Column */}
              <div className="bg-surface-container rounded-3xl border border-outline-variant overflow-hidden shadow-xl flex flex-col">
                <div className="p-6 md:p-8 border-b border-outline-variant flex justify-between items-center bg-surface-container-high/20">
                  <div>
                    <h3 className="text-xl font-black text-on-surface tracking-tight uppercase">Histórico Recente</h3>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] mt-1">Sessões Anteriores</p>
                  </div>
                  <button onClick={fetchEvaluations} className="text-primary hover:rotate-180 transition-transform duration-500 bg-surface-dim p-2 rounded-full border border-outline-variant">
                    <RefreshCw size={18} />
                  </button>
                </div>
                <div className="flex-1 overflow-x-auto overflow-y-auto max-h-[400px] scrollbar-thin scrollbar-thumb-outline-variant">
                   <table className="w-full text-left">
                    <thead className="bg-surface-dim/80 backdrop-blur-sm sticky top-0 z-10 text-[10px] font-black uppercase tracking-widest text-on-surface-variant border-b border-outline-variant">
                      <tr>
                        <th className="px-8 py-4">Paciente</th>
                        <th className="px-8 py-4 text-center">Data</th>
                        <th className="px-8 py-4 text-center">Peso</th>
                        <th className="px-8 py-4 text-center">% BF</th>
                        <th className="px-8 py-4 text-center">IMC</th>
                        <th className="px-8 py-4 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {fetchLoading ? (
                        <tr>
                          <td colSpan={6} className="px-8 py-20 text-center">
                            <Loader2 className="animate-spin text-primary inline mr-2" size={20} />
                            <span className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Carregando histórico...</span>
                          </td>
                        </tr>
                      ) : !patientName ? (
                        <tr>
                          <td colSpan={6} className="px-8 py-20 text-center text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                            Selecione um paciente para ver o histórico.
                          </td>
                        </tr>
                      ) : tableEvaluations.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-8 py-20 text-center text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                            Nenhuma avaliação encontrada.
                          </td>
                        </tr>
                      ) : (
                        tableEvaluations.map((ev, index) => {
                          const previousEvaluation = tableEvaluations[index + 1];
                          const samePatient = !!previousEvaluation;
                          const isSelected = selectedComparisons.find(e => e.id === ev.id);
                          
                          // Weight diff
                          const weightDiff = (samePatient && typeof ev.weight === 'number' && typeof previousEvaluation.weight === 'number') ? (ev.weight - previousEvaluation.weight) : null;
                          
                          // Lean Mass calc: Peso - ((Peso * BF) / 100)
                          const getLeanMass = (weight: number, bf: number | undefined | null) => {
                            if (bf === undefined || bf === null) return null;
                            return weight - ((weight * Number(bf)) / 100);
                          };
                          
                          const evLeanMass = getLeanMass(Number(ev.weight), ev.bodyFat ? Number(ev.bodyFat) : null);
                          const prevLeanMass = samePatient ? getLeanMass(Number(previousEvaluation.weight), previousEvaluation.bodyFat ? Number(previousEvaluation.bodyFat) : null) : null;
                          const leanMassDiff = (evLeanMass !== null && prevLeanMass !== null) ? (evLeanMass - prevLeanMass) : null;
                          
                          return (
                            <tr 
                              key={ev.id} 
                              onClick={() => handleSelect(ev)}
                              className={`hover:bg-primary/5 transition-all group cursor-pointer border-l-4 border-transparent ${isSelected ? 'bg-primary/10 border-primary ring-2 ring-primary ring-inset' : ''}`}
                            >
                              <td className="px-8 py-5 text-sm font-black text-on-surface">{ev.patientName}</td>
                              <td className="px-8 py-5 text-center text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
                                {ev.createdAt?.toDate?.() ? ev.createdAt.toDate().toLocaleDateString('pt-BR') : 'Nov/24'}
                              </td>
                              <td className="px-8 py-5 text-center">
                                <span className="bg-surface-dim px-3 py-1 rounded-full text-sm font-black text-primary border border-outline-variant">{ev.weight}kg</span>
                                {weightDiff !== null && weightDiff !== 0 && (
                                  <div className={`text-[10px] font-bold mt-1 ${weightDiff > 0 ? 'text-[#4edea3]' : 'text-error'}`}>
                                    {weightDiff > 0 ? '+' : ''}{weightDiff.toFixed(1)}kg
                                  </div>
                                )}
                              </td>
                              <td className="px-8 py-5 text-center">
                                <span className="text-sm font-black text-on-surface">
                                  {ev.bodyFat !== undefined && ev.bodyFat !== null ? `${Number(ev.bodyFat).toFixed(1)}%` : '--'}
                                </span>
                                {leanMassDiff !== null && leanMassDiff !== 0 && (
                                  <div className={`text-[10px] font-bold mt-1 ${leanMassDiff > 0 ? 'text-[#4edea3]' : 'text-error'}`}>
                                    {leanMassDiff > 0 ? '+' : ''}{leanMassDiff.toFixed(1)}kg
                                  </div>
                                )}
                              </td>
                              <td className="px-8 py-5 text-center">
                                <span className="text-sm font-bold text-primary">
                                  {ev.bmi !== undefined && ev.bmi !== null ? Number(ev.bmi).toFixed(1) : '--.-'}
                                </span>
                              </td>
                              <td className="px-8 py-5 text-right flex items-center justify-end gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleLoadEvaluation(ev);
                                  }}
                                  className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                >
                                  <Edit size={16} />
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(ev.id);
                                  }}
                                  className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-all"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                   </table>
                </div>
              </div>

              {/* Chart Column */}
              <div className="bg-surface-container rounded-3xl border border-outline-variant p-6 md:p-8 flex flex-col shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-5 -mr-10 -mt-10 group-hover:scale-125 transition-transform duration-700">
                  <TrendingUp size={240} />
                </div>
                
                <div className="relative z-10 flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-xl font-black text-on-surface uppercase tracking-tight">Evolução do Paciente</h3>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] mt-1">Progresso Antropométrico</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(78,222,163,0.5)]" />
                       <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Peso</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-[#3b82f6] shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                       <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">% BF</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 w-full min-h-[300px]">
                  {chartData.length < 2 ? (
                    <div className="h-full flex flex-col items-center justify-center space-y-4 border-2 border-dashed border-outline-variant rounded-2xl bg-surface-dim/30">
                      <TrendingUp size={40} className="text-on-surface-variant opacity-20" />
                      <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] text-center max-w-[200px]">
                        {patientName ? 'Registre mais avaliações para visualizar a curva de evolução.' : 'Selecione um paciente para ver os dados de evolução.'}
                      </p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: -5, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorPeso" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4edea3" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#4edea3" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorBF" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff0a" />
                        <XAxis 
                          dataKey="date" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
                          dy={15}
                        />
                        <YAxis 
                          yAxisId="left"
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#4edea3', fontSize: 10, fontWeight: 900 }} 
                          domain={['auto', 'auto']}
                        />
                        <YAxis 
                          yAxisId="right"
                          orientation="right"
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#3b82f6', fontSize: 10, fontWeight: 900 }} 
                          domain={[0, 30]}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area 
                          yAxisId="left"
                          name="Peso"
                          type="monotone" 
                          dataKey="peso" 
                          stroke="#4edea3" 
                          strokeWidth={4}
                          fillOpacity={1} 
                          fill="url(#colorPeso)" 
                          activeDot={{ r: 8, stroke: '#111827', strokeWidth: 2, fill: '#4edea3' }}
                        />
                        <Area 
                          yAxisId="right"
                          name="% BF"
                          type="monotone" 
                          dataKey="bf" 
                          stroke="#3b82f6" 
                          strokeWidth={4}
                          fillOpacity={1} 
                          fill="url(#colorBF)" 
                          activeDot={{ r: 8, stroke: '#111827', strokeWidth: 2, fill: '#3b82f6' }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
      </motion.div>
    </DashboardLayout>
  );
}
