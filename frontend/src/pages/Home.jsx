import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Bell, ShoppingCart, ChevronRight } from "lucide-react";
import { getWeekPlan, getCurrentWeek } from "../api/client";
import { getStoredWeek } from "../lib/weekStorage";

const DAG_NL    = ["zondag","maandag","dinsdag","woensdag","donderdag","vrijdag","zaterdag"];
const DAG_SHORT = ["Zo","Ma","Di","Wo","Do","Vr","Za"];
const MAAND_NL  = ["","jan","feb","mrt","apr","mei","jun","jul","aug","sep","okt","nov","dec"];

const MEAL_META = {
  ontbijt: { label: "Ontbijt",  dot: "#9aa19a" },
  lunch:   { label: "Lunch",    dot: "#9aa19a" },
  snack:   { label: "Snack",    dot: "#9aa19a" },
  diner:   { label: "Diner",    dot: "#1f3a2c" },
};

function greet() {
  const h = new Date().getHours();
  return h < 12 ? "Goedemorgen" : h < 18 ? "Goedemiddag" : "Goedenavond";
}

function MacroBar({ label, value, max, unit, color }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="mb-[10px]">
      <div className="flex justify-between text-[12px] mb-[5px]">
        <span className="text-ink2">{label}</span>
        <span className="text-ink">
          <strong className="font-semibold">{Math.round(value)}</strong>
          <span className="text-ink3"> / {max} {unit}</span>
        </span>
      </div>
      <div className="h-1 rounded-sm overflow-hidden" style={{ background: '#efece4' }}>
        <div className="h-full rounded-sm transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [cycleWeek, setCycleWeek] = useState(null);
  const [weekPlan, setWeekPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const todayNl = DAG_NL[now.getDay()];
  const todayLabel = todayNl.charAt(0).toUpperCase() + todayNl.slice(1);
  const dateLabel = `${todayLabel} · ${now.getDate()} ${MAAND_NL[now.getMonth() + 1]}`;

  const weekDates = useMemo(() => {
    const d = new Date(now);
    const dow = d.getDay() === 0 ? 6 : d.getDay() - 1;
    d.setDate(d.getDate() - dow);
    return Array.from({ length: 7 }, (_, i) => {
      const dd = new Date(d); dd.setDate(d.getDate() + i);
      return { short: DAG_SHORT[dd.getDay()], date: dd.getDate(), isToday: dd.toDateString() === now.toDateString(), dayNl: DAG_NL[dd.getDay()] };
    });
  }, []);

  useEffect(() => {
    const stored = getStoredWeek();
    if (stored) setCycleWeek(stored);
    else getCurrentWeek().then(setCycleWeek);
  }, []);

  useEffect(() => {
    if (!cycleWeek) return;
    setLoading(true);
    getWeekPlan(cycleWeek).then(setWeekPlan).finally(() => setLoading(false));
  }, [cycleWeek]);

  const [selectedDay, setSelectedDay] = useState(todayNl);

  const dagData = weekPlan?.dagen?.find(d => d.dag === selectedDay);
  const maaltijden = dagData?.maaltijden ?? [];
  const diner = maaltijden.find(m => m.maaltijd_type === "diner");
  const totalEiwit = dagData?.totaal_eiwit_g ?? 0;
  const totalKcal = dagData?.totaal_kcal ?? 0;
  const filledCount = maaltijden.filter(m => m.naam).length;
  const selectedLabel = selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1);

  return (
    <div className="bg-bg min-h-screen pb-[100px]">
      <div className="h-[54px]" />

      {/* Header */}
      <div className="px-5 pt-[14px] pb-[18px]">
        <div className="flex justify-between items-start">
          <div>
            <p className="eyebrow">{dateLabel}</p>
            <h1 className="h1-page mt-1">{greet()}, Gavin.</h1>
          </div>
          <button className="w-[38px] h-[38px] rounded-full border border-line bg-surface grid place-items-center text-ink2 flex-shrink-0">
            <Bell size={18} strokeWidth={1.6} />
          </button>
        </div>
        {weekPlan && (
          <p className="mt-[14px] text-[13px] text-ink2">
            {weekPlan.vlees_thema || "–"} · week {cycleWeek} · {todayLabel}
          </p>
        )}
      </div>

      {/* Today meals */}
      <div className="px-5">
        <div className="flex justify-between items-baseline mb-3">
          <p className="text-[13px] font-semibold">
            {selectedDay === todayNl ? "Vandaag" : selectedLabel}
          </p>
          <Link to="/weekplan" className="text-[12px] text-ink2">Volledig plan →</Link>
        </div>

        {loading ? (
          <div className="flex flex-col gap-[8px]">
            {[1,2,3,4].map(i => <div key={i} className="h-[58px] bg-surface rounded-[14px] border border-line animate-pulse" />)}
          </div>
        ) : (
          <div className="flex flex-col gap-[8px]">
            {["ontbijt","lunch","snack","diner"].map((type) => {
              const m = maaltijden.find(x => x.maaltijd_type === type);
              const meta = MEAL_META[type];
              const isDiner = type === "diner";
              return (
                <button
                  key={type}
                  onClick={() => m?.recept_id && navigate(`/recepten/${m.recept_id}`)}
                  className="w-full bg-surface rounded-[14px] border flex items-center gap-3 px-4 py-3 text-left"
                  style={{ borderColor: isDiner && m?.naam ? '#1f3a2c' : '#e7e4dc' }}
                >
                  <span
                    className="w-[6px] h-[6px] rounded-full flex-shrink-0"
                    style={{ background: m?.naam ? (isDiner ? '#1f3a2c' : '#5d655c') : '#e7e4dc' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-ink3 uppercase tracking-[1.2px] font-medium">{meta.label}</p>
                    <p className="text-[14px] font-medium mt-[1px] truncate" style={{ color: m?.naam ? '#1a1f1a' : '#9aa19a' }}>
                      {m?.naam ?? "Niet ingesteld"}
                    </p>
                  </div>
                  {m?.naam && (
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {m.kcal && <span className="text-[12px] text-ink3">{m.kcal} kcal</span>}
                      {m.recept_id && <ChevronRight size={15} strokeWidth={1.6} className="text-ink3" />}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Macro progress */}
      {!loading && (totalEiwit > 0 || totalKcal > 0) && (
        <div className="px-5 mt-5">
          <div className="flex justify-between items-baseline mb-[10px]">
            <p className="text-[13px] font-semibold">Vandaag in cijfers</p>
            <p className="text-[12px] text-ink3">{filledCount} van 4 maaltijden</p>
          </div>
          <MacroBar label="Eiwit" value={totalEiwit} max={160} unit="g" color="#1f3a2c" />
          <MacroBar label="Calorieën" value={totalKcal} max={2700} unit="kcal" color="#5d655c" />
        </div>
      )}

      {/* Diner quick action */}
      {!loading && diner?.naam && (
        <div className="px-5 mt-5">
          <div className="bg-surface rounded-[18px] border border-line overflow-hidden">
            <div className="h-[120px] bg-line2 flex items-center justify-center">
              <span className="text-ink3 text-[13px]">🍽️ {diner.naam}</span>
            </div>
            <div className="flex border-t border-line">
              <button
                onClick={() => diner.recept_id && navigate(`/recepten/${diner.recept_id}`)}
                className="flex-1 py-[13px] text-[13px] font-medium text-ink border-r border-line bg-transparent"
              >
                Recept openen
              </button>
              <Link to={`/boodschappen/${cycleWeek ?? 1}`}
                className="flex-1 py-[13px] text-[13px] font-medium text-ink2 flex items-center justify-center gap-[6px]">
                <ShoppingCart size={15} strokeWidth={1.6} /> Boodschappen
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Week strip */}
      <div className="px-5 mt-6">
        <p className="text-[13px] font-semibold mb-3">Deze week</p>
        <div className="flex gap-2">
          {weekDates.map((d, i) => {
            const isSelected = d.dayNl === selectedDay;
            return (
              <button
                key={i}
                onClick={() => setSelectedDay(d.dayNl)}
                className="flex-1 py-[10px] rounded-[12px] text-center border transition-colors"
                style={{
                  background: isSelected ? '#1f3a2c' : '#ffffff',
                  borderColor: isSelected ? 'transparent' : d.isToday ? '#5d655c' : '#e7e4dc',
                  color: isSelected ? '#ffffff' : '#1a1f1a',
                }}>
                <p style={{ fontSize: 10, letterSpacing: '0.8px', opacity: isSelected ? 0.7 : 0.5, textTransform: 'uppercase', margin: 0 }}>{d.short}</p>
                <p className="text-[14px] font-semibold mt-[2px]">{d.date}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
