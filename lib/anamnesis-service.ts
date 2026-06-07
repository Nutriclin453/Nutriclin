import { supabase } from './supabase';
import { isMockEnabled } from './mock-db';

export interface Anamnesis {
  id?: string;
  patientId: string;
  allergies?: string;
  medications?: string;
  diseases?: string;
  waterIntake?: number;
  waterTarget?: number;
  sleepQuality?: 'Excelente' | 'Boa' | 'Regular' | 'Ruim' | '';
  bowelHabit?: 'Regular' | 'Constipado' | 'Diarreico' | 'Irritável' | '';
  physicalActivity?: string;
  preferredFoods?: string;
  dislikedFoods?: string;
  notes?: string;
  updatedAt?: string;
}

const getLocalAnamnesisKey = (patientId: string) => `mock_anamnesis_${patientId}`;

export const AnamnesisService = {
  async getByPatientId(patientId: string): Promise<Anamnesis | null> {
    if (isMockEnabled()) {
      if (typeof window !== 'undefined') {
        const data = localStorage.getItem(getLocalAnamnesisKey(patientId));
        return data ? JSON.parse(data) : null;
      }
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('anamnesis')
        .select('*')
        .eq('patient_id', patientId)
        .maybeSingle();

      if (error) {
        // Table doesn't exist or other error, fallback to local
        throw error;
      }

      if (data) {
        return {
          id: data.id,
          patientId: data.patient_id,
          allergies: data.allergies,
          medications: data.medications,
          diseases: data.diseases,
          waterIntake: data.water_intake,
          waterTarget: data.water_target,
          sleepQuality: data.sleep_quality,
          bowelHabit: data.bowel_habit,
          physicalActivity: data.physical_activity,
          preferredFoods: data.preferred_foods,
          dislikedFoods: data.disliked_foods,
          notes: data.notes,
          updatedAt: data.updated_at
        };
      }
      return null;
    } catch (err) {
      console.warn('Supabase anamnesis table call failed, using localStorage fallback', err);
      if (typeof window !== 'undefined') {
        const data = localStorage.getItem(getLocalAnamnesisKey(patientId));
        return data ? JSON.parse(data) : null;
      }
      return null;
    }
  },

  async save(patientId: string, data: Omit<Anamnesis, 'id' | 'patientId'>): Promise<Anamnesis> {
    const anamnesisPayload: Anamnesis = {
      ...data,
      patientId,
      updatedAt: new Date().toISOString()
    };

    if (isMockEnabled()) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(getLocalAnamnesisKey(patientId), JSON.stringify(anamnesisPayload));
      }
      return anamnesisPayload;
    }

    try {
      // Check if table exists by doing simple fetch, then insert or update
      const existing = await this.getByPatientId(patientId);
      
      const payload: any = {
        patient_id: patientId,
        allergies: data.allergies || '',
        medications: data.medications || '',
        diseases: data.diseases || '',
        water_intake: data.waterIntake || 0,
        water_target: data.waterTarget || 0,
        sleep_quality: data.sleepQuality || '',
        bowel_habit: data.bowelHabit || '',
        physical_activity: data.physicalActivity || '',
        preferred_foods: data.preferredFoods || '',
        disliked_foods: data.dislikedFoods || '',
        notes: data.notes || '',
        updated_at: new Date().toISOString()
      };

      if (existing) {
        const { error } = await supabase
          .from('anamnesis')
          .update(payload)
          .eq('patient_id', patientId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('anamnesis')
          .insert([payload]);
        if (error) throw error;
      }
      return anamnesisPayload;
    } catch (err) {
      console.warn('Failed to save to Supabase anamnesis table, saving to localStorage fallback', err);
      if (typeof window !== 'undefined') {
        localStorage.setItem(getLocalAnamnesisKey(patientId), JSON.stringify(anamnesisPayload));
      }
      return anamnesisPayload;
    }
  }
};
