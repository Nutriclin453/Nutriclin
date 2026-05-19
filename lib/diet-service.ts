import { supabase } from './supabase';

export interface Meal {
  id: string; // for internal react keys
  name: string;
  time: string;
  kcal: number;
  items: string[];
  tag?: string;
}

export interface Macros {
  protein: number;
  carbs: number;
  fats: number;
  proteinPct: number;
  carbsPct: number;
  fatsPct: number;
}

export interface Diet {
  id?: string;
  patient_id: string;
  patient_name?: string;
  goal?: string;
  meals: Meal[];
  macros: Macros;
  notes?: string;
  created_at?: string;
}

export const DietService = {
  async getAll() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('diets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === '42P01') {
         throw new Error("Tabela de dieta não existe.");
      }
      if (error.message?.includes('schema cache')) {
         throw new Error("A tabela foi criada, mas o Supabase precisa atualizar o cache. Vá em Project Settings > API > e clique em 'Reload Schema Cache', ou aguarde uns minutos e recarregue a página.");
      }
      throw error;
    }
    return data as Diet[];
  },

  async getByPatientId(patientId: string) {
    const { data, error } = await supabase
      .from('diets')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });
    
    if (error) {
       if (error.code === '42P01') {
         throw new Error("Tabela de dieta não existe.");
       }
       if (error.message?.includes('schema cache')) {
         throw new Error("A tabela foi criada, mas o Supabase precisa atualizar o cache. Vá em Project Settings > API > e clique em 'Reload Schema Cache', ou aguarde uns minutos e recarregue a página.");
       }
      throw error;
    }
    return data as Diet[];
  },

  async save(diet: Diet) {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('User not authenticated');

    const dietData: any = {
      ...diet,
      created_by: userData.user.id
    };

    if (diet.id) {
       delete dietData.id;
       const { data, error } = await supabase
        .from('diets')
        .update(dietData)
        .eq('id', diet.id)
        .select()
        .single();
        
      if (error) {
        if (error.code === '42P01') {
          throw new Error("Tabela de dieta não existe.");
        }
        if (error.message?.includes('schema cache')) {
          throw new Error("A tabela foi criada, mas o Supabase precisa atualizar o cache. Vá em Project Settings > API > e clique em 'Reload Schema Cache', ou aguarde uns minutos e recarregue a página.");
        }
        throw error;
      }
      return data;
    } else {
      delete dietData.id;
      const { data, error } = await supabase
        .from('diets')
        .insert([dietData])
        .select()
        .single();
      
      if (error) {
        if (error.code === '42P01') {
          throw new Error("Tabela de dieta não existe.");
        }
        if (error.message?.includes('schema cache')) {
          throw new Error("A tabela foi criada, mas o Supabase precisa atualizar o cache. Vá em Project Settings > API > e clique em 'Reload Schema Cache', ou aguarde uns minutos e recarregue a página.");
        }
        throw error;
      }
      return data;
    }
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('diets')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};
