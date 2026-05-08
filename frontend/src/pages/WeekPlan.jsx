import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ChevronRight, ChevronDown, ShoppingCart, ArrowRight } from "lucide-react";
import { getWeekPlan, getCurrentWeek } from "../api/client";
import { getStoredWeek, setStoredWeek } from "../lib/weekStorage";

const DAYS = ["maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag", "zondag"];
const DAY_SHORT = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];
const MEAL_LABEL = { ontbijt: "Ontbijt", lunch: "Lunch", snack: "Snack", diner: "Diner" };

export default function WeekPlan() {
  const navigate = useNavigate();
  const [currentCycleWeek, setCurrentCycleWeek] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [weekPlan, setWeekPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedDay, setExpandedDay] = useState(null);

  const now = new Date();
  const todayNl = DAYS[now.getDay() === 0 ? 6 : now.getDay() - 1];

  useEffect(() => {
    const stored = getStoredWeek();
    if (stored) { setCurrentCycleWeek(stored); setSelectedWeek(stored); }
    else getCurrentWeek().then((w) => { setCurrentCycleWeek(w); setSelectedWeek(w); });
  }, []);

  useEffect(() => {
    if (!selectedWeek) return;
    setLoading(true);
    setExpandedDay(todayNl);
    getWeekPlan(selectedWeek).then(setWeekPlan).catch(() => {}).finally(() => setLoading(false));
  }, [selectedWeek]);

  const handleWeekSelect = (w) => {
    setStoredWeek(w);
    setSelectedWeek(w);
    setCurrentCycleWeek(w);
  };

  const toggleDay = (dag) => setExpandedDay(prev => prev === dag ? null : dag);

  return (
    <div className="bg-bg min-h-screen pb-[100px]">
      <div className="h-[54px]" />

      {/* Header */}
      <div className="px-5 pt-[14px] pb-1">
        <p className="eyebrow">8-weken cyclus</p>
        <h1 className="h1-page mt-1">Weekplan</h1>
      </div>

      {/* Week selector */}
      <div className="px-5 pt-[14px] flex gap-[6px]">
        {[1,2,3,4,5,6,7,8].map((w) => (
          <button
            key={w}
            onClick={() => handleWeekSelect(w)}
            className="flex-1 h-9 rounded-[9px] text-[12px] font-semibold transition-colors"
            style={{
              background: selectedWeek === w ? '#1f3a2c' : '#ffffff',
              color: selectedWeek === w ? '#fff' : '#5d655c',
              border: selectedWeek === w ? 'none' : '1px solid #e7e4dc',
            }}
          >{w}</button>
        ))}
      </div>

      {weekPlan?.vlees_thema && (
        <p className="px-5 mt-[10px] text-[12px] text-ink2">{weekPlan.vlees_thema}</p>
      )}

      {/* Day list */}
      <div className="px-5 mt-5 flex flex-col gap-[8px]">
        {loading ? (
          Array.from({ length: 7 }, (_, i) => (
            <div key={i} className="h-[62px] bg-surface rounded-[14px] border border-line animate-pulse" />
          ))
        ) : (
          DAYS.map((dag, i) => {
            const dagData = weekPlan?.dagen?.find(d => d.dag?.toLowerCase() === dag);
            const maaltijden = dagData?.maaltijden ?? [];
            const diner = maaltijden.find(m => m.maaltijd_type === "diner");
            const isToday = dag === todayNl;
            const isExpanded = expandedDay === dag;

            return (
              <div
                key={dag}
                className="rounded-[14px] overflow-hidden"
                style={{
                  background: '#ffffff',
                  border: isToday ? '1px solid #1f3a2c' : '1px solid #e7e4dc',
                }}
              >
                {/* Day header row */}
                <button
                  onClick={() => toggleDay(dag)}
                  className="w-full flex items-center gap-[14px] px-[14px] py-3 text-left"
                >
                  <div
                    className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center text-[11px] font-semibold flex-shrink-0"
                    style={{
                      background: isToday ? '#1f3a2c' : '#e9efe6',
                      color: isToday ? '#fff' : '#1f3a2c',
                      letterSpacing: '0.4px',
                    }}
                  >{DAY_SHORT[i]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium tracking-tight truncate">
                      {diner?.naam ?? <span className="text-ink3 italic font-normal">Niet ingesteld</span>}
                    </p>
                    <p className="text-[11px] text-ink3 mt-[2px]">
                      diner{diner?.eiwit_g ? ` · ${Math.round(diner.eiwit_g)}g eiwit` : ""}
                    </p>
                  </div>
                  {isToday && (
                    <span className="text-[11px] font-medium px-2 py-[3px] rounded-[6px] flex-shrink-0"
                      style={{ background: '#1f3a2c', color: '#fff' }}>vandaag</span>
                  )}
                  <ChevronDown
                    size={15} strokeWidth={1.6}
                    className="text-ink3 flex-shrink-0 transition-transform"
                    style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  />
                </button>

                {/* Expanded meals */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid #efece4' }}>
                    {["ontbijt", "lunch", "snack", "diner"].map((type, idx, arr) => {
                      const m = maaltijden.find(x => x.maaltijd_type === type);
                      return (
                        <button
                          key={type}
                          onClick={() => m?.recept_id && navigate(`/recepten/${m.recept_id}`)}
                          className="w-full flex items-center gap-3 px-[14px] py-[11px] text-left"
                          style={{ borderBottom: idx < arr.length - 1 ? '1px solid #efece4' : 'none' }}
                        >
                          <span
                            className="w-[5px] h-[5px] rounded-full flex-shrink-0"
                            style={{ background: m?.naam ? '#5d655c' : '#e7e4dc' }}
                          />
                          <span className="w-14 text-[11px] text-ink3 uppercase tracking-wide flex-shrink-0">
                            {MEAL_LABEL[type]}
                          </span>
                          <span className="flex-1 text-[13px] truncate" style={{ color: m?.naam ? '#1a1f1a' : '#9aa19a' }}>
                            {m?.naam ?? "–"}
                          </span>
                          {m?.kcal && <span className="text-[11px] text-ink3 flex-shrink-0">{m.kcal} kcal</span>}
                          {m?.recept_id && <ChevronRight size={14} strokeWidth={1.6} className="text-ink3 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Shopping CTA */}
      <div className="px-5 mt-5">
        <Link
          to={`/boodschappen/${selectedWeek ?? 1}`}
          className="flex items-center gap-3 rounded-[14px] px-4 py-[14px]"
          style={{ background: '#1a1f1a', color: '#fff' }}
        >
          <ShoppingCart size={20} strokeWidth={1.6} />
          <div className="flex-1">
            <p className="text-[13px] font-semibold">Boodschappenlijst</p>
            <p className="text-[11px] mt-[2px]" style={{ opacity: 0.6 }}>Week {selectedWeek}</p>
          </div>
          <ArrowRight size={18} strokeWidth={1.6} />
        </Link>
      </div>
    </div>
  );
}
