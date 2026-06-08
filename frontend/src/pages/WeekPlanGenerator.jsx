import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wand2, Check, Save } from "lucide-react";
import { generateWeekPlan, applyWeekPlan, getCurrentWeek, saveTemplate } from "../api/client";
import {
  IOSStatusBar, IOSLargeHeader, IOSGroupHeader, IOSGroup, IOSTabBar,
} from "../components/IOSPrimitives";
import DesktopShell from "../components/DesktopShell";

const MEAL_TYPES = [
  { id: "ontbijt", label: "Ontbijt" },
  { id: "lunch", label: "Lunch" },
  { id: "snack", label: "Snack" },
  { id: "diner", label: "Diner" },
  { id: "avondsnack", label: "Avondsnack" },
];

const DAYS = ["maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag", "zondag"];
const DAY_LABELS = { maandag: "Ma", dinsdag: "Di", woensdag: "Wo", donderdag: "Do", vrijdag: "Vr", zaterdag: "Za", zondag: "Zo" };

export default function WeekPlanGenerator() {
  const navigate = useNavigate();
  const [step, setStep] = useState("config"); // config | loading | review
  const [selectedTypes, setSelectedTypes] = useState(["diner"]);
  const [slots, setSlots] = useState([]);
  const [applying, setApplying] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [savedTemplate, setSavedTemplate] = useState(false);

  function toggleType(id) {
    setSelectedTypes(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  }

  async function handleGenerate() {
    if (!selectedTypes.length) return;
    setStep("loading");
    try {
      const result = await generateWeekPlan(selectedTypes, {});
      setSlots(result.slots || []);
      setStep("review");
    } catch {
      setStep("config");
    }
  }

  async function handleApply() {
    setApplying(true);
    try {
      const week = await getCurrentWeek();
      await applyWeekPlan(week, slots);
      navigate("/weekplan");
    } finally {
      setApplying(false);
    }
  }

  async function handleSaveTemplate() {
    if (!templateName.trim()) return;
    await saveTemplate(templateName.trim(), slots);
    setSavedTemplate(true);
    setShowSaveTemplate(false);
    setTemplateName("");
  }

  const ConfigStep = () => (
    <>
      <IOSGroupHeader>Welke maaltijden wil je laten plannen?</IOSGroupHeader>
      <IOSGroup footer="De AI kiest recepten op basis van jouw huidige voorraad.">
        <div className="px-4 py-3 flex gap-[6px] flex-wrap">
          {MEAL_TYPES.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => toggleType(id)}
              className="px-3 py-[6px] rounded-full text-[13px] font-semibold transition-colors"
              style={selectedTypes.includes(id)
                ? { background: '#1f7a4d', color: '#fff' }
                : { background: 'rgba(120,120,128,0.16)', color: 'rgba(60,60,67,0.7)' }
              }
            >
              {label}
            </button>
          ))}
        </div>
      </IOSGroup>

      <div className="px-4 mt-4">
        <button
          onClick={handleGenerate}
          disabled={!selectedTypes.length}
          className="w-full flex items-center justify-center gap-2 py-[13px] rounded-[12px] text-[15px] font-semibold text-white disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, #1f7a4d, #2d9e6b)' }}
        >
          <Wand2 size={16} />
          Genereer weekplan met AI
        </button>
      </div>
    </>
  );

  const LoadingStep = () => (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-10 h-10 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      <p className="text-[15px] text-ink2">AI is bezig met plannen…</p>
      <p className="text-[12px] text-ink3">Recepten worden gescoord op voorraad</p>
    </div>
  );

  const ReviewStep = () => {
    const slotsByDay = DAYS.map(dag => ({
      dag,
      slots: slots.filter(s => s.dag === dag),
    }));

    return (
      <>
        <IOSGroupHeader>Gegenereerd weekplan — {slots.length} maaltijden</IOSGroupHeader>

        {slotsByDay.filter(d => d.slots.length > 0).map(({ dag, slots: daySlots }) => (
          <div key={dag}>
            <IOSGroupHeader>{dag.charAt(0).toUpperCase() + dag.slice(1)}</IOSGroupHeader>
            <IOSGroup>
              {daySlots.map((slot, i) => (
                <div
                  key={`${slot.dag}-${slot.maaltijd_type}`}
                  className="flex items-center gap-3 px-4 py-[10px]"
                  style={{ borderBottom: i < daySlots.length - 1 ? '0.5px solid rgba(60,60,67,0.08)' : 'none' }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-ink3 uppercase tracking-wide">{slot.maaltijd_type}</p>
                    <p className="text-[15px] text-ink font-medium truncate">{slot.recept_naam || "—"}</p>
                  </div>
                  {slot.score > 0 && (
                    <span
                      className="text-[11px] font-semibold px-2 py-[2px] rounded-full flex-shrink-0"
                      style={{ background: 'rgba(31,122,77,0.1)', color: '#1f7a4d' }}
                    >
                      {Math.round(slot.score * 100)}% in huis
                    </span>
                  )}
                </div>
              ))}
            </IOSGroup>
          </div>
        ))}

        <div className="px-4 mt-4 space-y-2 pb-4">
          <button
            onClick={applying ? undefined : handleApply}
            disabled={applying}
            className="w-full flex items-center justify-center gap-2 py-[13px] rounded-[12px] text-[15px] font-semibold text-white disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #1f7a4d, #2d9e6b)' }}
          >
            <Check size={16} />
            {applying ? "Bezig…" : "Toepassen op huidige week"}
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
              className="w-full flex items-center justify-center gap-2 py-[11px] rounded-[12px] text-[14px] font-semibold"
              style={{ background: 'rgba(120,120,128,0.1)', color: 'rgba(60,60,67,0.7)' }}
            >
              <Save size={15} />
              Opslaan als template
            </button>
          )}

          <button
            onClick={() => setStep("config")}
            className="w-full text-center text-[13px] text-ink2 py-2"
          >
            Opnieuw genereren
          </button>
        </div>
      </>
    );
  };

  const title = step === "review" ? "Weekplan voorstel" : "Genereer weekplan";

  return (
    <>
      {/* ── Mobile ── */}
      <div className="lg:hidden min-h-screen bg-bg pb-[100px]">
        <IOSStatusBar />
        <IOSLargeHeader title={title} onBack={() => navigate('/weekplan')} />
        {step === "config" && <ConfigStep />}
        {step === "loading" && <LoadingStep />}
        {step === "review" && <ReviewStep />}
        <IOSTabBar />
      </div>

      {/* ── Desktop ── */}
      <div className="hidden lg:block">
        <DesktopShell
          title={title}
          subtitle="AI selecteert recepten op basis van voorraad"
          accessory={
            step === "review" ? (
              <div className="flex gap-2">
                <button
                  onClick={() => setStep("config")}
                  className="px-3 py-[6px] rounded-[7px] text-[13px] font-medium"
                  style={{ background: 'rgba(120,120,128,0.14)', color: 'rgba(60,60,67,0.7)' }}
                >
                  Opnieuw
                </button>
                <button
                  onClick={applying ? undefined : handleApply}
                  disabled={applying}
                  className="flex items-center gap-1.5 px-4 py-[6px] rounded-[7px] bg-brand text-white text-[13px] font-semibold disabled:opacity-40"
                >
                  <Check size={14} />
                  {applying ? "Bezig…" : "Toepassen"}
                </button>
              </div>
            ) : null
          }
        >
          <div className="max-w-2xl mx-auto p-5">
            {step === "config" && <ConfigStep />}
            {step === "loading" && <LoadingStep />}
            {step === "review" && <ReviewStep />}
          </div>
        </DesktopShell>
      </div>
    </>
  );
}
