import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Save } from "lucide-react";
import { getCurrentWeek, applyWeekPlan, saveTemplate } from "../api/client";
import RecipePicker from "../components/RecipePicker";
import {
  IOSStatusBar, IOSLargeHeader, IOSGroupHeader, IOSGroup, IOSTabBar,
} from "../components/IOSPrimitives";
import DesktopShell from "../components/DesktopShell";

const DAYS = ["maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag", "zondag"];
const DAYS_SHORT = {
  maandag: "Ma", dinsdag: "Di", woensdag: "Wo", donderdag: "Do",
  vrijdag: "Vr", zaterdag: "Za", zondag: "Zo",
};
const MEAL_TYPES = ["ontbijt", "lunch", "diner", "snack"];
const MEAL_LABEL = { ontbijt: "Ontbijt", lunch: "Lunch", diner: "Diner", snack: "Snack" };

export default function WeekPlanBuilder() {
  const navigate = useNavigate();
  const [slots, setSlots] = useState({});
  const [picker, setPicker] = useState(null); // { dag, mealType }
  const [applying, setApplying] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [savedTemplate, setSavedTemplate] = useState(false);

  function getSlot(dag, mealType) {
    return slots[dag]?.[mealType] ?? null;
  }

  function setSlot(dag, mealType, recipe) {
    setSlots(s => ({
      ...s,
      [dag]: { ...(s[dag] ?? {}), [mealType]: recipe },
    }));
  }

  function buildSlotsArray() {
    const arr = [];
    for (const dag of DAYS) {
      for (const mealType of MEAL_TYPES) {
        const recipe = getSlot(dag, mealType);
        if (recipe) arr.push({ dag, maaltijd_type: mealType, recept_id: recipe.id });
      }
    }
    return arr;
  }

  async function handleApply() {
    setApplying(true);
    try {
      const week = await getCurrentWeek();
      await applyWeekPlan(week, buildSlotsArray());
      navigate("/weekplan");
    } finally {
      setApplying(false);
    }
  }

  async function handleSaveTemplate() {
    if (!templateName.trim()) return;
    const slotsArray = buildSlotsArray().map(s => ({
      ...s,
      recept_naam: getSlot(s.dag, s.maaltijd_type)?.naam,
    }));
    await saveTemplate(templateName.trim(), slotsArray);
    setSavedTemplate(true);
    setShowSaveTemplate(false);
    setTemplateName("");
  }

  const totalSlots = DAYS.flatMap(d =>
    MEAL_TYPES.map(m => getSlot(d, m))
  ).filter(Boolean).length;

  const DaySlots = ({ dag }) => (
    <div>
      <IOSGroupHeader>
        {DAYS_SHORT[dag]} — {dag.charAt(0).toUpperCase() + dag.slice(1)}
      </IOSGroupHeader>
      <IOSGroup>
        {MEAL_TYPES.map((mealType, i) => {
          const recipe = getSlot(dag, mealType);
          return (
            <div
              key={mealType}
              className="flex items-center gap-3 px-4 py-[11px] cursor-pointer"
              style={i < MEAL_TYPES.length - 1 ? { borderBottom: '0.5px solid rgba(60,60,67,0.08)' } : {}}
              onClick={() => setPicker({ dag, mealType })}
            >
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-ink3 uppercase tracking-wide mb-0.5">
                  {MEAL_LABEL[mealType]}
                </p>
                {recipe ? (
                  <p className="text-[15px] text-ink font-medium truncate">{recipe.naam}</p>
                ) : (
                  <p className="text-[15px] text-ink3">+ Voeg toe</p>
                )}
              </div>
              {recipe && (
                <span className="text-[11px] text-ink2 flex-shrink-0">{recipe.categorie}</span>
              )}
            </div>
          );
        })}
      </IOSGroup>
    </div>
  );

  const Actions = () => (
    <div className="px-4 mt-2 space-y-2 pb-6">
      <button
        onClick={applying ? undefined : handleApply}
        disabled={applying || totalSlots === 0}
        className="w-full flex items-center justify-center gap-2 py-[13px] rounded-[12px] text-[15px] font-semibold text-white disabled:opacity-40"
        style={{ background: 'linear-gradient(135deg, #1f7a4d, #2d9e6b)' }}
      >
        <Check size={16} />
        {applying
          ? "Bezig…"
          : `Toepassen op huidige week${totalSlots > 0 ? ` (${totalSlots} maaltijden)` : ''}`}
      </button>

      {savedTemplate ? (
        <p className="text-center text-[13px] text-brand font-medium py-2">Template opgeslagen!</p>
      ) : showSaveTemplate ? (
        <div className="flex gap-2">
          <input
            className="flex-1 px-3 py-[9px] rounded-[9px] text-[14px] text-ink outline-none"
            style={{ background: 'rgba(120,120,128,0.1)', border: '1px solid rgba(60,60,67,0.15)' }}
            placeholder="Naam voor template…"
            value={templateName}
            onChange={e => setTemplateName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSaveTemplate()}
            autoFocus
          />
          <button
            onClick={handleSaveTemplate}
            disabled={!templateName.trim()}
            className="px-4 py-[9px] rounded-[9px] bg-brand text-white text-[13px] font-semibold disabled:opacity-40"
          >
            Sla op
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowSaveTemplate(true)}
          disabled={totalSlots === 0}
          className="w-full flex items-center justify-center gap-2 py-[11px] rounded-[12px] text-[14px] font-semibold disabled:opacity-40"
          style={{ background: 'rgba(120,120,128,0.1)', color: 'rgba(60,60,67,0.7)' }}
        >
          <Save size={15} />
          Opslaan als template
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* ── Mobile ── */}
      <div className="lg:hidden min-h-screen bg-bg pb-[100px]">
        <IOSStatusBar />
        <IOSLargeHeader title="Weekplan samenstellen" onBack={() => navigate('/weekplan')} />
        {DAYS.map(dag => <DaySlots key={dag} dag={dag} />)}
        <Actions />
        <IOSTabBar />
      </div>

      {/* ── Desktop ── */}
      <div className="hidden lg:block">
        <DesktopShell
          title="Weekplan samenstellen"
          subtitle="Stel per dag maaltijden in"
          accessory={
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/weekplan')}
                className="px-3 py-[6px] rounded-[7px] text-[13px] font-medium"
                style={{ background: 'rgba(120,120,128,0.14)', color: 'rgba(60,60,67,0.7)' }}
              >
                Annuleren
              </button>
              <button
                onClick={applying ? undefined : handleApply}
                disabled={applying || totalSlots === 0}
                className="flex items-center gap-1.5 px-4 py-[6px] rounded-[7px] bg-brand text-white text-[13px] font-semibold disabled:opacity-40"
              >
                <Check size={14} />
                {applying ? "Bezig…" : "Toepassen"}
              </button>
            </div>
          }
        >
          <div className="max-w-2xl mx-auto p-5">
            {DAYS.map(dag => <DaySlots key={dag} dag={dag} />)}
            <Actions />
          </div>
        </DesktopShell>
      </div>

      <RecipePicker
        open={picker !== null}
        onClose={() => setPicker(null)}
        categoryFilter={picker?.mealType}
        allowClear={picker ? !!getSlot(picker.dag, picker.mealType) : false}
        onSelect={recipe => {
          if (picker) setSlot(picker.dag, picker.mealType, recipe);
          setPicker(null);
        }}
      />
    </>
  );
}
