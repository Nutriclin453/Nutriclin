'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Plus, 
  Trash2, 
  User, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { AppointmentService } from '@/lib/appointment-service';
import { PatientService, Patient } from '@/lib/patient-service';
import { Appointment } from '@/lib/mock-db';
import { PatientModal } from '@/components/patient-modal';
import { DashboardLayout } from '@/components/dashboard-layout';

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', 
  '13:00', '14:00', '15:00', '16:00', '17:00', 
  '18:00', '19:00', '20:00'
];

// Timezone-safe local date formatting & parsing helpers
const formatDateLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDateLocal = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0); // midday safety against DST shifts
};

export default function AgendaPage() {
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [selectedDate, setSelectedDate] = useState(formatDateLocal(new Date()));
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [monthAppointments, setMonthAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [notes, setNotes] = useState('');

  // Calendar Helper Functions (midday safety prevents any TZ/DST offsets)
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const prevMonthDays = new Date(year, month, 0).getDate();
    const days = [];

    // Padding for first week
    for (let i = firstDay; i > 0; i--) {
      days.push({ 
        day: prevMonthDays - i + 1, 
        currentMonth: false, 
        date: new Date(year, month - 1, prevMonthDays - i + 1, 12, 0, 0) 
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ 
        day: i, 
        currentMonth: true, 
        date: new Date(year, month, i, 12, 0, 0) 
      });
    }

    // Padding for last week
    const totalDays = 42; // 6 rows of 7 days
    const remainingDays = totalDays - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ 
        day: i, 
        currentMonth: false, 
        date: new Date(year, month + 1, i, 12, 0, 0) 
      });
    }

    return days;
  };

  const getDaysInWeek = (date: Date) => {
    const day = date.getDay();
    const diff = date.getDate() - day;
    const startOfWeek = new Date(date.setDate(diff));
    startOfWeek.setHours(12, 0, 0); // midday safety
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  };

  useEffect(() => {
    loadData();
    loadMonthData();
  }, [selectedDate]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [apps, pts] = await Promise.all([
        AppointmentService.getByDate(selectedDate),
        PatientService.getAll()
      ]);
      setAppointments(apps);
      setPatients(pts);
    } catch (error) {
      console.error('Error loading agenda data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMonthData = async () => {
    try {
      const all = await AppointmentService.getAll();
      setMonthAppointments(all);
    } catch (error) {
      console.error('Error loading month data:', error);
    }
  };

  const handlePrev = () => {
    const d = parseDateLocal(selectedDate);
    if (viewMode === 'month') {
      d.setMonth(d.getMonth() - 1);
    } else if (viewMode === 'week') {
      d.setDate(d.getDate() - 7);
    } else {
      d.setDate(d.getDate() - 1);
    }
    setSelectedDate(formatDateLocal(d));
  };

  const handleNext = () => {
    const d = parseDateLocal(selectedDate);
    if (viewMode === 'month') {
      d.setMonth(d.getMonth() + 1);
    } else if (viewMode === 'week') {
      d.setDate(d.getDate() + 7);
    } else {
      d.setDate(d.getDate() + 1);
    }
    setSelectedDate(formatDateLocal(d));
  };

  const handleOpenModal = (slot: string) => {
    const existing = appointments.find(a => a.time === slot);
    if (existing) return; // Slot already taken

    setSelectedSlot(slot);
    setIsModalOpen(true);
  };

  const handleSaveAppointment = async () => {
    if (!selectedPatientId || !selectedSlot) return;

    const patient = patients.find(p => p.id === selectedPatientId);
    if (!patient) return;

    try {
      await AppointmentService.create({
        patientId: selectedPatientId,
        patientName: patient.name,
        date: selectedDate,
        time: selectedSlot,
        notes: notes,
        status: 'Marcado'
      });
      
      setIsModalOpen(false);
      setSelectedPatientId('');
      setNotes('');
      loadData();
    } catch (error) {
      alert('Erro ao salvar agendamento.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente cancelar este agendamento?')) return;
    try {
      await AppointmentService.delete(id);
      loadData();
    } catch (error) {
      alert('Erro ao excluir agendamento.');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Agenda de Atendimentos</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Gerencie seus horários e consultas.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <button 
                onClick={() => setViewMode('month')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  viewMode === 'month' 
                  ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' 
                  : 'text-slate-500 hover:text-primary'
                }`}
              >
                Mês
              </button>
              <button 
                onClick={() => setViewMode('week')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  viewMode === 'week' 
                  ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' 
                  : 'text-slate-500 hover:text-primary'
                }`}
              >
                Semana
              </button>
              <button 
                onClick={() => setViewMode('day')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  viewMode === 'day' 
                  ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' 
                  : 'text-slate-500 hover:text-primary'
                }`}
              >
                Dia
              </button>
            </div>

            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
              <button 
                onClick={handlePrev}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="px-4 py-2 flex items-center justify-center min-w-[160px]">
                <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                  {new Date(selectedDate).toLocaleDateString('pt-BR', { 
                    month: 'long', 
                    year: 'numeric',
                    day: viewMode === 'day' ? 'numeric' : undefined
                  })}
                </span>
              </div>
              <button 
                onClick={handleNext}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* View Switcher */}
        <div className="min-h-[400px]">
          {viewMode === 'month' ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden shadow-sm"
            >
              <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                  <div key={d} className="py-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {getDaysInMonth(parseDateLocal(selectedDate)).map((item, idx) => {
                  const dateStr = formatDateLocal(item.date);
                  const dayAppointments = monthAppointments.filter(a => a.date === dateStr);
                  const isSelected = selectedDate === dateStr;
                  const isToday = formatDateLocal(new Date()) === dateStr;
                  const hasAppointments = dayAppointments.length > 0;

                  return (
                    <div 
                      key={idx} 
                      onClick={() => {
                        setSelectedDate(dateStr);
                        // Toggle to day view? Or stay in month view for navigation?
                        // User said: "eu clico em um dia específico do calendário e, a partir desse clique, o sistema me mostra os horários disponíveis"
                        setViewMode('day');
                      }}
                      className={`min-h-[100px] p-2 border-r border-b border-slate-100 dark:border-slate-700/50 cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-700/30 group ${
                        !item.currentMonth ? 'opacity-25' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className={`w-8 h-8 flex items-center justify-center rounded-xl text-xs font-bold transition-all ${
                          isToday 
                          ? 'bg-primary text-on-primary font-black shadow-lg shadow-primary/20 scale-105' 
                          : hasAppointments 
                          ? 'bg-primary/10 text-primary font-bold border border-primary/20' 
                          : isSelected
                          ? 'border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200'
                          : 'text-slate-500 dark:text-slate-400 group-hover:text-primary'
                        }`}>
                          {item.day}
                        </span>
                        {dayAppointments.length > 0 && (
                          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        )}
                      </div>
                      <div className="mt-2 space-y-1">
                        {dayAppointments.slice(0, 2).map((app, appIdx) => (
                          <div 
                            key={appIdx}
                            className="px-1.5 py-0.5 rounded-md bg-primary/5 border border-primary/10 text-[9px] font-bold text-primary truncate"
                          >
                            {app.time} {app.patientName}
                          </div>
                        ))}
                        {dayAppointments.length > 2 && (
                          <div className="text-[9px] font-bold text-slate-400 pl-1">
                            + {dayAppointments.length - 2} mais...
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ) : viewMode === 'week' ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-7 gap-4"
            >
              {getDaysInWeek(parseDateLocal(selectedDate)).map((day, idx) => {
                const dateStr = formatDateLocal(day);
                const dayAppointments = monthAppointments.filter(a => a.date === dateStr);
                const isSelected = selectedDate === dateStr;

                return (
                  <div 
                    key={idx}
                    onClick={() => {
                      setSelectedDate(dateStr);
                      setViewMode('day');
                    }}
                    className={`bg-white dark:bg-slate-800 p-4 rounded-3xl border transition-all cursor-pointer hover:border-primary ${
                      isSelected ? 'border-primary ring-1 ring-primary' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1 mb-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {day.toLocaleDateString('pt-BR', { weekday: 'short' })}
                      </span>
                      <span className="text-xl font-black text-slate-900 dark:text-white">
                        {day.getDate()}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {dayAppointments.map((app, appIdx) => (
                        <div 
                          key={appIdx}
                          className="p-2 rounded-xl bg-primary/5 border border-primary/10 text-[10px] font-bold text-primary leading-tight"
                        >
                          {app.time}<br />
                          <span className="text-slate-600 dark:text-slate-300">{app.patientName}</span>
                        </div>
                      ))}
                      {dayAppointments.length === 0 && (
                        <div className="py-8 text-center text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest">
                          Livre
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          ) : (
            /* Day View Grid */
            <div className="grid grid-cols-1 gap-4">
              {TIME_SLOTS.map((slot) => {
                const appointment = appointments.find(a => a.time === slot);
                const isTaken = !!appointment;

                return (
                  <motion.div
                    key={slot}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                      isTaken 
                      ? 'bg-primary/5 border-primary/20 shadow-sm' 
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-primary/40'
                    }`}
                  >
                    <div className="min-w-[80px] flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400">
                      <Clock size={14} />
                      {slot}
                    </div>

                    <div className="flex-1">
                      {isTaken ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center">
                              <User size={20} />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white">{appointment.patientName}</p>
                              {appointment.notes && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 italic">"{appointment.notes}"</p>
                              )}
                              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                <CheckCircle2 size={10} /> Confirmado
                              </span>
                            </div>
                          </div>
                          <button 
                            onClick={() => appointment.id && handleDelete(appointment.id)}
                            className="p-2 text-slate-400 hover:text-error hover:bg-error/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleOpenModal(slot)}
                          className="w-full flex items-center justify-between text-left text-sm text-slate-400 hover:text-primary transition-all font-medium py-1"
                        >
                          <span>Horário Disponível</span>
                          <Plus size={18} className="opacity-0 group-hover:opacity-100 transition-all transform group-hover:scale-110" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
              >
                <div className="p-8 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                      <Plus size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">Novo Agendamento</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Marcar consulta para {selectedSlot} em {new Date(selectedDate).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Paciente</label>
                      <div className="flex gap-2">
                        <select 
                          value={selectedPatientId}
                          onChange={(e) => setSelectedPatientId(e.target.value)}
                          className="flex-1 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-primary transition-all font-bold"
                        >
                          <option value="">Selecione um paciente...</option>
                          {patients.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                        <button 
                          onClick={() => setIsPatientModalOpen(true)}
                          className="p-4 bg-primary/10 text-primary rounded-2xl hover:bg-primary/20 transition-all shadow-sm"
                          title="Cadastrar Novo Paciente"
                        >
                          <Plus size={24} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Observações (opcional)</label>
                      <textarea 
                        placeholder="Ex: Primeira consulta, foco em emagrecimento..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full p-4 h-24 resize-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-4">
                    <button 
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 p-4 rounded-2xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={handleSaveAppointment}
                      disabled={!selectedPatientId}
                      className="flex-2 p-4 bg-primary text-on-primary rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                    >
                      Confirmar Agendamento
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Info Card */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl flex items-start gap-4">
          <div className="p-2 bg-primary/10 rounded-xl text-primary">
            <AlertCircle size={20} />
          </div>
          <div>
            <h4 className="text-white font-bold">Gerenciamento Manual</h4>
            <p className="text-slate-400 text-sm leading-relaxed mt-1">
              Esta agenda é controlada exclusivamente por você. Para integrar com o Google Calendar e permitir agendamentos online automáticos, entre em contato para configurarmos o OAuth 2.0.
            </p>
          </div>
        </div>

        {/* Patient Modal */}
        <PatientModal 
          isOpen={isPatientModalOpen}
          onClose={() => setIsPatientModalOpen(false)}
          onSuccess={async () => {
            const pts = await PatientService.getAll();
            setPatients(pts);
            // Auto select if it's a new patient (the one with the largest id/most recent usually)
            // Simple heuristic for this mock: last entry
            if (pts.length > 0) {
              setSelectedPatientId(pts[pts.length - 1].id!);
            }
          }}
        />
      </div>
    </DashboardLayout>
  );
}
