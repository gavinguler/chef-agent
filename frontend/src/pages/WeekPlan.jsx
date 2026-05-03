import { useEffect, useState } from "react";
import { getWeekPlan } from "../api/client";
import DayTabs from "../components/DayTabs";

const DAYS = ["maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag", "zondag"];
const MEAL_EMOJI = { ontbijt: "🥣", lunch: "🥗", diner: "🍽️" };
const MEAL_LABELS = { ontbijt: "Ontbijt", lunch: "Lunch", diner: "Diner" };

function getCurrentCycleWeek() {
  const now = new Date();
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const isoWeek = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return ((isoWeek - 1) % 8) + 1;
}

const cycleWeek = getCurrentCycleWeek();

export default function WeekPlan() {
  const [weekPlan, setWeekPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const todayIndex = new Date().getDay();
  const [selectedDay, setSelectedDay] = useState(
    DAYS[todayIndex === 0 ? 6 : todayIndex - 1]
  );

  useEffect(() => {
    getWeekPlan(cycleWeek)
      .then(setWeekPlan)
      .catch(() => setError("Kon weekplan niet laden"))
      .finally(() => setLoading(false));
  }, []);

  const dagData = weekPlan?.dagen?.find(
    (d) => d.dag?.toLowerCase() === selectedDay
  );

  return (
    <div className="p-4 pb-20">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">Week {cycleWeek}</h1>
        <p className="text-gray-500 text-sm">{weekPlan?.vlees_thema || ""}</p>
      </div>

      <DayTabs selected={selectedDay} onChange={setSelectedDay} />

      <div className="mt-4">
        {loading && (
          <div className="bg-gray-100 animate-pulse h-40 rounded-xl" />
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            <p className="text-blue-600 text-xs font-bold uppercase mb-3">
              {selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)}
            </p>

            <div className="flex flex-col gap-2 mb-4">
              {["ontbijt", "lunch", "diner"].map((type) => {
                const maaltijd = dagData?.maaltijden?.find(
                  (m) => m.maaltijd_type === type
                );
                return (
                  <div
                    key={type}
                    className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3 shadow-sm"
                  >
                    <span className="text-xl">{MEAL_EMOJI[type]}</span>
                    <div className="flex-1">
                      <p className="text-gray-400 text-xs font-semibold uppercase">
                        {MEAL_LABELS[type]}
                      </p>
                      <p className="text-gray-800 text-sm font-medium">
                        {maaltijd?.naam || (
                          <span className="text-gray-300 italic">
                            Niet ingesteld
                          </span>
                        )}
                      </p>
                      {maaltijd?.eiwit_g && (
                        <p className="text-gray-400 text-xs">
                          {Math.round(maaltijd.eiwit_g)}g eiwit
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {(dagData?.totaal_eiwit_g > 0 || dagData?.totaal_kcal > 0) && (
              <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 flex justify-between items-center">
                <span className="text-green-700 text-sm font-semibold">
                  ✅ {Math.round(dagData.totaal_eiwit_g)}g eiwit
                </span>
                <span className="text-gray-500 text-sm">
                  {dagData.totaal_kcal} kcal
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
