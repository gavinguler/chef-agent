import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
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
      className="relative flex-shrink-0 transition-colors"
      style={{ width: 36, height: 22, borderRadius: 11, background: value ? '#1f3a2c' : '#e7e4dc' }}
    >
      <span
        className="absolute top-[2px] w-[18px] h-[18px] bg-white rounded-full transition-all"
        style={{ left: value ? 16 : 2, boxShadow: '0 1px 3px rgba(0,0,0,0.18)' }}
      />
    </button>
  );
}

function Section({ title, children }) {
  return (
    <div className="px-5 pt-5">
      <p className="eyebrow mb-[10px]">{title}</p>
      <div className="bg-surface border border-line rounded-[14px] px-[14px]">
        {children}
      </div>
    </div>
  );
}

function RowItem({ label, sub, right, border = true }) {
  return (
    <div
      className="flex items-center gap-3 py-[10px]"
      style={{ borderBottom: border ? '1px solid #efece4' : 'none' }}
    >
      <div className="flex-1">
        <p className="text-[13px] font-medium">{label}</p>
        {sub && <p className="text-[11px] text-ink3 mt-[2px]">{sub}</p>}
      </div>
      {right}
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
    <div className="bg-bg min-h-screen pb-[100px]">
      <div className="h-[54px]" />

      <div className="px-5 pt-[14px] pb-1">
        <h1 className="h1-page">Instellingen</h1>
        <p className="text-[13px] text-ink2 mt-1">Configureer je Chef Agent</p>
      </div>

      {/* Cyclus week */}
      <Section title="Huidige cyclus week">
        <div className="py-[10px]">
          <p className="text-[12px] text-ink2 mb-3">
            Auto: week {backendWeek ?? "…"}{override ? ` · Handmatig: week ${override}` : ""}
          </p>
          <div className="flex gap-[6px]">
            {[1,2,3,4,5,6,7,8].map((w) => (
              <button
                key={w}
                onClick={() => handleWeekSelect(w)}
                className="flex-1 h-[34px] rounded-[8px] text-[12px] font-semibold transition-colors"
                style={{
                  background: activeWeek === w ? '#1f3a2c' : 'transparent',
                  color: activeWeek === w ? '#fff' : '#5d655c',
                  border: activeWeek === w ? 'none' : '1px solid #e7e4dc',
                }}
              >W{w}</button>
            ))}
          </div>
          {override && (
            <button onClick={handleWeekReset} className="text-[11px] text-ink3 underline mt-2 block">
              Reset naar automatisch (week {backendWeek ?? "…"})
            </button>
          )}
          {weekSaved && <p className="text-[11px] mt-2 font-semibold" style={{ color: '#1f3a2c' }}>Opgeslagen</p>}
        </div>
      </Section>

      {/* Telegram */}
      {notif && (
        <>
          <Section title="Telegram">
            <RowItem
              label="Dagelijks ochtendberichtje"
              sub={`${toTimeStr(notif.daily_hour, notif.daily_minute)} · wat je vandaag eet`}
              right={<Toggle value={notif.daily_enabled} onChange={(v) => setField("daily_enabled", v)} />}
            />
            {notif.daily_enabled && (
              <div className="pb-[10px] flex items-center gap-3" style={{ borderBottom: '1px solid #efece4' }}>
                <span className="text-[12px] text-ink2">Tijdstip</span>
                <input
                  type="time"
                  value={toTimeStr(notif.daily_hour, notif.daily_minute)}
                  onChange={(e) => { const t = fromTimeStr(e.target.value); setNotif((n) => ({ ...n, daily_hour: t.hour, daily_minute: t.minute })); }}
                  className="flex-1 border border-line bg-line2 rounded-[10px] px-3 py-[8px] text-[13px] focus:outline-none"
                />
                <button
                  onClick={() => handleTest("daily")} disabled={testing === "daily"}
                  className="text-[12px] font-medium px-3 py-[8px] rounded-[10px] border border-line text-ink2 disabled:opacity-50"
                >
                  {testing === "daily" ? "..." : "Test"}
                </button>
              </div>
            )}
            <RowItem
              label="Boodschappenherinnering"
              sub="Op welke dagen?"
              right={<Toggle value={notif.shopping_enabled} onChange={(v) => setField("shopping_enabled", v)} />}
            />
            {notif.shopping_enabled && (
              <div className="pb-3 space-y-3" style={{ borderBottom: '1px solid #efece4' }}>
                <div className="flex gap-[6px] flex-wrap pt-1">
                  {DAYS.map((day, i) => (
                    <button
                      key={day}
                      onClick={() => toggleShoppingDay(day)}
                      className="px-3 py-[5px] rounded-[14px] text-[11px] font-medium transition-colors"
                      style={{
                        background: notif.shopping_days.includes(day) ? '#1f3a2c' : 'transparent',
                        color: notif.shopping_days.includes(day) ? '#fff' : '#5d655c',
                        border: notif.shopping_days.includes(day) ? 'none' : '1px solid #e7e4dc',
                      }}
                    >{DAY_SHORT[i]}</button>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[12px] text-ink2">Tijdstip</span>
                  <input
                    type="time"
                    value={toTimeStr(notif.shopping_hour, notif.shopping_minute)}
                    onChange={(e) => { const t = fromTimeStr(e.target.value); setNotif((n) => ({ ...n, shopping_hour: t.hour, shopping_minute: t.minute })); }}
                    className="flex-1 border border-line bg-line2 rounded-[10px] px-3 py-[8px] text-[13px] focus:outline-none"
                  />
                  <button
                    onClick={() => handleTest("shopping")} disabled={testing === "shopping"}
                    className="text-[12px] font-medium px-3 py-[8px] rounded-[10px] border border-line text-ink2 disabled:opacity-50"
                  >
                    {testing === "shopping" ? "..." : "Test"}
                  </button>
                </div>
              </div>
            )}
            <RowItem label="Vriezer-reminder" sub="Avond voor je het nodig hebt" border={false}
              right={<Toggle value={false} onChange={() => {}} />} />
          </Section>

          <div className="px-5 pt-5">
            <button
              onClick={handleSaveNotif} disabled={notifSaving}
              className="w-full bg-brand text-white text-[13px] font-semibold py-[14px] rounded-[14px] disabled:opacity-50"
            >
              {notifSaving ? "Opslaan..." : notifSaved ? "Opgeslagen" : "Instellingen opslaan"}
            </button>
          </div>
        </>
      )}

      {/* Voorkeuren */}
      <Section title="Voorkeuren">
        <RowItem label="Eiwit-doel" sub="140 g per dag" right={<ChevronRight size={15} strokeWidth={1.6} className="text-ink3" />} />
        <RowItem label="Calorie-budget" sub="2200 kcal per dag" right={<ChevronRight size={15} strokeWidth={1.6} className="text-ink3" />} />
        <RowItem label="Dieet" sub="Geen restricties" border={false} right={<ChevronRight size={15} strokeWidth={1.6} className="text-ink3" />} />
      </Section>
    </div>
  );
}
