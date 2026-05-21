import { supabase } from './supabase';
import { isMockEnabled } from './mock-db';

export interface Lead {
  id?: string;
  name: string;
  email: string;
  phone: string;
  goal?: string;
  service_type?: string;
  age?: number;
  weight?: number;
  height?: number;
  created_at?: string;
}

const getMockLeads = (): Lead[] => {
  if (typeof window === 'undefined') return [];
  try {
    const item = localStorage.getItem('mock_leads');
    return item ? JSON.parse(item) : [];
  } catch (e) {
    return [];
  }
};

const saveMockLead = (lead: Lead): Lead => {
  if (typeof window === 'undefined') return lead;
  const list = getMockLeads();
  const newLead = {
    ...lead,
    id: 'lead-' + Math.random().toString(36).substr(2, 9),
    created_at: new Date().toISOString()
  };
  list.push(newLead);
  localStorage.setItem('mock_leads', JSON.stringify(list));
  return newLead;
};

export const LeadService = {
  async create(data: Omit<Lead, 'id' | 'created_at'>) {
    if (isMockEnabled()) {
      return saveMockLead(data);
    }
    try {
      // Map properties both in Portuguese and English to support whatever column names they configured
      const payload: any = {
        name: data.name,
        nome: data.name,
        email: data.email,
        phone: data.phone,
        whatsapp: data.phone,
        telefone: data.phone,
        service_type: data.service_type,
        tipo_atendimento: data.service_type,
        atendimento: data.service_type,
        age: data.age,
        idade: data.age,
        weight: data.weight,
        peso: data.weight,
        height: data.height,
        altura: data.height
      };
      
      if (data.goal) {
        payload.goal = data.goal;
        payload.objetivo = data.goal;
      }

      // Try standard insert first
      const { data: newLead, error } = await supabase
        .from('leads')
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.warn('Insertion failed with full payload, trying with custom subset...', error);
        
        // Let's inspect column error or try subsets
        const isColumnError = error.message?.includes('column') || error.code === '42703';
        if (isColumnError) {
          // Try inserting a minimized English object first
          try {
            const { data: resEng, error: errEng } = await supabase
              .from('leads')
              .insert([{ 
                name: data.name, 
                email: data.email, 
                phone: data.phone, 
                goal: data.goal,
                service_type: data.service_type,
                age: data.age,
                weight: data.weight,
                height: data.height
              }])
              .select()
              .single();
            if (!errEng) return resEng;
          } catch (_) {}
          
          // Try inserting a minimized Portuguese object
          try {
            const { data: resPt, error: errPt } = await supabase
              .from('leads')
              .insert([{ 
                nome: data.name, 
                email: data.email, 
                whatsapp: data.phone, 
                objetivo: data.goal,
                tipo_atendimento: data.service_type,
                idade: data.age,
                peso: data.weight,
                altura: data.height
              }])
              .select()
              .single();
            if (!errPt) return resPt;
          } catch (_) {}
        }
        
        throw new Error(error.message || JSON.stringify(error));
      }
      return newLead;
    } catch (err) {
      console.warn('Supabase Lead insertion failed, saving to local mock storage:', err);
      return saveMockLead(data);
    }
  }
};
