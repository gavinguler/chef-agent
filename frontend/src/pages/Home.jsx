import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ShoppingCart } from "lucide-react";
import { getWeekPlan, getCurrentWeek } from "../api/client";
import { getStoredWeek } from "../lib/weekStorage";
import {
  IOSStatusBar, IOSLargeHeader, IOSGroupHeader, IOSGroup, IOSRow, IOSTabBar,
} from "../components/IOSPrimitives";
import DesktopShell, { Panel, Stat } from "../components/DesktopShell";
import ProteinRing from "../components/ProteinRing";
import ThinBar from "../components/ThinBar";

const DAG_NL       = ["zondag","maandag","dinsdag","woensdag","donderdag","vrijdag","zaterdag"];
const DAG_SHORT_NL = ["zo","ma","di","wo","do","vr","za"];
const MEAL_TYPES   = ["ontbijt","lunch","snack","diner","avondsnack"];
const MEAL_LABEL   = { ontbijt:"Ontbijt", lunch:"Lunch", snack:"Snack", diner:"Diner", avondsnack:"Avondsnack" };

function usePlan() {
  const [cycleWeek, setCycleWeek] = useState(null);
  const [weekPlan, setWeekPlan] = useState(null);
  const [loading, setLoading] = useState(true);

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

  return { cycleWeek, weekPlan, loading };
}

export default function Home() {
  const navigate = useNavigate();
  const { cycleWeek, weekPlan, loading } = usePlan();

  const now = new Date();
  const todayNl = DAG_NL[now.getDay()];

  const weekDates = useMemo(() => {
    const d = new Date(now);
    const dow = d.getDay() === 0 ? 6 : d.getDay() - 1;
    d.setDate(d.getDate() - dow);
    return Array.from({ length: 7 }, (_, i) => {
      const dd = new Date(d);
      dd.setDate(d.getDate() + i);
      return {
        short: DAG_SHORT_NL[dd.getDay()],
        date: dd.getDate(),
        isToday: dd.toDateString() === now.toDateString(),
        dayNl: DAG_NL[dd.getDay()],
      };
    });
  }, []);

  const dagData = weekPlan?.dagen?.find(d => d.dag === todayNl);
  const maaltijden = dagData?.maaltijden ?? [];
  const diner = maaltijden.find(m => m.maaltijd_type === "diner");
  const eiwit = dagData?.totaal_eiwit_g ?? 0;
  const kcal = dagData?.totaal_kcal ?? 0;
  const thema = weekPlan?.vlees_thema ?? "";

  const todayMeals = MEAL_TYPES
    .map(type => ({ type, meal: maaltijden.find(x => x.maaltijd_type === type) }))
    .filter(x => x.meal);

  const nextDays = weekDates.filter(d => !d.isToday).slice(0, 3).map(d => {
    const dag = weekPlan?.dagen?.find(x => x.dag === d.dayNl);
    const dinr = dag?.maaltijden?.find(m => m.maaltijd_type === "diner");
    return { ...d, diner: dinr };
  });

  return (
    <>
      {/* ── Mobile ── */}
      <div className="lg:hidden min-h-screen bg-bg pb-[100px]">
        <IOSStatusBar />
        <IOSLargeHeader
          title="Vandaag"
          accessory={
            <button className="w-[34px] h-[34px] rounded-full flex items-center justify-center" style={{ background: 'rgba(120,120,128,0.16)' }}>
              <Bell size={18} className="text-ink" />
            </button>
          }
        />

        {/* Subtitle */}
        <p className="px-4 mb-4 text-[15px] text-ink2">
          {thema ? `${thema} · ` : ""}week {cycleWeek}
        </p>

        {/* Hero card */}
        {diner && (
          <div className="mx-4 mb-6 bg-surface rounded-[14px] overflow-hidden shadow-sm">
            <div className="h-[170px] bg-fill flex items-center justify-center">
              {diner.image_url
                ? <img src={diner.image_url} alt={diner.naam} className="w-full h-full object-cover" />
                : <span className="text-4xl">🍽️</span>
              }
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wide px-2 py-[2px] rounded-full text-brand" style={{ background: 'rgba(31,122,77,0.12)' }}>
                  DINER
                </span>
              </div>
              <h2 className="text-[22px] font-bold text-ink mb-2">{diner.naam}</h2>
              <p className="text-[13px] text-ink2 mb-4">
                {diner.eiwit_g ? `${Math.round(diner.eiwit_g)}g eiwit` : ""}{diner.kcal ? ` · ${diner.kcal} kcal` : ""}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate(`/recepten/${diner.recept_id}`)}
                  className="flex-1 py-[10px] rounded-[10px] bg-brand text-white text-[15px] font-semibold"
                >
                  Recept openen
                </button>
                <button
                  onClick={() => navigate(`/boodschappen/${cycleWeek}`)}
                  className="px-4 py-[10px] rounded-[10px] text-brand text-[15px] font-semibold flex items-center gap-1"
                  style={{ background: 'rgba(31,122,77,0.12)' }}
                >
                  <ShoppingCart size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Alle maaltijden vandaag */}
        {todayMeals.length > 0 && (
          <>
            <IOSGroupHeader>Maaltijden vandaag</IOSGroupHeader>
            <IOSGroup>
              {todayMeals.map(({ type, meal }, i) => (
                <IOSRow
                  key={type}
                  title={meal.naam}
                  sub={MEAL_LABEL[type] + (meal.eiwit_g ? ` · ${Math.round(meal.eiwit_g)}g eiwit` : "")}
                  last={i === todayMeals.length - 1}
                  onClick={meal.recept_id ? () => navigate(`/recepten/${meal.recept_id}`) : undefined}
                />
              ))}
            </IOSGroup>
          </>
        )}

        {/* Macro's */}
        <IOSGroupHeader>Vandaag</IOSGroupHeader>
        <IOSGroup>
          <div className="p-4 flex items-start gap-4">
            <ProteinRing v={eiwit} max={160} />
            <div className="flex-1">
              <ThinBar v={kcal} max={2700} label="Calorieën" unit="kcal" />
              <ThinBar v={eiwit} max={160} label="Eiwit" unit="g" />
            </div>
          </div>
        </IOSGroup>

        {/* Week strip */}
        <IOSGroupHeader>Deze week</IOSGroupHeader>
        <div className="mx-4 flex gap-[6px]">
          {weekDates.map((d) => (
            <div
              key={d.dayNl}
              className="flex-1 flex flex-col items-center py-2 rounded-[10px] text-[12px] font-medium"
              style={d.isToday
                ? { background: '#1f7a4d', color: '#fff' }
                : { background: 'rgba(120,120,128,0.16)', color: 'rgba(60,60,67,0.6)' }
              }
            >
              <span className="uppercase text-[10px] tracking-wide">{d.short}</span>
              <span className="font-bold text-[15px] mt-px">{d.date}</span>
            </div>
          ))}
        </div>

        {/* Komende dagen */}
        <IOSGroupHeader>Komende dagen</IOSGroupHeader>
        <IOSGroup>
          {nextDays.map((d, i) => (
            <IOSRow
              key={d.dayNl}
              title={d.diner?.naam ?? "Niet ingesteld"}
              sub={d.short.toUpperCase() + " · " + (d.diner?.eiwit_g ? `${Math.round(d.diner.eiwit_g)}g eiwit` : "")}
              last={i === nextDays.length - 1}
              onClick={d.diner?.recept_id ? () => navigate(`/recepten/${d.diner.recept_id}`) : undefined}
            />
          ))}
        </IOSGroup>

        <IOSTabBar />
      </div>

      {/* ── Desktop ── */}
      <div className="hidden lg:block">
        <DesktopShell
          title="Vandaag"
          subtitle={`${todayNl.charAt(0).toUpperCase() + todayNl.slice(1)} · week ${cycleWeek}${thema ? ' · ' + thema : ''}`}
        >
          {loading ? (
            <div className="animate-pulse bg-surface rounded-[12px] h-64" />
          ) : (
            <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 320px' }}>
              {/* Left */}
              <div className="space-y-6">
                {/* Hero */}
                {diner && (
                  <div className="bg-surface rounded-[12px] overflow-hidden shadow-sm flex">
                    <div className="w-[320px] flex-shrink-0 bg-fill flex items-center justify-center">
                      {diner.image_url
                        ? <img src={diner.image_url} alt={diner.naam} className="w-full h-full object-cover" />
                        : <span className="text-5xl">🍽️</span>
                      }
                    </div>
                    <div className="p-6 flex flex-col justify-between">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wide text-brand px-2 py-px rounded-full" style={{ background: 'rgba(31,122,77,0.12)' }}>
                          DINER
                        </span>
                        <h2 className="text-[22px] font-bold text-ink mt-2 mb-1">{diner.naam}</h2>
                        <p className="text-[14px] text-ink2">{diner.eiwit_g ? `${Math.round(diner.eiwit_g)}g eiwit` : ""}{diner.kcal ? ` · ${diner.kcal} kcal` : ""}</p>
                      </div>
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={() => navigate(`/recepten/${diner.recept_id}`)}
                          className="px-4 py-2 rounded-[8px] bg-brand text-white text-[14px] font-semibold"
                        >
                          Recept openen
                        </button>
                        <button
                          onClick={() => navigate(`/boodschappen/${cycleWeek}`)}
                          className="px-4 py-2 rounded-[8px] text-brand text-[14px] font-semibold flex items-center gap-2"
                          style={{ background: 'rgba(31,122,77,0.12)' }}
                        >
                          <ShoppingCart size={16} />
                          Boodschappen
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Week strip */}
                <div className="grid grid-cols-7 gap-3">
                  {weekDates.map(d => {
                    const dag = weekPlan?.dagen?.find(x => x.dag === d.dayNl);
                    const dinr = dag?.maaltijden?.find(m => m.maaltijd_type === "diner");
                    return (
                      <div
                        key={d.dayNl}
                        className="bg-surface rounded-[10px] p-3 text-center cursor-pointer"
                        style={d.isToday ? { outline: '2px solid #1f7a4d', background: 'rgba(31,122,77,0.06)' } : {}}
                        onClick={() => dinr?.recept_id && navigate(`/recepten/${dinr.recept_id}`)}
                      >
                        <p className="text-[11px] font-semibold uppercase text-ink2">{d.short}</p>
                        <p className="text-[17px] font-bold text-ink">{d.date}</p>
                        {dinr && <p className="text-[11px] text-ink2 mt-1 leading-tight">{dinr.naam}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right */}
              <div className="space-y-4">
                <Panel title="Macro's">
                  <div className="flex items-center gap-4 mb-4">
                    <ProteinRing v={eiwit} max={160} />
                    <div className="flex-1">
                      <Stat label="Eiwit" v={`${Math.round(eiwit)}g`} />
                    </div>
                  </div>
                  <ThinBar v={kcal} max={2700} label="Calorieën" unit="kcal" />
                  <ThinBar v={eiwit} max={160} label="Eiwit" unit="g" />
                </Panel>
                {todayMeals.length > 0 && (
                  <Panel title="Maaltijden vandaag">
                    {todayMeals.map(({ type, meal }, i) => (
                      <div
                        key={type}
                        onClick={() => meal.recept_id && navigate(`/recepten/${meal.recept_id}`)}
                        className={`flex items-center justify-between py-[10px] ${meal.recept_id ? 'cursor-pointer hover:opacity-70' : ''} ${i < todayMeals.length - 1 ? 'border-b border-sep' : ''}`}
                      >
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink2">{MEAL_LABEL[type]}</p>
                          <p className="text-[14px] text-ink mt-px leading-snug">{meal.naam}</p>
                        </div>
                        {meal.eiwit_g && (
                          <p className="text-[13px] text-ink2 flex-shrink-0 ml-3">{Math.round(meal.eiwit_g)}g</p>
                        )}
                      </div>
                    ))}
                  </Panel>
                )}
              </div>
            </div>
          )}
        </DesktopShell>
      </div>
    </>
  );
}
