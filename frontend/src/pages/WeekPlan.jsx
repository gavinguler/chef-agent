import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { getWeekPlan, getCurrentWeek } from "../api/client";
import { getStoredWeek } from "../lib/weekStorage";
import {
  IOSStatusBar, IOSLargeHeader, IOSGroupHeader, IOSGroup, IOSRow, IOSTabBar,
} from "../components/IOSPrimitives";
import DesktopShell from "../components/DesktopShell";

const DAYS_NL  = ["maandag","dinsdag","woensdag","donderdag","vrijdag","zaterdag","zondag"];
const DAYS_SHORT = ["Ma","Di","Wo","Do","Vr","Za","Zo"];
const MEAL_TYPES = ["ontbijt","lunch","snack","diner","avondsnack"];
const MEAL_LABEL = { ontbijt:"Ontbijt", lunch:"Lunch", snack:"Snack", diner:"Diner", avondsnack:"Avondsnack" };

export default function WeekPlan() {
  const navigate = useNavigate();
  const [cycleWeek, setCycleWeek] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [weekPlan, setWeekPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const todayIndex = new Date().getDay();
  const todayNl = DAYS_NL[todayIndex === 0 ? 6 : todayIndex - 1];

  useEffect(() => {
    const stored = getStoredWeek();
    if (stored) { setCycleWeek(stored); setSelectedWeek(stored); }
    else getCurrentWeek().then(w => { setCycleWeek(w); setSelectedWeek(w); });
  }, []);

  useEffect(() => {
    if (!selectedWeek) return;
    setLoading(true);
    getWeekPlan(selectedWeek)
      .then(data => { setError(null); setWeekPlan(data); })
      .catch(() => setError("Kon weekplan niet laden"))
      .finally(() => setLoading(false));
  }, [selectedWeek]);

  const shoppingCount = weekPlan?.dagen?.reduce(
    (acc, d) => acc + (d.maaltijden?.length ?? 0), 0
  ) ?? 0;

  return (
    <>
      {/* ── Mobile ── */}
      <div className="lg:hidden min-h-screen bg-bg pb-[100px]">
        <IOSStatusBar />
        <IOSLargeHeader title={`Week ${selectedWeek ?? ""}`} />
        {weekPlan?.vlees_thema && (
          <p className="px-4 mb-3 text-[15px] text-ink2">{weekPlan.vlees_thema}</p>
        )}

        {/* Week selector */}
        <div className="px-4 mb-4 flex gap-[6px] flex-wrap">
          {Array.from({ length: 8 }, (_, i) => i + 1).map(w => (
            <button
              key={w}
              onClick={() => setSelectedWeek(w)}
              className="flex-1 min-w-[36px] h-[36px] rounded-[8px] text-[14px] font-semibold transition-colors"
              style={
                selectedWeek === w
                  ? { background: '#1f7a4d', color: '#fff' }
                  : w === cycleWeek
                  ? { background: 'rgba(31,122,77,0.12)', color: '#1f7a4d' }
                  : { background: 'rgba(120,120,128,0.16)', color: 'rgba(60,60,67,0.6)' }
              }
            >
              {w}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="mx-4 animate-pulse bg-surface rounded-[10px] h-40" />
        ) : (
          <>
            {error && !loading && (
              <div className="mx-4 bg-red-50 border border-red-200 rounded-[10px] p-3">
                <p className="text-red-700 text-[14px]">{error}</p>
              </div>
            )}
            {DAYS_NL.map((day, i) => {
              const dagData = weekPlan?.dagen?.find(d => d.dag?.toLowerCase() === day);
              const dayMeals = MEAL_TYPES
                .map(type => ({ type, meal: dagData?.maaltijden?.find(m => m.maaltijd_type === type) }))
                .filter(x => x.meal);
              const isToday = day === todayNl;
              return (
                <div key={day}>
                  <IOSGroupHeader>
                    {DAYS_SHORT[i]}{isToday ? ' · Vandaag' : ''}
                  </IOSGroupHeader>
                  <IOSGroup>
                    {dayMeals.length > 0 ? dayMeals.map(({ type, meal }, j) => (
                      <IOSRow
                        key={type}
                        title={meal.naam}
                        sub={MEAL_LABEL[type] + (meal.eiwit_g ? ` · ${Math.round(meal.eiwit_g)}g eiwit` : "")}
                        last={j === dayMeals.length - 1}
                        onClick={meal.recept_id ? () => navigate(`/recepten/${meal.recept_id}`) : undefined}
                      />
                    )) : (
                      <IOSRow title="Geen maaltijden gepland" last />
                    )}
                  </IOSGroup>
                </div>
              );
            })}

            <IOSGroupHeader>Boodschappen</IOSGroupHeader>
            <IOSGroup>
              <IOSRow
                icon={<ShoppingCart size={16} className="text-white" />}
                iconBg="#1f7a4d"
                title={`Boodschappenlijst week ${selectedWeek}`}
                sub={`${shoppingCount} items`}
                last
                onClick={() => navigate(`/boodschappen/${selectedWeek}`)}
              />
            </IOSGroup>
          </>
        )}

        <IOSTabBar />
      </div>

      {/* ── Desktop ── */}
      <div className="hidden lg:block">
        <DesktopShell
          title={`Weekplan — Week ${selectedWeek ?? ""}`}
          subtitle={weekPlan?.vlees_thema}
          accessory={
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {Array.from({ length: 8 }, (_, i) => i + 1).map(w => (
                  <button
                    key={w}
                    onClick={() => setSelectedWeek(w)}
                    className="w-8 h-8 rounded-[6px] text-[13px] font-semibold transition-colors"
                    style={
                      selectedWeek === w
                        ? { background: '#1f7a4d', color: '#fff' }
                        : { background: 'rgba(120,120,128,0.16)', color: 'rgba(60,60,67,0.6)' }
                    }
                  >
                    {w}
                  </button>
                ))}
              </div>
              <button
                onClick={() => navigate(`/boodschappen/${selectedWeek}`)}
                className="flex items-center gap-2 px-4 py-2 rounded-[8px] bg-brand text-white text-[14px] font-semibold"
              >
                <ShoppingCart size={16} />
                Boodschappenlijst
              </button>
            </div>
          }
        >
          {loading ? (
            <div className="animate-pulse bg-surface rounded-[12px] h-64" />
          ) : (
            <div>
              {/* Day header row */}
              <div className="grid gap-3 mb-2" style={{ gridTemplateColumns: `120px repeat(7, 1fr)` }}>
                <div />
                {DAYS_NL.map((day, i) => {
                  const isToday = day === todayNl;
                  return (
                    <div key={day} className="text-center pb-2">
                      <p className="text-[12px] font-semibold uppercase text-ink2">{DAYS_SHORT[i]}</p>
                      {isToday && <div className="w-1.5 h-1.5 rounded-full bg-brand mx-auto mt-1" />}
                    </div>
                  );
                })}
              </div>

              {/* All meal type rows */}
              <div className="space-y-2">
                {MEAL_TYPES.map(mealType => (
                  <div key={mealType} className="grid gap-2" style={{ gridTemplateColumns: `120px repeat(7, 1fr)` }}>
                    <div className="flex items-center">
                      <p className="text-[13px] font-semibold text-ink2">{MEAL_LABEL[mealType]}</p>
                    </div>
                    {DAYS_NL.map(day => {
                      const dagData = weekPlan?.dagen?.find(d => d.dag?.toLowerCase() === day);
                      const maaltijd = dagData?.maaltijden?.find(m => m.maaltijd_type === mealType);
                      const isToday = day === todayNl;
                      return (
                        <div
                          key={`${mealType}-${day}`}
                          onClick={() => maaltijd?.recept_id && navigate(`/recepten/${maaltijd.recept_id}`)}
                          className={`bg-surface rounded-[8px] p-2 min-h-[52px] ${maaltijd?.recept_id ? 'cursor-pointer hover:shadow-sm' : ''}`}
                          style={isToday ? { background: 'rgba(31,122,77,0.06)', outline: '1.5px solid rgba(31,122,77,0.3)' } : {}}
                        >
                          {maaltijd
                            ? <>
                                <p className="text-[12px] font-medium text-ink leading-snug">{maaltijd.naam}</p>
                                {maaltijd.eiwit_g && <p className="text-[10px] text-ink2 mt-px">{Math.round(maaltijd.eiwit_g)}g</p>}
                              </>
                            : <p className="text-[11px] text-ink3">—</p>
                          }
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </DesktopShell>
      </div>
    </>
  );
}
