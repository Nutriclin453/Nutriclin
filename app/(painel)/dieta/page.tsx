"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import {
  Apple,
  Flame,
  Scale,
  FileText,
  Save,
  Plus,
  Trash2,
  Loader2,
  Droplet,
  Coffee,
  CheckCircle2,
  ListRestart,
  Wheat,
  Drumstick,
  Leaf,
  Beef,
  Egg,
  Utensils,
  ShoppingCart,
  Pencil,
  Check,
  X
} from "lucide-react";
import { motion } from "motion/react";
import { Patient, PatientService } from "@/lib/patient-service";
import { Diet, DietService, Meal, Macros } from "@/lib/diet-service";
import { useAuth } from "@/components/supabase-provider";
import { setForceMock } from "@/lib/mock-db";
import { ShoppingListModal } from "@/components/shopping-list-modal";
import { SubstitutionGuide } from "@/components/substitution-guide";
import { ClinicalTemplateManager } from "@/components/clinical-template-manager";

const parseMealItem = (itemText: string) => {
  const numRegex = /^([\d.,]+)/;
  const numMatch = itemText.match(numRegex);
  if (!numMatch) {
    return {
      food: "custom",
      qty: "1",
      customName: itemText
    };
  }

  const qtyStr = numMatch[1].replace(',', '.');
  const qty = parseFloat(qtyStr) || 1;
  let rest = itemText.substring(numMatch[0].length).trim();

  let detectedUnit = "";
  let foodName = rest;
  const commonUnits = [
    "g", "ml", "fatias", "fatia", "colher de sopa", "colheres de sopa", 
    "colher", "colheres", "unidade", "unidades", "dosador", "dosadores", 
    "xícara", "xícaras", "pedaço", "pedaços", "scoop", "scoops"
  ];

  for (const u of commonUnits) {
    if (rest.toLowerCase().startsWith(u + " ")) {
      detectedUnit = u;
      foodName = rest.substring(u.length + 1).trim();
      break;
    } else if (rest.toLowerCase().startsWith(u + " de ")) {
      detectedUnit = u;
      foodName = rest.substring(u.length + 4).trim();
      break;
    } else if (rest.toLowerCase() === u) {
      detectedUnit = u;
      foodName = "";
      break;
    }
  }

  if (!detectedUnit) {
    const unitAttachRegex = /^([a-zA-Záéíóúâêîôûãõç]+)\s*(?:de\s+)?(.*)$/i;
    const attachMatch = rest.match(unitAttachRegex);
    if (attachMatch) {
      const u = attachMatch[1].toLowerCase();
      if (u === "g" || u === "ml") {
        detectedUnit = u;
        foodName = attachMatch[2].trim();
      }
    }
  }

  if (foodName.toLowerCase().startsWith("de ")) {
    foodName = foodName.substring(3).trim();
  }

  const matchedOpt = FOOD_OPTIONS.find((opt) => {
    const clean = opt.cleanName.toLowerCase();
    const target = foodName.toLowerCase();
    return target === clean || target.includes(clean) || clean.includes(target);
  });

  if (matchedOpt && matchedOpt.id !== "custom") {
    return {
      food: matchedOpt.id,
      qty: String(qty),
      customName: ""
    };
  }

  return {
    food: "custom",
    qty: String(qty),
    customName: rest
  };
};

const PRESET_GOALS = [
  "Hipertrofia",
  "Emagrecimento",
  "Manutenção",
  "Performance",
  "Saúde"
];

const PRESET_TAGS = [
  {
    id: "ALTA PROTEÍNA",
    color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  },
  {
    id: "PRÉ-TREINO",
    color: "bg-[#38bdf8]/10 text-[#38bdf8] border-[#38bdf8]/20",
  },
  {
    id: "PÓS-TREINO",
    color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  },
  {
    id: "ALTA SACIEDADE",
    color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  },
  { id: "LOW CARB", color: "bg-rose-500/10 text-rose-500 border-rose-500/20" },
];

const getMealAbbreviation = (name: string) => {
  if (!name) return "REFEIÇÃO";
  const n = name.toLowerCase();
  if (n.includes("café")) return "CAFÉ";
  if (n.includes("lanche")) return "LANCHE";
  if (n.includes("almoço")) return "ALMOÇO";
  if (n.includes("jantar")) return "JANTAR";
  if (n.includes("ceia")) return "CEIA";
  return "REFEIÇÃO";
};

const getFoodIcon = (foodText: string) => {
  const lowerItem = foodText.toLowerCase();
  if (
    lowerItem.includes("arroz") ||
    lowerItem.includes("pão") ||
    lowerItem.includes("pao") ||
    lowerItem.includes("batata") ||
    lowerItem.includes("mandioca") ||
    lowerItem.includes("macarrão") ||
    lowerItem.includes("aveia")
  ) {
    return <Wheat size={18} strokeWidth={2} />;
  }
  if (
    lowerItem.includes("frango") ||
    lowerItem.includes("peixe") ||
    lowerItem.includes("carne") ||
    lowerItem.includes("whey") ||
    lowerItem.includes("patinho") ||
    lowerItem.includes("boi")
  ) {
    return <Drumstick size={18} strokeWidth={2} />;
  }
  if (lowerItem.includes("ovo")) {
    return <Egg size={18} strokeWidth={2} />;
  }
  if (
    lowerItem.includes("salada") ||
    lowerItem.includes("brócolis") ||
    lowerItem.includes("vagem") ||
    lowerItem.includes("alface")
  ) {
    return <Leaf size={18} strokeWidth={2} />;
  }
  if (
    lowerItem.includes("azeite") ||
    lowerItem.includes("água") ||
    lowerItem.includes("agua") ||
    lowerItem.includes("leite") ||
    lowerItem.includes("café") ||
    lowerItem.includes("suco")
  ) {
    return <Droplet size={18} strokeWidth={2} />;
  }
  return <Utensils size={18} strokeWidth={2} />;
};

import { Evaluation, EvaluationService } from "@/lib/evaluation-service";

const MEAL_NAMES = [
  "1 - Café da Manhã",
  "2 - Lanche da Manhã",
  "3 - Almoço",
  "4 - Lanche da Tarde",
  "5 - Jantar",
];

const MEAL_TIMES = ["07:00", "10:00", "13:00", "16:30", "20:00"];

const getDefaultMeals = (): Meal[] =>
  MEAL_NAMES.map((name, i) => ({
    id: crypto.randomUUID(),
    name,
    time: MEAL_TIMES[i],
    kcal: 0,
    items: [],
  }));

export const FOOD_DATABASE = [
  // Proteínas (Carnes, aves, peixes e ovos)
  { names: ["frango", "frango grelhado", "peito de frango"], p: 0.315, c: 0.0, f: 0.03, isUnit: false },
  { names: ["carne", "boi", "bife", "carne vermelha", "alcatra"], p: 0.319, c: 0.0, f: 0.116, isUnit: false },
  { names: ["patinho moído", "patinho moido", "patinho"], p: 0.359, c: 0.0, f: 0.073, isUnit: false },
  { names: ["contra filé", "contra file"], p: 0.299, c: 0.0, f: 0.15, isUnit: false },
  { names: ["lombo", "lombo de porco", "suíno", "suino", "porco"], p: 0.36, c: 0.0, f: 0.09, isUnit: false },
  { names: ["peixe", "tilápia", "tilapia", "filé de tilápia", "file de tilapia"], p: 0.26, c: 0.0, f: 0.02, isUnit: false },
  { names: ["salmão", "salmao"], p: 0.23, c: 0.0, f: 0.14, isUnit: false },
  { names: ["atum"], p: 0.26, c: 0.0, f: 0.01, isUnit: false },
  { names: ["ovo", "ovos", "ovo cozido"], p: 6.0, c: 0.5, f: 5.0, isUnit: true },
  { names: ["clara", "clara de ovo"], p: 3.6, c: 0.2, f: 0.0, isUnit: true },

  // Laticínios e derivados
  { names: ["leite", "leite integral"], p: 0.03, c: 0.05, f: 0.03, isUnit: false },
  { names: ["leite desnatado"], p: 0.032, c: 0.047, f: 0.001, isUnit: false },
  { names: ["cottage", "queijo cottage"], p: 0.11, c: 0.03, f: 0.045, isUnit: false },
  { names: ["minas frescal", "queijo minas"], p: 0.174, c: 0.032, f: 0.20, isUnit: false },
  { names: ["mussarela", "queijo mussarela"], p: 0.226, c: 0.03, f: 0.25, isUnit: false },
  { names: ["iogurte", "iogurte natural", "iogurte integral"], p: 0.035, c: 0.045, f: 0.03, isUnit: false },
  { names: ["iogurte desnatado"], p: 0.04, c: 0.06, f: 0.001, isUnit: false },
  { names: ["requeijão leve", "requeijao leve"], p: 0.09, c: 0.03, f: 0.12, isUnit: false },

  // Cereais, tubérculos e pães (Carboidratos)
  { names: ["arroz", "arroz branco"], p: 0.025, c: 0.28, f: 0.002, isUnit: false },
  { names: ["arroz integral"], p: 0.026, c: 0.258, f: 0.01, isUnit: false },
  { names: ["batata doce", "batatadoce"], p: 0.015, c: 0.20, f: 0.001, isUnit: false },
  { names: ["batata", "batata inglesa"], p: 0.02, c: 0.20, f: 0.0, isUnit: false },
  { names: ["mandioca", "aipim", "macaxeira"], p: 0.015, c: 0.38, f: 0.003, isUnit: false },
  { names: ["macarrão", "macarrao"], p: 0.058, c: 0.308, f: 0.009, isUnit: false },
  { names: ["cuscuz"], p: 0.023, c: 0.23, f: 0.002, isUnit: false },
  { names: ["tapioca"], p: 0.001, c: 0.54, f: 0.0, isUnit: false },
  { names: ["pão francês", "pao frances", "pão de sal"], p: 4.0, c: 29.3, f: 1.55, isUnit: true },
  { names: ["pão integral", "pao integral"], p: 2.5, c: 12.0, f: 1.0, isUnit: true },
  { names: ["pão de queijo", "pao de queijo"], p: 0.051, c: 0.342, f: 0.13, isUnit: false },
  { names: ["aveia", "aveia em flocos"], p: 0.14, c: 0.60, f: 0.07, isUnit: false },
  { names: ["granola"], p: 0.10, c: 0.68, f: 0.09, isUnit: false },

  // Leguminosas e oleaginosas
  { names: ["feijão", "feijao", "feijão carioca"], p: 0.048, c: 0.136, f: 0.005, isUnit: false },
  { names: ["feijão preto", "feijao preto"], p: 0.045, c: 0.14, f: 0.005, isUnit: false },
  { names: ["lentilha"], p: 0.063, c: 0.163, f: 0.005, isUnit: false },
  { names: ["grão de bico", "grao de bico"], p: 0.07, c: 0.20, f: 0.025, isUnit: false },
  { names: ["castanha do pará", "castanha do para"], p: 0.14, c: 0.15, f: 0.63, isUnit: false },
  { names: ["castanha", "nozes", "castanhas", "amendoa", "amêndoas", "castanha de caju"], p: 0.14, c: 0.14, f: 0.66, isUnit: false },
  { names: ["pasta de amendoim", "amendoim"], p: 0.25, c: 0.20, f: 0.50, isUnit: false },
  { names: ["azeite", "azeite de oliva"], p: 0.0, c: 0.0, f: 1.0, isUnit: false },

  // Frutas e vegetais
  { names: ["banana"], p: 1.3, c: 27.0, f: 0.3, isUnit: true },
  { names: ["maçã", "maca"], p: 0.3, c: 14.0, f: 0.2, isUnit: true },
  { names: ["mamão", "mamao"], p: 0.5, c: 11.0, f: 0.1, isUnit: true },
  { names: ["abacate"], p: 0.012, c: 0.06, f: 0.084, isUnit: false },
  { names: ["laranja"], p: 0.9, c: 11.5, f: 0.1, isUnit: true },
  { names: ["morango", "morangos"], p: 0.007, c: 0.08, f: 0.003, isUnit: false },
  { names: ["melancia"], p: 0.009, c: 0.081, f: 0.001, isUnit: false },
  { names: ["alface", "salada", "folhas"], p: 0.013, c: 0.028, f: 0.002, isUnit: false },
  { names: ["brócolis", "brocolis"], p: 0.021, c: 0.044, f: 0.005, isUnit: false },
  { names: ["tomate"], p: 0.011, c: 0.031, f: 0.002, isUnit: false },
  { names: ["cenoura"], p: 0.013, c: 0.077, f: 0.002, isUnit: false },
  { names: ["abobrinha"], p: 0.011, c: 0.03, f: 0.002, isUnit: false },

  // Suplementos
  { names: ["creatina"], p: 0.0, c: 0.0, f: 0.0, isUnit: false },
  { names: ["ômega 3", "omega 3"], p: 0.0, c: 0.0, f: 1.0, isUnit: true },
  { names: ["vitamina d"], p: 0.0, c: 0.0, f: 0.0, isUnit: true },
  { names: ["multivitamínico", "multivitaminico"], p: 0.0, c: 0.0, f: 0.0, isUnit: true },
  { names: ["glutamina"], p: 1.0, c: 0.0, f: 0.0, isUnit: false },
  { names: ["bcaa"], p: 1.0, c: 0.0, f: 0.0, isUnit: false },
  { names: ["maca peruana", "maca"], p: 0.12, c: 0.60, f: 0.01, isUnit: false }
];

export const FOOD_OPTIONS = [
  // --- Cereais, tubérculos e pães ---
  { id: "arroz_branco", label: "🍚 [Cereais] Arroz Branco Cozido (g)", cleanName: "Arroz Branco", unit: "g" },
  { id: "arroz_integral", label: "🌾 [Cereais] Arroz Integral Cozido (g)", cleanName: "Arroz Integral", unit: "g" },
  { id: "pão", label: "🥖 [Cereais] Pão Francês (unidade)", cleanName: "Pão Francês", unit: "un" },
  { id: "pão_integral", label: "🍞 [Cereais] Pão Integral (fatia)", cleanName: "Pão Integral", unit: "fatia" },
  { id: "pão_de_queijo", label: "🧀 [Cereais] Pão de Queijo (g)", cleanName: "Pão de Queijo", unit: "g" },
  { id: "batata", label: "🥔 [Cereais] Batata Inglesa Cozida (g)", cleanName: "Batata Inglesa", unit: "g" },
  { id: "batata_doce", label: "🍠 [Cereais] Batata Doce Cozida (g)", cleanName: "Batata Doce", unit: "g" },
  { id: "mandioca", label: "🌾 [Cereais] Mandioca Cozida (g)", cleanName: "Mandioca", unit: "g" },
  { id: "macarrão", label: "🍝 [Cereais] Macarrão Cozido (g)", cleanName: "Macarrão", unit: "g" },
  { id: "cuscuz", label: "🌽 [Cereais] Cuscuz Nordestino (g)", cleanName: "Cuscuz", unit: "g" },
  { id: "tapioca", label: "🥞 [Cereais] Tapioca Pronta (g)", cleanName: "Tapioca", unit: "g" },
  { id: "aveia", label: "🥣 [Cereais] Aveia em Flocos (g)", cleanName: "Aveia", unit: "g" },
  { id: "granola", label: "🥣 [Cereais] Granola (g)", cleanName: "Granola", unit: "g" },

  // --- Carnes, aves, peixes e ovos ---
  { id: "frango", label: "🍗 [Carnes/Ovos] Peito de Frango Grelhado (g)", cleanName: "Frango Grelhado", unit: "g" },
  { id: "patinho", label: "🥩 [Carnes/Ovos] Patinho Moído (g)", cleanName: "Patinho Moído", unit: "g" },
  { id: "carne", label: "🍖 [Carnes/Ovos] Alcatra Grelhada (g)", cleanName: "Alcatra Grelhada", unit: "g" },
  { id: "contra_file", label: "🥩 [Carnes/Ovos] Contra Filé Grelhado (g)", cleanName: "Contra Filé", unit: "g" },
  { id: "lombo_porco", label: "🐖 [Carnes/Ovos] Lombo de Porco Assado (g)", cleanName: "Lombo de Porco", unit: "g" },
  { id: "tilapia", label: "🐟 [Carnes/Ovos] Filé de Tilápia Grelhado (g)", cleanName: "Filé de Tilápia", unit: "g" },
  { id: "salmao", label: "🐟 [Carnes/Ovos] Salmão Grelhado (g)", cleanName: "Salmão", unit: "g" },
  { id: "atum", label: "🐟 [Carnes/Ovos] Atum em Conserva (g)", cleanName: "Atum", unit: "g" },
  { id: "ovo", label: "🍳 [Carnes/Ovos] Ovo Cozido (unidade)", cleanName: "Ovo Cozido", unit: "un" },
  { id: "clara", label: "🥚 [Carnes/Ovos] Clara de Ovo (unidade)", cleanName: "Clara de Ovo", unit: "un" },

  // --- Leguminosas e oleaginosas ---
  { id: "feijão", label: "🍲 [Leguminosas] Feijão Carioca Cozido (g)", cleanName: "Feijão Carioca", unit: "g" },
  { id: "feijao_preto", label: "🍲 [Leguminosas] Feijão Preto Cozido (g)", cleanName: "Feijão Preto", unit: "g" },
  { id: "lentilha", label: "🍲 [Leguminosas] Lentilha Cozida (g)", cleanName: "Lentilha", unit: "g" },
  { id: "grao_de_bico", label: "🍲 [Leguminosas] Grão de Bico Cozido (g)", cleanName: "Grão de Bico", unit: "g" },
  { id: "castanha_para", label: "🌰 [Oleaginosas] Castanha do Pará (g)", cleanName: "Castanha do Pará", unit: "g" },
  { id: "castanha", label: "🌰 [Oleaginosas] Castanha de Caju (g)", cleanName: "Castanha de Caju", unit: "g" },
  { id: "amendoim", label: "🥜 [Oleaginosas] Amendoim Torrado (g)", cleanName: "Amendoim", unit: "g" },
  { id: "pasta_amendoim", label: "🥜 [Oleaginosas] Pasta de Amendoim (g)", cleanName: "Pasta de Amendoim", unit: "g" },
  { id: "azeite", label: "🫒 [Gorduras] Azeite de Oliva (ml)", cleanName: "Azeite de Oliva", unit: "ml" },

  // --- Laticínios e derivados ---
  { id: "leite_integral", label: "🥛 [Laticínios] Leite Integral (ml)", cleanName: "Leite Integral", unit: "ml" },
  { id: "leite", label: "🥛 [Laticínios] Leite Desnatado (ml)", cleanName: "Leite Desnatado", unit: "ml" },
  { id: "cottage", label: "🧀 [Laticínios] Queijo Cottage (g)", cleanName: "Queijo Cottage", unit: "g" },
  { id: "minas_prescal", label: "🧀 [Laticínios] Queijo Minas Frescal (g)", cleanName: "Queijo Minas", unit: "g" },
  { id: "mussarela", label: "🧀 [Laticínios] Queijo Mussarela (g)", cleanName: "Queijo Mussarela", unit: "g" },
  { id: "iogurte", label: "🥛 [Laticínios] Iogurte Natural Integral (g)", cleanName: "Iogurte Integral", unit: "g" },
  { id: "iogurte_desnatado", label: "🥛 [Laticínios] Iogurte Desnatado (g)", cleanName: "Iogurte Desnatado", unit: "g" },
  { id: "requeijao", label: "🧀 [Laticínios] Requeijão Cremoso Leve (g)", cleanName: "Requeijão Leve", unit: "g" },

  // --- Frutas e verduras populares ---
  { id: "banana", label: "🍌 [Frutas] Banana Prata (unidade)", cleanName: "Banana", unit: "un" },
  { id: "maçã", label: "🍎 [Frutas] Maçã Fuji (unidade)", cleanName: "Maçã", unit: "un" },
  { id: "mamão", label: "🥭 [Frutas] Mamão Formosa (unidade)", cleanName: "Mamão", unit: "un" },
  { id: "abacate", label: "🥑 [Frutas] Abacate (g)", cleanName: "Abacate", unit: "g" },
  { id: "laranja", label: "🍊 [Frutas] Laranja Pera (unidade)", cleanName: "Laranja", unit: "un" },
  { id: "morango", label: "🍓 [Frutas] Morango (g)", cleanName: "Morango", unit: "g" },
  { id: "melancia", label: "🍉 [Frutas] Melancia (g)", cleanName: "Melancia", unit: "g" },
  { id: "alface", label: "🥬 [Verduras] Alface Crespa (g)", cleanName: "Alface", unit: "g" },
  { id: "brócolis", label: "🥦 [Verduras] Brócolis Cozido (g)", cleanName: "Brócolis", unit: "g" },
  { id: "tomate", label: "🍅 [Verduras] Tomate Salada (g)", cleanName: "Tomate", unit: "g" },
  { id: "cenoura", label: "🥕 [Verduras] Cenoura Cozida (g)", cleanName: "Cenoura", unit: "g" },
  { id: "abobrinha", label: "🥒 [Verduras] Abobrinha Cozida (g)", cleanName: "Abobrinha", unit: "g" },

  { id: "custom", label: "✨ Outro Alimento (Texto Livre)", cleanName: "", unit: "" },
];

const SUPPLEMENT_OPTIONS = [
  { id: "whey", label: "💊 [Suple] Whey Protein (g)", cleanName: "Whey Protein", unit: "g" },
  { id: "creatina", label: "💊 [Suple] Creatina (g)", cleanName: "Creatina", unit: "g" },
  { id: "omega3", label: "💊 [Suple] Ômega 3 (caps)", cleanName: "Ômega 3", unit: "caps" },
  { id: "vitamina_d", label: "💊 [Suple] Vitamina D (UI)", cleanName: "Vitamina D", unit: "UI" },
  { id: "multivitaminico", label: "💊 [Suple] Multivitamínico (caps)", cleanName: "Multivitamínico", unit: "caps" },
  { id: "glutamina", label: "💊 [Suple] Glutamina (g)", cleanName: "Glutamina", unit: "g" },
  { id: "bcaa", label: "💊 [Suple] BCAA (g)", cleanName: "BCAA", unit: "g" },
  { id: "maca_peruana", label: "💊 [Suple] Maca Peruana (g)", cleanName: "Maca Peruana", unit: "g" },
  { id: "custom_suple", label: "✨ Outro Suplemento (Texto Livre)", cleanName: "", unit: "" },
];

function analyzeFoodItem(item: string) {
  const lowerItem = item.toLowerCase();

  let qty = 0;
  let isUnitType = false;

  const matchGrams = item.match(/(\d+(?:[.,]\d+)?)\s*(?:g|ml)/i);
  const matchUnits = item.match(
    /(\d+(?:[.,]\d+)?)\s*(?:fatia|unidade|ovo|scoop|col|colher|escumadeira|porção|porcao|un)/i,
  );
  const matchStartNumber = item.match(/^(\d+(?:[.,]\d+)?)/);

  if (matchGrams) {
    qty = parseFloat(matchGrams[1].replace(",", "."));
  } else if (matchUnits) {
    qty = parseFloat(matchUnits[1].replace(",", "."));
    isUnitType = true;
    if (lowerItem.includes("scoop")) qty *= 30;
    if (lowerItem.includes("colher") || lowerItem.includes("col")) qty *= 15;
  } else if (matchStartNumber) {
    qty = parseFloat(matchStartNumber[1].replace(",", "."));
    isUnitType = true;
  } else {
    qty = 100;
  }

  for (const food of FOOD_DATABASE) {
    if (food.names.some((n) => lowerItem.includes(n))) {
      let p = 0,
        c = 0,
        f = 0;

      if (food.isUnit) {
        let units = qty;
        if (!isUnitType && qty > 20) units = qty / 50;
        p = food.p * units;
        c = food.c * units;
        f = food.f * units;
      } else {
        let grams = qty;
        if (isUnitType && qty < 10) grams = qty * 100;
        p = food.p * grams;
        c = food.c * grams;
        f = food.f * grams;
      }

      return { p, c, f };
    }
  }

  return { p: 0, c: 0, f: 0 };
}

export default function Dieta() {
  const { user, loading: authLoading } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [loadingDiet, setLoadingDiet] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [dietId, setDietId] = useState<string | undefined>(undefined);
  const [goal, setGoal] = useState("Hipertrofia");
  const [notes, setNotes] = useState("");
  const [macros, setMacros] = useState<Macros & { hydration?: number }>({
    protein: 0,
    carbs: 0,
    fats: 0,
    proteinPct: 0,
    carbsPct: 0,
    fatsPct: 0,
    hydration: 3.5,
  });
  const [meals, setMeals] = useState<Meal[]>([]);
  const [newItemDrafts, setNewItemDrafts] = useState<
    Record<string, { food: string; qty: string; customName: string }>
  >({});
  const [newSuppDrafts, setNewSuppDrafts] = useState<
    Record<string, { food: string; qty: string; customName: string }>
  >({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isShoppingListOpen, setIsShoppingListOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<{ mealId: string; itemIdx: number } | null>(null);
  const [editingItemDraft, setEditingItemDraft] = useState<{
    food: string;
    qty: string;
    customName: string;
  } | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      fetchPatients();
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (selectedPatientId) {
      fetchDiet(selectedPatientId);
    } else {
      resetDiet();
    }
  }, [selectedPatientId]);

  useEffect(() => {
    if (loadingDiet || meals.length === 0) return;

    let totalP = 0;
    let totalC = 0;
    let totalF = 0;

    let mealsUpdated = false;
    const newMeals = [...meals];

    newMeals.forEach((meal, idx) => {
      let mealP = 0;
      let mealC = 0;
      let mealF = 0;
      meal.items.forEach((item) => {
        const m = analyzeFoodItem(item);
        mealP += m.p;
        mealC += m.c;
        mealF += m.f;
      });
      totalP += mealP;
      totalC += mealC;
      totalF += mealF;

      const mealKcal = Math.round(mealP * 4 + mealC * 4 + mealF * 9);
      if (meal.kcal !== mealKcal) {
        newMeals[idx] = { ...meal, kcal: mealKcal };
        mealsUpdated = true;
      }
    });

    if (mealsUpdated) {
      setMeals(newMeals);
    }

    totalP = Math.round(totalP);
    totalC = Math.round(totalC);
    totalF = Math.round(totalF);

    if (
      macros.protein !== totalP ||
      macros.carbs !== totalC ||
      macros.fats !== totalF
    ) {
      const totalKcal = totalP * 4 + totalC * 4 + totalF * 9;
      let pPct = 0,
        cPct = 0,
        fPct = 0;
      if (totalKcal > 0) {
        pPct = Math.round(((totalP * 4) / totalKcal) * 100);
        cPct = Math.round(((totalC * 4) / totalKcal) * 100);
        fPct = Math.round(((totalF * 9) / totalKcal) * 100);
      }
      setMacros((prev) => ({
        ...prev,
        protein: totalP,
        carbs: totalC,
        fats: totalF,
        proteinPct: pPct,
        carbsPct: cPct,
        fatsPct: fPct,
      }));
    }
  }, [meals, loadingDiet, macros.protein, macros.carbs, macros.fats]);

  const fetchPatients = async (retryCount = 0) => {
    try {
      const data = await PatientService.getAll();
      setPatients(data || []);
    } catch (err: any) {
      console.error(err);
      const msg = err?.message || String(err);
      if ((msg.includes('Failed to fetch') || msg.includes('fetch') || msg.includes('network') || msg.includes('TypeError')) && retryCount < 1) {
        setForceMock(true);
        setTimeout(() => {
          fetchPatients(retryCount + 1);
        }, 50);
        return;
      }
    } finally {
      setLoadingPatients(false);
    }
  };

  const resetDiet = () => {
    setDietId(undefined);
    setGoal("Hipertrofia");
    setNotes("");
    setMacros({
      protein: 0,
      carbs: 0,
      fats: 0,
      proteinPct: 0,
      carbsPct: 0,
      fatsPct: 0,
      hydration: 3.5,
    });
    setMeals(getDefaultMeals());
  };

  const fetchDiet = async (patientId: string, retryCount = 0) => {
    setLoadingDiet(true);
    setErrorMsg("");
    try {
      const patient = patients.find((p) => p.id === patientId);

      let defaultHydration = 3.5;
      if (patient) {
        try {
          const evals = await EvaluationService.getAll();
          const patientEvals = evals
            .filter((e) => e.patientName === patient.name)
            .sort((a: any, b: any) => {
              const dateA = a.createdAt?.toDate
                ? a.createdAt.toDate().getTime()
                : 0;
              const dateB = b.createdAt?.toDate
                ? b.createdAt.toDate().getTime()
                : 0;
              return dateB - dateA;
            });
          if (patientEvals.length > 0 && patientEvals[0].weight) {
            defaultHydration = Number(
              (patientEvals[0].weight * 0.035).toFixed(1),
            );
          }
        } catch (e) {
          // ignore
        }
      }

      const patientDiets = await DietService.getByPatientId(patientId);
      if (patientDiets && patientDiets.length > 0) {
        const d = patientDiets[0];
        const defaultGoal = patient?.goal && PRESET_GOALS.includes(patient.goal) ? patient.goal : "Hipertrofia";
        setDietId(d.id);
        setGoal(d.goal || defaultGoal);
        setNotes(d.notes || "");
        setMacros({ hydration: defaultHydration, ...d.macros } as any);
        // Ensure exactly 5 fixed meals
        let rawMeals = d.meals?.length ? d.meals : getDefaultMeals();

        if (rawMeals.length < 5) {
          const needed = 5 - rawMeals.length;
          for (let i = 0; i < needed; i++) {
            const idx = rawMeals.length;
            rawMeals.push({
              id: crypto.randomUUID(),
              name: MEAL_NAMES[idx] || `Refeição ${idx + 1}`,
              time: MEAL_TIMES[idx] || "00:00",
              kcal: 0,
              items: [],
            });
          }
        }

        rawMeals = rawMeals.slice(0, 5).map((m: any, i: number) => ({
          ...m,
          name: MEAL_NAMES[i],
          items: m.items || [],
        }));

        setMeals(rawMeals);
      } else {
        const defaultGoal = patient?.goal && PRESET_GOALS.includes(patient.goal) ? patient.goal : "Hipertrofia";
        setDietId(undefined);
        setGoal(defaultGoal);
        setNotes("");
        setMacros({
          protein: 0,
          carbs: 0,
          fats: 0,
          proteinPct: 0,
          carbsPct: 0,
          fatsPct: 0,
          hydration: defaultHydration,
        });
        setMeals(getDefaultMeals());
      }
    } catch (err: any) {
      console.error(err);
      const msg = err?.message || String(err);
      if ((msg.includes('Failed to fetch') || msg.includes('fetch') || msg.includes('network') || msg.includes('TypeError')) && retryCount < 1) {
        setForceMock(true);
        setTimeout(() => {
          fetchDiet(patientId, retryCount + 1);
        }, 50);
        return;
      }
      setErrorMsg(
        err.message ||
          "Erro ao buscar dieta. Se a tabela não existir, crie a migration.",
      );
      resetDiet();
    } finally {
      setLoadingDiet(false);
    }
  };

  const handleSave = async () => {
    if (!selectedPatientId) return;
    setSaving(true);
    setErrorMsg("");
    setSaveSuccess(false);
    try {
      const patient = patients.find((p) => p.id === selectedPatientId);
      const diet: Diet = {
        id: dietId,
        patient_id: selectedPatientId,
        patient_name: patient?.name,
        goal,
        notes,
        macros,
        meals,
      };
      const saved = await DietService.save(diet);
      if (saved) {
        setDietId(saved.id);
        setSaveSuccess(true);
        setTimeout(() => {
          setSaveSuccess(false);
        }, 4000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao salvar dieta.");
    } finally {
      setSaving(false);
    }
  };

  const updateMeal = (id: string, field: keyof Meal, value: any) => {
    setMeals(meals.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

  const addMealItem = (mealId: string, itemText: string) => {
    if (!itemText.trim()) return;
    setMeals(
      meals.map((m) =>
        m.id === mealId ? { ...m, items: [...m.items, itemText] } : m,
      ),
    );
  };

  const removeMealItem = (mealId: string, itemIdx: number) => {
    setMeals(
      meals.map((m) =>
        m.id === mealId
          ? { ...m, items: m.items.filter((_, i) => i !== itemIdx) }
          : m,
      ),
    );
  };

  const saveEditedItem = () => {
    if (!editingItemId || !editingItemDraft) return;
    const { mealId, itemIdx } = editingItemId;
    const { food, qty, customName } = editingItemDraft;

    let itemText = "";
    if (food === "custom" || food === "custom_suple") {
      itemText = qty ? `${qty} ${customName}` : customName;
    } else {
      const opt = FOOD_OPTIONS.find((o) => o.id === food);
      const itemNameStr = opt ? (opt.cleanName || opt.label.split(" ")[0]) : food;
      const unit = opt ? opt.unit : "g";
      itemText = `${qty}${unit} de ${itemNameStr}`;
    }

    setMeals(
      meals.map((m) => {
        if (m.id === mealId) {
          const updatedItems = [...m.items];
          if (itemText.trim() === "") {
            updatedItems.splice(itemIdx, 1);
          } else {
            updatedItems[itemIdx] = itemText.trim();
          }
          return { ...m, items: updatedItems };
        }
        return m;
      })
    );
    setEditingItemId(null);
    setEditingItemDraft(null);
  };

  // Recalculate percentages when macros change
  const handleMacroChange = (
    field: "protein" | "carbs" | "fats" | "hydration",
    val: number,
  ) => {
    const newMacros = { ...macros, [field]: val };

    // Recalculate percentages if protein, carbs, or fats change
    const totalKcal =
      newMacros.protein * 4 + newMacros.carbs * 4 + newMacros.fats * 9;
    if (totalKcal > 0) {
      newMacros.proteinPct = Math.round(
        ((newMacros.protein * 4) / totalKcal) * 100,
      );
      newMacros.carbsPct = Math.round(
        ((newMacros.carbs * 4) / totalKcal) * 100,
      );
      newMacros.fatsPct = Math.round(((newMacros.fats * 9) / totalKcal) * 100);
    } else {
      newMacros.proteinPct = 0;
      newMacros.carbsPct = 0;
      newMacros.fatsPct = 0;
    }
    setMacros(newMacros);
  };

  const totalCalories = macros.protein * 4 + macros.carbs * 4 + macros.fats * 9;

  // Format current date for subtitle
  const currentDateFormatted = new Date().toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
  const subtitle = `Planejamento ${goal} - Fase 1 (${currentDateFormatted})`;

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 max-w-7xl mx-auto print:hidden"
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-outline-variant/30">
          <div>
            <div className="flex items-center gap-2 text-on-surface-variant text-sm mb-2 font-medium">
              <span>Pacientes</span>
              <span>›</span>
              <span className="text-primary">
                {patients.find((p) => p.id === selectedPatientId)?.name ||
                  "Selecione um paciente"}
              </span>
            </div>
            <h1 className="text-4xl font-black text-on-surface tracking-tight">
              Prescrição Nutricional
            </h1>
            <p className="text-on-surface-variant text-base font-medium mt-1 capitalize">
              {subtitle}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsShoppingListOpen(true)}
              disabled={!selectedPatientId || meals.length === 0}
              className="bg-surface-container-highest text-on-surface hover:text-primary px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-surface-dim transition-all border border-outline-variant disabled:opacity-50 disabled:cursor-not-allowed"
              title="Gerar Lista de Compras baseada no cardápio"
            >
              <ShoppingCart size={18} className="text-primary animate-none" />
              Lista de Compras
            </button>
            <button
              onClick={() => window.print()}
              disabled={!selectedPatientId}
              className="bg-surface-container-highest text-on-surface hover:text-primary px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-surface-dim transition-all border border-outline-variant disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText size={18} />
              Imprimir PDF
            </button>
            <button
              onClick={handleSave}
              disabled={!selectedPatientId || saving}
              className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {saving ? "Salvando..." : "Salvar Plano"}
            </button>
          </div>
        </div>

        {saveSuccess && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-emerald-500 text-sm font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Plano alimentar salvo com sucesso!
          </div>
        )}

        {errorMsg && (
          <div className="bg-error/10 border border-error/20 p-4 rounded-xl text-error text-sm font-medium">
            {errorMsg}
            {errorMsg.includes("não existe") && (
              <p className="mt-2 text-on-surface font-normal">
                Vá ao painel do Supabase, clique em &quot;SQL Editor&quot;, crie
                uma new query, cole o conteúdo de{" "}
                <code className="bg-surface-dim px-1 rounded text-primary">
                  supabase/migrations/20260519100000_diets.sql
                </code>{" "}
                e execute.
              </p>
            )}
          </div>
        )}

        {/* Setup Parameters */}
        <div className="bg-surface-container p-6 rounded-2xl border border-outline-variant flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className="flex-1 w-full max-w-sm space-y-2">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest outline-none">
              Selecionar Paciente
            </label>
            <select
              className="w-full bg-surface text-on-surface border border-outline-variant p-3 rounded-xl focus:border-primary outline-none font-medium"
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              disabled={loadingPatients}
            >
              <option value="">Selecione um paciente...</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 w-full space-y-2">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest outline-none">
              Objetivo da Dieta
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_GOALS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => selectedPatientId && setGoal(preset)}
                  disabled={!selectedPatientId}
                  className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                    goal === preset
                      ? "bg-primary text-on-primary border-primary shadow-sm shadow-primary/20"
                      : "bg-surface border-outline-variant text-on-surface-variant hover:text-on-surface hover:border-primary/50"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loadingDiet ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : (
          <div
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 opacity-100 transition-opacity"
            style={{
              opacity: selectedPatientId ? 1 : 0.5,
              pointerEvents: selectedPatientId ? "auto" : "none",
            }}
          >
            {/* Left Column: Meals */}
            <div className="lg:col-span-8 space-y-6">
              {meals.map((meal, i) => (
                <div
                  key={meal.id}
                  className="bg-surface-container border border-outline-variant rounded-2xl p-5 flex flex-col md:flex-row gap-5 overflow-hidden relative group"
                >
                  {/* Time Block */}
                  <div className="bg-[#132d24] border border-emerald-500/20 rounded-xl p-4 flex flex-col items-center justify-center shrink-0 min-w-[140px]">
                    <input
                      type="time"
                      value={meal.time}
                      onChange={(e) =>
                        updateMeal(meal.id, "time", e.target.value)
                      }
                      className="bg-transparent text-emerald-400 text-[28px] font-bold text-center w-full outline-none appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-inner-spin-button]:hidden p-0 m-0 cursor-text"
                    />
                    <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest mt-1 text-center">
                      {getMealAbbreviation(MEAL_NAMES[i])}
                    </span>
                  </div>

                  {/* Meal Content */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <h3 className="text-on-surface text-xl font-bold max-w-[200px] sm:max-w-none pb-1 truncate">
                          {MEAL_NAMES[i]}
                        </h3>
                        {/* Tag Selection */}
                        <select
                          value={meal.tag || ""}
                          onChange={(e) =>
                            updateMeal(meal.id, "tag", e.target.value)
                          }
                          className={`text-[9px] uppercase font-black tracking-widest outline-none py-1 px-2 rounded border appearance-none text-center cursor-pointer ${
                            meal.tag
                              ? PRESET_TAGS.find((t) => t.id === meal.tag)
                                  ?.color ||
                                "bg-surface border-outline-variant text-on-surface-variant"
                              : "bg-surface border-transparent text-on-surface-variant/50 hover:bg-surface-dim"
                          }`}
                        >
                          <option value="">+ Add Tag</option>
                          {PRESET_TAGS.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.id}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Food Items Grid*/}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 pt-2">
                      {meal.items.map((item, itemIdx) => {
                        const isEditing = editingItemId?.mealId === meal.id && editingItemId?.itemIdx === itemIdx;
                        return (
                          <div
                            key={itemIdx}
                            className={`flex items-center gap-3 group/item min-h-[28px] ${isEditing ? "col-span-1 md:col-span-2" : ""}`}
                          >
                            <div className="text-primary/70 shrink-0">
                              {getFoodIcon(item)}
                            </div>
                            
                            {isEditing && editingItemDraft ? (
                              <div className="flex items-center gap-1.5 flex-1 bg-surface-dim/80 p-1.5 rounded-xl border border-[#38bdf8] flex-wrap md:flex-nowrap">
                                <select
                                  value={editingItemDraft.food}
                                  onChange={(e) => {
                                    setEditingItemDraft({
                                      ...editingItemDraft,
                                      food: e.target.value,
                                    });
                                  }}
                                  className="bg-surface border border-outline-variant text-[11px] font-semibold text-on-surface rounded-md p-1 outline-none focus:border-primary flex-1 min-w-[100px]"
                                >
                                  <option value="custom">Outro (Customizado)...</option>
                                  {FOOD_OPTIONS.map((opt) => (
                                    <option key={opt.id} value={opt.id}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </select>

                                {editingItemDraft.food === "custom" && (
                                  <input
                                    type="text"
                                    placeholder="Nome do alimento"
                                    value={editingItemDraft.customName}
                                    onChange={(e) => {
                                      setEditingItemDraft({
                                        ...editingItemDraft,
                                        customName: e.target.value,
                                      });
                                    }}
                                    className="bg-surface border border-outline-variant text-[11px] font-semibold text-on-surface rounded-md p-1 outline-none focus:border-primary flex-1 min-w-[90px]"
                                  />
                                )}

                                <div className="flex items-center gap-1 shrink-0">
                                  <input
                                    type="number"
                                    step="any"
                                    placeholder="Qtd."
                                    value={editingItemDraft.qty}
                                    onChange={(e) => {
                                      setEditingItemDraft({
                                        ...editingItemDraft,
                                        qty: e.target.value,
                                      });
                                    }}
                                    className="bg-surface border border-outline-variant text-[11px] font-semibold text-on-surface rounded-md p-1 outline-none focus:border-primary w-12 text-center"
                                  />
                                  <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider">
                                    {FOOD_OPTIONS.find((o) => o.id === editingItemDraft.food)?.unit || "un."}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    onClick={saveEditedItem}
                                    className="p-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 hover:scale-105 transition-all"
                                    title="Salvar Alteração"
                                  >
                                    <Check size={12} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingItemId(null);
                                      setEditingItemDraft(null);
                                    }}
                                    className="p-1 rounded-md bg-surface-container-high text-on-surface-variant hover:text-error border border-outline-variant hover:scale-105 transition-all"
                                    title="Cancelar"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm font-medium text-on-surface/90 flex-1 leading-snug truncate">
                                {item}
                              </span>
                            )}
                            
                            <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover/item:opacity-100 transition-opacity">
                              {!isEditing && (
                                <button
                                  onClick={() => {
                                    setEditingItemId({ mealId: meal.id, itemIdx });
                                    setEditingItemDraft(parseMealItem(item));
                                  }}
                                  className="text-on-surface-variant hover:text-[#38bdf8] transition-colors"
                                  title="Editar Alimento"
                                >
                                  <Pencil size={14} />
                                </button>
                              )}
                              <button
                                onClick={() => removeMealItem(meal.id, itemIdx)}
                                className="text-on-surface-variant hover:text-error transition-colors"
                                title="Remover"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Add new item input */}
                    <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant/30">
                      {/* Row 1: Alimentos */}
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="w-5 h-5 flex items-center justify-center shrink-0 text-on-surface-variant hidden md:flex">
                          <Plus size={14} />
                        </div>

                        <select
                          className="bg-surface border border-outline-variant text-sm font-medium text-on-surface rounded-lg p-2 outline-none focus:border-primary flex-1 min-w-[140px]"
                          value={newItemDrafts[meal.id]?.food || ""}
                          onChange={(e) => {
                            setNewItemDrafts({
                              ...newItemDrafts,
                              [meal.id]: {
                                ...(newItemDrafts[meal.id] || {
                                  qty: "",
                                  customName: "",
                                }),
                                food: e.target.value,
                              },
                            });
                          }}
                        >
                          <option value="" disabled>
                            Selecione o alimento...
                          </option>
                          {FOOD_OPTIONS.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.label}
                            </option>
                          ))}
                        </select>

                        {newItemDrafts[meal.id]?.food === "custom" && (
                          <input
                            type="text"
                            placeholder="Nome do alimento"
                            className="bg-surface border border-outline-variant text-sm font-medium text-on-surface rounded-lg p-2 outline-none focus:border-primary flex-1 min-w-[100px]"
                            value={newItemDrafts[meal.id]?.customName || ""}
                            onChange={(e) =>
                              setNewItemDrafts({
                                ...newItemDrafts,
                                [meal.id]: {
                                  ...newItemDrafts[meal.id],
                                  customName: e.target.value,
                                },
                              })
                            }
                          />
                        )}

                        <input
                          type="number"
                          placeholder={
                            FOOD_OPTIONS.find(
                              (o) => o.id === newItemDrafts[meal.id]?.food,
                            )?.unit || "Qtd."
                          }
                          className="bg-surface border border-outline-variant text-sm font-medium text-on-surface rounded-lg p-2 outline-none focus:border-primary w-20"
                          value={newItemDrafts[meal.id]?.qty || ""}
                          onChange={(e) =>
                            setNewItemDrafts({
                              ...newItemDrafts,
                              [meal.id]: {
                                ...newItemDrafts[meal.id],
                                qty: e.target.value,
                              },
                            })
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const draft = newItemDrafts[meal.id];
                              if (
                                draft?.food &&
                                draft?.qty &&
                                (draft.food !== "custom" || draft.customName)
                              ) {
                                const opt = FOOD_OPTIONS.find(
                                  (o) => o.id === draft.food,
                                );
                                let itemText = "";
                                if (draft.food === "custom") {
                                  itemText = `${draft.qty} ${draft.customName}`;
                                } else {
                                  const itemNameStr = opt
                                    ? (opt.cleanName || opt.label.split(" ")[0])
                                    : draft.food;
                                  const unit = opt ? opt.unit : "g";
                                  itemText = `${draft.qty}${unit} ${itemNameStr}`;
                                }
                                addMealItem(meal.id, itemText);
                                setNewItemDrafts({
                                  ...newItemDrafts,
                                  [meal.id]: {
                                    food: "",
                                    qty: "",
                                    customName: "",
                                  },
                                });
                              }
                            }
                          }}
                        />

                        <button
                          onClick={() => {
                            const draft = newItemDrafts[meal.id];
                            if (
                              draft?.food &&
                              (draft.food === "custom" ? !!draft.customName : !!draft.qty)
                            ) {
                              const opt = FOOD_OPTIONS.find(
                                (o) => o.id === draft.food,
                              );
                              let itemText = "";
                              if (draft.food === "custom") {
                                itemText = draft.qty ? `${draft.qty} ${draft.customName}` : draft.customName;
                              } else {
                                const itemNameStr = opt
                                  ? (opt.cleanName || opt.label.split(" ")[0])
                                  : draft.food;
                                const unit = opt ? opt.unit : "g";
                                itemText = `${draft.qty}${unit} ${itemNameStr}`;
                              }
                              addMealItem(meal.id, itemText);
                              setNewItemDrafts({
                                ...newItemDrafts,
                                [meal.id]: { food: "", qty: "", customName: "" },
                              });
                            }
                          }}
                          disabled={
                            !newItemDrafts[meal.id]?.food ||
                            (newItemDrafts[meal.id]?.food === "custom"
                              ? !newItemDrafts[meal.id]?.customName
                              : !newItemDrafts[meal.id]?.qty)
                          }
                          className="bg-primary text-on-primary p-2 flex items-center justify-center rounded-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      {/* Row 2: Suplementos */}
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="w-5 h-5 flex items-center justify-center shrink-0 text-on-surface-variant hidden md:flex">
                          <Plus size={14} />
                        </div>

                        <select
                          className="bg-surface border border-outline-variant text-sm font-medium text-on-surface rounded-lg p-2 outline-none focus:border-primary flex-1 min-w-[140px]"
                          value={newSuppDrafts[meal.id]?.food || ""}
                          onChange={(e) => {
                            setNewSuppDrafts({
                              ...newSuppDrafts,
                              [meal.id]: {
                                ...(newSuppDrafts[meal.id] || {
                                  qty: "",
                                  customName: "",
                                }),
                                food: e.target.value,
                              },
                            });
                          }}
                        >
                          <option value="" disabled>
                            Adicionar Suplemento...
                          </option>
                          {SUPPLEMENT_OPTIONS.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.label}
                            </option>
                          ))}
                        </select>

                        {newSuppDrafts[meal.id]?.food === "custom_suple" && (
                          <input
                            type="text"
                            placeholder="Nome do suplemento"
                            className="bg-surface border border-outline-variant text-sm font-medium text-on-surface rounded-lg p-2 outline-none focus:border-primary flex-1 min-w-[100px]"
                            value={newSuppDrafts[meal.id]?.customName || ""}
                            onChange={(e) =>
                              setNewSuppDrafts({
                                ...newSuppDrafts,
                                [meal.id]: {
                                  ...newSuppDrafts[meal.id],
                                  customName: e.target.value,
                                },
                              })
                            }
                          />
                        )}

                        <input
                          type="number"
                          placeholder={
                            SUPPLEMENT_OPTIONS.find(
                              (o) => o.id === newSuppDrafts[meal.id]?.food,
                            )?.unit || "Qtd."
                          }
                          className="bg-surface border border-outline-variant text-sm font-medium text-on-surface rounded-lg p-2 outline-none focus:border-primary w-20"
                          value={newSuppDrafts[meal.id]?.qty || ""}
                          onChange={(e) =>
                            setNewSuppDrafts({
                              ...newSuppDrafts,
                              [meal.id]: {
                                ...newSuppDrafts[meal.id],
                                qty: e.target.value,
                              },
                            })
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const draft = newSuppDrafts[meal.id];
                              if (
                                draft?.food &&
                                (draft.food === "custom_suple" ? !!draft.customName : !!draft.qty)
                              ) {
                                const opt = SUPPLEMENT_OPTIONS.find(
                                  (o) => o.id === draft.food,
                                );
                                let itemText = "";
                                if (draft.food === "custom_suple") {
                                  itemText = draft.qty ? `${draft.qty} ${draft.customName}` : draft.customName;
                                } else {
                                  const itemNameStr = opt
                                    ? (opt.cleanName || opt.label.split(" ")[0])
                                    : draft.food;
                                  const unit = opt ? opt.unit : "g";
                                  itemText = `${draft.qty}${unit} ${itemNameStr}`;
                                }
                                addMealItem(meal.id, itemText);
                                setNewSuppDrafts({
                                  ...newSuppDrafts,
                                  [meal.id]: {
                                    food: "",
                                    qty: "",
                                    customName: "",
                                  },
                                });
                              }
                            }
                          }}
                        />

                        <button
                          onClick={() => {
                            const draft = newSuppDrafts[meal.id];
                            if (
                                draft?.food &&
                                (draft.food === "custom_suple" ? !!draft.customName : !!draft.qty)
                            ) {
                              const opt = SUPPLEMENT_OPTIONS.find(
                                  (o) => o.id === draft.food,
                                );
                              let itemText = "";
                              if (draft.food === "custom_suple") {
                                itemText = draft.qty ? `${draft.qty} ${draft.customName}` : draft.customName;
                              } else {
                                const itemNameStr = opt
                                  ? (opt.cleanName || opt.label.split(" ")[0])
                                  : draft.food;
                                const unit = opt ? opt.unit : "g";
                                itemText = `${draft.qty}${unit} ${itemNameStr}`;
                              }
                              addMealItem(meal.id, itemText);
                              setNewSuppDrafts({
                                ...newSuppDrafts,
                                [meal.id]: { food: "", qty: "", customName: "" },
                              });
                            }
                          }}
                          disabled={
                            !newSuppDrafts[meal.id]?.food ||
                            (newSuppDrafts[meal.id]?.food === "custom_suple" 
                              ? !newSuppDrafts[meal.id]?.customName
                              : !newSuppDrafts[meal.id]?.qty)
                          }
                          className="bg-primary text-on-primary p-2 flex items-center justify-center rounded-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column: Macros & Sidebar Info */}
            <div className="lg:col-span-4 space-y-6">
              {/* Hydration Card */}
              <div className="bg-surface-container border border-outline-variant rounded-3xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-on-surface">
                    Hidratação
                  </h3>
                  <Droplet className="text-[#38bdf8]" size={20} />
                </div>
                <div className="flex items-end gap-1 mb-4">
                  <input
                    type="number"
                    step="0.1"
                    className="bg-transparent text-4xl w-24 font-black text-primary outline-none focus:border-b border-primary"
                    value={macros.hydration || 3.5}
                    onChange={(e) =>
                      handleMacroChange("hydration", Number(e.target.value))
                    }
                  />
                  <span className="text-xl font-bold text-on-surface-variant mb-1">
                    L/dia
                  </span>
                </div>
                <div className="h-2.5 w-full bg-surface-dim rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-[#38bdf8] w-3/4"></div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[11px] font-bold text-on-surface-variant">
                    Progresso: -- L
                  </span>
                  <span className="text-[11px] font-bold text-on-surface-variant">
                    Meta: {macros.hydration || 3.5}L
                  </span>
                </div>
              </div>

              {/* Macros Card */}
              <section className="bg-surface-container border border-outline-variant rounded-3xl p-6">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-on-surface mb-2">
                    Metas de Macronutrientes
                  </h3>
                  <div className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                    {totalCalories} Kcal Totais
                  </div>
                </div>

                <div className="space-y-5">
                  {[
                    {
                      label: "Proteínas",
                      field: "protein",
                      value: macros.protein,
                      percent: macros.proteinPct,
                      color: "#4edea3",
                    },
                    {
                      label: "Carboidratos",
                      field: "carbs",
                      value: macros.carbs,
                      percent: macros.carbsPct,
                      color: "#f8fafc",
                    },
                    {
                      label: "Gorduras",
                      field: "fats",
                      value: macros.fats,
                      percent: macros.fatsPct,
                      color: "#f59e0b",
                    },
                  ].map((macro, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between items-end">
                        <p className="text-sm font-bold text-on-surface">
                          {macro.label}
                        </p>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={macro.value || ""}
                            onChange={(e) =>
                              handleMacroChange(
                                macro.field as any,
                                Number(e.target.value),
                              )
                            }
                            className="w-14 bg-transparent border-b border-transparent focus:border-primary text-right text-on-surface font-black outline-none"
                          />
                          <span className="text-sm font-bold text-on-surface-variant">
                            g
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 w-full bg-surface-dim rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{
                            width: `${macro.percent || 10}%`,
                            backgroundColor: macro.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 p-4 bg-surface-dim/50 rounded-xl border border-outline-variant/50 border-dashed">
                  <p className="text-xs text-on-surface-variant italic font-medium leading-relaxed">
                    &quot;A constância nos macronutrientes é a chave para a
                    hipertrofia e emagrecimento.&quot;
                  </p>
                </div>
              </section>

              {/* Substitutions or Notes */}
              <div className="bg-surface-container border border-outline-variant rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <ListRestart className="text-primary" size={24} />
                  <h3 className="text-xl font-bold text-on-surface leading-tight">
                    Diretrizes e<br />
                    Substituições
                  </h3>
                </div>
                <textarea
                  className="w-full h-32 bg-surface-dim border border-transparent text-sm text-on-surface rounded-xl p-3 outline-none focus:border-primary resize-none placeholder-on-surface-variant/50"
                  placeholder="Ex: Beber bastante água. Usar temperos naturais como alho, cebola, orégano, etc..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Clinical Template Manager */}
              <ClinicalTemplateManager
                type="diet"
                currentData={{ meals, macros, notes, goal }}
                onApply={(data) => {
                  if (data.meals) setMeals(data.meals);
                  if (data.notes !== undefined) setNotes(data.notes);
                  if (data.goal) setGoal(data.goal);
                  if (data.macros) {
                    setMacros((prev) => ({
                      ...prev,
                      ...data.macros
                    }));
                  }
                }}
                disabled={!selectedPatientId}
              />

              {/* Substitution Calculator Guide */}
              <SubstitutionGuide />
            </div>
          </div>
        )}
      </motion.div>

      {/* Print-Only Layout */}
      {selectedPatientId && (
        <div className="hidden print:block text-slate-900 bg-white font-sans max-w-4xl mx-auto p-8 space-y-8">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-emerald-600 pb-6">
            <div>
              <h1 className="text-3xl font-extrabold text-emerald-800 tracking-tight">CRN Nutrição</h1>
              <p className="text-sm text-slate-500 font-medium">Dr. Antônio Feitoza - Nutricionista</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-slate-800">Plano Alimentar Prescrito</h2>
              <p className="text-xs text-slate-400 mt-1">{currentDateFormatted}</p>
            </div>
          </div>

          {/* Patient Details Info */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Paciente</p>
              <p className="text-slate-800 font-extrabold text-lg">
                {patients.find((p) => p.id === selectedPatientId)?.name || "-"}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Objetivo do Plano</p>
              <p className="text-slate-800 font-extrabold text-lg">{goal}</p>
            </div>
          </div>

          {/* Macros Summary Panel */}
          <div className="border border-slate-100 rounded-2xl p-6 bg-slate-50/50 space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-dashed border-slate-200 pb-2">
              Distribuição Nutricional Diária
            </h3>
            <div className="grid grid-cols-5 gap-4 text-center">
              <div>
                <p className="text-sm font-bold text-slate-800">{totalCalories} kcal</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Meta Calórica</p>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{macros.protein}g ({macros.proteinPct}%)</p>
                <p className="text-[10px] font-bold text-emerald-600 uppercase mt-1">Proteínas</p>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{macros.carbs}g ({macros.carbsPct}%)</p>
                <p className="text-[10px] font-bold text-amber-600 uppercase mt-1">Carboidratos</p>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{macros.fats}g ({macros.fatsPct}%)</p>
                <p className="text-[10px] font-bold text-rose-600 uppercase mt-1">Gorduras</p>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{macros.hydration} L</p>
                <p className="text-[10px] font-bold text-sky-600 uppercase mt-1">Hidratação</p>
              </div>
            </div>
          </div>

          {/* Meals Listing */}
          <div className="space-y-6">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">
              Refeições Recomendadas
            </h3>
            {meals.map((meal, index) => (
              <div key={meal.id} className="border border-slate-100 rounded-2xl p-5 bg-white shadow-sm space-y-3 [page-break-inside:avoid]">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-3">
                    <span className="bg-emerald-50 text-emerald-800 font-bold px-3 py-1 rounded-lg text-sm">
                      {meal.time}
                    </span>
                    <h4 className="font-extrabold text-slate-800 text-base">{meal.name}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    {meal.tag && (
                      <span className="text-[9px] font-bold uppercase tracking-widest bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {meal.tag}
                      </span>
                    )}
                    <span className="text-xs font-bold text-slate-500">{meal.kcal} kcal</span>
                  </div>
                </div>
                {meal.items.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Nenhum item adicionado a esta refeição.</p>
                ) : (
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-slate-700 text-sm font-medium pl-2 list-disc list-inside">
                    {meal.items.map((item, idx) => (
                      <li key={idx} className="marker:text-emerald-500">{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          {/* Notes and Guidelines */}
          {notes && (
            <div className="border border-slate-100 rounded-2xl p-6 bg-slate-50 space-y-2 [page-break-inside:avoid]">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Orientações Gerais e Observações
              </h3>
              <p className="text-slate-700 text-sm whitespace-pre-wrap font-medium">{notes}</p>
            </div>
          )}

          {/* Signatures */}
          <div className="pt-12 flex justify-between items-end border-t border-slate-200 text-xs text-slate-400">
            <div>
              <p>Documento gerado digitalmente pelo sistema CRN Nutrição.</p>
              <p>© 2026 CRN Nutrição - Dr. Antônio Feitoza.</p>
            </div>
            <div className="text-right border-t border-dashed border-slate-400 pt-2 w-48">
              <p className="font-bold text-slate-600">Assinatura do Profissional</p>
            </div>
          </div>
        </div>
      )}

      <ShoppingListModal 
        isOpen={isShoppingListOpen}
        onClose={() => setIsShoppingListOpen(false)}
        meals={meals}
        patientName={patients.find((p) => p.id === selectedPatientId)?.name || 'Paciente'}
      />
    </DashboardLayout>
  );
}
