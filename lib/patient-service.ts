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
  idade?: number;
  age?: number;
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
      
      const { birthDate, lastVisit, ...restData } = data;

      const payload: any = {
        name: data.name,
        email: data.email || '',
        phone: data.phone || '',
        goal: data.goal || 'Saúde',
        status: data.status || 'Ativo',
        created_by: userData.user.id
      };

      // Add extra columns if they are supported by the database
      if (data.weight !== undefined) payload.weight = data.weight;
      if (data.height !== undefined) payload.height = data.height;
      if (data.idade !== undefined) payload.idade = data.idade;
      if (data.age !== undefined) payload.age = data.age;
      if (lastVisit !== undefined) payload.last_visit = lastVisit;
      if (data.gender !== undefined) payload.gender = data.gender;

      // Handle age / birth_date mapping
      if (birthDate !== undefined && birthDate !== null) {
        payload.birth_date = birthDate;
      } else {
        const anyAge = data.age !== undefined ? data.age : data.idade;
        if (anyAge !== undefined && anyAge !== null && anyAge !== '') {
          const ageNum = parseInt(anyAge.toString(), 10);
          if (!isNaN(ageNum)) {
            const calculatedBirth = new Date();
            calculatedBirth.setFullYear(calculatedBirth.getFullYear() - ageNum);
            calculatedBirth.setMonth(0, 1);
            payload.birth_date = calculatedBirth.toISOString().split('T')[0];
          }
        }
      }

      const { data: newPatient, error } = await supabase
        .from('patients')
        .insert([payload])
        .select()
        .single();

      if (error) {
        const isColumnError = error.message?.includes('column') || error.code === '42703';
        if (isColumnError) {
          console.warn('Patient creation failed with full columns, trying minimal subset...', error);
          const cleanPayload: any = {
            name: data.name,
            email: data.email || '',
            phone: data.phone || '',
            goal: data.goal || 'Saúde',
            status: data.status || 'Ativo',
            created_by: userData.user.id
          };
          if (payload.birth_date !== undefined) {
            cleanPayload.birth_date = payload.birth_date;
          }
          if (payload.gender !== undefined) {
            cleanPayload.gender = payload.gender;
          } else if ((data as any).gender !== undefined) {
            cleanPayload.gender = (data as any).gender;
          } else if ((data as any).genero !== undefined) {
            cleanPayload.gender = (data as any).genero;
          }
          const { data: retryPatient, error: retryError } = await supabase
            .from('patients')
            .insert([cleanPayload])
            .select()
            .single();

          if (!retryError) {
            return {
              ...retryPatient,
              age: data.age ?? data.idade,
              idade: data.idade ?? data.age
            };
          }
          throw retryError;
        }

        console.error('Supabase Error (create):', error);
        throw new Error(error.message || JSON.stringify(error));
      }
      return {
        ...newPatient,
        age: data.age ?? data.idade,
        idade: data.idade ?? data.age
      };
    } catch (err) {
      return handleFetchError(err, () => savePatient(data as any));
    }
  },

  async update(id: string, data: Partial<Omit<Patient, 'id' | 'createdBy' | 'createdAt'>>) {
    if (isMockEnabled()) {
      return savePatient({ id, ...data } as any);
    }

    try {
      const { birthDate, lastVisit, ...restData } = data;
      const updateData: any = { ...restData };
      
      if (lastVisit !== undefined) updateData.last_visit = lastVisit;

      // Handle age / birth_date mapping for update
      if (birthDate !== undefined) {
        updateData.birth_date = birthDate;
      } else {
        const anyAge = data.age !== undefined ? data.age : data.idade;
        if (anyAge !== undefined && anyAge !== null && anyAge !== '') {
          const ageNum = parseInt(anyAge.toString(), 10);
          if (!isNaN(ageNum)) {
            const calculatedBirth = new Date();
            calculatedBirth.setFullYear(calculatedBirth.getFullYear() - ageNum);
            calculatedBirth.setMonth(0, 1);
            updateData.birth_date = calculatedBirth.toISOString().split('T')[0];
          }
        }
      }

      const { data: updatedPatient, error } = await supabase
        .from('patients')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        const isColumnError = error.message?.includes('column') || error.code === '42703';
        if (isColumnError) {
          console.warn('Patient update failed with full columns, trying minimal subset...', error);
          const cleanUpdateData: any = {};
          if (data.name !== undefined) cleanUpdateData.name = data.name;
          if (data.email !== undefined) cleanUpdateData.email = data.email;
          if (data.phone !== undefined) cleanUpdateData.phone = data.phone;
          if (data.goal !== undefined) cleanUpdateData.goal = data.goal;
          if (data.status !== undefined) cleanUpdateData.status = data.status;
          if (updateData.birth_date !== undefined) cleanUpdateData.birth_date = updateData.birth_date;

          const { data: retryPatient, error: retryError } = await supabase
            .from('patients')
            .update(cleanUpdateData)
            .eq('id', id)
            .select()
            .single();

          if (!retryError) {
            return {
              ...retryPatient,
              age: data.age ?? data.idade,
              idade: data.idade ?? data.age
            };
          }
          throw retryError;
        }

        console.error('Supabase Error (update):', error);
        throw new Error(error.message || JSON.stringify(error));
      }
      return {
        ...updatedPatient,
        age: data.age ?? data.idade,
        idade: data.idade ?? data.age
      };
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

      // Fetch all leads to enrich patients with weight, height, and gender from public triage if missing
      let fetchedLeads: any[] = [];
      try {
        const { data: leadsData } = await supabase
          .from('leads')
          .select('*');
        if (leadsData) fetchedLeads = leadsData;
      } catch (e) {
        console.warn('Could not fetch leads for patient enrichment:', e);
      }

      return (data || []).map(p => {
        let calculatedAge: number | undefined = undefined;
        if (p.birth_date) {
          const birth = new Date(p.birth_date);
          if (!isNaN(birth.getTime())) {
            calculatedAge = new Date().getFullYear() - birth.getFullYear();
          }
        }

        const matchingLead = fetchedLeads.find(l => 
          (l.email && p.email && l.email.toLowerCase().trim() === p.email.toLowerCase().trim()) ||
          (l.name && p.name && l.name.toLowerCase().trim() === p.name.toLowerCase().trim())
        );

        return {
          ...p,
          lastVisit: p.last_visit ? { toDate: () => new Date(p.last_visit) } : null,
          birthDate: p.birth_date,
          age: calculatedAge ?? p.age ?? p.idade ?? matchingLead?.age ?? matchingLead?.idade,
          idade: calculatedAge ?? p.idade ?? p.age ?? matchingLead?.idade ?? matchingLead?.age,
          weight: p.weight ?? p.peso ?? matchingLead?.weight ?? matchingLead?.peso,
          height: p.height ?? p.altura ?? matchingLead?.height ?? matchingLead?.altura,
          gender: p.gender ?? p.genero ?? matchingLead?.gender ?? matchingLead?.genero,
          createdBy: p.created_by,
          createdAt: p.created_at
        };
      }) as unknown as Patient[];
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
