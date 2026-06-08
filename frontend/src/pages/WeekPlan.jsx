import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Wand2, LayoutTemplate } from "lucide-react";
import { getWeekPlan, getCurrentWeek, getTemplates, applyTemplate } from "../api/client";
import { getStoredWeek } from "../lib/weekStorage";
import {
  IOSStatusBar, IOSLargeHeader, IOSGroupHeader, IOSGroup, IOSRow, IOSTabBar,
} from "../components/IOSPrimitives";
import DesktopShell from "../components/DesktopShell";

const DAYS_NL  = ["maandag","dinsdag","woensdag","donderdag","vrijdag","zaterdag","zondag"];
const DAYS_SHORT = ["Ma","Di","Wo","Do","Vr","Za","Zo"];
const MEAL_TYPES = ["ontbijt","lunch","snack","diner","avondsnack"];
const MEAL_LABEL = { ontbijt:"Ontbijt", lunch:"Lunch", snack:"Snack", diner:"Diner", avondsnack:"Avondsnack" };

function WeekGridRow({ label, days, todayNl, weekPlan, mealType, onNavigate, last }) {
  return (
    <>
      {/* Row label */}
      <div
        className="flex items-center px-3"
        style={{
          borderTop: '0.5px solid rgba(0,0,0,0.06)',
          background: 'rgba(0,0,0,0.02)',
          fontSize: 11, fontWeight: 700, color: 'rgba(60,60,67,0.5)',
          textTransform: 'uppercase', letterSpacing: '0.6px',
        }}
      >
        {label}
      </div>

      {/* 7 day cells */}
      {days.map((day, i) => {
        const dagData = weekPlan?.dagen?.find(d => d.dag?.toLowerCase() === day);
        const maaltijd = dagData?.maaltijden?.find(m => m.maaltijd_type === mealType);
        const isToday = day === todayNl;
        return (
          <div
            key={`${mealType}-${day}`}
            onClick={() => maaltijd?.recept_id && onNavigate(`/recepten/${maaltijd.recept_id}`)}
            className={maaltijd?.recept_id ? 'cursor-pointer' : ''}
            style={{
              borderTop: '0.5px solid rgba(0,0,0,0.06)',
              borderLeft: '0.5px solid rgba(0,0,0,0.04)',
              background: isToday ? '#fbfdfb' : 'transparent',
              padding: 6,
            }}
          >
            <div
              style={{
                background: '#fff',
                borderRadius: 7,
                padding: 7,
                border: '0.5px solid rgba(0,0,0,0.06)',
                boxShadow: isToday ? '0 0 0 1.5px #1f7a4d' : 'none',
                minHeight: 80,
              }}
            >
              {/* Photo placeholder */}
              <div
                className="rounded-[4px] mb-1.5 flex items-center justify-center overflow-hidden"
                style={{ height: 48, background: 'rgba(120,120,128,0.08)' }}
              >
                {maaltijd?.image_url
                  ? <img src={maaltijd.image_url} alt="" className="w-full h-full object-cover" />
                  : maaltijd
                    ? <span style={{ fontSize: 16 }}>🍽️</span>
                    : null
                }
              </div>
              {maaltijd ? (
                <>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 600, lineHeight: 1.25, color: '#000', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {maaltijd.naam}
                  </p>
                  {maaltijd.eiwit_g && (
                    <p style={{ margin: '3px 0 0', fontSize: 10, color: 'rgba(60,60,67,0.5)' }}>
                      {Math.round(maaltijd.eiwit_g)}g eiwit
                    </p>
                  )}
                </>
              ) : (
                <p style={{ margin: 0, fontSize: 11, color: 'rgba(60,60,67,0.3)' }}>—</p>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}

export default function WeekPlan() {
  const navigate = useNavigate();
  const [cycleWeek, setCycleWeek] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [weekPlan, setWeekPlan] = useState(null);
  const [nextWeekPlan, setNextWeekPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [applyingTemplate, setApplyingTemplate] = useState(null);
  const [error, setError] = useState(null);

  const todayIndex = new Date().getDay();
  const todayNl = DAYS_NL[todayIndex === 0 ? 6 : todayIndex - 1];

  useEffect(() => {
    getCurrentWeek().then(w => {
      setCycleWeek(w);
      const stored = getStoredWeek();
      setSelectedWeek(stored ?? w);
    });
  }, []);

  useEffect(() => {
    if (!selectedWeek) return;
    setLoading(true);
    const nextWeek = (selectedWeek % 8) + 1;
    Promise.all([getWeekPlan(selectedWeek), getWeekPlan(nextWeek)])
      .then(([data, next]) => { setError(null); setWeekPlan(data); setNextWeekPlan(next); })
      .catch(() => setError("Kon weekplan niet laden"))
      .finally(() => setLoading(false));
  }, [selectedWeek]);

  const shoppingCount = weekPlan?.dagen?.reduce(
    (acc, d) => acc + (d.maaltijden?.length ?? 0), 0
  ) ?? 0;

  async function handleOpenTemplates() {
    setShowTemplates(true);
    try {
      const data = await getTemplates();
      setTemplates(data);
    } catch {
      setTemplates([]);
    }
  }

  async function handleApplyTemplate(templateId) {
    if (!selectedWeek) return;
    const hasSlots = weekPlan?.dagen?.some(d => d.maaltijden?.length > 0);
    if (hasSlots && !window.confirm("De huidige week heeft al een weekplan. Overschrijven?")) return;
    setApplyingTemplate(templateId);
    try {
      await applyTemplate(templateId, selectedWeek);
      const data = await getWeekPlan(selectedWeek);
      setWeekPlan(data);
      setShowTemplates(false);
    } finally {
      setApplyingTemplate(null);
    }
  }

  return (
    <>
      {/* ── Mobile ── */}
      <div className="lg:hidden min-h-screen bg-bg pb-[100px]">
        <IOSStatusBar />
        <IOSLargeHeader
          title={`Week ${selectedWeek ?? ""}`}
          accessory={
            <div className="flex gap-2">
              <button
                onClick={handleOpenTemplates}
                className="w-[32px] h-[32px] rounded-full flex items-center justify-center"
                style={{ background: 'rgba(120,120,128,0.14)' }}
              >
                <LayoutTemplate size={16} className="text-ink2" />
              </button>
              <button
                onClick={() => navigate('/weekplan/genereren')}
                className="w-[32px] h-[32px] rounded-full bg-brand flex items-center justify-center"
              >
                <Wand2 size={16} className="text-white" />
              </button>
            </div>
          }
        />
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

            {/* Batch kookmomenten — bovenaan voor zichtbaarheid */}
            {weekPlan?.dagen?.filter(d => d.is_batch).length > 0 && (
              <>
                <IOSGroupHeader>Batch kookmomenten</IOSGroupHeader>
                <IOSGroup>
                  {weekPlan.dagen.filter(d => d.is_batch).map((dagData, i, arr) => {
                    const diner = dagData.maaltijden?.find(m => m.maaltijd_type === 'diner');
                    const batchIdx = DAYS_NL.indexOf(dagData.dag);
                    const consumers = weekPlan.dagen
                      .filter(d => DAYS_NL.indexOf(d.dag) > batchIdx &&
                        d.maaltijden?.some(m => m.naam?.toLowerCase().includes('(batch)')))
                      .map(d => d.dag.charAt(0).toUpperCase() + d.dag.slice(1));
                    const consumerStr = consumers.length > 0 ? ` → ${consumers.join(' + ')} lunch` : '';
                    const nextBatchNames = consumers.length === 0
                      ? (nextWeekPlan?.dagen ?? [])
                          .filter(d => ['maandag','dinsdag','woensdag'].includes(d.dag))
                          .flatMap(d => d.maaltijden ?? [])
                          .filter(m => m.naam?.toLowerCase().includes('(batch)'))
                          .map(m => m.naam.replace(/\s*\(batch\)/i, '').trim())
                          .filter((v, i, a) => a.indexOf(v) === i)
                      : [];
                    const subText = consumers.length > 0 && diner
                      ? `Kook extra: ${diner.naam}${consumerStr}`
                      : nextBatchNames.length > 0
                        ? `Kook voor volgende week: ${nextBatchNames.join(', ')}`
                        : 'Voorbereiding voor volgende week';
                    return (
                      <IOSRow
                        key={dagData.dag}
                        title={`🍳 ${dagData.dag.charAt(0).toUpperCase() + dagData.dag.slice(1)}`}
                        sub={subText}
                        last={i === arr.length - 1}
                      />
                    );
                  })}
                </IOSGroup>
              </>
            )}

            {DAYS_NL.map((day, i) => {
              const dagData = weekPlan?.dagen?.find(d => d.dag?.toLowerCase() === day);
              const dayMeals = MEAL_TYPES
                .map(type => ({ type, meal: dagData?.maaltijden?.find(m => m.maaltijd_type === type) }))
                .filter(x => x.meal);
              const isToday = day === todayNl;
              const isBatch = dagData?.is_batch;
              return (
                <div key={day}>
                  <div className="px-4 pt-5 pb-1 flex items-center justify-between">
                    <p className="text-[13px] uppercase text-ink2 tracking-wide">
                      {DAYS_SHORT[i]}{isToday ? ' · Vandaag' : ''}
                    </p>
                    {isBatch && (
                      <span className="text-[11px] font-semibold px-2 py-[2px] rounded-full" style={{ background: 'rgba(31,122,77,0.12)', color: '#1f7a4d' }}>
                        🍳 Batch
                      </span>
                    )}
                  </div>
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
          title="Weekplan"
          subtitle={selectedWeek ? `Week ${selectedWeek}${weekPlan?.vlees_thema ? ' · ' + weekPlan.vlees_thema : ''}` : undefined}
          accessory={
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedWeek(w => Math.max(1, (w ?? 1) - 1))}
                className="px-3 py-[6px] rounded-[7px] text-[13px] font-medium"
                style={{ background: 'rgba(120,120,128,0.14)', color: 'rgba(60,60,67,0.6)' }}
              >← Vorige</button>
              <button
                onClick={() => setSelectedWeek(w => Math.min(8, (w ?? 1) + 1))}
                className="px-3 py-[6px] rounded-[7px] text-[13px] font-medium"
                style={{ background: 'rgba(120,120,128,0.14)', color: 'rgba(60,60,67,0.6)' }}
              >Volgende →</button>
              <button
                onClick={handleOpenTemplates}
                className="flex items-center gap-1.5 px-3 py-[6px] rounded-[7px] text-[13px] font-semibold"
                style={{ background: 'rgba(120,120,128,0.14)', color: 'rgba(60,60,67,0.7)' }}
              >
                <LayoutTemplate size={14} /> Laad template
              </button>
              <button
                onClick={() => navigate('/weekplan/genereren')}
                className="flex items-center gap-1.5 px-3 py-[6px] rounded-[7px] text-[13px] font-semibold"
                style={{ background: 'rgba(31,122,77,0.1)', color: '#1f7a4d' }}
              >
                <Wand2 size={14} /> Genereer weekplan
              </button>
              <button
                onClick={() => navigate(`/boodschappen/${selectedWeek}`)}
                className="flex items-center gap-1.5 px-3 py-[6px] rounded-[7px] bg-brand text-white text-[13px] font-semibold"
              >
                <ShoppingCart size={14} /> Boodschappenlijst
              </button>
            </div>
          }
        >
          <div className="p-6">
            {/* Week selector strip */}
            <div className="flex items-center gap-2 mb-5 pb-4" style={{ borderBottom: '0.5px solid rgba(60,60,67,0.08)' }}>
              <div className="flex gap-1.5">
                {Array.from({ length: 8 }, (_, i) => i + 1).map(w => (
                  <button
                    key={w}
                    onClick={() => setSelectedWeek(w)}
                    className="px-4 py-[6px] rounded-[6px] text-[12px] font-semibold transition-colors"
                    style={
                      selectedWeek === w
                        ? { background: '#1f7a4d', color: '#fff' }
                        : w === cycleWeek
                        ? { background: 'rgba(31,122,77,0.1)', color: '#1f7a4d' }
                        : { background: 'rgba(120,120,128,0.12)', color: 'rgba(60,60,67,0.6)' }
                    }
                  >
                    Week {w}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="animate-pulse bg-surface rounded-[12px] h-64" />
            ) : (
              <div>
                {/* Grid panel */}
                <div
                  className="rounded-[12px] overflow-hidden"
                  style={{ background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
                >
                  {/* Grid: 80px label + 7 day cols */}
                  <div className="grid" style={{ gridTemplateColumns: '80px repeat(7, 1fr)' }}>

                    {/* Header row */}
                    <div style={{ padding: '12px 14px', background: 'rgba(0,0,0,0.02)' }} />
                    {DAYS_NL.map((day, i) => {
                      const isToday = day === todayNl;
                      const dagData = weekPlan?.dagen?.find(d => d.dag?.toLowerCase() === day);
                      const isBatch = dagData?.is_batch;
                      return (
                        <div
                          key={day}
                          className="px-3 py-3"
                          style={{
                            background: isToday ? 'rgba(31,122,77,0.06)' : 'rgba(0,0,0,0.02)',
                            borderBottom: '0.5px solid rgba(0,0,0,0.08)',
                          }}
                        >
                          <p className="text-[11px] font-bold uppercase tracking-[0.6px]" style={{ color: isToday ? '#1f7a4d' : 'rgba(60,60,67,0.5)' }}>
                            {DAYS_SHORT[i]}
                          </p>
                          {isToday && <p className="text-[9px] font-bold tracking-wide" style={{ color: '#1f7a4d' }}>VANDAAG</p>}
                          {isBatch && <p className="text-[9px] font-bold tracking-wide mt-[2px]" style={{ color: '#1f7a4d' }}>🍳 BATCH</p>}
                        </div>
                      );
                    })}

                    {/* Meal type rows — 3 main: ontbijt, lunch, diner */}
                    {["ontbijt", "lunch", "diner"].map((mealType, ri) => (
                      <WeekGridRow
                        key={mealType}
                        label={MEAL_LABEL[mealType]}
                        days={DAYS_NL}
                        todayNl={todayNl}
                        weekPlan={weekPlan}
                        mealType={mealType}
                        onNavigate={navigate}
                        last={ri === 2}
                      />
                    ))}
                  </div>
                </div>

                {/* Batch kookmomenten */}
                {weekPlan?.dagen?.filter(d => d.is_batch).length > 0 && (
                  <div className="mt-3 rounded-[10px] overflow-hidden" style={{ background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                    <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
                      <span style={{ fontSize: 14 }}>🍳</span>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-ink2">Batch kookmomenten</p>
                    </div>
                    <div className="flex">
                      {weekPlan.dagen.filter(d => d.is_batch).map((dagData, i, arr) => {
                        const diner = dagData.maaltijden?.find(m => m.maaltijd_type === 'diner');
                        const batchIdx = DAYS_NL.indexOf(dagData.dag);
                        const consumers = weekPlan.dagen
                          .filter(d => DAYS_NL.indexOf(d.dag) > batchIdx &&
                            d.maaltijden?.some(m => m.naam?.toLowerCase().includes('(batch)')))
                          .map(d => d.dag.charAt(0).toUpperCase() + d.dag.slice(1));
                        const nextBatchNames = consumers.length === 0
                          ? (nextWeekPlan?.dagen ?? [])
                              .filter(d => ['maandag','dinsdag','woensdag'].includes(d.dag))
                              .flatMap(d => d.maaltijden ?? [])
                              .filter(m => m.naam?.toLowerCase().includes('(batch)'))
                              .map(m => m.naam.replace(/\s*\(batch\)/i, '').trim())
                              .filter((v, j, a) => a.indexOf(v) === j)
                          : [];
                        return (
                          <div
                            key={dagData.dag}
                            className="flex-1 px-4 py-3"
                            style={i < arr.length - 1 ? { borderRight: '0.5px solid rgba(0,0,0,0.06)' } : {}}
                          >
                            <p className="text-[12px] font-semibold text-ink mb-1">
                              {dagData.dag.charAt(0).toUpperCase() + dagData.dag.slice(1)}
                            </p>
                            {consumers.length > 0 && diner ? (
                              <>
                                <p className="text-[12px] text-ink leading-snug">Kook extra: <strong>{diner.naam}</strong></p>
                                <p className="text-[11px] text-ink2 mt-1">→ {consumers.join(' + ')} lunch</p>
                              </>
                            ) : nextBatchNames.length > 0 ? (
                              <>
                                <p className="text-[12px] text-ink leading-snug">Kook voor volgende week:</p>
                                <p className="text-[12px] font-semibold text-ink mt-0.5">{nextBatchNames.join(', ')}</p>
                              </>
                            ) : (
                              <p className="text-[12px] text-ink2">Voorbereiding voor volgende week</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Totals row */}
                {weekPlan && (
                  <div
                    className="mt-3 px-4 py-3 rounded-[10px] flex items-center gap-6 text-[12px]"
                    style={{ background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
                  >
                    <span className="text-ink2">Week-totaal:</span>
                    {(() => {
                      const allMaaltijden = weekPlan.dagen?.flatMap(d => d.maaltijden ?? []) ?? [];
                      const totalKcal = allMaaltijden.reduce((s, m) => s + (m.kcal ?? 0), 0);
                      const totalEiwit = allMaaltijden.reduce((s, m) => s + (m.eiwit_g ?? 0), 0);
                      return (
                        <>
                          <span><strong className="text-ink">{Math.round(totalKcal).toLocaleString()} kcal</strong></span>
                          <span><strong className="text-ink">{Math.round(totalEiwit)} g</strong> <span className="text-ink2">eiwit</span></span>
                          {weekPlan.vlees_thema && (
                            <span className="text-ink2">Vlees-thema: <strong className="text-ink">{weekPlan.vlees_thema}</strong></span>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>
        </DesktopShell>
      </div>

      {/* Template modal */}
      {showTemplates && (
        <div
          className="fixed inset-0 z-50 flex items-end lg:items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={() => setShowTemplates(false)}
        >
          <div
            className="w-full max-w-md rounded-t-[20px] lg:rounded-[16px] bg-white p-5"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-[17px] font-semibold text-ink">Laad template</p>
              <button onClick={() => setShowTemplates(false)} className="text-[13px] text-brand font-medium">Sluiten</button>
            </div>
            {templates.length === 0 ? (
              <p className="text-[14px] text-ink2 text-center py-6">Nog geen templates opgeslagen.</p>
            ) : (
              <div className="space-y-2">
                {templates.map(t => (
                  <div key={t.id} className="flex items-center justify-between p-3 rounded-[10px]" style={{ background: 'rgba(120,120,128,0.06)' }}>
                    <div>
                      <p className="text-[15px] font-medium text-ink">{t.naam}</p>
                      <p className="text-[12px] text-ink2">{t.slot_count} maaltijden · {t.aangemaakt_op?.slice(0, 10)}</p>
                    </div>
                    <button
                      onClick={() => handleApplyTemplate(t.id)}
                      disabled={applyingTemplate === t.id}
                      className="px-3 py-[6px] rounded-[7px] bg-brand text-white text-[13px] font-semibold disabled:opacity-50"
                    >
                      {applyingTemplate === t.id ? "…" : "Laden"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
