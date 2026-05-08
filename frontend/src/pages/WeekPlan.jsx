import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getWeekPlan, getCurrentWeek } from "../api/client";
import { getStoredWeek } from "../lib/weekStorage";
import DayTabs from "../components/DayTabs";

const DAYS = ["maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag", "zondag"];
const MEAL_EMOJI = { ontbijt: "🥣", lunch: "🥗", diner: "🍽️" };
const MEAL_LABELS = { ontbijt: "Ontbijt", lunch: "Lunch", diner: "Diner" };
const MEAL_BG = { ontbijt: "bg-amber-50", lunch: "bg-sky-50", diner: "bg-emerald-50" };

export default function WeekPlan() {
  const navigate = useNavigate();
  const [currentCycleWeek, setCurrentCycleWeek] = useState(null);
  const [weekPlan, setWeekPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const todayIndex = new Date().getDay();
  const [selectedDay, setSelectedDay] = useState(DAYS[todayIndex === 0 ? 6 : todayIndex - 1]);

  useEffect(() => {
    const stored = getStoredWeek();
    if (stored) { setCurrentCycleWeek(stored); setSelectedWeek(stored); }
    else getCurrentWeek().then((w) => { setCurrentCycleWeek(w); setSelectedWeek(w); });
  }, []);

  useEffect(() => {
    if (!selectedWeek) return;
    setLoading(true);
    getWeekPlan(selectedWeek)
      .then(setWeekPlan)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedWeek]);

  const dagData = weekPlan?.dagen?.find((d) => d.dag?.toLowerCase() === selectedDay);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-900 via-green-800 to-green-700 px-5 pt-12 pb-5">
        <h1 className="text-white text-2xl font-bold tracking-tight mb-3">Weekplan</h1>
        {weekPlan?.vlees_thema && (
          <p className="text-green-300 text-sm mb-3">{weekPlan.vlees_thema}</p>
        )}
        {/* Week pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
          {[1,2,3,4,5,6,7,8].map((w) => (
            <button
              key={w}
              onClick={() => setSelectedWeek(w)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all ${
                selectedWeek === w
                  ? "bg-white text-green-800 shadow-card"
                  : w === currentCycleWeek
                  ? "bg-green-700/60 text-white ring-1 ring-white/40"
                  : "bg-green-800/50 text-green-200"
              }`}
            >
              W{w}{w === currentCycleWeek ? " ★" : ""}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4">
        <DayTabs selected={selectedDay} onChange={setSelectedDay} />

        <div className="mt-4">
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse shadow-card" />)}
            </div>
          ) : (
            <>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                {selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)}
              </p>

              <div className="space-y-3 mb-4">
                {["ontbijt", "lunch", "diner"].map((type) => {
                  const maaltijd = dagData?.maaltijden?.find((m) => m.maaltijd_type === type);
                  const isClickable = !!maaltijd?.recept_id;
                  return (
                    <div
                      key={type}
                      onClick={() => isClickable && navigate(`/recepten/${maaltijd.recept_id}`)}
                      className={`bg-white rounded-2xl shadow-card overflow-hidden ${isClickable ? "cursor-pointer active:scale-95 transition-transform" : ""}`}
                    >
                      <div className="flex items-center gap-3 p-4">
                        <div className={`w-10 h-10 rounded-xl ${MEAL_BG[type]} flex items-center justify-center text-xl flex-shrink-0`}>
                          {MEAL_EMOJI[type]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{MEAL_LABELS[type]}</p>
                          {maaltijd?.naam ? (
                            <>
                              <p className="text-gray-900 text-sm font-semibold truncate">{maaltijd.naam}</p>
                              {maaltijd.eiwit_g && (
                                <p className="text-xs text-green-600 font-medium">{Math.round(maaltijd.eiwit_g)}g eiwit</p>
                              )}
                            </>
                          ) : (
                            <p className="text-gray-300 text-sm italic">Niet ingesteld</p>
                          )}
                        </div>
                        {isClickable && (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6"/>
                          </svg>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {(dagData?.totaal_eiwit_g > 0 || dagData?.totaal_kcal > 0) && (
                <div className="bg-brand rounded-2xl px-5 py-3.5 flex justify-between items-center">
                  <span className="text-white text-sm font-bold">
                    {Math.round(dagData.totaal_eiwit_g)}g eiwit
                  </span>
                  <span className="text-green-200 text-sm font-medium">
                    {dagData.totaal_kcal} kcal
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
