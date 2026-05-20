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
} from "lucide-react";
import { motion } from "motion/react";
import { Patient, PatientService } from "@/lib/patient-service";
import { Diet, DietService, Meal, Macros } from "@/lib/diet-service";

const PRESET_GOALS = [
  "Hipertrofia",
  "Emagrecimento",
  "Manutenção",
  "Performance",
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

const FOOD_DATABASE = [
  { names: ["frango"], p: 0.31, c: 0, f: 0.036, isUnit: false },
  { names: ["arroz"], p: 0.025, c: 0.28, f: 0.002, isUnit: false },
  { names: ["feijão", "feijao"], p: 0.048, c: 0.136, f: 0.005, isUnit: false },
  { names: ["ovo", "ovos"], p: 6, c: 0.5, f: 5, isUnit: true },
  { names: ["batata", "mandioca"], p: 0.02, c: 0.2, f: 0, isUnit: false },
  { names: ["whey"], p: 0.8, c: 0.1, f: 0.05, isUnit: false },
  {
    names: ["carne", "patinho", "boi", "bife"],
    p: 0.3,
    c: 0,
    f: 0.05,
    isUnit: false,
  },
  { names: ["pão", "pao"], p: 2.5, c: 12, f: 1, isUnit: true },
  { names: ["leite"], p: 0.03, c: 0.05, f: 0.03, isUnit: false },
  { names: ["banana"], p: 1.3, c: 27, f: 0.3, isUnit: true },
  { names: ["aveia"], p: 0.14, c: 0.6, f: 0.07, isUnit: false },
  { names: ["azeite"], p: 0, c: 0, f: 1, isUnit: false },
  {
    names: ["peixe", "tilápia", "tilapia"],
    p: 0.26,
    c: 0,
    f: 0.02,
    isUnit: false,
  },
  { names: ["macarrão", "macarrao"], p: 0.05, c: 0.3, f: 0.01, isUnit: false },
  { names: ["iogurte"], p: 0.04, c: 0.05, f: 0.03, isUnit: false },
  { names: ["abacate"], p: 0.02, c: 0.09, f: 0.15, isUnit: false },
  {
    names: ["amendoim", "pasta de amendoim"],
    p: 0.25,
    c: 0.2,
    f: 0.5,
    isUnit: false,
  },
  { names: ["castanha", "nozes"], p: 0.14, c: 0.14, f: 0.66, isUnit: false },
  { names: ["maçã", "maca"], p: 0.3, c: 14, f: 0.2, isUnit: true },
  { names: ["mamão", "mamao"], p: 0.5, c: 11, f: 0.1, isUnit: true },
];

const FOOD_OPTIONS = [
  { id: "frango", label: "Frango (g)", unit: "g" },
  { id: "arroz", label: "Arroz (g)", unit: "g" },
  { id: "feijão", label: "Feijão (g)", unit: "g" },
  { id: "ovo", label: "Ovo (un)", unit: "un" },
  { id: "batata", label: "Batata/Mandioca (g)", unit: "g" },
  { id: "whey", label: "Whey Protein (g)", unit: "g" },
  { id: "carne", label: "Carne Vermelha/Patinho (g)", unit: "g" },
  { id: "pão", label: "Pão (fatia)", unit: "fatia" },
  { id: "leite", label: "Leite (ml)", unit: "ml" },
  { id: "banana", label: "Banana (un)", unit: "un" },
  { id: "aveia", label: "Aveia (g)", unit: "g" },
  { id: "azeite", label: "Azeite (ml)", unit: "ml" },
  { id: "peixe", label: "Peixe/Tilápia (g)", unit: "g" },
  { id: "macarrão", label: "Macarrão (g)", unit: "g" },
  { id: "iogurte", label: "Iogurte (g/ml)", unit: "g" },
  { id: "abacate", label: "Abacate (g)", unit: "g" },
  { id: "amendoim", label: "Pasta de Amendoim (g)", unit: "g" },
  { id: "castanha", label: "Castanha/Nozes (g)", unit: "g" },
  { id: "maçã", label: "Maçã (un)", unit: "un" },
  { id: "mamão", label: "Mamão (un)", unit: "un" },
  { id: "custom", label: "Outro Alimento (Texto Livre)", unit: "" },
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

  useEffect(() => {
    fetchPatients();
  }, []);

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

  const fetchPatients = async () => {
    try {
      const data = await PatientService.getAll();
      setPatients(data || []);
    } catch (err: any) {
      console.error(err);
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

  const fetchDiet = async (patientId: string) => {
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
        setDietId(d.id);
        setGoal(d.goal || "Hipertrofia");
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
          hydration: defaultHydration,
        });
        setMeals(getDefaultMeals());
      }
    } catch (err: any) {
      if (!String(err?.message || err).toLowerCase().includes('failed to fetch')) {
        setErrorMsg(
          err.message ||
            "Erro ao buscar dieta. Se a tabela não existir, crie a migration.",
        );
      }
      resetDiet();
    } finally {
      setLoadingDiet(false);
    }
  };

  const handleSave = async () => {
    if (!selectedPatientId) return;
    setSaving(true);
    setErrorMsg("");
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
      if (saved) setDietId(saved.id);
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
        className="space-y-6 max-w-7xl mx-auto"
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
            <button className="bg-surface-container-highest text-on-surface hover:text-primary px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-surface-dim transition-all border border-outline-variant">
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
                      {meal.items.map((item, itemIdx) => (
                        <div
                          key={itemIdx}
                          className="flex items-start gap-3 group/item"
                        >
                          <div className="text-primary/70 shrink-0 mt-0.5">
                            {getFoodIcon(item)}
                          </div>
                          <span className="text-sm font-medium text-on-surface/90 flex-1 leading-snug">
                            {item}
                          </span>
                          <button
                            onClick={() => removeMealItem(meal.id, itemIdx)}
                            className="text-on-surface-variant hover:text-error opacity-0 group-hover/item:opacity-100 transition-opacity"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add new item input */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-outline-variant/30">
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
                                  ? opt.label.split(" ")[0]
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
                                ? opt.label.split(" ")[0]
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
                          !newItemDrafts[meal.id]?.qty ||
                          (newItemDrafts[meal.id]?.food === "custom" &&
                            !newItemDrafts[meal.id]?.customName)
                        }
                        className="bg-primary text-on-primary p-2 flex items-center justify-center rounded-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                      >
                        <Plus size={16} />
                      </button>
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
            </div>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
