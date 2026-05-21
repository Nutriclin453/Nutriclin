import { supabase } from './supabase';
import { isMockEnabled, getPatients, savePatient, deletePatient, setForceMock } from './mock-db';

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
  weight?: number;
  height?: number;
}

const handleFetchError = <T>(error: any, fallback: () => T): T | Promise<T> => {
  const msg = error.message || String(error);
  if (msg.includes('Failed to fetch') || msg.includes('fetch') || msg.includes('NetworkError') || msg.includes('network') || msg.includes('TypeError')) {
    console.warn('Network or fetch error detected with Supabase. Switching to local mock state.', error);
    setForceMock(true);
    return fallback();
  }
  throw error;
};

export const PatientService = {
  async create(data: Omit<Patient, 'id' | 'createdBy' | 'createdAt'>) {
    if (isMockEnabled()) {
      return savePatient(data as any);
    }

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) {
        if (userError.message && (userError.message.includes('fetch') || userError.message.includes('network'))) {
          throw userError;
        }
      }
      if (userError || !userData.user) throw new Error('User not authenticated');
      
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { birthDate, lastVisit, ...restData } = data;

      const payload: any = {
        ...restData,
        birth_date: birthDate,
        last_visit: lastVisit,
        created_by: userData.user.id
      };

      const { data: newPatient, error } = await supabase
        .from('patients')
        .insert([payload])
        .select()
        .single();

      if (error) {
        const isColumnError = error.message?.includes('column') || error.code === '42703';
        if (isColumnError) {
          console.warn('Patient creation failed with full columns, trying without weight/height...', error);
          const { weight, height, ...cleanPayload } = payload;
          const { data: retryPatient, error: retryError } = await supabase
            .from('patients')
            .insert([cleanPayload])
            .select()
            .single();

          if (!retryError) {
            return retryPatient;
          }
          throw retryError;
        }

        console.error('Supabase Error (create):', error);
        throw new Error(error.message || JSON.stringify(error));
      }
      return newPatient;
    } catch (err) {
      return handleFetchError(err, () => savePatient(data as any));
    }
  },

  async update(id: string, data: Partial<Omit<Patient, 'id' | 'createdBy' | 'createdAt'>>) {
    if (isMockEnabled()) {
      return savePatient({ id, ...data } as any);
    }

    try {
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
        const isColumnError = error.message?.includes('column') || error.code === '42703';
        if (isColumnError) {
          console.warn('Patient update failed with full columns, trying without weight/height...', error);
          const { weight, height, ...cleanUpdateData } = updateData;
          const { data: retryPatient, error: retryError } = await supabase
            .from('patients')
            .update(cleanUpdateData)
            .eq('id', id)
            .select()
            .single();

          if (!retryError) {
            return retryPatient;
          }
          throw retryError;
        }

        console.error('Supabase Error (update):', error);
        throw new Error(error.message || JSON.stringify(error));
      }
      return updatedPatient;
    } catch (err) {
      return handleFetchError(err, () => savePatient({ id, ...data } as any));
    }
  },

  async getAll() {
    if (isMockEnabled()) {
      return getPatients();
    }

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) {
        if (userError.message && (userError.message.includes('fetch') || userError.message.includes('network'))) {
          throw userError;
        }
      }
      if (userError || !userData.user) return [];
      
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('created_by', userData.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase Error (getAll):', error);
        throw error;
      }
      return (data || []).map(p => ({
          ...p,
          lastVisit: p.last_visit ? { toDate: () => new Date(p.last_visit) } : null,
          birthDate: p.birth_date,
          createdBy: p.created_by,
          createdAt: p.created_at
      })) as unknown as Patient[];
    } catch (err) {
      return handleFetchError(err, () => getPatients());
    }
  },

  async delete(id: string) {
    if (isMockEnabled()) {
      deletePatient(id);
      return;
    }

    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase Error (delete):', error);
        throw new Error(error.message || JSON.stringify(error));
      }
    } catch (err) {
      return handleFetchError(err, () => {
        deletePatient(id);
      });
    }
  }
};
