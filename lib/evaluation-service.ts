import { supabase } from './supabase';
import { isMockEnabled, getEvaluations, saveEvaluation, deleteEvaluation, setForceMock } from './mock-db';

export interface Skinfolds {
  tricipital?: number;
  subescapular?: number;
  subaxilar?: number;
  peitoral?: number;
  abdomen?: number;
  suprailiaca?: number;
  coxa?: number;
}

export function calculatePollock7FromFields(skinfolds: any, age: any, gender: string): number | undefined {
  if (!skinfolds || !age) return undefined;
  const tricipital = Number(skinfolds.tricipital);
  const subescapular = Number(skinfolds.subescapular);
  const subaxilar = Number(skinfolds.subaxilar);
  const peitoral = Number(skinfolds.peitoral);
  const abdomen = Number(skinfolds.abdomen);
  const suprailiaca = Number(skinfolds.suprailiaca);
  const coxa = Number(skinfolds.coxa);
  const numAge = Number(age);

  if (tricipital && subescapular && subaxilar && peitoral && abdomen && suprailiaca && coxa && numAge) {
    const sum7 = tricipital + subescapular + subaxilar + peitoral + abdomen + suprailiaca + coxa;
    const isMale = String(gender).toLowerCase() === 'male' || String(gender).toLowerCase().startsWith('masc');
    let density;
    if (isMale) {
      density = 1.112 - (0.00043499 * sum7) + (0.00000055 * sum7 * sum7) - (0.00028826 * numAge);
    } else {
      density = 1.097 - (0.00046971 * sum7) + (0.00000056 * sum7 * sum7) - (0.00012828 * numAge);
    }
    const bf = ((4.95 / density) - 4.50) * 100;
    return Number(bf.toFixed(1));
  }
  return undefined;
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
  attendanceNote?: string;
  createdBy?: string;
  createdAt?: any;
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

export const EvaluationService = {
  async create(data: Omit<Evaluation, 'createdBy' | 'createdAt'>) {
    const runMockFallback = () => {
      const saved = saveEvaluation({
        patient_name: data.patientName,
        gender: data.gender,
        weight: Number(data.weight),
        height: Number(data.height),
        age: Number(data.age),
        objective: data.objective,
        waist: Number(data.waist),
        abdominal: Number(data.abdominal),
        neck: Number(data.neck),
        skinfolds: data.skinfolds,
        bmi: Number(data.bmi),
        body_fat: data.bodyFat,
        tdee: Number(data.tdee),
        attendance_note: data.attendanceNote,
        created_by: '1'
      });
      return {
        id: saved.id,
        patientName: saved.patient_name,
        gender: saved.gender,
        weight: saved.weight,
        height: saved.height,
        age: saved.age,
        objective: saved.objective,
        waist: saved.waist,
        abdominal: saved.abdominal,
        neck: saved.neck,
        skinfolds: saved.skinfolds || {},
        bmi: saved.bmi,
        bodyFat: saved.body_fat,
        tdee: saved.tdee,
        attendanceNote: saved.attendance_note,
        createdBy: saved.created_by,
        createdAt: saved.created_at ? { toDate: () => new Date(saved.created_at) } : null
      } as Evaluation;
    };

    if (isMockEnabled()) {
      return runMockFallback();
    }

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) {
        if (userError.message && (userError.message.includes('fetch') || userError.message.includes('network'))) {
          throw userError;
        }
      }
      if (userError || !userData.user) throw new Error('User not authenticated');
      
      // Transform JS camelCase to snake_case for Supabase
      // We also duplicate body_fat into skinfolds so we have a solid JSON fallback
      const dbData: any = {
        patient_name: data.patientName,
        gender: data.gender,
        weight: data.weight,
        height: data.height,
        age: data.age,
        objective: data.objective,
        waist: data.waist,
        abdominal: data.abdominal,
        neck: data.neck,
        skinfolds: { ...data.skinfolds, body_fat: data.bodyFat },
        bmi: data.bmi,
        tdee: data.tdee,
        body_fat: data.bodyFat,
        attendance_note: data.attendanceNote,
        created_by: userData.user.id,
        created_at: data.createdAt
      };

      const { data: newEval, error } = await supabase
        .from('evaluations')
        .insert([dbData])
        .select()
        .single();

      if (error) {
        // Fallback if missing columns exist in user's current schema
        if (
          error.message.includes('does not exist') ||
          error.message.includes('schema cache') ||
          error.message.includes('Could not find')
        ) {
          const { body_fat, attendance_note, ...rest } = dbData;
          const { data: retryEval, error: retryError } = await supabase
            .from('evaluations')
            .insert([rest])
            .select()
            .single();
            
          if (retryError) throw retryError;
          return retryEval;
        }
        throw error;
      }
      return newEval;
    } catch (err: any) {
      return handleFetchError(err, runMockFallback);
    }
  },

  async getAll() {
    const runMockFallback = () => {
      const listData = getEvaluations();
      return (listData || []).map(e => ({
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
        bodyFat: e.body_fat !== undefined && e.body_fat !== null 
          ? Number(e.body_fat) 
          : (e.skinfolds?.body_fat !== undefined && e.skinfolds?.body_fat !== null
            ? Number(e.skinfolds.body_fat)
            : (e.skinfolds?.bodyFat !== undefined && e.skinfolds?.bodyFat !== null
              ? Number(e.skinfolds.bodyFat)
              : calculatePollock7FromFields(e.skinfolds, e.age, e.gender)
            )
          ),
        tdee: e.tdee,
        attendanceNote: e.attendance_note,
        createdBy: e.created_by,
        createdAt: e.created_at ? { toDate: () => new Date(e.created_at) } : null
      })) as unknown as Evaluation[];
    };

    if (isMockEnabled()) {
      return runMockFallback();
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
        .from('evaluations')
        .select('*')
        .eq('created_by', userData.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase Error (getAll evals):', error);
        throw error;
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
        bodyFat: e.body_fat !== undefined && e.body_fat !== null 
          ? Number(e.body_fat) 
          : (e.skinfolds?.body_fat !== undefined && e.skinfolds?.body_fat !== null
            ? Number(e.skinfolds.body_fat)
            : (e.skinfolds?.bodyFat !== undefined && e.skinfolds?.bodyFat !== null
              ? Number(e.skinfolds.bodyFat)
              : calculatePollock7FromFields(e.skinfolds, e.age, e.gender)
            )
          ),
        tdee: e.tdee,
        attendanceNote: e.attendance_note,
        createdBy: e.created_by,
        createdAt: e.created_at ? { toDate: () => new Date(e.created_at) } : null
      })) as unknown as Evaluation[];
    } catch (err) {
      return handleFetchError(err, runMockFallback);
    }
  },

  async update(id: string, data: Partial<Evaluation>) {
    const runMockFallback = () => {
      // Basic mock update: get all, modify, and save back isn't fully implemented in mock-db,
      // but we will do a saveEvaluation which might not exist for update.
      // Assuming a simplistic approach. This is minimal required for mock.
      const current = getEvaluations().find(e => e.id === id);
      if (current) {
        deleteEvaluation(id);
        const updated = {
          ...current,
          ...data,
          patient_name: data.patientName ?? current.patient_name,
          body_fat: data.bodyFat ?? current.body_fat,
          attendance_note: data.attendanceNote ?? current.attendance_note,
        };
        saveEvaluation(updated);
      }
      return data as Evaluation;
    };

    if (isMockEnabled()) {
      return runMockFallback();
    }

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) {
        if (userError.message && (userError.message.includes('fetch') || userError.message.includes('network'))) {
          throw userError;
        }
      }
      if (userError || !userData.user) throw new Error('User not authenticated');

      const dbData: any = {};
      if (data.patientName !== undefined) dbData.patient_name = data.patientName;
      if (data.gender !== undefined) dbData.gender = data.gender;
      if (data.weight !== undefined) dbData.weight = data.weight;
      if (data.height !== undefined) dbData.height = data.height;
      if (data.age !== undefined) dbData.age = data.age;
      if (data.objective !== undefined) dbData.objective = data.objective;
      if (data.waist !== undefined) dbData.waist = data.waist;
      if (data.abdominal !== undefined) dbData.abdominal = data.abdominal;
      if (data.neck !== undefined) dbData.neck = data.neck;
      if (data.skinfolds !== undefined) dbData.skinfolds = { ...data.skinfolds, body_fat: data.bodyFat };
      if (data.bmi !== undefined) dbData.bmi = data.bmi;
      if (data.tdee !== undefined) dbData.tdee = data.tdee;
      if (data.bodyFat !== undefined) dbData.body_fat = data.bodyFat;
      if (data.attendanceNote !== undefined) dbData.attendance_note = data.attendanceNote;
      if (data.createdAt !== undefined) dbData.created_at = data.createdAt;

      const { data: updatedEval, error } = await supabase
        .from('evaluations')
        .update(dbData)
        .eq('id', id)
        .select()
        .single();
        
      if (error) {
        console.error("Supabase update error:", JSON.stringify(error, null, 2));
        if (
          error.message && (
            error.message.includes('does not exist') ||
            error.message.includes('schema cache') ||
            error.message.includes('Could not find')
          )
        ) {
          const { body_fat, attendance_note, ...rest } = dbData;
          const { data: retryEval, error: retryError } = await supabase
            .from('evaluations')
            .update(rest)
            .eq('id', id)
            .select()
            .single();
            
          if (retryError) {
            console.error("Supabase update retry error:", JSON.stringify(retryError, null, 2));
            throw retryError;
          }
          return retryEval;
        }
        throw new Error(`Update failed: ${error.message} (Code: ${error.code})`);
      }
      return updatedEval;
    } catch (err: any) {
      return handleFetchError(err, runMockFallback);
    }
  },

  async delete(id: string) {
    if (isMockEnabled()) {
      deleteEvaluation(id);
      return;
    }

    try {
      const { error } = await supabase
        .from('evaluations')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase Error (delete eval):', error);
        throw new Error(error.message || JSON.stringify(error));
      }
    } catch (err) {
      return handleFetchError(err, () => {
        deleteEvaluation(id);
      });
    }
  }
};
