import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ShoppingCart, Plus, Sparkles, ChevronRight } from "lucide-react";
import { getWeekPlan, getCurrentWeek, getRecipes } from "../api/client";
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

function useRecentRecipes() {
  const [recipes, setRecipes] = useState([]);
  useEffect(() => {
    getRecipes().then(r => setRecipes(r.slice(-4).reverse())).catch(() => {});
  }, []);
  return recipes;
}

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

function InlineStat({ label, v }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-ink2">{label}</p>
      <p className="text-[15px] font-bold text-ink mt-px">{v}</p>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { cycleWeek, weekPlan, loading } = usePlan();
  const recentRecipes = useRecentRecipes();

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

  const todayIdx = DAG_NL.indexOf(todayNl);
  const upcomingBatch = weekPlan?.dagen
    ?.filter(d => d.is_batch && DAG_NL.indexOf(d.dag) >= todayIdx)
    .sort((a, b) => DAG_NL.indexOf(a.dag) - DAG_NL.indexOf(b.dag))[0] ?? null;
  const batchDiner = upcomingBatch?.maaltijden?.find(m => m.maaltijd_type === 'diner') ?? null;
  const batchConsumers = upcomingBatch && weekPlan
    ? weekPlan.dagen
        .filter(d => DAG_NL.indexOf(d.dag) > DAG_NL.indexOf(upcomingBatch.dag) &&
          d.maaltijden?.some(m => m.naam?.toLowerCase().includes('(batch)')))
        .map(d => d.dag.charAt(0).toUpperCase() + d.dag.slice(1))
    : [];

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

        {/* Batch kookreminder — direct na maaltijden voor zichtbaarheid */}
        {batchDiner && (
          <>
            <IOSGroupHeader>Batch koken</IOSGroupHeader>
            <IOSGroup>
              <div className="px-4 py-3 flex items-start gap-3">
                <span className="text-2xl leading-none mt-0.5">🍳</span>
                <div className="flex-1">
                  <p className="text-[15px] font-semibold text-ink">
                    {upcomingBatch.dag === todayNl
                      ? 'Vandaag extra koken'
                      : `${upcomingBatch.dag.charAt(0).toUpperCase() + upcomingBatch.dag.slice(1)} extra koken`}
                  </p>
                  <p className="text-[14px] text-ink mt-[2px]">{batchDiner.naam}</p>
                  {batchConsumers.length > 0 && (
                    <p className="text-[13px] text-ink2 mt-1">
                      Voedt lunch op {batchConsumers.join(' en ')}
                    </p>
                  )}
                </div>
                {upcomingBatch.dag === todayNl && (
                  <span className="text-[11px] font-bold px-2 py-[3px] rounded-full" style={{ background: 'rgba(31,122,77,0.12)', color: '#1f7a4d' }}>
                    VANDAAG
                  </span>
                )}
              </div>
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
          accessory={
            <button
              onClick={() => navigate('/recepten')}
              className="flex items-center gap-1.5 px-3 py-[6px] rounded-[7px] bg-brand text-white text-[13px] font-semibold"
            >
              <Plus size={14} /> Nieuw recept
            </button>
          }
        >
          {loading ? (
            <div className="p-6 space-y-4">
              <div className="animate-pulse bg-surface rounded-[14px] h-56" />
              <div className="animate-pulse bg-surface rounded-[14px] h-32" />
            </div>
          ) : (
            <div className="p-6 grid gap-5" style={{ gridTemplateColumns: '1fr 300px' }}>
              {/* ── Left ── */}
              <div className="space-y-5">
                {/* Hero card */}
                {diner && (
                  <div
                    className="bg-surface rounded-[14px] overflow-hidden flex"
                    style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)' }}
                  >
                    <div className="w-[280px] flex-shrink-0 bg-fill flex items-center justify-center" style={{ minHeight: 230 }}>
                      {diner.image_url
                        ? <img src={diner.image_url} alt={diner.naam} className="w-full h-full object-cover" style={{ minHeight: 230 }} />
                        : <span className="text-5xl">🍽️</span>
                      }
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <span
                        className="text-[11px] font-bold uppercase tracking-[0.6px] px-2 py-[3px] rounded self-start"
                        style={{ background: 'rgba(31,122,77,0.1)', color: '#1f7a4d' }}
                      >
                        Vanavond · diner
                      </span>
                      <h2 className="text-[24px] font-bold text-ink mt-3 mb-1 leading-tight">{diner.naam}</h2>
                      <p className="text-[13px] text-ink2 mb-4">
                        2 porties{diner.bereidingstijd_min ? ` · ${diner.bereidingstijd_min} min` : ""}{thema ? ` · ${thema}` : ""}
                      </p>
                      <div className="flex gap-5 mb-auto">
                        {diner.kcal && <InlineStat label="Calorieën" v={`${diner.kcal} kcal`} />}
                        {diner.eiwit_g && <InlineStat label="Eiwit" v={`${Math.round(diner.eiwit_g)}g`} />}
                        {diner.vet_g && <InlineStat label="Vet" v={`${Math.round(diner.vet_g)}g`} />}
                        {diner.koolhydraten_g && <InlineStat label="KH" v={`${Math.round(diner.koolhydraten_g)}g`} />}
                      </div>
                      <div className="flex gap-2 mt-5">
                        <button
                          onClick={() => navigate(`/recepten/${diner.recept_id}`)}
                          className="px-4 py-2 rounded-[8px] bg-brand text-white text-[13px] font-semibold"
                        >
                          Recept openen
                        </button>
                        <button
                          onClick={() => navigate(`/boodschappen/${cycleWeek}`)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-[8px] text-[13px] font-semibold"
                          style={{ background: 'rgba(31,122,77,0.1)', color: '#1f7a4d' }}
                        >
                          <ShoppingCart size={13} /> Boodschappen
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Week strip */}
                <div>
                  <p className="text-[15px] font-bold text-ink mb-3">Deze week</p>
                  <div className="grid grid-cols-7 gap-2">
                    {weekDates.map(d => {
                      const dag = weekPlan?.dagen?.find(x => x.dag === d.dayNl);
                      const dinr = dag?.maaltijden?.find(m => m.maaltijd_type === "diner");
                      return (
                        <div
                          key={d.dayNl}
                          className="rounded-[12px] overflow-hidden cursor-pointer"
                          style={d.isToday ? { boxShadow: '0 0 0 2px #1f7a4d' } : {}}
                          onClick={() => dinr?.recept_id && navigate(`/recepten/${dinr.recept_id}`)}
                        >
                          <div
                            className="h-[80px] flex items-center justify-center overflow-hidden"
                            style={{ background: d.isToday ? '#1f7a4d' : 'rgba(120,120,128,0.08)' }}
                          >
                            {dinr?.image_url
                              ? <img src={dinr.image_url} alt="" className="w-full h-full object-cover" />
                              : <span className="text-xl">{d.isToday ? '🍽️' : '🍽'}</span>
                            }
                          </div>
                          <div className="p-2 bg-surface">
                            <p className="text-[10px] font-bold uppercase tracking-wide text-ink3">{d.short} · {d.date}</p>
                            <p className="text-[11px] font-semibold text-ink mt-0.5 leading-snug">{dinr?.naam ?? "—"}</p>
                            {dinr?.eiwit_g && <p className="text-[10px] text-ink2">{Math.round(dinr.eiwit_g)}g</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recent recepten */}
                {recentRecipes.length > 0 && (
                  <div>
                    <div className="flex items-baseline justify-between mb-3">
                      <p className="text-[15px] font-bold text-ink">Recent toegevoegd</p>
                      <button onClick={() => navigate('/recepten')} className="text-[13px] font-medium text-brand">
                        Alle recepten →
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      {recentRecipes.map(r => (
                        <div
                          key={r.id}
                          onClick={() => navigate(`/recepten/${r.id}`)}
                          className="bg-surface rounded-[10px] overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                        >
                          <div className="h-[96px] bg-fill flex items-center justify-center">
                            {r.image_url
                              ? <img src={r.image_url} alt={r.naam} className="w-full h-full object-cover" />
                              : <span className="text-2xl">🍽️</span>
                            }
                          </div>
                          <div className="p-2">
                            <p className="text-[10px] font-bold uppercase tracking-wide text-brand">{r.categorie}</p>
                            <p className="text-[12px] font-semibold text-ink mt-0.5 leading-snug">{r.naam}</p>
                            <p className="text-[11px] text-ink2 mt-px">
                              {[r.eiwit_g ? `${Math.round(r.eiwit_g)}g` : null, r.kcal ? `${r.kcal}kcal` : null].filter(Boolean).join(' · ')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ── Right ── */}
              <div className="space-y-4">
                <Panel title="Macro's vandaag">
                  <div className="flex items-center gap-3 pb-3 mb-3" style={{ borderBottom: '0.5px solid rgba(60,60,67,0.1)' }}>
                    <ProteinRing v={eiwit} max={160} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[20px] font-bold text-ink leading-none">
                        {Math.round(eiwit)}<span className="text-[12px] font-normal text-ink2"> / 160 g</span>
                      </p>
                      <p className="text-[12px] text-ink2 mt-1">
                        Eiwit-doel · {Math.round(eiwit / 160 * 100)}% behaald
                      </p>
                    </div>
                  </div>
                  <ThinBar v={kcal} max={2700} label="Calorieën" unit="kcal" />
                </Panel>

                {todayMeals.length > 0 && (
                  <Panel title="Maaltijden vandaag">
                    {todayMeals.map(({ type, meal }, i) => (
                      <div
                        key={type}
                        onClick={() => meal.recept_id && navigate(`/recepten/${meal.recept_id}`)}
                        className={`flex items-center justify-between py-[9px] ${meal.recept_id ? 'cursor-pointer hover:opacity-70' : ''} ${i < todayMeals.length - 1 ? 'border-b border-sep' : ''}`}
                      >
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wide text-ink2">{MEAL_LABEL[type]}</p>
                          <p className="text-[13px] text-ink mt-px leading-snug">{meal.naam}</p>
                        </div>
                        {meal.eiwit_g && (
                          <p className="text-[12px] text-ink2 flex-shrink-0 ml-3">{Math.round(meal.eiwit_g)}g</p>
                        )}
                      </div>
                    ))}
                  </Panel>
                )}

                {/* AI quick */}
                <div
                  className="rounded-[12px] p-4 text-white cursor-pointer flex items-center gap-3"
                  style={{ background: 'linear-gradient(135deg, #af52de, #5856d6)' }}
                  onClick={() => navigate('/recepten')}
                >
                  <Sparkles size={18} />
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold">AI: stel een diner voor</p>
                    <p className="text-[11px] mt-0.5" style={{ opacity: 0.85 }}>Op basis van je weekplan</p>
                  </div>
                  <ChevronRight size={15} style={{ opacity: 0.7 }} />
                </div>
              </div>
            </div>
          )}
        </DesktopShell>
      </div>
    </>
  );
}
