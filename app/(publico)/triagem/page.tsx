'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Mail, 
  Phone, 
  ArrowRight, 
  Check, 
  Flame, 
  Scale, 
  TrendingUp, 
  Heart, 
  Apple,
  MessageCircle,
  Camera,
  CheckCircle,
  Loader2,
  MapPin,
  Laptop,
  CheckCircle2,
  Calculator,
  CalendarCheck
} from 'lucide-react';
import { LeadService } from '@/lib/lead-service';
import { PatientService } from '@/lib/patient-service';
import { isMockEnabled } from '@/lib/mock-db';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

const LOGO_URL = "/logo.png";

type Step = 'contact' | 'atendimento' | 'details' | 'success';

interface GoalOption {
  value: string;
  label: string;
}

const GOALS: GoalOption[] = [
  { value: 'Emagrecimento', label: 'Emagrecimento' },
  { value: 'Hipertrofia', label: 'Hipertrofia' },
  { value: 'Performance', label: 'Performance' },
  { value: 'Saúde', label: 'Saúde' },
];

export default function TriagemPage() {
  const [step, setStep] = useState<Step>('contact');
  
  // Step 1: Personal info
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneRaw, setPhoneRaw] = useState('');
  
  // Step 2: Preference
  const [serviceType, setServiceType] = useState<'Presencial' | 'Online' | ''>('');
  
  // Step 3: Bio and Goals
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [goal, setGoal] = useState('Emagrecimento');
  const [gender, setGender] = useState<'Masculino' | 'Feminino' | ''>('');
  
  // Statuses
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Flexible parsing for international phone numbers
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Allow digits, +, (, ), -, and spaces
    const allowedChars = inputValue.replace(/[^\d+() -]/g, '');
    setPhone(allowedChars);
    
    // Raw value just gets digits and +
    const pureVal = allowedChars.replace(/[^\d+]/g, '');
    setPhoneRaw(pureVal);
  };

  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!name.trim()) {
      setErrorMsg('Por favor, informe seu nome completo.');
      return;
    }
    
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Por favor, informe um e-mail válido.');
      return;
    }
    
    if (phoneRaw.replace(/\D/g, '').length < 8) {
      setErrorMsg('Por favor, informe seu WhatsApp com código do país/DDD válido.');
      return;
    }

    setStep('atendimento');
  };

  const handleSelectService = (type: 'Presencial' | 'Online') => {
    setServiceType(type);
    setStep('details');
  };

  const handleSubmitFinal = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!gender) {
      setErrorMsg('Por favor, selecione o seu gênero.');
      return;
    }

    setLoading(true);

    const parsedAge = age ? parseInt(age, 10) : undefined;
    const parsedWeight = weight ? parseFloat(weight.replace(',', '.')) : undefined;
    const parsedHeight = height ? parseFloat(height.replace(',', '.')) : undefined;

    try {
      await LeadService.create({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone,
        service_type: serviceType === 'Presencial' ? 'Consulta Presencial' : 'Consulta Online / À Distância',
        age: parsedAge,
        weight: parsedWeight,
        height: parsedHeight,
        goal: goal,
        gender: gender
      });

      // Try to auto-create patient direct (working beautifully in mock mode, and if RLS allows)
      try {
        await PatientService.create({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone,
          goal: goal,
          status: 'Ativo',
          weight: parsedWeight,
          height: parsedHeight,
          age: parsedAge,
          idade: parsedAge,
          gender: gender as any,
        } as any);
      } catch (patientErr) {
        console.warn('Could not insert patient directly in public page, will be synced upon dietitian login:', patientErr);
      }

      try {
        await supabase.from('notifications').insert({
          title: 'Novo Lead do Instagram!',
          message: name.trim(),
          read: false,
        });
      } catch (notifErr) {
        console.error('Failed to create notification', notifErr);
      }

      setStep('success');
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Ocorreu um erro ao enviar seus dados. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col lg:grid lg:grid-cols-12 overflow-x-hidden relative">
      
      {/* LEFT COLUMN: Nutritionist Image (visible on desktop) */}
      <div className="hidden lg:flex lg:col-span-5 relative min-h-screen overflow-hidden bg-slate-900 border-r border-slate-800/60 selective-glow">
        <Image 
          src="/nutri-oficial.jpg.PNG" 
          alt="Dr. Antonio Feitoza" 
          fill 
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover object-top lg:object-center scale-105 transition-all duration-[8000ms] ease-out hover:scale-100"
          referrerPolicy="no-referrer"
        />
        {/* Subtle dark overlay with vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/20" />
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Dynamic quote/brand logo overlap on image columns */}
        <div className="absolute bottom-16 left-12 right-12 z-20 flex flex-col space-y-4">
          <div className="w-12 h-1 bg-primary rounded-full" />
          <h2 className="text-3xl font-black text-slate-100 uppercase tracking-tight leading-tight">
            ALTA PERFORMANCE <br />
            & ESTILO DE VIDA
          </h2>
          <p className="text-sm font-medium text-slate-400 leading-relaxed max-w-sm">
            Agende sua triagem com o Dr. Antonio Feitoza e conquiste o corpo e a saúde que você sempre desejou com acompanhamento clínico individualizado.
          </p>
        </div>
      </div>

      {/* RIGHT COLUMN: The Interactive Form Container */}
      <div className="lg:col-span-7 flex flex-col justify-center items-center py-12 px-4 sm:px-6 md:px-12 relative min-h-screen lg:min-h-0">
        
        {/* Decorative background lights behind right side */}
        <div className="absolute top-[10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-lg z-10">
          
          {/* Header (Shows on top of form always) */}
          <motion.div 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center text-center mb-8"
          >
            {/* Mobile-only visible top logo or circle thumbnail */}
            <div className="block lg:hidden relative w-20 h-20 rounded-full overflow-hidden border-2 border-primary mb-4 shrink-0 shadow-xl shadow-primary/10">
              <Image 
                src="/nutri-oficial.jpg.PNG" 
                alt="Dr. Antonio Feitoza" 
                fill 
                className="object-cover object-top lg:object-center"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="hidden lg:flex relative w-12 h-12 bg-slate-900 border border-slate-800 rounded-2xl items-center justify-center shadow-lg mb-3">
              <Image 
                src={LOGO_URL} 
                alt="Antonio Feitoza Logo" 
                fill 
                sizes="48px"
                className="object-contain p-2"
                referrerPolicy="no-referrer"
              />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">Antonio Feitoza</h1>
            <p className="text-[10px] sm:text-xs font-bold text-primary uppercase tracking-widest mt-1">Nutricionista Esportivo</p>
          </motion.div>

          {/* Form Card */}
          <div className="w-full bg-slate-900/90 border border-slate-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative">
            
            {/* Steps Progress Header */}
            {step !== 'success' && (
              <div className="flex items-center gap-3 mb-8 justify-center">
                <div className="text-[10px] uppercase font-black tracking-widest text-slate-500">Etapa</div>
                <div className="flex items-center gap-1.5">
                  <div className={`h-2 rounded-full transition-all duration-300 ${step === 'contact' ? 'w-8 bg-primary' : 'w-2 bg-slate-700'}`} />
                  <div className={`h-2 rounded-full transition-all duration-300 ${step === 'atendimento' ? 'w-8 bg-primary' : 'w-2 bg-slate-700'}`} />
                  <div className={`h-2 rounded-full transition-all duration-300 ${step === 'details' ? 'w-8 bg-primary' : 'w-2 bg-slate-700'}`} />
                </div>
              </div>
            )}

            <AnimatePresence mode="wait">
              {/* STEP 1: CONTACT INFO */}
              {step === 'contact' && (
                <motion.div
                  key="contact-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="space-y-2 mb-6 text-center">
                    <h2 className="text-lg font-black text-slate-100 flex items-center justify-center gap-2">
                       Inicie sua evolução
                    </h2>
                    <p className="text-slate-400 text-xs">
                      Preencha com seus dados primários de contacto para iniciarmos a sua triagem personalizada.
                    </p>
                  </div>

                  <form onSubmit={handleNextStep1} className="space-y-4">
                    {/* Name Input */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1 flex items-center gap-1.5">
                        <User size={13} className="text-primary" /> Nome Completo
                      </label>
                      <input 
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Como deseja ser chamado?"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-slate-100 placeholder-slate-600 outline-none focus:border-primary/60 transition-all text-sm font-medium"
                      />
                    </div>

                    {/* Email Input */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1 flex items-center gap-1.5">
                        <Mail size={13} className="text-primary" /> E-mail
                      </label>
                      <input 
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seuemail@exemplo.com"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-slate-100 placeholder-slate-600 outline-none focus:border-primary/60 transition-all text-sm font-medium"
                      />
                    </div>

                    {/* WhatsApp Input */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1 flex items-center gap-1.5">
                        <Phone size={13} className="text-primary" /> WhatsApp (+País ou DDD)
                      </label>
                      <input 
                        type="tel"
                        required
                        value={phone}
                        onChange={handlePhoneChange}
                        placeholder="Ex: +353 83 123 4567 ou (11) 99999-9999"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-slate-100 placeholder-slate-600 outline-none focus:border-primary/60 transition-all text-sm font-medium tracking-wide"
                      />
                    </div>

                    {/* Errors */}
                    {errorMsg && (
                      <p className="text-xs font-bold text-red-400 text-center bg-red-950/20 border border-red-900/30 p-2.5 rounded-lg">
                        {errorMsg}
                      </p>
                    )}

                    {/* Submit / Next */}
                    <button
                      type="submit"
                      className="w-full bg-primary text-slate-950 font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-primary/20 mt-6"
                    >
                      Próximo <ArrowRight size={18} />
                    </button>
                  </form>
                </motion.div>
              )}

              {/* STEP 2: PREFERRED SERVICE (AUTO-ADVANCE) */}
              {step === 'atendimento' && (
                <motion.div
                  key="atendimento-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="space-y-2 mb-8 text-center">
                    <h2 className="text-lg font-black text-slate-100">Como prefere o seu atendimento?</h2>
                    <p className="text-slate-400 text-xs">
                      Selecione o modelo mais confortável para sua rotina diária:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {/* Option 1: Presencial */}
                    <button
                      onClick={() => handleSelectService('Presencial')}
                      className="w-full p-5 sm:p-6 rounded-2xl border border-slate-800/80 bg-slate-950/40 hover:border-primary/60 text-left transition-all active:scale-[0.99] group flex flex-col sm:flex-row items-center sm:items-start gap-4 cursor-pointer"
                    >
                      <div className="p-3 bg-red-950/20 text-red-400 rounded-xl border border-red-900/40 group-hover:text-primary group-hover:border-primary/30 transition-all">
                        <MapPin size={24} />
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-base font-black text-slate-100 group-hover:text-primary transition-colors flex items-center justify-center sm:justify-between gap-2">
                          📍 Consulta Presencial
                        </h3>
                        <p className="text-slate-400 text-xs leading-relaxed mt-1">
                          Acompanhamento cara a cara com avaliação de composição corporal física completa no meu consultório.
                        </p>
                      </div>
                    </button>

                    {/* Option 2: Online */}
                    <button
                      onClick={() => handleSelectService('Online')}
                      className="w-full p-5 sm:p-6 rounded-2xl border border-slate-800/80 bg-slate-950/40 hover:border-primary/60 text-left transition-all active:scale-[0.99] group flex flex-col sm:flex-row items-center sm:items-start gap-4 cursor-pointer"
                    >
                      <div className="p-3 bg-blue-950/20 text-blue-400 rounded-xl border border-blue-900/40 group-hover:text-primary group-hover:border-primary/30 transition-all">
                        <Laptop size={24} />
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-base font-black text-slate-100 group-hover:text-primary transition-colors flex items-center justify-center sm:justify-between gap-2">
                          💻 Consulta Online / À Distância
                        </h3>
                        <p className="text-slate-400 text-xs leading-relaxed mt-1">
                          Atendimento por videoconferência e suporte completo no WhatsApp de onde você estiver no mundo.
                        </p>
                      </div>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep('contact')}
                    className="w-full text-slate-400 hover:text-slate-200 text-center text-xs font-bold uppercase tracking-widest mt-8 bg-transparent border-0 outline-none cursor-pointer block"
                  >
                    Voltar
                  </button>
                </motion.div>
              )}

              {/* STEP 3: BIOMETRIC DETAILS & GOAL SELECT */}
              {step === 'details' && (
                <motion.div
                  key="details-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="space-y-2 mb-6 text-center">
                    <h2 className="text-lg font-black text-slate-100">Conte-nos sobre seus dados</h2>
                    <p className="text-slate-400 text-xs">
                      Precisamos dessas informações biométricas estimadas para calcular sua base de consultoria.
                    </p>
                  </div>

                  <form onSubmit={handleSubmitFinal} className="space-y-4">
                    {/* Core Grid */}
                    <div className="grid grid-cols-3 gap-3">
                      
                      {/* Age Input */}
                      <div className="space-y-1.5 col-span-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-0.5">
                          Idade
                        </label>
                        <input 
                          type="number"
                          required
                          value={age}
                          min="1"
                          max="120"
                          onChange={(e) => setAge(e.target.value)}
                          placeholder="Anos"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 placeholder-slate-700 outline-none focus:border-primary/60 transition-all text-sm font-medium text-center"
                        />
                      </div>

                      {/* Weight Input */}
                      <div className="space-y-1.5 col-span-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-0.5">
                          Peso (kg)
                        </label>
                        <input 
                          type="text"
                          required
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          placeholder="ex: 78.5"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 placeholder-slate-700 outline-none focus:border-primary/60 transition-all text-sm font-medium text-center"
                        />
                      </div>

                      {/* Height Input */}
                      <div className="space-y-1.5 col-span-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-0.5">
                          Altura (cm)
                        </label>
                        <input 
                          type="number"
                          required
                          value={height}
                          min="30"
                          max="280"
                          onChange={(e) => setHeight(e.target.value)}
                          placeholder="ex: 175"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 placeholder-slate-700 outline-none focus:border-primary/60 transition-all text-sm font-medium text-center"
                        />
                      </div>

                    </div>

                    {/* Gender Selection */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1 font-mono">
                        Gênero *
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          id="btn-gender-masculino"
                          onClick={() => setGender('Masculino')}
                          className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            gender === 'Masculino'
                              ? 'border-primary bg-primary/10 text-primary font-black shadow-lg shadow-primary/5'
                              : 'border-slate-800 bg-slate-950/40 text-slate-450 hover:border-slate-700 hover:text-slate-200'
                          }`}
                        >
                          ♂️ Masculino
                        </button>
                        <button
                          type="button"
                          id="btn-gender-feminino"
                          onClick={() => setGender('Feminino')}
                          className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            gender === 'Feminino'
                              ? 'border-primary bg-primary/10 text-primary font-black shadow-lg shadow-primary/5'
                              : 'border-slate-800 bg-slate-950/40 text-slate-455 hover:border-slate-700 hover:text-slate-200'
                          }`}
                        >
                          ♀️ Feminino
                        </button>
                      </div>
                    </div>

                    {/* Goal Dropdown Selection */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1 font-mono">
                        Objetivo Principal
                      </label>
                      <select
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-slate-100 outline-none focus:border-primary/60 transition-all text-sm font-medium cursor-pointer"
                      >
                        {GOALS.map((g) => (
                          <option key={g.value} value={g.value} className="bg-slate-950 text-slate-100">
                            {g.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Errors */}
                    {errorMsg && (
                      <p className="text-xs font-bold text-red-400 text-center bg-red-950/20 border border-red-900/30 p-2.5 rounded-lg">
                        {errorMsg}
                      </p>
                    )}

                    {loading ? (
                      <div className="flex items-center justify-center gap-2 py-4 text-slate-400 font-bold text-xs uppercase tracking-widest bg-slate-950 rounded-xl">
                        <Loader2 size={18} className="animate-spin text-primary" />
                        GRAVANDO SEUS DADOS...
                      </div>
                    ) : (
                      <button
                        type="submit"
                        className="w-full bg-primary text-slate-950 font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-primary/20 mt-6"
                      >
                        Finalizar <ArrowRight size={18} />
                      </button>
                    )}
                  </form>

                  <button
                    type="button"
                    onClick={() => setStep('atendimento')}
                    disabled={loading}
                    className="w-full text-slate-400 hover:text-slate-200 text-center text-xs font-bold uppercase tracking-widest mt-6 bg-transparent border-0 outline-none cursor-pointer block"
                  >
                    Voltar
                  </button>
                </motion.div>
              )}

              {/* SUCCESS / COMPLETED SCREEN */}
              {step === 'success' && (
                <motion.div
                  key="success-step"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-center py-6 flex flex-col items-center"
                >
                  <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center text-primary mb-6 shadow-glow shadow-primary/10">
                    <CheckCircle2 size={36} />
                  </div>

                  <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
                    Obrigado, {name.split(' ')[0]}!
                  </h1>
                  <p className="text-xs font-bold text-primary uppercase tracking-widest mt-1">Sua triagem foi concluída com sucesso</p>
                  
                  <p className="text-slate-400 text-sm leading-relaxed mt-4 mb-8">
                     O seu pedido de agendamento de <span className="text-primary font-bold">{goal}</span> foi registrado. Entrarei em contato em breve através do WhatsApp <span className="text-slate-100 font-bold">{phone}</span> para acertar todos os detalhes do seu atendimento.
                  </p>

                  <div className="w-full space-y-3">
                    <a
                      href="https://instagram.com/nutryantoniofeitoza"
                      target="_blank"
                      rel="noreferrer"
                      className="w-full bg-slate-950 text-slate-200 border border-slate-800 hover:border-slate-700 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all block text-center cursor-pointer hover:bg-slate-900"
                    >
                      <Camera size={18} className="text-[#E1306C]" /> Acompanhar no Instagram
                    </a>
                    
                    <a
                      href={`https://api.whatsapp.com/send?phone=5511999999999&text=Ol%C3%A1%2C%20Dr.%20Antonio.%20Acabei%20de%20finalizar%20a%20minha%20triagem%20esportiva%20para%20o%20pilar%20de%20${goal}%21`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full bg-primary text-slate-950 py-3.5 rounded-xl font-black flex items-center justify-center gap-2 transition-all block text-center cursor-pointer hover:brightness-110 shadow-lg shadow-primary/10"
                    >
                      <MessageCircle size={18} /> Chamar no WhatsApp
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Footer branding */}
          <div className="flex flex-col items-center justify-center mt-8 space-y-2 text-center">
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
              © {new Date().getFullYear()} Dr. Antonio Feitoza • Todos os direitos reservados.
            </p>
            <div className="text-[9px] text-slate-700 font-mono px-3 py-1 bg-slate-900/30 rounded-full border border-slate-900/40">
              CRM • Nutrição Clínica & Performance Esportiva
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
