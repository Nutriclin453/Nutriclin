'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { 
  Dumbbell, 
  Zap, 
  Timer, 
  Repeat, 
  ChevronRight,
  TrendingUp,
  Check,
  Plus,
  Printer,
  Edit,
  Trash2,
  History,
  Lock,
  MessageCircle,
  BarChart3,
  Scale,
  Loader2
} from 'lucide-react';
import { Patient, PatientService } from '@/lib/patient-service';
import { WorkoutService, Exercise, WorkoutPlan } from '@/lib/workout-service';
import { useAuth } from '@/components/supabase-provider';
import { setForceMock } from '@/lib/mock-db';

const EXERCISE_DATABASE: Record<string, { name: string; image: string }[]> = {
  'Peito': [
    { name: 'Supino Reto (Barra)', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&auto=format&fit=crop' },
    { name: 'Supino Reto (Halteres)', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&auto=format&fit=crop' },
    { name: 'Supino Inclinado (Barra)', image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop' },
    { name: 'Supino Inclinado (Halteres)', image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop' },
    { name: 'Supino Declinado (Barra)', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop' },
    { name: 'Supino Declinado (Halteres)', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop' },
    { name: 'Crucifixo Reto', image: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=500&auto=format&fit=crop' },
    { name: 'Crucifixo Inclinado', image: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=500&auto=format&fit=crop' },
    { name: 'Crossover (Polia Alta)', image: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=500&auto=format&fit=crop' },
    { name: 'Crossover (Polia Baixa)', image: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=500&auto=format&fit=crop' },
    { name: 'Peck Deck (Voador)', image: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=500&auto=format&fit=crop' },
    { name: 'Supino Máquina Vertical', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop' },
    { name: 'Supino Máquina Inclinado', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop' },
    { name: 'Flexão de Braço', image: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=500&auto=format&fit=crop' },
    { name: 'Paralelas (Foco Peito)', image: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=500&auto=format&fit=crop' }
  ],
  'Costas': [
    { name: 'Puxada Frontal Aberta', image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=200&h=200&fit=crop' },
    { name: 'Puxada Supinada (Fechada)', image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=200&h=200&fit=crop' },
    { name: 'Puxada Romena/Triângulo', image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=200&h=200&fit=crop' },
    { name: 'Pulldown na Polia', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=200&fit=crop' },
    { name: 'Barra Fixa (Pronada)', image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=200&h=200&fit=crop' },
    { name: 'Barra Fixa (Supinada)', image: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=200&h=200&fit=crop' },
    { name: 'Remada Baixa (Triângulo)', image: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=200&h=200&fit=crop' },
    { name: 'Remada Curvada (Barra)', image: 'https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?w=200&h=200&fit=crop' },
    { name: 'Remada Cavalinho', image: 'https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?w=200&h=200&fit=crop' },
    { name: 'Remada Unilateral (Serrote)', image: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=200&h=200&fit=crop' },
    { name: 'Remada Articulada Máquina', image: 'https://images.unsplash.com/photo-1623874514711-0f321325f318?w=200&h=200&fit=crop' },
    { name: 'Crucifixo Invertido na Máquina', image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=200&h=200&fit=crop' }
  ],
  'Pernas': [
    { name: 'Agachamento Livre (Barra)', image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=200&h=200&fit=crop' },
    { name: 'Agachamento Hack', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=200&fit=crop' },
    { name: 'Leg Press 45°', image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=200&h=200&fit=crop' },
    { name: 'Cadeira Extensora', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=200&fit=crop' },
    { name: 'Mesa Flexora', image: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=200&h=200&fit=crop' },
    { name: 'Cadeira Flexora', image: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=200&h=200&fit=crop' },
    { name: 'Flexora Vertical (Em Pé)', image: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=200&h=200&fit=crop' },
    { name: 'Stiff (Barra)', image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=200&h=200&fit=crop' },
    { name: 'Stiff (Halteres)', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=200&h=200&fit=crop' },
    { name: 'Agachamento Búlgaro', image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=200&h=200&fit=crop' },
    { name: 'Avanço/Passada (Halteres)', image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=200&h=200&fit=crop' },
    { name: 'Elevação Pélvica', image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=200&h=200&fit=crop' },
    { name: 'Cadeira Abdutora', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=200&fit=crop' },
    { name: 'Cadeira Adutora', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=200&fit=crop' },
    { name: 'Panturrilha em Pé Máquina', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=200&fit=crop' },
    { name: 'Gêmeos Sentado (Burrinho)', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=200&fit=crop' }
  ],
  'Ombros': [
    { name: 'Desenvolvimento (Halteres)', image: 'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=200&h=200&fit=crop' },
    { name: 'Desenvolvimento (Barra)', image: 'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=200&h=200&fit=crop' },
    { name: 'Desenvolvimento Máquina', image: 'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=200&h=200&fit=crop' },
    { name: 'Elevação Lateral (Halteres)', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=200&h=200&fit=crop' },
    { name: 'Elevação Lateral (Polia)', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=200&h=200&fit=crop' },
    { name: 'Elevação Lateral Máquina', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=200&h=200&fit=crop' },
    { name: 'Elevação Frontal (Halteres)', image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=200&h=200&fit=crop' },
    { name: 'Elevação Frontal (Barra)', image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=200&h=200&fit=crop' },
    { name: 'Elevação Frontal (Polia)', image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=200&h=200&fit=crop' },
    { name: 'Crucifixo Invertido (Halteres)', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=200&fit=crop' },
    { name: 'Face Pull (Polia)', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=200&h=200&fit=crop' },
    { name: 'Encolhimento de Ombros (Trapézio)', image: 'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=200&h=200&fit=crop' }
  ],
  'Braços': [
    { name: 'Rosca Direta (Barra Reta)', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=200&h=200&fit=crop' },
    { name: 'Rosca Direta (Barra W)', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=200&h=200&fit=crop' },
    { name: 'Rosca Alternada', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=200&h=200&fit=crop' },
    { name: 'Rosca Martelo', image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=200&h=200&fit=crop' },
    { name: 'Rosca Scott', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=200&h=200&fit=crop' },
    { name: 'Rosca Concentrada', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=200&h=200&fit=crop' },
    { name: 'Rosca Inversa (Antebraço)', image: 'https://images.unsplash.com/photo-1591940742878-13aba4b7a35e?w=200&h=200&fit=crop' },
    { name: 'Tríceps Pulley (Barra)', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=200&fit=crop' },
    { name: 'Tríceps Corda', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=200&fit=crop' },
    { name: 'Tríceps Testa (Barra W)', image: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=200&h=200&fit=crop' },
    { name: 'Tríceps Francês (Halter)', image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2adfcd?w=200&h=200&fit=crop' },
    { name: 'Tríceps Coice (Polia)', image: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=200&h=200&fit=crop' },
    { name: 'Mergulho no Banco', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=200&fit=crop' }
  ],
  'Core': [
    { name: 'Abdominal Supra', image: 'https://images.unsplash.com/photo-1571019613200-a292415176bb?w=200&h=200&fit=crop' },
    { name: 'Abdominal Infra', image: 'https://images.unsplash.com/photo-1571019613200-a292415176bb?w=200&h=200&fit=crop' },
    { name: 'Prancha Isométrica', image: 'https://images.unsplash.com/photo-1571019613200-a292415176bb?w=200&h=200&fit=crop' },
    { name: 'Extensão Lombar (Banco Romano)', image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=200&h=200&fit=crop' },
    { name: 'Levantamento Terra (Deadlift)', image: 'https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?w=200&h=200&fit=crop' }
  ]
};

const getPlaceholderImage = (muscle: string) => {
  const m = muscle.toLowerCase();
  if (m.includes('peito') || m.includes('chest')) return 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=200&h=200&fit=crop';
  if (m.includes('costa') || m.includes('back')) return 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=200&h=200&fit=crop';
  if (m.includes('perna') || m.includes('leg') || m.includes('quad')) return 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=200&h=200&fit=crop';
  if (m.includes('ombro') || m.includes('shoulder')) return 'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=200&h=200&fit=crop';
  return 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=200&fit=crop';
};

const FREQUENCY_OPTIONS = {
  '2 Dias (Divisão AB)': ['Treino A', 'Treino B'],
  '3 Dias (Divisão ABC - Push/Pull/Legs)': ['Treino A', 'Treino B', 'Treino C'],
  '4 Dias (Divisão ABCD)': ['Treino A', 'Treino B', 'Treino C', 'Treino D'],
  '5 Dias (Divisão ABCDE)': ['Treino A', 'Treino B', 'Treino C', 'Treino D', 'Treino E'],
  '6 Dias (Divisão ABCDEF)': ['Treino A', 'Treino B', 'Treino C', 'Treino D', 'Treino E', 'Treino F'],
};

export default function Treinos() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab ] = useState('Treino A');
  const [frequency, setFrequency] = useState('3 Dias (Divisão ABC - Push/Pull/Legs)');
  const [isEditing, setIsEditing] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingWorkouts, setLoadingWorkouts] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [planId, setPlanId] = useState<string | undefined>(undefined);

  const [workouts, setWorkouts] = useState<Exercise[]>([]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchPatients();
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (selectedPatientId) {
      fetchWorkout(selectedPatientId);
    } else {
      setWorkouts([]);
      setPlanId(undefined);
    }
  }, [selectedPatientId]);

  const fetchPatients = async (retryCount = 0) => {
    try {
      const data = await PatientService.getAll();
      setPatients(data || []);
    } catch (err: any) {
      console.error(err);
      const msg = err?.message || String(err);
      if ((msg.includes('Failed to fetch') || msg.includes('fetch') || msg.includes('network') || msg.includes('TypeError')) && retryCount < 1) {
        setForceMock(true);
        setTimeout(() => {
          fetchPatients(retryCount + 1);
        }, 50);
        return;
      }
      setErrorMsg('Erro ao buscar pacientes.');
    } finally {
      setLoadingPatients(false);
    }
  };

  const fetchWorkout = async (patientId: string, retryCount = 0) => {
    setLoadingWorkouts(true);
    setErrorMsg('');
    try {
      const plans = await WorkoutService.getByPatientId(patientId);
      if (plans && plans.length > 0) {
        setWorkouts(plans[0].exercises || []);
        setPlanId(plans[0].id);
      } else {
        setWorkouts([]);
        setPlanId(undefined);
      }
    } catch (err: any) {
      console.error(err);
      const msg = err?.message || String(err);
      if ((msg.includes('Failed to fetch') || msg.includes('fetch') || msg.includes('network') || msg.includes('TypeError')) && retryCount < 1) {
        setForceMock(true);
        setTimeout(() => {
          fetchWorkout(patientId, retryCount + 1);
        }, 50);
        return;
      }
      setErrorMsg('Erro ao buscar treinos.');
    } finally {
      setLoadingWorkouts(false);
    }
  };

  const handleSave = async () => {
    if (!selectedPatientId) return;
    setSaving(true);
    setErrorMsg('');
    try {
      const patient = patients.find(p => p.id === selectedPatientId);
      const plan: any = { // Use any to bypass frequency if it's still in types elsewhere, though we removed it from WorkoutPlan
        id: planId,
        patient_id: selectedPatientId,
        patient_name: patient?.name,
        exercises: workouts
      };
      const saved = await WorkoutService.save(plan);
      if (saved) {
        setPlanId(saved.id);
        setIsEditing(false);
      }
    } catch (err: any) {
      console.error("Save error:", err);
      setErrorMsg(err.message || 'Erro ao salvar treinos.');
    } finally {
      setSaving(false);
    }
  };


  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const filteredExercises = workouts.filter(ex => ex.treino === activeTab);

  const updateExercise = (id: number | string, field: string, value: string) => {
    setWorkouts(prev => prev.map(ex => {
      if (ex.id !== id) return ex;
      
      let updatedEx = { ...ex, [field]: value };
      
      // Quando o grupo muscular muda, selecionamos o primeiro exercício desse grupo automaticamente
      if (field === 'subtitle') {
        const groupExercises = EXERCISE_DATABASE[value] || [];
        if (groupExercises.length > 0) {
          updatedEx.name = groupExercises[0].name;
          updatedEx.image = groupExercises[0].image;
        } else {
          updatedEx.name = '';
          updatedEx.image = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=200&fit=crop';
        }
      }
      
      // Quando o nome do exercício muda, atualizamos a imagem correspondente
      if (field === 'name') {
        const currentGroup = updatedEx.subtitle; // Usa o grupo já atualizado
        const group = EXERCISE_DATABASE[currentGroup] || [];
        const found = group.find(item => item.name === value);
        if (found) {
          updatedEx.image = found.image;
        }
      }
      
      return updatedEx;
    }));
  };

  const removeExercise = (id: number | string) => {
    setWorkouts(prev => prev.filter(ex => ex.id !== id));
  };

  const addExercise = () => {
    const defaultGroup = 'Peito';
    const groupData = EXERCISE_DATABASE[defaultGroup];
    const defaultEx = groupData[0];
    
    const newEx = {
      id: crypto.randomUUID(), // Usando UUID para evitar conflitos de ID
      treino: activeTab,
      name: defaultEx.name,
      subtitle: defaultGroup,
      sets: '3',
      reps: '10-12',
      rest: '60s',
      notes: '',
      image: defaultEx.image
    };
    setWorkouts(prev => [...prev, newEx]);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto print:hidden">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2 border-b border-slate-200 dark:border-slate-800/50">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-500/20">
                Protocolo Ativo
              </span>
              <span className="text-slate-500 text-xs font-medium">
                • Iniciado em 12 Out, 2023
              </span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-none">
              {patients.find(p => p.id === selectedPatientId)?.name || 'Prescrição de Treinos'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl leading-relaxed">
              Gestão de mesociclos e progressão de carga personalizada por perfil.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              id="btn-imprimir"
              onClick={() => window.print()}
              type="button"
              className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-4 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 cursor-pointer shadow-lg"
            >
              <Printer size={18} />
              Imprimir Plano
            </button>
            <button 
              onClick={() => {
                if (isEditing) {
                  handleSave();
                } else {
                  setIsEditing(true);
                }
              }}
              disabled={!selectedPatientId || saving}
              className={`px-6 py-4 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed print:hidden ${
                isEditing 
                ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20' 
                : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
              }`}
            >
              {saving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Salvando...
                </>
              ) : isEditing ? (
                <>
                  <Check size={18} />
                  Salvar Alterações
                </>
              ) : (
                <>
                  <Edit size={18} />
                  Editar Plano
                </>
              )}
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-500 text-sm font-medium">
            {errorMsg}
          </div>
        )}

        {/* Patient Selection & Frequency */}
        <div className="bg-white dark:bg-[#0f172a] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-6 items-start md:items-center print:hidden">
          <div className="flex-1 w-full max-w-sm space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Selecionar Paciente
            </label>
            <select
              className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 p-3 rounded-xl focus:border-emerald-500 outline-none font-medium text-sm transition-all"
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              disabled={loadingPatients}
            >
              <option value="">Selecione um paciente...</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 w-full max-w-sm space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Divisão / Frequência Semanal
            </label>
            <select
              className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 p-3 rounded-xl focus:border-emerald-500 outline-none font-medium text-sm transition-all"
              value={frequency}
              onChange={(e) => {
                const newFreq = e.target.value;
                setFrequency(newFreq);
                // Reset active tab if it's no longer valid
                const availableTabs = FREQUENCY_OPTIONS[newFreq as keyof typeof FREQUENCY_OPTIONS];
                if (!availableTabs.includes(activeTab)) {
                  setActiveTab(availableTabs[0]);
                }
              }}
              disabled={!selectedPatientId}
            >
              {Object.keys(FREQUENCY_OPTIONS).map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loadingWorkouts ? (
           <div className="flex justify-center py-20">
             <Loader2 className="animate-spin text-emerald-500" size={32} />
           </div>
        ) : (
          <div 
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 transition-opacity"
            style={{ 
              opacity: selectedPatientId ? 1 : 0.5,
              pointerEvents: selectedPatientId ? 'auto' : 'none'
            }}
          >
          <div className="lg:col-span-8 space-y-6">
            {/* Tabs */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-900/50 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 flex-wrap print:hidden">
              {FREQUENCY_OPTIONS[frequency as keyof typeof FREQUENCY_OPTIONS].map((tab) => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 min-w-[80px] py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
                    activeTab === tab 
                    ? 'bg-white dark:bg-slate-800 text-emerald-500 shadow-sm border border-slate-200 dark:border-slate-700' 
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Exercise List Header */}
            <div className="hidden lg:grid grid-cols-12 px-6 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest print:grid">
              <div className="col-span-5 text-left">Exercício</div>
              <div className="col-span-1 text-center">Séries</div>
              <div className="col-span-1 text-center">Reps</div>
              <div className="col-span-1 text-center">Descanso</div>
              <div className="col-span-3">Notas</div>
              <div className="col-span-1 text-right">Ação</div>
            </div>

            {/* Exercise Cards */}
            <div className="space-y-3">
              {filteredExercises.map((ex, i) => (
                <div key={ex.id} className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 lg:p-6 hover:border-emerald-500/30 transition-all group overflow-hidden relative">
                  {/* Selected Indicator */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-6">
                    {/* Exercise & Image */}
                    <div className="lg:col-span-5 flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                        <img 
                          src={ex.image || getPlaceholderImage(ex.subtitle)} 
                          alt={ex.name} 
                          className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform" 
                        />
                      </div>
                      <div className="overflow-hidden w-full space-y-2">
                        {isEditing ? (
                          <>
                            <div className="flex flex-col gap-2">
                              <select 
                                value={ex.subtitle} 
                                onChange={(e) => updateExercise(ex.id, 'subtitle', e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2 py-1.5 text-[11px] font-black uppercase tracking-widest text-emerald-500 outline-none focus:border-emerald-500 transition-all cursor-pointer"
                              >
                                {Object.keys(EXERCISE_DATABASE).map(group => (
                                  <option key={group} value={group}>{group}</option>
                                ))}
                              </select>
                              
                              <select 
                                value={ex.name} 
                                onChange={(e) => updateExercise(ex.id, 'name', e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2 py-1.5 text-sm font-bold text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500 transition-all cursor-pointer"
                              >
                                <option value="" disabled>Selecione o Exercício</option>
                                {(EXERCISE_DATABASE[ex.subtitle] || []).map(item => (
                                  <option key={item.name} value={item.name}>{item.name}</option>
                                ))}
                              </select>
                            </div>
                          </>
                        ) : (
                          <>
                            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base lg:text-lg line-clamp-1">{ex.name}</h3>
                            <div className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <p className="text-xs text-slate-500 font-medium lowercase tracking-wide">{ex.subtitle}</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="lg:col-span-1 text-center">
                      <span className="lg:hidden text-[10px] font-bold text-slate-500 block mb-1">SÉRIEs</span>
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={ex.sets} 
                          onChange={(e) => updateExercise(ex.id, 'sets', e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-1 py-1 text-sm font-bold text-slate-700 dark:text-slate-300 text-center outline-none focus:border-emerald-500"
                        />
                      ) : (
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{ex.sets}</span>
                      )}
                    </div>
                    <div className="lg:col-span-1 text-center">
                      <span className="lg:hidden text-[10px] font-bold text-slate-500 block mb-1">REPS</span>
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={ex.reps} 
                          onChange={(e) => updateExercise(ex.id, 'reps', e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-1 py-1 text-sm font-bold text-slate-700 dark:text-slate-300 text-center outline-none focus:border-emerald-500"
                        />
                      ) : (
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{ex.reps}</span>
                      )}
                    </div>
                    <div className="lg:col-span-1 text-center">
                      <span className="lg:hidden text-[10px] font-bold text-slate-500 block mb-1">DESCANSO</span>
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={ex.rest} 
                          onChange={(e) => updateExercise(ex.id, 'rest', e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-1 py-1 text-sm font-bold text-slate-700 dark:text-slate-300 text-center outline-none focus:border-emerald-500"
                        />
                      ) : (
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{ex.rest}</span>
                      )}
                    </div>

                    {/* Notes */}
                    <div className="lg:col-span-3">
                      <span className="lg:hidden text-[10px] font-bold text-slate-500 block mb-1">NOTAS</span>
                      {isEditing ? (
                        <textarea 
                          value={ex.notes} 
                          onChange={(e) => updateExercise(ex.id, 'notes', e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 text-[11px] text-slate-500 italic outline-none focus:border-emerald-500 resize-none h-12"
                        />
                      ) : (
                        <p className="text-xs text-slate-500 italic line-clamp-2 leading-relaxed">
                          {ex.notes}
                        </p>
                      )}
                    </div>

                    {/* Action */}
                    <div className="lg:col-span-1 flex justify-end print:hidden">
                      {isEditing ? (
                        <button 
                          onClick={() => removeExercise(ex.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      ) : (
                        <button className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all">
                          <Edit size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isEditing && (
                <button 
                  onClick={addExercise}
                  className="w-full p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-slate-400 hover:text-emerald-500 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all flex flex-col items-center gap-2 group"
                >
                  <Plus className="group-hover:scale-110 transition-transform" size={24} />
                  <span className="font-bold text-sm uppercase tracking-widest">Adicionar Exercício</span>
                </button>
              )}

              {filteredExercises.length === 0 && !isEditing && (
                <div className="p-16 text-center bg-white dark:bg-[#0f172a] border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] space-y-6">
                  <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                    <Plus size={32} />
                  </div>
                  <div className="space-y-2">
                    <p className="font-black text-slate-900 dark:text-slate-100 text-xl tracking-tight">Nenhum exercício prescrito</p>
                    <p className="text-slate-500 text-sm max-w-xs mx-auto">Este paciente ainda não possui um plano de treino para o {activeTab}.</p>
                  </div>
                  <button 
                    onClick={() => {
                      setIsEditing(true);
                      addExercise();
                    }}
                    className="bg-emerald-500 text-slate-950 px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:brightness-110 transition-all shadow-xl shadow-emerald-500/20 mx-auto"
                  >
                    <Dumbbell size={18} />
                    Criar Plano de Treino
                  </button>
                </div>
              )}
            </div>

            {/* Addition Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 print:hidden">
              <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                      <History size={18} />
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100">Sugestões de Progressão</h4>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-500">+2.5% Intensidade</span>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Aumento de Carga</p>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">Com base no RPE 7 da semana passada, aumente a carga neste treino em 2,5kg para manter a tensão mecânica.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                      <Timer size={18} />
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100">Redução de Descanso</h4>
                  </div>
                  <span className="text-[10px] font-bold text-amber-500">Foco em Densidade</span>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Controle Metabólico</p>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">Para exercícios isolados de hoje, reduza o descanso para aumentar o estresse metabólico e acúmulo de lactato.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            {/* Trainer Analysis */}
            <section className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-8 print:hidden">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                  <BarChart3 size={20} />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Análise do Treinador</h3>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Tendência de Volume Semanal</span>
                  <span className="text-sm font-black text-emerald-500">+12%</span>
                </div>
                
                {/* Minimalist Bar Chart */}
                <div className="flex items-end justify-between h-24 gap-2">
                  {[30, 45, 60, 35, 75, 45, 85, 95].map((height, i) => (
                    <div 
                      key={i} 
                      style={{ height: `${height}%` }} 
                      className={`flex-1 rounded-t-sm transition-all ${
                        i === 7 ? 'bg-emerald-500 shadow-[0_-4px_12px_rgba(16,185,129,0.3)]' : 'bg-slate-200 dark:bg-slate-800'
                      }`}
                    />
                  ))}
                </div>

                <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 italic relative">
                  <span className="absolute -top-3 left-6 text-2xl text-emerald-500 opacity-20 font-serif">&quot;</span>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    O volume está atingindo o pico conforme planejado. Marcadores de recuperação estão ótimos. Faremos o deload em 2 semanas.
                  </p>
                </div>

                <button className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-900 transition-all">
                  <MessageCircle size={16} />
                  Falar com o Nutri
                </button>
              </div>
            </section>

            {/* Other Stats */}
            <div className="grid grid-cols-2 gap-4 print:hidden">
              <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 p-6 rounded-3xl">
                <Scale className="text-slate-400 mb-2" size={20} />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Peso Atual</p>
                <p className="text-xl font-black text-slate-900 dark:text-slate-100">84.5 kg</p>
              </div>
              <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 p-6 rounded-3xl">
                <Zap className="text-emerald-500 mb-2" size={20} />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Intensidade</p>
                <p className="text-xl font-black text-slate-900 dark:text-slate-100">Alta</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

      {/* Print-Only Full Workout View */}
      <div className="hidden print:block w-full max-w-4xl mx-auto bg-white p-0">
          <div className="border-b-4 border-emerald-500 pb-6 mb-10 flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Plano de Treinamento</h1>
              <p className="text-emerald-600 font-bold uppercase tracking-widest text-[10px] mt-1">Antonio Feitoza • Nutrição & Treinamento</p>
            </div>
            <div className="text-right">
              <div className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Data de Emissão</div>
              <div className="text-slate-900 font-bold">{new Date().toLocaleDateString('pt-BR')}</div>
            </div>
          </div>

          <div className="mb-10 bg-slate-50 border border-slate-200 p-6 rounded-2xl flex justify-between">
            <div>
              <span className="text-slate-400 font-black uppercase tracking-widest text-[10px] block mb-1">Paciente</span>
              <span className="text-xl font-black text-slate-900 truncate">{patients.find(p => p.id === selectedPatientId)?.name || 'N/A'}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 font-black uppercase tracking-widest text-[10px] block mb-1">Frequência</span>
              <span className="text-lg font-bold text-slate-700">{frequency.split(' ')[0]} {frequency.split(' ')[1]}</span>
            </div>
          </div>

          {FREQUENCY_OPTIONS[frequency as keyof typeof FREQUENCY_OPTIONS].map((tabName) => {
            const tabExercises = workouts.filter(ex => ex.treino === tabName);
            if (tabExercises.length === 0) return null;

            return (
              <div key={tabName} className="space-y-6 break-inside-avoid mb-16">
                <div className="bg-slate-900 text-white px-6 py-3 rounded-xl flex justify-between items-center shadow-lg">
                  <h2 className="text-xl font-black uppercase tracking-[0.1em]">{tabName}</h2>
                </div>

                <div className="overflow-hidden border border-slate-200 rounded-2xl">
                  <table className="w-full text-sm border-collapse bg-white">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-6 py-4 text-left font-black uppercase tracking-widest text-[10px] text-slate-500">Exercício</th>
                        <th className="px-4 py-4 text-center font-black uppercase tracking-widest text-[10px] text-slate-500">Séries</th>
                        <th className="px-4 py-4 text-center font-black uppercase tracking-widest text-[10px] text-slate-500">Reps</th>
                        <th className="px-4 py-4 text-center font-black uppercase tracking-widest text-[10px] text-slate-500">Pausa</th>
                        <th className="px-6 py-4 text-left font-black uppercase tracking-widest text-[10px] text-slate-500">Observações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tabExercises.map((ex) => (
                        <tr key={ex.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-5">
                            <div className="font-bold text-slate-900 text-base">{ex.name}</div>
                            <div className="text-[10px] text-emerald-600 uppercase font-black tracking-widest mt-0.5">{ex.subtitle}</div>
                          </td>
                          <td className="px-4 py-5 font-black text-center text-slate-800 bg-slate-50/30">{ex.sets}</td>
                          <td className="px-4 py-5 font-black text-center text-slate-800">{ex.reps}</td>
                          <td className="px-4 py-5 font-black text-center text-slate-800 bg-slate-50/30">{ex.rest}</td>
                          <td className="px-6 py-5 text-xs italic text-slate-500 leading-relaxed font-medium">{ex.notes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
          
          <div className="mt-24 border-t-2 border-slate-100 pt-10 text-center pb-12">
            <div className="text-[11px] text-slate-400 font-black uppercase tracking-[0.3em] mb-4">
              Antonio Feitoza • Nutrição Esportiva e Treinamento
            </div>
            <div className="text-[9px] text-slate-300 font-bold">
              ESTE DOCUMENTO É PARTE INTEGRANTE DO PROTOCOLO DE ACOMPANHAMENTO.
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }
