import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getWeekPlan, getCurrentWeek } from "../api/client";
import { getStoredWeek } from "../lib/weekStorage";

function greet() {
  const h = new Date().getHours();
  if (h < 12) return "Goedemorgen";
  if (h < 18) return "Goedemiddag";
  return "Goedenavond";
}

const DAG_NL = ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"];
const DAG_LABEL = { maandag: "Maandag", dinsdag: "Dinsdag", woensdag: "Woensdag", donderdag: "Donderdag", vrijdag: "Vrijdag", zaterdag: "Zaterdag", zondag: "Zondag" };
const MAAND_NL = ["", "jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
const MEAL_EMOJI = { ontbijt: "🥣", lunch: "🥗", diner: "🍽️" };

export default function Home() {
  const navigate = useNavigate();
  const [cycleWeek, setCycleWeek] = useState(null);
  const [weekPlan, setWeekPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const vandaag = useMemo(() => DAG_NL[new Date().getDay()], []);
  const vandaag_label = DAG_LABEL[vandaag] || vandaag;
  const now = new Date();
  const datum = `${now.getDate()} ${MAAND_NL[now.getMonth() + 1]}`;

  useEffect(() => {
    const stored = getStoredWeek();
    if (stored) setCycleWeek(stored);
    else getCurrentWeek().then(setCycleWeek);
  }, []);

  useEffect(() => {
    if (!cycleWeek) return;
    setLoading(true);
    getWeekPlan(cycleWeek)
      .then(setWeekPlan)
      .finally(() => setLoading(false));
  }, [cycleWeek]);

  const vandaagPlan = weekPlan?.dagen?.find((d) => d.dag?.toLowerCase() === vandaag);
  const maaltijden = vandaagPlan?.maaltijden?.filter((m) => m.naam) || [];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-900 via-green-800 to-green-700 px-5 pt-12 pb-6">
        <p className="text-green-300 text-sm font-medium mb-0.5">{vandaag_label} · {datum}</p>
        <h1 className="text-white text-2xl font-bold tracking-tight">{greet()} 👋</h1>
        {weekPlan && (
          <p className="text-green-300 text-sm mt-1">
            Week {cycleWeek}{weekPlan.vlees_thema ? ` · ${weekPlan.vlees_thema}` : ""}
          </p>
        )}
      </div>

      <div className="px-4 -mt-2">
        {/* Vandaag kaart */}
        <div className="bg-white rounded-2xl shadow-card-md overflow-hidden mb-4">
          <div className="px-4 pt-4 pb-3 border-b border-gray-50">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Vandaag</p>
          </div>
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : maaltijden.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {maaltijden.map((m) => (
                <button
                  key={m.maaltijd_type}
                  onClick={() => m.recept_id && navigate(`/recepten/${m.recept_id}`)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
                >
                  <span className="text-xl w-8 text-center">{MEAL_EMOJI[m.maaltijd_type]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{m.naam}</p>
                    <p className="text-xs text-gray-400 capitalize">{m.maaltijd_type}</p>
                  </div>
                  {m.eiwit_g && (
                    <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                      {Math.round(m.eiwit_g)}g
                    </span>
                  )}
                </button>
              ))}
              {vandaagPlan?.totaal_eiwit_g > 0 && (
                <div className="flex items-center justify-between px-4 py-3 bg-green-50">
                  <span className="text-xs font-bold text-green-700">
                    {Math.round(vandaagPlan.totaal_eiwit_g)}g eiwit
                  </span>
                  <span className="text-xs text-gray-500">{vandaagPlan.totaal_kcal} kcal</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-6">Geen maaltijden ingesteld</p>
          )}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Link to="/weekplan" className="bg-white rounded-2xl p-4 shadow-card flex items-center gap-3 active:scale-95 transition-transform">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl">📅</div>
            <span className="text-sm font-semibold text-gray-800">Weekplan</span>
          </Link>
          <Link to="/recepten" className="bg-white rounded-2xl p-4 shadow-card flex items-center gap-3 active:scale-95 transition-transform">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-xl">📖</div>
            <span className="text-sm font-semibold text-gray-800">Recepten</span>
          </Link>
          <Link to="/weekplan" className="bg-white rounded-2xl p-4 shadow-card flex items-center gap-3 active:scale-95 transition-transform">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-xl">🛒</div>
            <span className="text-sm font-semibold text-gray-800">Boodschappen</span>
          </Link>
          <Link to="/recepten?new=1" className="bg-brand rounded-2xl p-4 shadow-card flex items-center gap-3 active:scale-95 transition-transform">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">➕</div>
            <span className="text-sm font-bold text-white">Nieuw recept</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
