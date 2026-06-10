import { supabase } from './supabase';
import { isMockEnabled, getPatients, savePatient, deletePatient, setForceMock, getEvaluations } from './mock-db';

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
  console.warn('Supabase or database error in PatientService. Falling back to safe local mock database.', error);
  setForceMock(true);
  return fallback();
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
    let rawPatients: Patient[] = [];
    let fetchedLeads: any[] = [];
    let fetchedEvaluations: any[] = [];

    if (isMockEnabled()) {
      rawPatients = getPatients();
      fetchedEvaluations = getEvaluations();
      try {
        const item = typeof window !== 'undefined' ? localStorage.getItem('mock_leads') : null;
        if (item) fetchedLeads = JSON.parse(item);
      } catch (_) {}
    } else {
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
        rawPatients = (data || []).map(p => ({
          ...p,
          birthDate: p.birth_date,
          lastVisit: p.last_visit ? { toDate: () => new Date(p.last_visit) } : null,
          createdBy: p.created_by,
          createdAt: p.created_at
        }));

        try {
          const { data: leadsData } = await supabase
            .from('leads')
            .select('*');
          if (leadsData) fetchedLeads = leadsData;
        } catch (e) {
          console.warn('Could not fetch leads for patient enrichment:', e);
        }

        try {
          const { data: evalsData } = await supabase
            .from('evaluations')
            .select('*');
          if (evalsData) fetchedEvaluations = evalsData;
        } catch (e) {
          console.warn('Could not fetch evaluations for patient enrichment:', e);
        }
      } catch (err) {
        return handleFetchError(err, () => {
          rawPatients = getPatients();
          fetchedEvaluations = getEvaluations();
          try {
            const item = typeof window !== 'undefined' ? localStorage.getItem('mock_leads') : null;
            if (item) fetchedLeads = JSON.parse(item);
          } catch (_) {}

          const findLatestEvaluationDate = (patientName: string) => {
            const pName = patientName.toLowerCase().trim();
            const patientEvals = fetchedEvaluations.filter(ev => {
              const evName = (ev.patientName || ev.patient_name || '').toLowerCase().trim();
              return evName === pName;
            });
            if (patientEvals.length === 0) return null;
            
            const times = patientEvals.map(ev => {
              const rawDate = ev.createdAt || ev.created_at;
              if (!rawDate) return 0;
              const t = new Date(rawDate).getTime();
              return isNaN(t) ? 0 : t;
            }).filter(t => t > 0);
            
            if (times.length === 0) return null;
            return new Date(Math.max(...times));
          };

          return rawPatients.map(p => {
            let calculatedAge: number | undefined = undefined;
            if (p.birthDate) {
              const birth = new Date(p.birthDate);
              if (!isNaN(birth.getTime())) {
                calculatedAge = new Date().getFullYear() - birth.getFullYear();
              }
            }
            const matchingLead = fetchedLeads.find(l => 
              (l.email && p.email && l.email.toLowerCase().trim() === p.email.toLowerCase().trim()) ||
              (l.name && p.name && l.name.toLowerCase().trim() === p.name.toLowerCase().trim())
            );

            let latestVisitDate: Date | null = null;
            const lv = p.lastVisit || (p as any).last_visit;
            if (lv) {
              try {
                let d: Date;
                if (typeof lv.toDate === 'function') {
                  d = lv.toDate();
                } else {
                  d = new Date(lv);
                }
                if (!isNaN(d.getTime())) {
                  latestVisitDate = d;
                }
              } catch (_) {}
            }
            
            const evalDate = findLatestEvaluationDate(p.name);
            if (evalDate) {
              if (!latestVisitDate || evalDate.getTime() > latestVisitDate.getTime()) {
                latestVisitDate = evalDate;
              }
            }

            return {
              ...p,
              lastVisit: latestVisitDate ? { toDate: () => latestVisitDate } : null,
              age: calculatedAge ?? p.age ?? p.idade ?? matchingLead?.age ?? matchingLead?.idade,
              idade: calculatedAge ?? p.idade ?? p.age ?? matchingLead?.idade ?? matchingLead?.age,
              weight: p.weight ?? p.peso ?? matchingLead?.weight ?? matchingLead?.peso,
              peso: p.weight ?? p.peso ?? matchingLead?.weight ?? matchingLead?.peso,
              height: p.height ?? p.altura ?? matchingLead?.height ?? matchingLead?.altura,
              altura: p.height ?? p.altura ?? matchingLead?.height ?? matchingLead?.altura,
              gender: p.gender ?? p.genero ?? matchingLead?.gender ?? matchingLead?.genero,
              genero: p.gender ?? p.genero ?? matchingLead?.gender ?? matchingLead?.genero,
            };
          });
        });
      }
    }

    const findLatestEvaluationDate = (patientName: string) => {
      const pName = patientName.toLowerCase().trim();
      const patientEvals = fetchedEvaluations.filter(ev => {
        const evName = (ev.patientName || ev.patient_name || '').toLowerCase().trim();
        return evName === pName;
      });
      if (patientEvals.length === 0) return null;
      
      const times = patientEvals.map(ev => {
        const rawDate = ev.createdAt || ev.created_at;
        if (!rawDate) return 0;
        const t = new Date(rawDate).getTime();
        return isNaN(t) ? 0 : t;
      }).filter(t => t > 0);
      
      if (times.length === 0) return null;
      return new Date(Math.max(...times));
    };

    return (rawPatients || []).map(p => {
      let calculatedAge: number | undefined = undefined;
      const bDate = p.birthDate || (p as any).birth_date;
      if (bDate) {
        const birth = new Date(bDate);
        if (!isNaN(birth.getTime())) {
          calculatedAge = new Date().getFullYear() - birth.getFullYear();
        }
      }

      const matchingLead = fetchedLeads.find(l => 
        (l.email && p.email && l.email.toLowerCase().trim() === p.email.toLowerCase().trim()) ||
        (l.name && p.name && l.name.toLowerCase().trim() === p.name.toLowerCase().trim())
      );

      let latestVisitDate: Date | null = null;
      const lv = p.lastVisit || (p as any).last_visit;
      if (lv) {
        try {
          let d: Date;
          if (typeof lv.toDate === 'function') {
            d = lv.toDate();
          } else {
            d = new Date(lv);
          }
          if (!isNaN(d.getTime())) {
            latestVisitDate = d;
          }
        } catch (_) {}
      }
      
      const evalDate = findLatestEvaluationDate(p.name);
      if (evalDate) {
        if (!latestVisitDate || evalDate.getTime() > latestVisitDate.getTime()) {
          latestVisitDate = evalDate;
        }
      }

      return {
        ...p,
        lastVisit: latestVisitDate ? { toDate: () => latestVisitDate } : null,
        birthDate: bDate,
        age: calculatedAge ?? p.age ?? p.idade ?? matchingLead?.age ?? matchingLead?.idade,
        idade: calculatedAge ?? p.idade ?? p.age ?? matchingLead?.idade ?? matchingLead?.age,
        weight: p.weight ?? p.peso ?? matchingLead?.weight ?? matchingLead?.peso,
        peso: p.weight ?? p.peso ?? matchingLead?.weight ?? matchingLead?.peso,
        height: p.height ?? p.altura ?? matchingLead?.height ?? matchingLead?.altura,
        altura: p.height ?? p.altura ?? matchingLead?.height ?? matchingLead?.altura,
        gender: p.gender ?? p.genero ?? matchingLead?.gender ?? matchingLead?.genero,
        genero: p.gender ?? p.genero ?? matchingLead?.gender ?? matchingLead?.genero,
        createdBy: p.createdBy || (p as any).created_by,
        createdAt: p.createdAt || (p as any).created_at
      };
    }) as unknown as Patient[];
  },

  async delete(id: string) {
    if (isMockEnabled()) {
      deletePatient(id);
      return;
    }

    try {
      // 1. Fetch patient name before deleting them so we can clean up appointments by name match as well
      const { data: patientData } = await supabase
        .from('patients')
        .select('name')
        .eq('id', id)
        .maybeSingle();

      const patientName = patientData?.name;

      // 2. Delete appointments belonging to this patient's ID
      await supabase
        .from('appointments')
        .delete()
        .eq('patient_id', id);

      // 3. Delete appointments matching this patient's Name (e.g. if entered as draft or matching name string)
      if (patientName) {
        await supabase
          .from('appointments')
          .delete()
          .eq('patient_name', patientName);
      }

      // 4. Delete the patient node itself
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
