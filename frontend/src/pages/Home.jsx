import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getWeekPlan } from "../api/client";
import FreezerBanner from "../components/FreezerBanner";

function getCurrentCycleWeek() {
  const now = new Date();
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const isoWeek = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return ((isoWeek - 1) % 8) + 1;
}

function greet() {
  const h = new Date().getHours();
  if (h < 12) return "Goedemorgen";
  if (h < 18) return "Goedemiddag";
  return "Goedenavond";
}

const DAG_NL = ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"];

export default function Home() {
  const [weekPlan, setWeekPlan] = useState(null);
  const [freezerItems] = useState([]);
  const cycleWeek = getCurrentCycleWeek();
  const vandaag = DAG_NL[new Date().getDay()];

  useEffect(() => {
    getWeekPlan(cycleWeek).then(setWeekPlan).catch(console.error);
  }, [cycleWeek]);

  const vandaagPlan = weekPlan?.dagen?.find((d) => d.dag === vandaag);
  const diner = vandaagPlan?.maaltijden?.find((m) => m.maaltijd_type === "diner");

  return (
    <div className="p-4 pb-20">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">{greet()} 👋</h1>
        <p className="text-gray-500 text-sm">
          Week {cycleWeek} · {weekPlan ? weekPlan.vlees_thema || "" : "laden..."}
        </p>
      </div>

      {diner && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 mb-3">
          <p className="text-gray-400 text-xs font-semibold uppercase mb-1">
            Vandaag · {vandaag.charAt(0).toUpperCase() + vandaag.slice(1)}
          </p>
          <p className="font-semibold text-gray-900">🍽️ {diner.naam}</p>
          <div className="flex gap-2 mt-2">
            {diner.eiwit_g && (
              <span className="bg-green-50 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-md">
                {Math.round(diner.eiwit_g)}g eiwit
              </span>
            )}
            {diner.kcal && (
              <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-md">
                {diner.kcal} kcal
              </span>
            )}
          </div>
        </div>
      )}

      <FreezerBanner items={freezerItems} />

      <div className="grid grid-cols-2 gap-3">
        <Link to="/weekplan" className="bg-white border border-gray-200 rounded-xl p-3 text-center shadow-sm active:bg-gray-50">
          <div className="text-2xl mb-1">🛒</div>
          <p className="text-gray-700 text-sm font-semibold">Boodschappen</p>
        </Link>
        <Link to="/recepten" className="bg-white border border-gray-200 rounded-xl p-3 text-center shadow-sm active:bg-gray-50">
          <div className="text-2xl mb-1">📖</div>
          <p className="text-gray-700 text-sm font-semibold">Recepten</p>
        </Link>
        <Link to="/weekplan" className="bg-white border border-gray-200 rounded-xl p-3 text-center shadow-sm active:bg-gray-50">
          <div className="text-2xl mb-1">📅</div>
          <p className="text-gray-700 text-sm font-semibold">Week plan</p>
        </Link>
        <Link to="/recepten?new=1" className="bg-brand rounded-xl p-3 text-center active:opacity-90">
          <div className="text-2xl mb-1">➕</div>
          <p className="text-white text-sm font-bold">Nieuw recept</p>
        </Link>
      </div>
    </div>
  );
}
