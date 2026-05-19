import { supabase } from './supabase';

export interface Exercise {
  id: number | string;
  treino: string;
  name: string;
  subtitle: string;
  sets: string;
  reps: string;
  rest: string;
  notes: string;
  image: string;
}

export interface WorkoutPlan {
  id?: string;
  patient_id: string;
  patient_name?: string;
  exercises: Exercise[];
  notes?: string;
  created_at?: string;
  created_by?: string;
}

export const WorkoutService = {
  async getByPatientId(patientId: string) {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });
    
    if (error) {
       if (error.code === '42P01') {
         throw new Error("Tabela de treinos não existe. Certifique-se de executar a migração SQL no Supabase.");
       }
       if (error.message?.includes('schema cache')) {
         throw new Error("A tabela de treinos foi detectada, mas o cache do Supabase está desatualizado. Vá em Project Settings > API > e clique em 'Reload Schema Cache' no seu dashboard do Supabase.");
       }
      throw error;
    }
    return data as WorkoutPlan[];
  },

  async save(plan: WorkoutPlan) {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('User not authenticated');

    // Create a clean payload with only columns that exist in the DB
    const planData: any = {
      patient_id: plan.patient_id,
      exercises: plan.exercises,
      notes: plan.notes || '',
      created_by: userData.user.id
    };

    if (plan.id) {
      const { data, error } = await supabase
        .from('workouts')
        .update(planData)
        .eq('id', plan.id)
        .select()
        .single();
        
      if (error) throw error;
      return data as WorkoutPlan;
    } else {
      const { data, error } = await supabase
        .from('workouts')
        .insert([planData])
        .select()
        .single();
      
      if (error) throw error;
      return data as WorkoutPlan;
    }
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};
