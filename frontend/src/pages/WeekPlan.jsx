import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ChevronRight, ChevronDown, ShoppingCart, ArrowRight, LayoutGrid, List } from "lucide-react";
import { getWeekPlan, getCurrentWeek } from "../api/client";
import { getStoredWeek, setStoredWeek } from "../lib/weekStorage";

const DAYS = ["maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag", "zondag"];
const DAY_SHORT = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];
const MEAL_LABEL = { ontbijt: "Ontbijt", lunch: "Lunch", snack: "Snack", diner: "Diner", avondsnack: "Avondsnack" };
const MEAL_TYPES = ["ontbijt", "lunch", "snack", "diner", "avondsnack"];

const KOOKSCHEMA = {
  1: { batches: [
    { dag: "Zondag", duur: "~75 min", items: ["Bolognese 1050g (3 porties)", "Zoete aardappel 1kg", "6 hardgekookte eieren"] },
    { dag: "Dinsdag", duur: "~25 min", items: ["Couscous 150g droog → 450g"] },
    { dag: "Donderdag", duur: "~40 min", items: ["Linzencurry 900g (3 porties)", "Basmatirijst"] },
  ]},
  2: { batches: [
    { dag: "Zondag", duur: "~3u15", items: ["Riblap-stoof 1400g (4 porties)", "Zoete aardappel 1kg", "6 hardgekookte eieren"] },
    { dag: "Dinsdag", duur: "~25 min", items: ["Zilvervliesrijst 150g droog"] },
    { dag: "Donderdag", duur: "~40 min", items: ["Kikkererwten-stoof 900g (3 porties)", "Couscous 390g"] },
  ]},
  3: { batches: [
    { dag: "Zondag", duur: "~75 min", items: ["Rosbief 700g slow roast (kern 55°C)", "Zoete aardappel 1kg", "6 hardgekookte eieren"] },
    { dag: "Dinsdag", duur: "~25 min", items: ["Volkorenpasta 450g → pasta-salade WO-lunch"] },
    { dag: "Donderdag", duur: "~40 min", items: ["Shakshuka-saus 900g (3 porties, eieren ALTIJD vers)"] },
  ]},
  4: { batches: [
    { dag: "Zondag", duur: "~75 min", items: ["Chili con carne 1100g (3 porties)", "Zoete aardappel 1kg", "6 hardgekookte eieren"] },
    { dag: "Dinsdag", duur: "~25 min", items: ["Zilvervliesrijst 150g droog"] },
    { dag: "Donderdag", duur: "~40 min", items: ["Kikkererwten-stoof 900g (3 porties)", "Couscous 390g"] },
  ]},
  5: { batches: [
    { dag: "Zondag", duur: "~75 min", items: ["Gehaktballetjes 1100g (~24 stuks in tomatensaus)", "Zoete aardappel 1kg", "6 hardgekookte eieren"] },
    { dag: "Dinsdag", duur: "~25 min", items: ["Volkorenpasta 450g → pasta-salade WO-lunch"] },
    { dag: "Donderdag", duur: "~40 min", items: ["Rode-linzendahl 900g (3 porties)", "Basmatirijst 390g"] },
  ]},
  6: { batches: [
    { dag: "Zondag", duur: "~75 min", items: ["Rundvleescurry 1100g (3 porties)", "Zoete aardappel 1kg", "6 hardgekookte eieren"] },
    { dag: "Dinsdag", duur: "~25 min", items: ["Jasmijnrijst 150g droog"] },
    { dag: "Donderdag", duur: "~40 min", items: ["Shakshuka-saus 900g (3 porties, eieren ALTIJD vers)"] },
  ]},
  7: { batches: [
    { dag: "Zondag", duur: "~75 min", items: ["Picadillo 1100g (3 porties)", "Zoete aardappel 1kg", "6 hardgekookte eieren"] },
    { dag: "Dinsdag", duur: "~25 min", items: ["Jasmijnrijst 150g droog"] },
    { dag: "Donderdag", duur: "~40 min", items: ["Rode-linzendahl 900g (3 porties)", "Basmatirijst 390g"] },
  ]},
  8: { batches: [
    { dag: "Zondag", duur: "~30 min", items: ["Pasta-salade 250g pasta + feta + olijven (voor MA-lunch)"] },
    { dag: "Dinsdag", duur: "~15 min", items: ["Zalm 180g oven"] },
    { dag: "Woensdag", duur: "~10 min", items: ["Tartaar VERS bereiden — niet bewaren"] },
    { dag: "Donderdag", duur: "~40 min", items: ["Linzencurry 900g (3 porties)", "Basmatirijst 390g"] },
  ]},
};

export default function WeekPlan() {
  const navigate = useNavigate();
  const [currentCycleWeek, setCurrentCycleWeek] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [weekPlan, setWeekPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedDay, setExpandedDay] = useState(null);
  const [view, setView] = useState("lijst"); // "lijst" | "overzicht"

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

  const schema = KOOKSCHEMA[selectedWeek];

  return (
    <div className="bg-bg min-h-screen pb-[100px]">
      <div className="h-[54px]" />

      {/* Header */}
      <div className="px-5 pt-[14px] pb-1 flex items-start justify-between">
        <div>
          <p className="eyebrow">8-weken cyclus</p>
          <h1 className="h1-page mt-1">Weekplan</h1>
        </div>
        {/* View toggle */}
        <div className="flex gap-1 mt-1 rounded-[10px] p-[3px]" style={{ background: '#e9efe6' }}>
          <button
            onClick={() => setView("lijst")}
            className="flex items-center gap-1 px-[10px] py-[5px] rounded-[8px] text-[11px] font-semibold transition-all"
            style={{ background: view === "lijst" ? "#fff" : "transparent", color: view === "lijst" ? "#1a1f1a" : "#5d655c" }}
          >
            <List size={13} strokeWidth={1.8} /> Lijst
          </button>
          <button
            onClick={() => setView("overzicht")}
            className="flex items-center gap-1 px-[10px] py-[5px] rounded-[8px] text-[11px] font-semibold transition-all"
            style={{ background: view === "overzicht" ? "#fff" : "transparent", color: view === "overzicht" ? "#1a1f1a" : "#5d655c" }}
          >
            <LayoutGrid size={13} strokeWidth={1.8} /> Overzicht
          </button>
        </div>
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

      {view === "lijst" ? (
        <>
          {/* Day accordion list */}
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

                    {isExpanded && (
                      <div style={{ borderTop: '1px solid #efece4' }}>
                        {MEAL_TYPES.map((type, idx, arr) => {
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
        </>
      ) : (
        <>
          {/* WEEKOVERZICHT — grid tabel */}
          <div className="mt-5 px-5">
            <p className="text-[12px] font-semibold text-ink2 uppercase tracking-[1px] mb-3">Eetschema</p>
          </div>
          <div className="overflow-x-auto px-5">
            {loading ? (
              <div className="h-[240px] bg-surface rounded-[14px] border border-line animate-pulse" />
            ) : (
              <table className="w-full text-left border-collapse" style={{ minWidth: 540 }}>
                <thead>
                  <tr>
                    <th className="w-10 pb-2" />
                    {MEAL_TYPES.map(t => (
                      <th key={t} className="pb-2 text-[10px] font-semibold uppercase tracking-[1px] text-ink3 pr-3">
                        {MEAL_LABEL[t]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DAYS.map((dag, i) => {
                    const dagData = weekPlan?.dagen?.find(d => d.dag?.toLowerCase() === dag);
                    const maaltijden = dagData?.maaltijden ?? [];
                    const isToday = dag === todayNl;
                    return (
                      <tr
                        key={dag}
                        style={{
                          borderTop: '1px solid #efece4',
                          background: isToday ? '#f4f8f2' : 'transparent',
                        }}
                      >
                        <td className="py-[10px] pr-2">
                          <span
                            className="inline-flex w-7 h-7 rounded-[7px] items-center justify-center text-[10px] font-semibold"
                            style={{
                              background: isToday ? '#1f3a2c' : '#e9efe6',
                              color: isToday ? '#fff' : '#1f3a2c',
                            }}
                          >{DAY_SHORT[i]}</span>
                        </td>
                        {MEAL_TYPES.map(type => {
                          const m = maaltijden.find(x => x.maaltijd_type === type);
                          const isDiner = type === "diner";
                          return (
                            <td key={type} className="py-[10px] pr-3">
                              <button
                                onClick={() => m?.recept_id && navigate(`/recepten/${m.recept_id}`)}
                                className="text-left w-full"
                              >
                                <p
                                  className="text-[12px] leading-snug"
                                  style={{
                                    color: m?.naam ? (isDiner ? '#1a1f1a' : '#3d4a3d') : '#c8cfc8',
                                    fontWeight: isDiner && m?.naam ? 500 : 400,
                                    maxWidth: 130,
                                    overflow: 'hidden',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                  }}
                                >
                                  {m?.naam ?? "–"}
                                </p>
                                {m?.kcal && (
                                  <p className="text-[10px] text-ink3 mt-[1px]">{m.kcal} kcal</p>
                                )}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* KOOKSCHEMA */}
          {schema && (
            <div className="px-5 mt-6">
              <p className="text-[12px] font-semibold text-ink2 uppercase tracking-[1px] mb-3">Kookschema</p>
              <div className="flex flex-col gap-[8px]">
                {schema.batches.map((batch, idx) => (
                  <div
                    key={idx}
                    className="rounded-[14px] px-4 py-[12px]"
                    style={{ background: '#ffffff', border: '1px solid #e7e4dc' }}
                  >
                    <div className="flex items-center justify-between mb-[6px]">
                      <span className="text-[13px] font-semibold">{batch.dag}</span>
                      <span
                        className="text-[10px] font-medium px-[8px] py-[2px] rounded-full"
                        style={{ background: '#e9efe6', color: '#1f3a2c' }}
                      >{batch.duur}</span>
                    </div>
                    <ul className="flex flex-col gap-[4px]">
                      {batch.items.map((item, j) => (
                        <li key={j} className="flex items-start gap-2">
                          <span className="mt-[5px] w-[4px] h-[4px] rounded-full flex-shrink-0" style={{ background: '#5d655c' }} />
                          <span className="text-[12px] text-ink2">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

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
