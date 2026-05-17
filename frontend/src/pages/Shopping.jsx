import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCurrentWeek, getShoppingList, toggleShoppingItem } from "../api/client";
import { getStoredWeek } from "../lib/weekStorage";
import { IOSStatusBar, IOSLargeHeader, IOSGroupHeader, IOSTabBar } from "../components/IOSPrimitives";
import DesktopShell from "../components/DesktopShell";

function useShoppingData(week) {
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!week) return;
    setLoading(true);
    getShoppingList(week)
      .then(data => {
        const grouped = {};
        for (const item of data.items ?? []) {
          const cat = item.categorie ?? "overig";
          if (!grouped[cat]) grouped[cat] = [];
          grouped[cat].push({ ...item, naam: item.product });
        }
        const categories = Object.entries(grouped).map(([naam, items]) => ({ naam, items }));
        setList({ week: data.week, categories });
      })
      .catch(() => setList(null))
      .finally(() => setLoading(false));
  }, [week]);

  return { list, loading };
}

export default function Shopping() {
  const { week: paramWeek } = useParams();
  const navigate = useNavigate();
  const [week, setWeek] = useState(null);

  function selectWeek(w) {
    navigate(`/boodschappen/${w}`);
  }

  useEffect(() => {
    if (paramWeek) {
      setWeek(Number(paramWeek));
    } else {
      const stored = getStoredWeek();
      if (stored) setWeek(stored);
      else getCurrentWeek().then(setWeek).catch(() => {});
    }
  }, [paramWeek]);

  const { list, loading } = useShoppingData(week);

  const [checked, setChecked] = useState(new Set());

  // Sync checked state from API response
  useEffect(() => {
    if (!list) return;
    const apiChecked = new Set(
      list.categories.flatMap(cat => cat.items.filter(item => item.checked).map(item => item.id))
    );
    setChecked(apiChecked);
  }, [list]);

  async function toggle(id) {
    // Optimistic update
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    try {
      await toggleShoppingItem(week, id);
    } catch {
      // Revert on failure
      setChecked(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    }
  }

  const categories = list?.categories ?? list?.boodschappen_per_categorie ?? [];
  const allItems = categories.flatMap(cat =>
    (cat.items ?? cat.boodschappen ?? []).map(item => item.id ?? `${cat.naam}-${item.naam}`)
  );
  const totalItems = allItems.length;
  const checkedCount = allItems.filter(id => checked.has(id)).length;
  const progress = totalItems > 0 ? checkedCount / totalItems : 0;

  // ── Mobile checklist ──────────────────────────────────────
  const MobileList = () => (
    <>
      <div className="px-4 mb-4">
        <div className="flex justify-between text-[13px] text-ink2 mb-2">
          <span>{checkedCount} van {totalItems}</span>
          <span>{Math.round(progress * 100)}%</span>
        </div>
        <div className="h-1 rounded-sm overflow-hidden" style={{ background: 'rgba(120,120,128,0.16)' }}>
          <div className="h-full rounded-sm transition-all duration-300" style={{ width: `${progress * 100}%`, background: '#1f7a4d' }} />
        </div>
      </div>

      {categories.map(cat => {
        const items = cat.items ?? cat.boodschappen ?? [];
        return (
          <div key={cat.naam} className="mb-2">
            <IOSGroupHeader>{cat.naam}</IOSGroupHeader>
            <div className="mx-4 bg-surface rounded-[10px] overflow-hidden">
              {items.map((item, i) => {
                const itemId = item.id ?? `${cat.naam}-${item.naam}`;
                const isDone = checked.has(itemId);
                return (
                  <div
                    key={itemId}
                    onClick={() => toggle(itemId)}
                    className="flex items-center gap-3 px-4 py-[11px] min-h-[44px] cursor-pointer"
                    style={i < items.length - 1 ? { borderBottom: '0.5px solid rgba(60,60,67,0.12)' } : {}}
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors duration-150"
                      style={isDone ? { background: '#1f7a4d', borderColor: '#1f7a4d' } : { borderColor: 'rgba(60,60,67,0.3)' }}
                    >
                      {isDone && <svg width="12" height="10" viewBox="0 0 12 10" fill="none"><path d="M1 5l3 3 7-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                    </div>
                    {item.hoeveelheid && <span className="w-[60px] flex-shrink-0 text-[14px] text-ink2">{item.hoeveelheid}</span>}
                    <span className="flex-1 text-[17px] text-ink" style={isDone ? { textDecoration: 'line-through', opacity: 0.45 } : {}}>
                      {item.naam}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );

  // ── Desktop checklist (cleaner, no iOS margins) ───────────
  const DesktopList = () => (
    <div className="space-y-3">
      {categories.map(cat => {
        const items = cat.items ?? cat.boodschappen ?? [];
        return (
          <div key={cat.naam}>
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink2 mb-2 px-1">{cat.naam}</p>
            <div className="bg-surface rounded-[10px] overflow-hidden" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
              {items.map((item, i) => {
                const itemId = item.id ?? `${cat.naam}-${item.naam}`;
                const isDone = checked.has(itemId);
                return (
                  <div
                    key={itemId}
                    onClick={() => toggle(itemId)}
                    className="flex items-center gap-3 px-4 py-[10px] min-h-[42px] cursor-pointer hover:bg-black/[0.02] transition-colors"
                    style={i < items.length - 1 ? { borderBottom: '0.5px solid rgba(60,60,67,0.08)' } : {}}
                  >
                    <div
                      className="w-[22px] h-[22px] rounded-full flex-shrink-0 flex items-center justify-center transition-colors"
                      style={isDone
                        ? { background: '#1f7a4d' }
                        : { border: '1.5px solid rgba(60,60,67,0.3)' }
                      }
                    >
                      {isDone && <svg width="11" height="9" viewBox="0 0 11 9" fill="none"><path d="M1 4.5l3 3 6-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                    </div>
                    {item.hoeveelheid && (
                      <span className="w-[64px] flex-shrink-0 text-[13px] text-ink2 tabular-nums">{item.hoeveelheid}</span>
                    )}
                    <span
                      className="flex-1 text-[14px] text-ink"
                      style={isDone ? { textDecoration: 'line-through', color: 'rgba(60,60,67,0.4)' } : {}}
                    >
                      {item.naam}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      {/* ── Mobile ── */}
      <div className="lg:hidden min-h-screen bg-bg pb-[100px]">
        <IOSStatusBar />
        <IOSLargeHeader title="Boodschappen" />

        {/* Week picker */}
        <div className="px-4 mb-3 flex items-center gap-2">
          <span className="text-[13px] text-ink2 flex-shrink-0">Week</span>
          <div className="flex gap-[6px] overflow-x-auto pb-px">
            {Array.from({ length: 8 }, (_, i) => i + 1).map(w => (
              <button
                key={w}
                onClick={() => selectWeek(w)}
                className="w-8 h-8 rounded-[7px] text-[13px] font-semibold flex-shrink-0"
                style={week === w
                  ? { background: '#1f7a4d', color: '#fff' }
                  : { background: 'rgba(120,120,128,0.16)', color: 'rgba(60,60,67,0.6)' }
                }
              >
                {w}
              </button>
            ))}
          </div>
        </div>

        <p className="px-4 mb-3 text-[13px] text-ink2">
          {totalItems} items · {checkedCount} afgevinkt
        </p>

        {!week ? (
          <div className="mx-4 animate-pulse bg-surface rounded-[10px] h-40" />
        ) : loading ? (
          <div className="mx-4 animate-pulse bg-surface rounded-[10px] h-40" />
        ) : categories.length === 0 ? (
          <div className="mx-4 bg-surface rounded-[10px] p-6 text-center">
            <p className="text-[17px] text-ink2">Geen boodschappen voor week {week}</p>
          </div>
        ) : (
          <MobileList />
        )}

        <IOSTabBar />
      </div>

      {/* ── Desktop ── */}
      <div className="hidden lg:block">
        <DesktopShell
          title="Boodschappen"
          subtitle={week ? `Week ${week} · ${checkedCount} van ${totalItems} afgevinkt` : undefined}
          accessory={
            <div className="flex items-center gap-1">
              {Array.from({ length: 8 }, (_, i) => i + 1).map(w => (
                <button
                  key={w}
                  onClick={() => selectWeek(w)}
                  className="w-7 h-7 rounded-[6px] text-[12px] font-semibold"
                  style={week === w
                    ? { background: '#1f7a4d', color: '#fff' }
                    : { background: 'rgba(120,120,128,0.16)', color: 'rgba(60,60,67,0.6)' }
                  }
                >
                  {w}
                </button>
              ))}
            </div>
          }
        >
          <div className="p-6">
            {!week || loading ? (
              <div className="animate-pulse bg-surface rounded-[12px] h-64" />
            ) : categories.length === 0 ? (
              <div className="bg-surface rounded-[12px] p-10 text-center max-w-lg">
                <p className="text-[17px] font-semibold text-ink mb-2">Geen boodschappenlijst</p>
                <p className="text-[14px] text-ink2">Er is nog geen lijst gegenereerd voor week {week}.</p>
              </div>
            ) : (
              <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 280px' }}>
                {/* Left: lijst */}
                <DesktopList />

                {/* Right: voortgang */}
                <div className="space-y-4">
                  <div className="bg-surface rounded-[12px] p-4" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-ink2 mb-3">Voortgang</p>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-[28px] font-bold text-ink">{checkedCount}</span>
                      <span className="text-[14px] text-ink2">/ {totalItems} items</span>
                    </div>
                    <div className="h-[6px] rounded-full overflow-hidden" style={{ background: 'rgba(120,120,128,0.16)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${progress * 100}%`, background: '#1f7a4d' }}
                      />
                    </div>
                    <p className="text-[13px] text-ink2 mt-2">{Math.round(progress * 100)}% afgevinkt</p>
                  </div>

                  <div className="bg-surface rounded-[12px] p-4" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-ink2 mb-3">Categorieën</p>
                    {categories.map(cat => {
                      const items = cat.items ?? cat.boodschappen ?? [];
                      const catChecked = items.filter(item => checked.has(item.id ?? `${cat.naam}-${item.naam}`)).length;
                      return (
                        <div key={cat.naam} className="flex items-center justify-between py-[7px]" style={{ borderBottom: '0.5px solid rgba(60,60,67,0.08)' }}>
                          <span className="text-[13px] text-ink">{cat.naam}</span>
                          <span className="text-[12px] text-ink2">{catChecked}/{items.length}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </DesktopShell>
      </div>
    </>
  );
}
