import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCurrentWeek, getShoppingList } from "../api/client";
import { getStoredWeek } from "../lib/weekStorage";
import { IOSStatusBar, IOSLargeHeader, IOSGroupHeader, IOSTabBar } from "../components/IOSPrimitives";
import DesktopShell from "../components/DesktopShell";

function useShoppingData(week) {
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!week) return;
    setLoading(true);
    getShoppingList(week).then(setList).finally(() => setLoading(false));
  }, [week]);

  return { list, loading };
}

export default function Shopping() {
  const { week: paramWeek } = useParams();
  const navigate = useNavigate();
  const [week, setWeek] = useState(null);

  useEffect(() => {
    if (paramWeek) {
      setWeek(Number(paramWeek));
    } else {
      const stored = getStoredWeek();
      if (stored) setWeek(stored);
      else getCurrentWeek().then(setWeek);
    }
  }, [paramWeek]);

  const { list, loading } = useShoppingData(week);

  const storageKey = `shopping-checked-${week}`;
  const [checked, setChecked] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem(`shopping-checked-${paramWeek || 'current'}`) ?? "[]")); }
    catch { return new Set(); }
  });

  useEffect(() => {
    if (!week) return;
    try {
      const saved = JSON.parse(localStorage.getItem(`shopping-checked-${week}`) ?? "[]");
      setChecked(new Set(saved));
    } catch {
      setChecked(new Set());
    }
  }, [week]);

  useEffect(() => {
    if (!week) return;
    localStorage.setItem(`shopping-checked-${week}`, JSON.stringify([...checked]));
  }, [checked, week]);

  function toggle(id) {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const categories = list?.categories ?? list?.boodschappen_per_categorie ?? [];
  const allItems = categories.flatMap(cat =>
    (cat.items ?? cat.boodschappen ?? []).map(item => item.id ?? `${cat.naam}-${item.naam}`)
  );
  const totalItems = allItems.length;
  const checkedCount = allItems.filter(id => checked.has(id)).length;
  const progress = totalItems > 0 ? checkedCount / totalItems : 0;

  const ShoppingContent = () => (
    <>
      {/* Progress */}
      <div className="px-4 mb-4">
        <div className="flex justify-between text-[13px] text-ink2 mb-2">
          <span>{checkedCount} van {totalItems}</span>
          <span>{Math.round(progress * 100)}%</span>
        </div>
        <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(120,120,128,0.16)' }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${progress * 100}%`, background: '#1f7a4d' }}
          />
        </div>
      </div>

      {/* Categories */}
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
                    className={`flex items-center gap-3 px-4 py-[11px] min-h-[44px] cursor-pointer active:bg-gray-50 ${i < items.length - 1 ? 'border-b' : ''}`}
                    style={i < items.length - 1 ? { borderBottom: '0.5px solid rgba(60,60,67,0.12)' } : {}}
                  >
                    {/* Checkbox */}
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors duration-150"
                      style={isDone
                        ? { background: '#1f7a4d', borderColor: '#1f7a4d' }
                        : { borderColor: 'rgba(60,60,67,0.3)' }
                      }
                    >
                      {isDone && (
                        <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                          <path d="M1 5l3 3 7-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>

                    {/* Quantity */}
                    {item.hoeveelheid && (
                      <span className="w-[60px] flex-shrink-0 text-[14px] text-ink2">{item.hoeveelheid}</span>
                    )}

                    {/* Name */}
                    <span
                      className="flex-1 text-[17px] text-ink transition-opacity duration-150"
                      style={isDone ? { textDecoration: 'line-through', opacity: 0.45 } : {}}
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
    </>
  );

  return (
    <>
      {/* ── Mobile ── */}
      <div className="lg:hidden min-h-screen bg-bg pb-[100px]">
        <IOSStatusBar />
        <IOSLargeHeader
          title="Boodschappen"
          onBack={() => navigate(-1)}
          accessory={
            <button className="text-brand text-[17px]">Deel</button>
          }
        />
        <p className="px-4 mb-3 text-[15px] text-ink2">Week {week} · {totalItems} items</p>

        {loading ? (
          <div className="mx-4 animate-pulse bg-surface rounded-[10px] h-40" />
        ) : (
          <ShoppingContent />
        )}

        <IOSTabBar />
      </div>

      {/* ── Desktop ── */}
      <div className="hidden lg:block">
        <DesktopShell
          title="Boodschappen"
          subtitle={`Week ${week} · ${checkedCount} van ${totalItems} afgevinkt`}
        >
          {loading ? (
            <div className="animate-pulse bg-surface rounded-[12px] h-64" />
          ) : (
            <div className="max-w-2xl">
              <ShoppingContent />
            </div>
          )}
        </DesktopShell>
      </div>
    </>
  );
}
