import { useState, useEffect } from "react";
import { getCurrentWeek } from "../api/client";
import { getStoredWeek, setStoredWeek, clearStoredWeek } from "../lib/weekStorage";

export default function Settings() {
  const [backendWeek, setBackendWeek] = useState(null);
  const [override, setOverride] = useState(getStoredWeek());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getCurrentWeek().then(setBackendWeek);
  }, []);

  const handleSelect = (w) => {
    setStoredWeek(w);
    setOverride(w);
    flash();
  };

  const handleReset = () => {
    clearStoredWeek();
    setOverride(null);
    flash();
  };

  const flash = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const activeWeek = override ?? backendWeek;

  return (
    <div className="p-4 pb-20">
      <h1 className="text-xl font-bold text-gray-900 mb-1">Instellingen</h1>
      <p className="text-gray-500 text-sm mb-6">Configureer je Chef Agent</p>

      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mb-4">
        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Huidige cyclus week</p>
        <p className="text-gray-500 text-xs mb-3">
          Automatisch berekend: week {backendWeek ?? "…"}
          {override ? ` · Handmatig ingesteld op week ${override}` : ""}
        </p>
        <div className="flex gap-1 flex-wrap mb-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
            <button
              key={w}
              onClick={() => handleSelect(w)}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                activeWeek === w
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white text-gray-600 border-gray-200"
              }`}
            >
              W{w}
            </button>
          ))}
        </div>
        {override && (
          <button onClick={handleReset} className="text-xs text-gray-400 underline">
            Reset naar automatisch (week {backendWeek ?? "…"})
          </button>
        )}
        {saved && (
          <p className="text-green-600 text-xs mt-2 font-semibold">✓ Opgeslagen</p>
        )}
      </div>
    </div>
  );
}
