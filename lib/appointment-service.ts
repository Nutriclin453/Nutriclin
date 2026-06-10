import { supabase } from './supabase';
import { isMockEnabled, getAppointments, saveAppointment, deleteAppointment, Appointment } from './mock-db';

const handleFetchError = <T>(error: any, fallback: () => T): T | Promise<T> => {
  console.warn('Supabase or database error in AppointmentService. Falling back to safe local mock database.', error);
  return fallback();
};

export const AppointmentService = {
  async getAll() {
    if (isMockEnabled()) {
      return getAppointments();
    }

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) return [];

      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('created_by', userData.user.id)
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (error) {
        // If table doesn't exist, fallback to mock
        if (error.code === '42P01') {
          console.warn('Table appointments not found. Using mock storage.');
          return getAppointments();
        }
        throw error;
      }

      return (data || []).map(app => ({
        id: app.id,
        patientId: app.patient_id,
        patientName: app.patient_name,
        date: app.date,
        time: app.time,
        notes: app.notes,
        status: app.status,
        createdBy: app.created_by,
        createdAt: app.created_at
      })) as Appointment[];
    } catch (err) {
      return handleFetchError(err, () => getAppointments());
    }
  },

  async getByDate(date: string) {
    const all = await this.getAll();
    return all.filter(app => app.date === date);
  },

  async create(app: Omit<Appointment, 'id' | 'createdAt'>) {
    if (isMockEnabled()) {
      return saveAppointment(app as Appointment);
    }

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) throw new Error('User not authenticated');

      const payload = {
        patient_id: app.patientId,
        patient_name: app.patientName,
        date: app.date,
        time: app.time,
        notes: app.notes,
        status: app.status,
        created_by: userData.user.id
      };

      const { data, error } = await supabase
        .from('appointments')
        .insert([payload])
        .select()
        .single();

      if (error) {
        if (error.code === '42P01') {
          return saveAppointment(app as Appointment);
        }
        throw error;
      }

      return {
        id: data.id,
        patientId: data.patient_id,
        patientName: data.patient_name,
        date: data.date,
        time: data.time,
        notes: data.notes,
        status: data.status,
        createdBy: data.created_by,
        createdAt: data.created_at
      } as Appointment;
    } catch (err) {
      return handleFetchError(err, () => saveAppointment(app as Appointment));
    }
  },

  async delete(id: string) {
    if (isMockEnabled() || id.startsWith('app-')) {
      return deleteAppointment(id);
    }

    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      return handleFetchError(err, () => deleteAppointment(id));
    }
  }
};
