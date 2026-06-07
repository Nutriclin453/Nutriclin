'use client';

import React from 'react';
import Image from 'next/image';
import { DashboardLayout } from '@/components/dashboard-layout';
import { 
  Briefcase, 
  GraduationCap, 
  Share2 as Instagram, 
  Mail, 
  Calendar,
  CheckCircle2,
  Award
} from 'lucide-react';

const PROFILE_PIC = "https://lh3.googleusercontent.com/aida-public/AB6AXuAwMx_M9Qw136yh2NPy8eUrNHgF4GaAem0OHx5iK8bZMDV5mAzTzZXBpZPCVpNAR0SWFUC_uL9N6-pJ9tpci3xn8JejhfLS_5kx4tBkyCv5ECP6LwUb3vflCQkdFwHjb7Ww0aroW9TEyHFcnI7rQOpM_jVO2RngZ3krNlMQs8-kJTdUt34NmAHyFCmLPfSkWlpk7l4U2JOnaDHGQRQJN0fBS7mYEp6nvj5qch5WKoR5PblvbE-3oVHylU9wcGLPLcc7_2U7SAEJ6vEPkvM";
const LOGO_URL = "/logo.png";

export default function Sobre() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Hero Section */}
        <section className="relative rounded-3xl overflow-hidden bg-surface-container border border-outline-variant flex flex-col md:flex-row shadow-xl">
          <div className="md:w-1/3 h-[500px] relative">
            <img src={PROFILE_PIC} className="w-full h-full object-cover" alt="Dr. Antonio Feitoza" />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-container to-transparent md:bg-gradient-to-r md:from-transparent md:to-surface-container" />
          </div>
          <div className="md:w-2/3 p-8 md:p-12 flex flex-col justify-center space-y-6">
            <div>
              <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[10px] uppercase font-black tracking-widest border border-primary/20">Nutricionista Clínico & Esportivo</span>
              <h1 className="text-4xl md:text-5xl font-black text-on-surface mt-4 tracking-tighter">Antonio Feitoza</h1>
            </div>
            <p className="text-on-surface-variant text-base md:text-lg leading-relaxed font-medium max-w-2xl">
              Nutricionista com sólida trajetória internacional, atendendo pacientes brasileiros enquanto reside na Europa. Com foco em resultados reais e embasamento científico, Antonio Feitoza traz uma visão global e multidisciplinar para a saúde de seus pacientes.
            </p>
            <div className="grid grid-cols-2 gap-8 pt-6">
              <div className="space-y-1">
                <p className="text-3xl font-black text-primary tracking-tight">+1.000</p>
                <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest">Pacientes Atendidos</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-black text-primary tracking-tight">24 Anos</p>
                <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest">De Experiência (Desde 2001)</p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Left: Experience & Education */}
          <div className="md:col-span-8 space-y-12">
            
            {/* Experience */}
            <section className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 text-primary rounded-xl">
                  <Briefcase size={24} />
                </div>
                <h2 className="text-2xl font-bold text-on-surface">Experiência Profissional</h2>
              </div>
              <div className="space-y-8 border-l border-outline-variant ml-6 pl-8 relative">
                {[
                  { role: 'Gerente Regional', company: 'Sapore', desc: 'Liderança estratégica em operações de grande porte.' },
                  { role: 'Gerente Master / Nutricionista Clínico', company: 'Hospital', desc: 'Gestão hospitalar e atendimento clínico especializado.' },
                  { role: 'Consultor Especialista', company: 'Petrobras', desc: 'Atuação com expertise em Tecnologia de Segurança dos Alimentos (Qualidade).' },
                  { role: 'Supervisor de Laboratórios', company: 'Universidade', desc: 'Supervisão acadêmica e técnica nos laboratórios de Embriologia e Histologia.' },
                ].map((exp, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[37px] top-1.5 w-4 h-4 rounded-full bg-primary ring-4 ring-surface" />
                    <h3 className="font-bold text-on-surface flex items-center justify-between flex-wrap gap-2">
                       <span>{exp.role} @ {exp.company}</span>
                    </h3>
                    <p className="text-sm text-on-surface-variant mt-2 font-medium leading-relaxed">{exp.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Academic */}
            <section className="space-y-8">
               <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 text-primary rounded-xl">
                  <GraduationCap size={24} />
                </div>
                <h2 className="text-2xl font-bold text-on-surface">Formação Acadêmica</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  'Graduação em Nutrição',
                  'Pós-graduação em Tecnologia de Segurança dos Alimentos',
                  'Pós-graduação em Nutrição Clínica Funcional',
                  'Pós-graduação em Nutrição Esportiva',
                  'Pós-graduação em Nutrição Clínica',
                  'CREF Provisionado em Educação Física'
                ].map((edu) => (
                  <div key={edu} className="flex items-start gap-4 p-4 rounded-2xl bg-surface-container border border-outline-variant hover:border-primary/30 transition-all group">
                    <CheckCircle2 className="text-primary mt-1 shrink-0 group-hover:scale-110 transition-transform" size={18} />
                    <span className="text-sm font-bold text-on-surface-variant group-hover:text-on-surface transition-colors">{edu}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right: Contact & Quick Info */}
          <div className="md:col-span-4 space-y-8">
            <section className="bg-surface-container p-4 md:p-8 rounded-3xl border border-outline-variant space-y-8 h-full">
              <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
                <Award className="text-primary" size={20} />
                Contato & Registro
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4 group cursor-pointer">
                  <div className="p-3 bg-surface-dim rounded-xl border border-outline-variant text-on-surface-variant group-hover:text-primary transition-all">
                    <Award size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest">CRN Profissional</p>
                    <p className="font-black text-on-surface">CRN 14029</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 group cursor-pointer">
                  <div className="p-3 bg-surface-dim rounded-xl border border-outline-variant text-on-surface-variant group-hover:text-primary transition-all">
                    <Instagram size={20} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest">Instagram</p>
                    <p className="font-black text-on-surface truncate">@nutryantoniofeitoza</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 group cursor-pointer">
                  <div className="p-3 bg-surface-dim rounded-xl border border-outline-variant text-on-surface-variant group-hover:text-primary transition-all">
                    <Mail size={20} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest">E-mail</p>
                    <p className="font-black text-on-surface truncate">tonymab1@icloud.com</p>
                  </div>
                </div>
              </div>

              <button className="w-full py-4 bg-primary text-on-primary rounded-2xl font-bold flex items-center justify-center gap-3 hover:brightness-110 transition-all shadow-lg shadow-primary/20 mt-8">
                <Calendar size={18} />
                Agendar
              </button>
            </section>
          </div>
        </div>

        {/* Footer Text */}
        <footer className="pt-12 border-t border-outline-variant flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="w-12 h-12 relative opacity-50 contrast-125 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
              <Image 
                src={LOGO_URL} 
                alt="Logo" 
                fill 
                className="object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <p>© 2026 Antonio Feitoza Nutrição. Todos os direitos reservados.</p>
          </div>
          <div className="flex gap-4 md:gap-8">
            <a href="#" className="hover:text-primary transition-colors">Privacidade</a>
            <a href="#" className="hover:text-primary transition-colors">Termos</a>
          </div>
        </footer>
      </div>
    </DashboardLayout>
  );
}

