import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import {
  getNotificationSettings, updateNotificationSettings,
  testDailyMessage, testShoppingReminder, getCurrentWeek,
} from "../api/client";
import { getStoredWeek } from "../lib/weekStorage";
import {
  IOSStatusBar, IOSLargeHeader, IOSGroupHeader, IOSGroup, IOSRow, IOSToggle, IOSTabBar,
} from "../components/IOSPrimitives";
import DesktopShell from "../components/DesktopShell";

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [cycleWeek, setCycleWeek] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getNotificationSettings().then(setSettings);
    const stored = getStoredWeek();
    if (stored) setCycleWeek(stored);
    else getCurrentWeek().then(setCycleWeek);
  }, []);

  async function toggle(field) {
    if (!settings) return;
    const next = { ...settings, [field]: !settings[field] };
    setSettings(next);
    setSaving(true);
    await updateNotificationSettings(next).finally(() => setSaving(false));
  }

  const SettingsContent = () => (
    <>
      <IOSGroupHeader>Cyclus</IOSGroupHeader>
      <IOSGroup>
        <IOSRow title="Huidige week" detail={cycleWeek ? `Week ${cycleWeek}` : "—"} />
        <IOSRow title="Startdatum" detail="Week 18, 2026" last />
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
          sub="Elke ochtend om 08:00"
          accessory={
            settings && <IOSToggle on={settings.daily_message_enabled ?? false} onChange={() => toggle("daily_message_enabled")} />
          }
        />
        <IOSRow
          title="Boodschappen herinnering"
          sub="Zondagochtend"
          accessory={
            settings && <IOSToggle on={settings.shopping_reminder_enabled ?? false} onChange={() => toggle("shopping_reminder_enabled")} />
          }
        />
        <IOSRow
          title="Vriezer herinnering"
          sub="Wekelijks"
          last
          accessory={
            settings && <IOSToggle on={settings.freezer_reminder_enabled ?? false} onChange={() => toggle("freezer_reminder_enabled")} />
          }
        />
      </IOSGroup>

      <IOSGroupHeader>Testen</IOSGroupHeader>
      <IOSGroup>
        <IOSRow
          title="Stuur dagelijks testbericht"
          onClick={testDailyMessage}
        />
        <IOSRow
          title="Stuur boodschappen testbericht"
          last
          onClick={testShoppingReminder}
        />
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
