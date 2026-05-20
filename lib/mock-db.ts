// Helper for local mock storage in the web sandbox environment
import { Patient } from './patient-service';
import { Evaluation } from './evaluation-service';
import { Diet } from './diet-service';
import { WorkoutPlan } from './workout-service';

let forceMock = false;

export const setForceMock = (val: boolean): void => {
  forceMock = val;
  if (typeof window !== 'undefined') {
    try {
      window.localStorage?.setItem('supabase_force_mock', val ? 'true' : 'false');
    } catch (e) {
      console.error(e);
    }
  }
};

export const isMockEnabled = (): boolean => {
  if (typeof window === 'undefined') return true;
  if (forceMock) return true;
  
  try {
    if (typeof window !== 'undefined' && window.localStorage?.getItem('supabase_force_mock') === 'true') {
      return true;
    }
  } catch (e) {
    // Ignore error
  }
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !url || url.trim() === '' || url.includes('example.supabase.co');
};

const getStorageItem = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

const setStorageItem = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
  }
};

// Seed Patients
const defaultPatients: Patient[] = [
  {
    id: '患者-allan',
    name: 'Allan',
    email: 'allan@example.com',
    phone: '(11) 98765-4321',
    goal: 'Ganho de Massa',
    status: 'Ativo',
    gender: 'Masculino',
    birthDate: '2000-01-01',
    createdAt: new Date().toISOString()
  },
  {
    id: '患者-joao',
    name: 'João',
    email: 'joao@example.com',
    phone: '(11) 91234-5678',
    goal: 'Emagrecimento',
    status: 'Ativo',
    gender: 'Masculino',
    birthDate: '1995-05-15',
    createdAt: new Date().toISOString()
  }
];

// Seed Evaluations to show progress in charts right away
const defaultEvaluations: any[] = [
  {
    id: 'eval-allan-1',
    patient_name: 'Allan',
    gender: 'male',
    weight: 75,
    height: 176,
    age: 24,
    objective: 'Hipertrofia',
    waist: 82,
    abdominal: 84,
    neck: 36,
    skinfolds: {
      tricipital: 10,
      subescapular: 12,
      subaxilar: 11,
      peitoral: 9,
      abdomen: 15,
      suprailiaca: 12,
      coxa: 14,
      body_fat: 13.1
    },
    bmi: 24.2,
    body_fat: 13.1,
    tdee: 2300,
    created_by: '1',
    created_at: '2026-04-10T14:30:00Z'
  },
  {
    id: 'eval-allan-2',
    patient_name: 'Allan',
    gender: 'male',
    weight: 77,
    height: 176,
    age: 24,
    objective: 'Hipertrofia',
    waist: 80,
    abdominal: 81,
    neck: 37,
    skinfolds: {
      tricipital: 9,
      subescapular: 11,
      subaxilar: 10,
      peitoral: 8,
      abdomen: 13,
      suprailiaca: 10,
      coxa: 12,
      body_fat: 12.2
    },
    bmi: 24.9,
    body_fat: 12.2,
    tdee: 2350,
    created_by: '1',
    created_at: '2026-05-19T14:30:00Z'
  }
];

// Default plans (Diets & Workouts)
const defaultDiets: Diet[] = [
  {
    id: 'diet-allan',
    patient_id: '患者-allan',
    patient_name: 'Allan',
    goal: 'Aumento de Massa',
    notes: 'Priorizar proteínas de alto valor biológico e hidratação regular.',
    meals: [
      {
        id: 'meal-1',
        name: 'Café da Manhã',
        time: '08:00',
        kcal: 450,
        items: ['3 ovos inteiros mexidos', '2 fatias de pão integral', '100g de mamão com aveia', '1 xícara de café preto']
      },
      {
        id: 'meal-2',
        name: 'Almoço',
        time: '12:30',
        kcal: 700,
        items: ['200g de peito de frango grelhado', '250g de arroz branco cozido', '100g de feijão carioca', 'Vegetais variados cozidos']
      },
      {
        id: 'meal-3',
        name: 'Lanche da Tarde',
        time: '16:00',
        kcal: 350,
        items: ['30g de whey protein concentrado', '1 banana madura', '30g de aveia em flocos']
      },
      {
        id: 'meal-4',
        name: 'Janta',
        time: '20:00',
        kcal: 600,
        items: ['180g de patinho moído grelhado', '200g de batata doce assada', 'Salada verde à vontade com azeite de oliva']
      }
    ],
    macros: {
      protein: 160,
      carbs: 220,
      fats: 65,
      proteinPct: 30,
      carbsPct: 50,
      fatsPct: 20
    },
    created_at: '2026-05-19T14:30:00Z'
  }
];

const defaultWorkouts: WorkoutPlan[] = [
  {
    id: 'workout-allan',
    patient_id: '患者-allan',
    patient_name: 'Allan',
    notes: 'Manter a cadência controlada nas fases excêntricas e foco na progressão de cargas.',
    exercises: [
      {
        id: 'ex-1',
        treino: 'A - Empurrar (Peito, Ombros, Tríceps)',
        name: 'Supino Reto com Barra',
        subtitle: 'Peitoral Completo',
        sets: '4',
        reps: '8 a 10',
        rest: '2 min',
        notes: 'Cadência 3:1:1. Focar na contração do peitoral no topo.',
        image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=200&auto=format&fit=crop'
      },
      {
        id: 'ex-2',
        treino: 'A - Empurrar (Peito, Ombros, Tríceps)',
        name: 'Desenvolvimento Militar Halteres',
        subtitle: 'Deltoide Anterior',
        sets: '4',
        reps: '10 a 12',
        rest: '90s',
        notes: 'Coluna bem apoiada no banco, não subir além da linha das orelhas rápido demais.',
        image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=200&auto=format&fit=crop'
      },
      {
        id: 'ex-3',
        treino: 'B - Puxar (Costas, Dorsal, Bíceps)',
        name: 'Puxada Alta (Pulldown)',
        subtitle: 'Grande Dorsal',
        sets: '4',
        reps: '10 a 12',
        rest: '90s',
        notes: 'Puxar controlando o cotovelo apontado para baixo e para trás.',
        image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=200&auto=format&fit=crop'
      },
      {
        id: 'ex-4',
        treino: 'C - Pernas Completo',
        name: 'Agachamento Livre com Barra',
        subtitle: 'Quadríceps e Glúteos',
        sets: '4',
        reps: '8 a 10',
        rest: '2 min',
        notes: 'Manter abdômen contraído, descida controlada e joelhos apontando para fora.',
        image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=200&auto=format&fit=crop'
      }
    ],
    created_at: '2026-05-19T14:30:00Z'
  }
];

export const getPatients = (): Patient[] => {
  return getStorageItem<Patient[]>('mock_patients', defaultPatients);
};

export const savePatient = (patient: Patient): Patient => {
  const list = getPatients();
  let updated: Patient;
  
  if (patient.id) {
    list.forEach((p, idx) => {
      if (p.id === patient.id) {
        list[idx] = { ...p, ...patient };
        updated = list[idx];
      }
    });
    updated = patient;
  } else {
    updated = {
      ...patient,
      id: '患者-' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    list.push(updated);
  }
  setStorageItem('mock_patients', list);
  return updated;
};

export const deletePatient = (id: string): void => {
  const list = getPatients().filter(p => p.id !== id);
  setStorageItem('mock_patients', list);
};

// Evaluations
export const getEvaluations = (): any[] => {
  return getStorageItem<any[]>('mock_evaluations', defaultEvaluations);
};

export const saveEvaluation = (ev: any): any => {
  const list = getEvaluations();
  let updated: any;
  if (ev.id) {
    let found = false;
    list.forEach((item, idx) => {
      if (item.id === ev.id) {
        list[idx] = { ...item, ...ev };
        updated = list[idx];
        found = true;
      }
    });
    if (!found) {
      updated = ev;
      list.push(updated);
    }
  } else {
    updated = {
      ...ev,
      id: 'eval-' + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString()
    };
    list.push(updated);
  }
  setStorageItem('mock_evaluations', list);
  return updated;
};

export const deleteEvaluation = (id: string): void => {
  const list = getEvaluations().filter(item => item.id !== id);
  setStorageItem('mock_evaluations', list);
};

// Diets
export const getDiets = (): Diet[] => {
  return getStorageItem<Diet[]>('mock_diets', defaultDiets);
};

export const saveDiet = (diet: Diet): Diet => {
  const list = getDiets();
  let updated: Diet;
  if (diet.id) {
    list.forEach((item, idx) => {
      if (item.id === diet.id) {
        list[idx] = { ...item, ...diet };
        updated = list[idx];
      }
    });
    updated = diet;
  } else {
    updated = {
      ...diet,
      id: 'diet-' + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString()
    };
    list.push(updated);
  }
  setStorageItem('mock_diets', list);
  return updated;
};

export const deleteDiet = (id: string): void => {
  const list = getDiets().filter(item => item.id !== id);
  setStorageItem('mock_diets', list);
};

// Workouts
export const getWorkouts = (): WorkoutPlan[] => {
  return getStorageItem<WorkoutPlan[]>('mock_workouts', defaultWorkouts);
};

export const saveWorkout = (plan: WorkoutPlan): WorkoutPlan => {
  const list = getWorkouts();
  let updated: WorkoutPlan;
  if (plan.id) {
    list.forEach((item, idx) => {
      if (item.id === plan.id) {
        list[idx] = { ...item, ...plan };
        updated = list[idx];
      }
    });
    updated = plan;
  } else {
    updated = {
      ...plan,
      id: 'workout-' + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString()
    };
    list.push(updated);
  }
  setStorageItem('mock_workouts', list);
  return updated;
};

export const deleteWorkout = (id: string): void => {
  const list = getWorkouts().filter(item => item.id !== id);
  setStorageItem('mock_workouts', list);
};
