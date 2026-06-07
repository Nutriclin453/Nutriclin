import { ClinicalTemplate } from '@/types/patient';

const STORAGE_KEY = 'clinical_templates_v1';

const DEFAULT_TEMPLATES: ClinicalTemplate[] = [
  {
    id: 'tpl-diet-hypertrophy',
    name: 'Dieta Hipertrofia Limpa (3200 kcal)',
    type: 'diet',
    description: 'Protocolo de superávit calórico controlado com foco em ganho de massa magra sem acúmulo excessivo de gordura.',
    data: {
      meals: [
        {
          id: 'meal-dh-1',
          name: 'Café da Manhã Energético',
          time: '07:30',
          kcal: 650,
          items: [
            '4 Ovos inteiros mexidos (com gota de azeite)',
            '80g de Aveia em flocos (com água ou leite desnatado)',
            '1 Banana prata picada',
            '30g de Whey Protein isolado'
          ],
          tag: 'Café da Manhã'
        },
        {
          id: 'meal-dh-2',
          name: 'Almoço Construtor',
          time: '12:30',
          kcal: 850,
          items: [
            '200g de Arroz branco cozido',
            '100g de Feijão carioca',
            '150g de Peito de frango grelhado',
            'Legumes variados (brócolis, abobrinha, cenoura)'
          ],
          tag: 'Almoço'
        },
        {
          id: 'meal-dh-3',
          name: 'Lanche Pré-Treino',
          time: '16:30',
          kcal: 450,
          items: [
            '100g de Pasta de amendoim integral',
            '2 Fatias de pão de forma integral',
            '1 Maçã média'
          ],
          tag: 'Lanche da Tarde'
        },
        {
          id: 'meal-dh-4',
          name: 'Janta de Recuperação',
          time: '20:30',
          kcal: 750,
          items: [
            '150g de Carne bovina magra (Patinho)',
            '200g de Batata-doce cozida',
            'Azeite de oliva extra virgem (uma colher de sopa)',
            'Salada de folhas verdes à vontade'
          ],
          tag: 'Jantar'
        }
      ]
    },
    createdAt: '2026-06-01T12:00:00Z'
  },
  {
    id: 'tpl-diet-fatloss',
    name: 'Dieta Definição / Secagem (2100 kcal)',
    type: 'diet',
    description: 'Protocolo de déficit calórico para redução de percentual de gordura preservando a massa muscular máxima.',
    data: {
      meals: [
        {
          id: 'meal-df-1',
          name: 'Desjejum Leve',
          time: '08:00',
          kcal: 380,
          items: [
            '2 Ovos cozidos',
            '1 Fatia de pão integral torrado',
            '150g de Mamão papaia com sementes de chia'
          ],
          tag: 'Café da Manhã'
        },
        {
          id: 'meal-df-2',
          name: 'Almoço de Alta Densidade Nutritiva',
          time: '12:30',
          kcal: 620,
          items: [
            '150g de Arroz integral cozido',
            '150g de Peito de frango em filé grelhado',
            '120g de Batata-doce cozida sem casca',
            'Brócolis e cenoura cozidos (à vontade)'
          ],
          tag: 'Almoço'
        },
        {
          id: 'meal-df-3',
          name: 'Lanche Intermediário',
          time: '16:00',
          kcal: 290,
          items: [
            '150g de Iogurte Grego desnatado',
            '120g de Morangos frescos fatiados',
            '15g de Granola sem açúcar'
          ],
          tag: 'Lanche da Tarde'
        },
        {
          id: 'meal-df-4',
          name: 'Janta Leve e Nutritiva',
          time: '20:00',
          kcal: 480,
          items: [
            '130g de Filé de carne vermelha magra grelhada',
            '120g de Purê de mandioca ou arroz cozido',
            'Salada completa com azeite de oliva (moderado)'
          ],
          tag: 'Jantar'
        }
      ]
    },
    createdAt: '2026-06-01T12:00:00Z'
  },
  {
    id: 'tpl-workout-a-v3',
    name: 'Treino A - Peitorais, Ombros e Tríceps',
    type: 'workout',
    description: 'Protocolo focado em empurrar (Push Day).',
    data: {
      exercises: [
        {
          id: 'ex-a-1-v3',
          treino: 'Treino A',
          name: 'Supino Reto (Barra)',
          subtitle: 'Peito',
          sets: '4',
          reps: '8 a 12',
          rest: '1:30 min',
          notes: 'Aquecer bem os manguitos rotadores.',
          image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500'
        },
        {
          id: 'ex-a-2-v3',
          treino: 'Treino A',
          name: 'Supino Inclinado (Halteres)',
          subtitle: 'Peito',
          sets: '4',
          reps: '10 a 12',
          rest: '1:15 min',
          image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500'
        },
        {
          id: 'ex-a-3-v3',
          treino: 'Treino A',
          name: 'Peck Deck (Voador)',
          subtitle: 'Peito',
          sets: '3',
          reps: '12 a 15',
          rest: '1:00 min',
          image: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=500'
        },
        {
          id: 'ex-a-4-v3',
          treino: 'Treino A',
          name: 'Desenvolvimento (Halteres)',
          subtitle: 'Ombros',
          sets: '3',
          reps: '10 a 12',
          rest: '1:15 min',
          image: 'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=500'
        },
        {
          id: 'ex-a-5-v3',
          treino: 'Treino A',
          name: 'Elevação Lateral (Halteres)',
          subtitle: 'Ombros',
          sets: '4',
          reps: '12 a 15',
          rest: '1:00 min',
          image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500'
        },
        {
          id: 'ex-a-6-v3',
          treino: 'Treino A',
          name: 'Tríceps Testa (Barra W)',
          subtitle: 'Braços',
          sets: '4',
          reps: '10 a 12',
          rest: '1:15 min',
          image: 'https://images.unsplash.com/photo-1623874514711-0f321325f318?w=500'
        },
        {
          id: 'ex-a-7-v3',
          treino: 'Treino A',
          name: 'Tríceps Corda',
          subtitle: 'Braços',
          sets: '3',
          reps: '12 a 15',
          rest: '1:00 min',
          image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500'
        }
      ]
    },
    createdAt: '2026-06-01T12:00:00Z'
  },
  {
    id: 'tpl-workout-b-v3',
    name: 'Treino B - Dorsais e Bíceps',
    type: 'workout',
    description: 'Protocolo focado em puxar (Pull Day).',
    data: {
      exercises: [
        {
          id: 'ex-b-1-v3',
          treino: 'Treino B',
          name: 'Puxada Frontal Aberta',
          subtitle: 'Costas',
          sets: '4',
          reps: '10 a 12',
          rest: '1:15 min',
          image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=500'
        },
        {
          id: 'ex-b-2-v3',
          treino: 'Treino B',
          name: 'Remada Curvada (Barra)',
          subtitle: 'Costas',
          sets: '4',
          reps: '8 a 10',
          rest: '1:30 min',
          image: 'https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?w=500'
        },
        {
          id: 'ex-b-3-v3',
          treino: 'Treino B',
          name: 'Remada Baixa (Triângulo)',
          subtitle: 'Costas',
          sets: '3',
          reps: '10 a 12',
          rest: '1:00 min',
          image: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=500'
        },
        {
          id: 'ex-b-4-v3',
          treino: 'Treino B',
          name: 'Rosca Direta (Barra W)',
          subtitle: 'Braços',
          sets: '4',
          reps: '8 a 12',
          rest: '1:15 min',
          image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500'
        }
      ]
    },
    createdAt: '2026-06-01T12:00:00Z'
  },
  {
    id: 'tpl-workout-c-v3',
    name: 'Treino C - Pernas e Core',
    type: 'workout',
    description: 'Protocolo completo de membros inferiores.',
    data: {
      exercises: [
        {
          id: 'ex-c-1-v3',
          treino: 'Treino C',
          name: 'Agachamento Livre (Barra)',
          subtitle: 'Pernas',
          sets: '4',
          reps: '8 a 10',
          rest: '1:45 min',
          image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500'
        },
        {
          id: 'ex-c-2-v3',
          treino: 'Treino C',
          name: 'Leg Press 45°',
          subtitle: 'Pernas',
          sets: '4',
          reps: '10 a 12',
          rest: '1:30 min',
          image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=500'
        },
        {
          id: 'ex-c-3-v3',
          treino: 'Treino C',
          name: 'Cadeira Extensora',
          subtitle: 'Pernas',
          sets: '4',
          reps: '12 a 15',
          rest: '1:00 min',
          image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500'
        },
        {
          id: 'ex-c-4-v3',
          treino: 'Treino C',
          name: 'Abdominal Supra',
          subtitle: 'Core',
          sets: '4',
          reps: '15 a 20',
          rest: '0:45 min',
          image: 'https://images.unsplash.com/photo-1571019613200-a292415176bb?w=500'
        }
      ]
    },
    createdAt: '2026-06-01T12:00:00Z'
  },
  {
    id: 'tpl-workout-d-v3',
    name: 'Treino D - Quadríceps Focado',
    type: 'workout',
    data: {
      exercises: [
        {
          id: 'ex-d-1-v3',
          treino: 'Treino D',
          name: 'Agachamento Hack',
          subtitle: 'Pernas',
          sets: '4',
          reps: '10 a 12',
          rest: '1:30 min',
          image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500'
        }
      ]
    },
    createdAt: '2026-06-01T12:00:00Z'
  },
  {
    id: 'tpl-workout-e-v3',
    name: 'Treino E - Isquiotibiais e Glúteos',
    type: 'workout',
    data: {
      exercises: [
        {
          id: 'ex-e-1-v3',
          treino: 'Treino E',
          name: 'Stiff (Barra)',
          subtitle: 'Pernas',
          sets: '4',
          reps: '10 a 12',
          rest: '1:30 min',
          image: 'https://images.unsplash.com/photo-1541534741688-6078c64b5952?w=500'
        },
        {
          id: 'ex-e-2-v3',
          treino: 'Treino E',
          name: 'Elevação Pélvica',
          subtitle: 'Pernas',
          sets: '4',
          reps: '10 a 12',
          rest: '1:30 min',
          image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500'
        }
      ]
    },
    createdAt: '2026-06-01T12:00:00Z'
  },
  {
    id: 'tpl-workout-f-v3',
    name: 'Treino F - Full Body',
    type: 'workout',
    data: {
      exercises: [
        {
          id: 'ex-f-1-v3',
          treino: 'Treino F',
          name: 'Avanço/Passada (Halteres)',
          subtitle: 'Pernas',
          sets: '3',
          reps: '12',
          rest: '1:00 min',
          image: 'https://images.unsplash.com/photo-1541534741688-6078c64b5952?w=500'
        }
      ]
    },
    createdAt: '2026-06-01T12:00:00Z'
  }
];

export const TemplateService = {
  getTemplates(type?: 'diet' | 'workout'): ClinicalTemplate[] {
    if (typeof window === 'undefined') return DEFAULT_TEMPLATES;
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const list: ClinicalTemplate[] = stored ? JSON.parse(stored) : [];
      
      const deletedKey = 'clinical_templates_deleted_defaults';
      const deletedStr = localStorage.getItem(deletedKey);
      const deletedList: string[] = deletedStr ? JSON.parse(deletedStr) : [];
      
      const mergedList = [...list];
      DEFAULT_TEMPLATES.forEach(def => {
        if (!deletedList.includes(def.id) && !mergedList.some(item => item.id === def.id)) {
          mergedList.push(def);
        }
      });
      
      if (type) {
        return mergedList.filter(t => t.type === type);
      }
      return mergedList;
    } catch (e) {
      console.error('Error reading templates', e);
      return DEFAULT_TEMPLATES;
    }
  },

  saveTemplate(template: Omit<ClinicalTemplate, 'id' | 'createdAt'>): ClinicalTemplate {
    const id = `tpl-custom-${Date.now()}`;
    const newTemplate: ClinicalTemplate = {
      ...template,
      id,
      createdAt: new Date().toISOString()
    };

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const list: ClinicalTemplate[] = stored ? JSON.parse(stored) : [];
        list.push(newTemplate);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      } catch (e) {
        console.error('Error saving template', e);
      }
    }

    return newTemplate;
  },

  deleteTemplate(id: string): boolean {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        let list: ClinicalTemplate[] = stored ? JSON.parse(stored) : [];
        
        const isDefault = id.startsWith('tpl-diet-') || id.startsWith('tpl-workout-');
        
        if (isDefault) {
          const deletedKey = 'clinical_templates_deleted_defaults';
          const deletedStr = localStorage.getItem(deletedKey);
          const deletedList: string[] = deletedStr ? JSON.parse(deletedStr) : [];
          if (!deletedList.includes(id)) {
            deletedList.push(id);
            localStorage.setItem(deletedKey, JSON.stringify(deletedList));
          }
        } else {
          list = list.filter(t => t.id !== id);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        }

        return true;
      } catch (e) {
        console.error('Error deleting template', e);
      }
    }
    return false;
  }
};
