import { supabase } from './supabase';

export interface Patient {
  id?: string;
  name: string;
  email: string;
  phone: string;
  goal: string;
  status: 'Ativo' | 'Inativo';
  lastVisit?: any | null; // using any for dates as they come back as string from Supabase but used as firestore Timestamp. I will fix the UI side soon.
  birthDate?: string | null;
  gender?: 'Masculino' | 'Feminino' | 'Outro' | null;
  createdBy?: string;
  createdAt?: any;
}

export const PatientService = {
  async create(data: Omit<Patient, 'id' | 'createdBy' | 'createdAt'>) {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('User not authenticated');
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { birthDate, lastVisit, ...restData } = data;

    const { data: newPatient, error } = await supabase
      .from('patients')
      .insert([
        {
          ...restData,
          birth_date: birthDate,
          last_visit: lastVisit,
          created_by: userData.user.id
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase Error (create):', error);
      throw new Error(error.message || JSON.stringify(error));
    }
    return newPatient;
  },

  async update(id: string, data: Partial<Omit<Patient, 'id' | 'createdBy' | 'createdAt'>>) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { birthDate, lastVisit, ...restData } = data;
    const updateData: any = { ...restData };
    
    if (birthDate !== undefined) updateData.birth_date = birthDate;
    if (lastVisit !== undefined) updateData.last_visit = lastVisit;

    const { data: updatedPatient, error } = await supabase
      .from('patients')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase Error (update):', error);
      throw new Error(error.message || JSON.stringify(error));
    }
    return updatedPatient;
  },

  async getAll() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return [];
    
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('created_by', userData.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase Error (getAll):', error);
      const msg = error.message || JSON.stringify(error);
      throw new Error(msg === 'Failed to fetch' ? 'Failed to fetch (Falha na conexão). Verifique se sua variável NEXT_PUBLIC_SUPABASE_URL está correta e com https://' : msg);
    }
    return (data || []).map(p => ({
        ...p,
        lastVisit: p.last_visit ? { toDate: () => new Date(p.last_visit) } : null,
        birthDate: p.birth_date,
        createdBy: p.created_by,
        createdAt: p.created_at
    })) as unknown as Patient[];
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase Error (delete):', error);
      throw new Error(error.message || JSON.stringify(error));
    }
  }
};
