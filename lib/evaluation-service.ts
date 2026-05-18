import { supabase } from './supabase';

export interface Skinfolds {
  tricipital?: number;
  subescapular?: number;
  subaxilar?: number;
  peitoral?: number;
  abdomen?: number;
  suprailiaca?: number;
  coxa?: number;
}

export interface Evaluation {
  id?: string;
  patientName: string;
  gender: 'male' | 'female';
  weight: number;
  height: number;
  age?: number;
  objective?: string;
  waist?: number;
  abdominal?: number;
  neck?: number;
  skinfolds: Skinfolds;
  bmi: number;
  bodyFat?: number;
  tdee: number;
  createdBy?: string;
  createdAt?: any;
}

export const EvaluationService = {
  async create(data: Omit<Evaluation, 'createdBy' | 'createdAt'>) {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('User not authenticated');
    
    // Transform JS camelCase to snake_case for Supabase
    const dbData = {
      patient_name: data.patientName,
      gender: data.gender,
      weight: data.weight,
      height: data.height,
      age: data.age,
      objective: data.objective,
      waist: data.waist,
      abdominal: data.abdominal,
      neck: data.neck,
      skinfolds: data.skinfolds,
      bmi: data.bmi,
      tdee: data.tdee,
      created_by: userData.user.id
    };

    const { data: newEval, error } = await supabase
      .from('evaluations')
      .insert([dbData])
      .select()
      .single();

    if (error) {
      console.error('Supabase Error (create eval):', error);
      throw new Error(error.message || JSON.stringify(error));
    }
    return newEval;
  },

  async getAll() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return [];
    
    const { data, error } = await supabase
      .from('evaluations')
      .select('*')
      .eq('created_by', userData.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase Error (getAll evals):', error);
      const msg = error.message || JSON.stringify(error);
      throw new Error(msg === 'Failed to fetch' ? 'Failed to fetch (Falha na conexão). Verifique se sua variável NEXT_PUBLIC_SUPABASE_URL está correta e com https://' : msg);
    }
    
    return (data || []).map(e => ({
      id: e.id,
      patientName: e.patient_name,
      gender: e.gender,
      weight: e.weight,
      height: e.height,
      age: e.age,
      objective: e.objective,
      waist: e.waist,
      abdominal: e.abdominal,
      neck: e.neck,
      skinfolds: e.skinfolds || {},
      bmi: e.bmi,
      tdee: e.tdee,
      createdBy: e.created_by,
      createdAt: e.created_at ? { toDate: () => new Date(e.created_at) } : null
    })) as unknown as Evaluation[];
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('evaluations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase Error (delete eval):', error);
      throw new Error(error.message || JSON.stringify(error));
    }
  }
};
