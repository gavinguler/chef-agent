import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import {
  getNotificationSettings, updateNotificationSettings,
  testDailyMessage, testShoppingReminder, getCurrentWeek,
} from "../api/client";
import { getStoredWeek, setStoredWeek, clearStoredWeek } from "../lib/weekStorage";
import {
  IOSStatusBar, IOSLargeHeader, IOSGroupHeader, IOSGroup, IOSRow, IOSToggle, IOSTabBar,
} from "../components/IOSPrimitives";
import DesktopShell from "../components/DesktopShell";

const DAYS_NL = ["maandag","dinsdag","woensdag","donderdag","vrijdag","zaterdag","zondag"];
const DAYS_SHORT = ["Ma","Di","Wo","Do","Vr","Za","Zo"];

function pad(n) { return String(n).padStart(2, "0"); }

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [realWeek, setRealWeek] = useState(null);
  const [overrideWeek, setOverrideWeek] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getNotificationSettings().then(setSettings);
    getCurrentWeek().then(w => {
      setRealWeek(w);
      const stored = getStoredWeek();
      setOverrideWeek(stored ?? w);
    });
  }, []);

  async function save(next) {
    setSettings(next);
    setSaving(true);
    await updateNotificationSettings(next).finally(() => setSaving(false));
  }

  function toggleField(field) {
    if (!settings) return;
    save({ ...settings, [field]: !settings[field] });
  }

  function setTime(prefix, type, val) {
    if (!settings) return;
    const num = parseInt(val, 10);
    if (isNaN(num)) return;
    save({ ...settings, [`${prefix}_${type}`]: num });
  }

  function toggleDay(day) {
    if (!settings) return;
    const days = settings.shopping_days.includes(day)
      ? settings.shopping_days.filter(d => d !== day)
      : [...settings.shopping_days, day];
    save({ ...settings, shopping_days: days });
  }

  function applyWeekOverride(w) {
    setOverrideWeek(w);
    if (w === realWeek) clearStoredWeek();
    else setStoredWeek(w);
  }

  const SettingsContent = () => (
    <>
      <IOSGroupHeader>Cyclus</IOSGroupHeader>
      <IOSGroup>
        <IOSRow title="Echte cyclus week" detail={realWeek ? `Week ${realWeek}` : "—"} />
        <IOSRow
          title="Actieve week"
          last
          detail={
            <div className="flex gap-1 items-center">
              {Array.from({ length: 8 }, (_, i) => i + 1).map(w => (
                <button
                  key={w}
                  onClick={() => applyWeekOverride(w)}
                  className="w-7 h-7 rounded-[6px] text-[12px] font-semibold"
                  style={
                    overrideWeek === w
                      ? { background: '#1f7a4d', color: '#fff' }
                      : { background: 'rgba(120,120,128,0.16)', color: 'rgba(60,60,67,0.6)' }
                  }
                >
                  {w}
                </button>
              ))}
            </div>
          }
        />
      </IOSGroup>

      <IOSGroupHeader>Telegram</IOSGroupHeader>
      <IOSGroup>
        <IOSRow
          icon={<MessageCircle size={16} className="text-white" />}
          iconBg="#0088cc"
          title="Verbonden"
          sub="Telegram bot actief"
        />
        <IOSRow
          title="Dagelijks bericht"
          accessory={
            settings && <IOSToggle on={settings.daily_enabled} onChange={() => toggleField("daily_enabled")} />
          }
        />
        {settings?.daily_enabled && (
          <IOSRow
            title="Tijdstip dagelijks bericht"
            detail={
              <div className="flex items-center gap-1">
                <select
                  value={settings.daily_hour}
                  onChange={e => setTime("daily", "hour", e.target.value)}
                  className="bg-fill rounded-[6px] px-2 py-1 text-[14px] text-ink border-none outline-none"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>{pad(i)}</option>
                  ))}
                </select>
                <span className="text-ink2 text-[14px]">:</span>
                <select
                  value={settings.daily_minute}
                  onChange={e => setTime("daily", "minute", e.target.value)}
                  className="bg-fill rounded-[6px] px-2 py-1 text-[14px] text-ink border-none outline-none"
                >
                  {[0, 15, 30, 45].map(m => (
                    <option key={m} value={m}>{pad(m)}</option>
                  ))}
                </select>
              </div>
            }
          />
        )}
        <IOSRow
          title="Boodschappen herinnering"
          accessory={
            settings && <IOSToggle on={settings.shopping_enabled} onChange={() => toggleField("shopping_enabled")} />
          }
        />
        {settings?.shopping_enabled && (
          <>
            <IOSRow
              title="Herinnering op"
              detail={
                <div className="flex gap-1 flex-wrap justify-end">
                  {DAYS_NL.map((day, i) => (
                    <button
                      key={day}
                      onClick={() => toggleDay(day)}
                      className="w-7 h-7 rounded-full text-[11px] font-semibold"
                      style={
                        settings.shopping_days.includes(day)
                          ? { background: '#1f7a4d', color: '#fff' }
                          : { background: 'rgba(120,120,128,0.16)', color: 'rgba(60,60,67,0.6)' }
                      }
                    >
                      {DAYS_SHORT[i]}
                    </button>
                  ))}
                </div>
              }
            />
            <IOSRow
              title="Tijdstip herinnering"
              detail={
                <div className="flex items-center gap-1">
                  <select
                    value={settings.shopping_hour}
                    onChange={e => setTime("shopping", "hour", e.target.value)}
                    className="bg-fill rounded-[6px] px-2 py-1 text-[14px] text-ink border-none outline-none"
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>{pad(i)}</option>
                    ))}
                  </select>
                  <span className="text-ink2 text-[14px]">:</span>
                  <select
                    value={settings.shopping_minute}
                    onChange={e => setTime("shopping", "minute", e.target.value)}
                    className="bg-fill rounded-[6px] px-2 py-1 text-[14px] text-ink border-none outline-none"
                  >
                    {[0, 15, 30, 45].map(m => (
                      <option key={m} value={m}>{pad(m)}</option>
                    ))}
                  </select>
                </div>
              }
            />
          </>
        )}
        <IOSRow title="Stuur dagelijks testbericht" last={false} onClick={testDailyMessage} />
        <IOSRow title="Stuur boodschappen testbericht" last onClick={testShoppingReminder} />
      </IOSGroup>
    </>
  );

  return (
    <>
      {/* ── Mobile ── */}
      <div className="lg:hidden min-h-screen bg-bg pb-[100px]">
        <IOSStatusBar />
        <IOSLargeHeader title="Instellingen" />
        {saving && <p className="px-4 text-[13px] text-ink2">Opslaan…</p>}
        <SettingsContent />
        <IOSTabBar />
      </div>

      {/* ── Desktop ── */}
      <div className="hidden lg:block">
        <DesktopShell title="Instellingen" subtitle={saving ? "Opslaan…" : undefined}>
          <div className="max-w-2xl">
            <SettingsContent />
          </div>
        </DesktopShell>
      </div>
    </>
  );
}
