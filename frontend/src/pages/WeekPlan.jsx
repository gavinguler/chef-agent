import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getWeekPlan, getCurrentWeek } from "../api/client";
import DayTabs from "../components/DayTabs";

const DAYS = ["maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag", "zondag"];
const MEAL_EMOJI = { ontbijt: "🥣", lunch: "🥗", diner: "🍽️" };
const MEAL_LABELS = { ontbijt: "Ontbijt", lunch: "Lunch", diner: "Diner" };

export default function WeekPlan() {
  const navigate = useNavigate();
  const [currentCycleWeek, setCurrentCycleWeek] = useState(null);
  const [weekPlan, setWeekPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const todayIndex = new Date().getDay();
  const [selectedDay, setSelectedDay] = useState(
    DAYS[todayIndex === 0 ? 6 : todayIndex - 1]
  );

  useEffect(() => {
    getCurrentWeek().then((week) => {
      setCurrentCycleWeek(week);
      setSelectedWeek(week);
    });
  }, []);

  useEffect(() => {
    if (!selectedWeek) return;
    setLoading(true);
    setError(null);
    getWeekPlan(selectedWeek)
      .then(setWeekPlan)
      .catch(() => setError("Kon weekplan niet laden"))
      .finally(() => setLoading(false));
  }, [selectedWeek]);

  const dagData = weekPlan?.dagen?.find(
    (d) => d.dag?.toLowerCase() === selectedDay
  );

  return (
    <div className="p-4 pb-20">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">Weekplan</h1>
        <div className="flex gap-1 mt-2 flex-wrap">
          {[1,2,3,4,5,6,7,8].map((w) => (
            <button
              key={w}
              onClick={() => setSelectedWeek(w)}
              className={`px-3 py-1 rounded-full text-sm font-semibold border transition-colors ${
                selectedWeek === w
                  ? "bg-green-600 text-white border-green-600"
                  : w === currentCycleWeek
                  ? "bg-green-50 text-green-700 border-green-300"
                  : "bg-white text-gray-600 border-gray-200"
              }`}
            >
              W{w}{w === currentCycleWeek ? " ★" : ""}
            </button>
          ))}
        </div>
        <p className="text-gray-500 text-sm mt-2">{weekPlan?.vlees_thema || ""}</p>
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
                const isClickable = !!maaltijd?.recept_id;
                return (
                  <div
                    key={type}
                    onClick={() => isClickable && navigate(`/recepten/${maaltijd.recept_id}`)}
                    className={`bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3 shadow-sm ${isClickable ? "cursor-pointer active:bg-gray-50" : ""}`}
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
                    {isClickable && (
                      <span className="text-gray-300 text-sm">›</span>
                    )}
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
