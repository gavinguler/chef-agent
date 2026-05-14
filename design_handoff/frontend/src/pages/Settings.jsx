import { useState, useEffect } from "react";
import { getCurrentWeek, getNotificationSettings, updateNotificationSettings, testDailyMessage, testShoppingReminder } from "../api/client";
import { getStoredWeek, setStoredWeek, clearStoredWeek } from "../lib/weekStorage";

const DAYS = ["maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag", "zondag"];
const DAY_SHORT = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];

function pad(n) { return String(n).padStart(2, "0"); }
function toTimeStr(h, m) { return `${pad(h)}:${pad(m)}`; }
function fromTimeStr(s) {
  const [h, m] = s.split(":").map(Number);
  return { hour: h, minute: m };
}

export default function Settings() {
  const [backendWeek, setBackendWeek] = useState(null);
  const [override, setOverride] = useState(getStoredWeek());
  const [weekSaved, setWeekSaved] = useState(false);

  const [notif, setNotif] = useState(null);
  const [notifSaving, setNotifSaving] = useState(false);
  const [notifSaved, setNotifSaved] = useState(false);
  const [testing, setTesting] = useState(null);

  useEffect(() => {
    getCurrentWeek().then(setBackendWeek);
    getNotificationSettings().then(setNotif);
  }, []);

  // --- Cyclus week ---
  const handleWeekSelect = (w) => {
    setStoredWeek(w);
    setOverride(w);
    setWeekSaved(true);
    setTimeout(() => setWeekSaved(false), 1500);
  };
  const handleWeekReset = () => {
    clearStoredWeek();
    setOverride(null);
    setWeekSaved(true);
    setTimeout(() => setWeekSaved(false), 1500);
  };
  const activeWeek = override ?? backendWeek;

  // --- Notificaties ---
  const setField = (key, value) => setNotif((n) => ({ ...n, [key]: value }));

  const toggleShoppingDay = (day) => {
    setNotif((n) => {
      const days = n.shopping_days.includes(day)
        ? n.shopping_days.filter((d) => d !== day)
        : [...n.shopping_days, day];
      return { ...n, shopping_days: days };
    });
  };

  const handleSaveNotif = async () => {
    setNotifSaving(true);
    try {
      const updated = await updateNotificationSettings(notif);
      setNotif(updated);
      setNotifSaved(true);
      setTimeout(() => setNotifSaved(false), 2000);
    } finally {
      setNotifSaving(false);
    }
  };

  const handleTest = async (type) => {
    setTesting(type);
    try {
      if (type === "daily") await testDailyMessage();
      else await testShoppingReminder();
    } finally {
      setTesting(null);
    }
  };

  return (
    <div className="p-4 pb-20">
      <h1 className="text-xl font-bold text-gray-900 mb-1">Instellingen</h1>
      <p className="text-gray-500 text-sm mb-6">Configureer je Chef Agent</p>

      {/* Cyclus week */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mb-4">
        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Huidige cyclus week</p>
        <p className="text-gray-500 text-xs mb-3">
          Automatisch: week {backendWeek ?? "…"}
          {override ? ` · Handmatig: week ${override}` : ""}
        </p>
        <div className="flex gap-1 flex-wrap mb-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
            <button
              key={w}
              onClick={() => handleWeekSelect(w)}
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
          <button onClick={handleWeekReset} className="text-xs text-gray-400 underline">
            Reset naar automatisch (week {backendWeek ?? "…"})
          </button>
        )}
        {weekSaved && <p className="text-green-600 text-xs mt-2 font-semibold">✓ Opgeslagen</p>}
      </div>

      {/* Notificaties */}
      {notif && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mb-4">
          <p className="text-xs font-bold text-gray-400 uppercase mb-4">Telegram notificaties</p>

          {/* Weekoverzicht */}
          <div className="mb-4">
            <p className="text-xs text-gray-500 font-semibold mb-2">Overzicht deze week</p>
            <div className="flex gap-1">
              {DAYS.map((day, i) => {
                const hasDailyMsg = notif.daily_enabled;
                const hasShopping = notif.shopping_enabled && notif.shopping_days.includes(day);
                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-0.5">
                    <span className="text-xs text-gray-400 font-medium">{DAY_SHORT[i]}</span>
                    <div className="h-8 w-full rounded-lg border flex flex-col items-center justify-center gap-0.5"
                      style={{ borderColor: hasDailyMsg || hasShopping ? "#d1fae5" : "#e5e7eb",
                               background: hasDailyMsg || hasShopping ? "#f0fdf4" : "#f9fafb" }}>
                      {hasDailyMsg && <span className="text-xs leading-none">☀️</span>}
                      {hasShopping && <span className="text-xs leading-none">🛒</span>}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-3 mt-2 text-xs text-gray-400">
              <span>☀️ dagelijks bericht</span>
              <span>🛒 boodschappen</span>
            </div>
          </div>

          {/* Dagelijks bericht */}
          <div className="border-t border-gray-100 pt-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-800">☀️ Dagelijks ochtendberichtje</p>
              <button
                onClick={() => setField("daily_enabled", !notif.daily_enabled)}
                className={`w-10 h-6 rounded-full transition-colors ${notif.daily_enabled ? "bg-green-500" : "bg-gray-200"}`}
              >
                <span className={`block w-4 h-4 bg-white rounded-full shadow mx-1 transition-transform ${notif.daily_enabled ? "translate-x-4" : ""}`} />
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-2">Wat je die dag gaat eten</p>
            {notif.daily_enabled && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Tijdstip:</span>
                <input
                  type="time"
                  value={toTimeStr(notif.daily_hour, notif.daily_minute)}
                  onChange={(e) => {
                    const { hour, minute } = fromTimeStr(e.target.value);
                    setNotif((n) => ({ ...n, daily_hour: hour, daily_minute: minute }));
                  }}
                  className="border border-gray-200 rounded-lg px-2 py-1 text-sm"
                />
                <button
                  onClick={() => handleTest("daily")}
                  disabled={testing === "daily"}
                  className="text-xs text-gray-500 border border-gray-200 rounded-lg px-2 py-1 disabled:opacity-50"
                >
                  {testing === "daily" ? "..." : "Test"}
                </button>
              </div>
            )}
          </div>

          {/* Boodschappenherinnering */}
          <div className="border-t border-gray-100 pt-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-800">🛒 Boodschappenherinnering</p>
              <button
                onClick={() => setField("shopping_enabled", !notif.shopping_enabled)}
                className={`w-10 h-6 rounded-full transition-colors ${notif.shopping_enabled ? "bg-green-500" : "bg-gray-200"}`}
              >
                <span className={`block w-4 h-4 bg-white rounded-full shadow mx-1 transition-transform ${notif.shopping_enabled ? "translate-x-4" : ""}`} />
              </button>
            </div>
            {notif.shopping_enabled && (
              <>
                <p className="text-xs text-gray-500 mb-2">Op welke dagen?</p>
                <div className="flex gap-1 flex-wrap mb-3">
                  {DAYS.map((day, i) => (
                    <button
                      key={day}
                      onClick={() => toggleShoppingDay(day)}
                      className={`px-2 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                        notif.shopping_days.includes(day)
                          ? "bg-green-600 text-white border-green-600"
                          : "bg-white text-gray-600 border-gray-200"
                      }`}
                    >
                      {DAY_SHORT[i]}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Tijdstip:</span>
                  <input
                    type="time"
                    value={toTimeStr(notif.shopping_hour, notif.shopping_minute)}
                    onChange={(e) => {
                      const { hour, minute } = fromTimeStr(e.target.value);
                      setNotif((n) => ({ ...n, shopping_hour: hour, shopping_minute: minute }));
                    }}
                    className="border border-gray-200 rounded-lg px-2 py-1 text-sm"
                  />
                  <button
                    onClick={() => handleTest("shopping")}
                    disabled={testing === "shopping"}
                    className="text-xs text-gray-500 border border-gray-200 rounded-lg px-2 py-1 disabled:opacity-50"
                  >
                    {testing === "shopping" ? "..." : "Test"}
                  </button>
                </div>
              </>
            )}
          </div>

          <button
            onClick={handleSaveNotif}
            disabled={notifSaving}
            className="w-full bg-green-600 text-white text-sm font-semibold py-2 rounded-lg disabled:opacity-50"
          >
            {notifSaving ? "Opslaan..." : notifSaved ? "✓ Opgeslagen" : "Opslaan"}
          </button>
        </div>
      )}
    </div>
  );
}
