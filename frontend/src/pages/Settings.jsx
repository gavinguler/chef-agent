import { useState, useEffect } from "react";
import { getCurrentWeek, getNotificationSettings, updateNotificationSettings, testDailyMessage, testShoppingReminder } from "../api/client";
import { getStoredWeek, setStoredWeek, clearStoredWeek } from "../lib/weekStorage";

const DAYS = ["maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag", "zondag"];
const DAY_SHORT = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];

function pad(n) { return String(n).padStart(2, "0"); }
function toTimeStr(h, m) { return `${pad(h)}:${pad(m)}`; }
function fromTimeStr(s) { const [h, m] = s.split(":").map(Number); return { hour: h, minute: m }; }

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${value ? "bg-brand" : "bg-gray-200"}`}
    >
      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${value ? "left-6" : "left-1"}`} />
    </button>
  );
}

function Card({ children }) {
  return <div className="bg-white rounded-2xl shadow-card overflow-hidden mb-3">{children}</div>;
}

function CardHeader({ title, subtitle }) {
  return (
    <div className="px-4 pt-4 pb-3 border-b border-gray-50">
      <p className="text-sm font-bold text-gray-900">{title}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  );
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

  const handleWeekSelect = (w) => {
    setStoredWeek(w); setOverride(w); setWeekSaved(true);
    setTimeout(() => setWeekSaved(false), 1500);
  };
  const handleWeekReset = () => {
    clearStoredWeek(); setOverride(null); setWeekSaved(true);
    setTimeout(() => setWeekSaved(false), 1500);
  };
  const activeWeek = override ?? backendWeek;

  const setField = (key, value) => setNotif((n) => ({ ...n, [key]: value }));
  const toggleShoppingDay = (day) => setNotif((n) => ({
    ...n,
    shopping_days: n.shopping_days.includes(day)
      ? n.shopping_days.filter((d) => d !== day)
      : [...n.shopping_days, day],
  }));

  const handleSaveNotif = async () => {
    setNotifSaving(true);
    try {
      const updated = await updateNotificationSettings(notif);
      setNotif(updated); setNotifSaved(true);
      setTimeout(() => setNotifSaved(false), 2000);
    } finally { setNotifSaving(false); }
  };

  const handleTest = async (type) => {
    setTesting(type);
    try {
      if (type === "daily") await testDailyMessage();
      else await testShoppingReminder();
    } finally { setTesting(null); }
  };

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-green-900 via-green-800 to-green-700 px-5 pt-12 pb-6">
        <h1 className="text-white text-2xl font-bold tracking-tight">Instellingen</h1>
        <p className="text-green-300 text-sm mt-1">Configureer je Chef Agent</p>
      </div>

      <div className="px-4 pt-4 pb-24">

        {/* Cyclus week */}
        <Card>
          <CardHeader title="Huidige cyclus week" subtitle={`Automatisch: week ${backendWeek ?? "…"}${override ? ` · Handmatig: week ${override}` : ""}`} />
          <div className="p-4">
            <div className="flex gap-2 flex-wrap mb-3">
              {[1,2,3,4,5,6,7,8].map((w) => (
                <button
                  key={w}
                  onClick={() => handleWeekSelect(w)}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-bold transition-all ${
                    activeWeek === w ? "bg-brand text-white" : "bg-gray-100 text-gray-600"
                  }`}
                >W{w}</button>
              ))}
            </div>
            {override && (
              <button onClick={handleWeekReset} className="text-xs text-gray-400 underline">
                Reset naar automatisch (week {backendWeek ?? "…"})
              </button>
            )}
            {weekSaved && <p className="text-green-600 text-xs mt-2 font-semibold">✓ Opgeslagen</p>}
          </div>
        </Card>

        {/* Telegram notificaties */}
        {notif && (
          <>
            {/* Weekoverzicht */}
            <Card>
              <CardHeader title="Notificaties deze week" />
              <div className="p-4">
                <div className="flex gap-1.5">
                  {DAYS.map((day, i) => {
                    const hasDaily = notif.daily_enabled;
                    const hasShopping = notif.shopping_enabled && notif.shopping_days.includes(day);
                    return (
                      <div key={day} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[10px] text-gray-400 font-semibold">{DAY_SHORT[i]}</span>
                        <div className={`w-full rounded-xl py-2 flex flex-col items-center gap-0.5 ${
                          hasDaily || hasShopping ? "bg-green-50" : "bg-gray-50"
                        }`}>
                          {hasDaily && <span className="text-xs leading-none">☀️</span>}
                          {hasShopping && <span className="text-xs leading-none">🛒</span>}
                          {!hasDaily && !hasShopping && <span className="w-1 h-1 rounded-full bg-gray-200 my-1.5" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-3 mt-2">
                  <span className="text-[10px] text-gray-400">☀️ dagelijks bericht</span>
                  <span className="text-[10px] text-gray-400">🛒 boodschappen</span>
                </div>
              </div>
            </Card>

            {/* Dagelijks bericht */}
            <Card>
              <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-50">
                <div>
                  <p className="text-sm font-bold text-gray-900">☀️ Dagelijks ochtendberichtje</p>
                  <p className="text-xs text-gray-400 mt-0.5">Wat je die dag gaat eten</p>
                </div>
                <Toggle value={notif.daily_enabled} onChange={(v) => setField("daily_enabled", v)} />
              </div>
              {notif.daily_enabled && (
                <div className="p-4 flex items-center gap-3">
                  <span className="text-xs text-gray-500 font-medium">Tijdstip</span>
                  <input
                    type="time"
                    value={toTimeStr(notif.daily_hour, notif.daily_minute)}
                    onChange={(e) => { const t = fromTimeStr(e.target.value); setNotif((n) => ({ ...n, daily_hour: t.hour, daily_minute: t.minute })); }}
                    className="flex-1 border border-gray-100 bg-gray-50 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                  <button
                    onClick={() => handleTest("daily")} disabled={testing === "daily"}
                    className="text-xs font-semibold text-brand border border-brand/20 bg-green-50 rounded-xl px-3 py-2 disabled:opacity-50"
                  >
                    {testing === "daily" ? "..." : "Test"}
                  </button>
                </div>
              )}
            </Card>

            {/* Boodschappenherinnering */}
            <Card>
              <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-50">
                <div>
                  <p className="text-sm font-bold text-gray-900">🛒 Boodschappenherinnering</p>
                  <p className="text-xs text-gray-400 mt-0.5">Op welke dagen?</p>
                </div>
                <Toggle value={notif.shopping_enabled} onChange={(v) => setField("shopping_enabled", v)} />
              </div>
              {notif.shopping_enabled && (
                <div className="p-4 space-y-3">
                  <div className="flex gap-1.5 flex-wrap">
                    {DAYS.map((day, i) => (
                      <button
                        key={day}
                        onClick={() => toggleShoppingDay(day)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                          notif.shopping_days.includes(day)
                            ? "bg-brand text-white"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >{DAY_SHORT[i]}</button>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 font-medium">Tijdstip</span>
                    <input
                      type="time"
                      value={toTimeStr(notif.shopping_hour, notif.shopping_minute)}
                      onChange={(e) => { const t = fromTimeStr(e.target.value); setNotif((n) => ({ ...n, shopping_hour: t.hour, shopping_minute: t.minute })); }}
                      className="flex-1 border border-gray-100 bg-gray-50 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                    <button
                      onClick={() => handleTest("shopping")} disabled={testing === "shopping"}
                      className="text-xs font-semibold text-brand border border-brand/20 bg-green-50 rounded-xl px-3 py-2 disabled:opacity-50"
                    >
                      {testing === "shopping" ? "..." : "Test"}
                    </button>
                  </div>
                </div>
              )}
            </Card>

            <button
              onClick={handleSaveNotif} disabled={notifSaving}
              className="w-full bg-brand text-white text-sm font-bold py-3.5 rounded-2xl shadow-card disabled:opacity-50 transition-all active:scale-95"
            >
              {notifSaving ? "Opslaan..." : notifSaved ? "✓ Opgeslagen" : "Instellingen opslaan"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
