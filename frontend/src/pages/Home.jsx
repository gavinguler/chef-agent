import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Bell, ShoppingCart, ChevronRight } from "lucide-react";
import { getWeekPlan, getCurrentWeek } from "../api/client";
import { getStoredWeek } from "../lib/weekStorage";

const DAG_NL  = ["zondag","maandag","dinsdag","woensdag","donderdag","vrijdag","zaterdag"];
const DAG_SHORT = ["Zo","Ma","Di","Wo","Do","Vr","Za"];
const MAAND_NL = ["","jan","feb","mrt","apr","mei","jun","jul","aug","sep","okt","nov","dec"];

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

  // 7-day strip starting Monday
  const weekDates = useMemo(() => {
    const d = new Date(now);
    const dow = d.getDay() === 0 ? 6 : d.getDay() - 1; // 0=Mon
    d.setDate(d.getDate() - dow);
    return Array.from({ length: 7 }, (_, i) => {
      const dd = new Date(d); dd.setDate(d.getDate() + i);
      return { short: DAG_SHORT[dd.getDay() === 0 ? 7 : dd.getDay()].slice(0, 2), date: dd.getDate(), isToday: dd.toDateString() === now.toDateString() };
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

  const dagData = weekPlan?.dagen?.find(d => d.dag === todayNl);
  const diner = dagData?.maaltijden?.find(m => m.maaltijd_type === "diner");
  const totalEiwit = dagData?.totaal_eiwit_g ?? 0;
  const totalKcal = dagData?.totaal_kcal ?? 0;

  return (
    <div className="bg-bg min-h-screen pb-[100px]">
      {/* Status bar spacer */}
      <div className="h-[54px]" />

      {/* Header */}
      <div className="px-5 pt-[14px] pb-[18px]">
        <div className="flex justify-between items-start">
          <div>
            <p className="eyebrow">{dateLabel}</p>
            <h1 className="h1-page mt-1">Goedenavond, Gavin.</h1>
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

      {/* Today card */}
      <div className="px-5">
        <div className="bg-surface rounded-[18px] border border-line overflow-hidden">
          {/* Photo placeholder */}
          <div className="h-[150px] bg-line2 flex items-center justify-center">
            <span className="text-ink3 text-[13px]">🍽️ {diner?.naam ?? "–"}</span>
          </div>

          <div className="px-4 pt-[14px] pb-4">
            <div className="flex items-center gap-[6px] eyebrow mb-[8px]">
              <span className="w-[6px] h-[6px] rounded-full bg-ink3 inline-block" />
              Vanavond · diner
            </div>
            {loading ? (
              <div className="h-5 bg-line2 rounded animate-pulse w-2/3 mb-3" />
            ) : (
              <p className="text-[19px] font-semibold mb-3" style={{ letterSpacing: '-0.3px' }}>
                {diner?.naam ?? "Niet ingesteld"}
              </p>
            )}
            <div className="flex gap-4 text-[12px] text-ink2">
              {diner?.kcal && <span><strong className="text-[14px] font-semibold text-ink">{diner.kcal}</strong> kcal</span>}
              {diner?.eiwit_g && <span><strong className="text-[14px] font-semibold text-ink">{Math.round(diner.eiwit_g)}g</strong> eiwit</span>}
            </div>
          </div>

          <div className="flex border-t border-line">
            <button
              onClick={() => diner?.recept_id && navigate(`/recepten/${diner.recept_id}`)}
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

      {/* Macro progress */}
      {!loading && (totalEiwit > 0 || totalKcal > 0) && (
        <div className="px-5 mt-5">
          <div className="flex justify-between items-baseline mb-[10px]">
            <p className="text-[13px] font-semibold">Vandaag in cijfers</p>
            <p className="text-[12px] text-ink3">3 van 3 maaltijden</p>
          </div>
          <MacroBar label="Eiwit" value={totalEiwit} max={160} unit="g" color="#1f3a2c" />
          <MacroBar label="Calorieën" value={totalKcal} max={2700} unit="kcal" color="#5d655c" />
        </div>
      )}

      {/* Week strip */}
      <div className="px-5 mt-6">
        <div className="flex justify-between items-baseline mb-3">
          <p className="text-[13px] font-semibold">Deze week</p>
          <Link to="/weekplan" className="text-[12px] text-ink2">Volledig plan →</Link>
        </div>
        <div className="flex gap-2">
          {weekDates.map((d, i) => (
            <div key={i} className="flex-1 py-[10px] rounded-[12px] text-center border transition-colors"
              style={{
                background: d.isToday ? '#1f3a2c' : '#ffffff',
                borderColor: d.isToday ? 'transparent' : '#e7e4dc',
                color: d.isToday ? '#ffffff' : '#1a1f1a',
              }}>
              <p style={{ fontSize: 10, letterSpacing: '0.8px', opacity: d.isToday ? 0.7 : 0.5, textTransform: 'uppercase', margin: 0 }}>{d.short}</p>
              <p className="text-[14px] font-semibold mt-[2px]">{d.date}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
