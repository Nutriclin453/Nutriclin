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
      // Find dynamic default nutritionist ID if registered
      let dNutriId: string | null = process.env.NEXT_PUBLIC_NUTRITIONIST_ID || null;
      if (!dNutriId) {
        try {
          const { data: metaRows } = await supabase
            .from('leads')
            .select('email')
            .eq('name', '__NUTRITIONIST_SYSTEM_METADATA_DO_NOT_DELETE__')
            .limit(1);
          if (metaRows && metaRows.length > 0) {
            dNutriId = metaRows[0].email;
          }
        } catch (err) {
          console.warn('Could not load nutritionist dynamic ID metadata:', err);
        }
      }

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

      // If we have the dynamic nutritionist user ID, append candidates
      if (dNutriId) {
        payload.nutritionist_id = dNutriId;
        payload.created_by = dNutriId;
        payload.user_id = dNutriId;
      }

      // Try standard insert first
      let { data: newLead, error } = await supabase
        .from('leads')
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.warn('Insertion failed with full payload, trying with custom subset...', error);
        
        // Try inserting a cleaned English object with only standard columns
        try {
          const engPayload: any = { 
            name: data.name, 
            email: data.email, 
            phone: data.phone, 
            goal: data.goal,
            service_type: data.service_type,
            age: data.age,
            weight: data.weight,
            height: data.height
          };
          if (dNutriId) {
            engPayload.nutritionist_id = dNutriId;
          }
          const { data: resEng, error: errEng } = await supabase
            .from('leads')
            .insert([engPayload])
            .select()
            .single();
          if (!errEng) return resEng;
        } catch (_) {}

        // Try inserting a cleaned Portuguese object
        try {
          const ptPayload: any = { 
            nome: data.name, 
            email: data.email, 
            whatsapp: data.phone, 
            objetivo: data.goal,
            tipo_atendimento: data.service_type,
            idade: data.age,
            peso: data.weight,
            altura: data.height
          };
          if (dNutriId) {
            ptPayload.nutritionist_id = dNutriId;
          }
          const { data: resPt, error: errPt } = await supabase
            .from('leads')
            .insert([ptPayload])
            .select()
            .single();
          if (!errPt) return resPt;
        } catch (_) {}

        // Try stripping all extra candidates (pure minimal insert with standard columns)
        try {
          const minPayload = { 
            name: data.name, 
            email: data.email, 
            phone: data.phone,
            goal: data.goal,
            service_type: data.service_type,
            age: data.age !== undefined && data.age !== null ? Number(data.age) : undefined,
            weight: data.weight !== undefined && data.weight !== null ? Number(data.weight) : undefined,
            height: data.height !== undefined && data.height !== null ? Number(data.height) : undefined
          };
          const { data: resMin, error: errMin } = await supabase
            .from('leads')
            .insert([minPayload])
            .select()
            .single();
          if (!errMin) return resMin;
        } catch (_) {}
        
        throw new Error(error.message || JSON.stringify(error));
      }
      return newLead;
    } catch (err) {
      console.warn('Supabase Lead insertion failed, saving to local mock storage:', err);
      return saveMockLead(data);
    }
  }
};
