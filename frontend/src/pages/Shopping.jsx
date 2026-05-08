import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Check } from "lucide-react";
import { getShoppingList, toggleShoppingItem, getCurrentWeek } from "../api/client";
import { getStoredWeek } from "../lib/weekStorage";

const CAT_ORDER = ["Vlees & vis", "Groente & fruit", "Zuivel & ei", "Granen & koolhydraten",
                   "Conserven", "Aardappelen", "Fruit & noten", "Kruiden & sauzen", "Overig"];

export default function Shopping() {
  const { week: weekParam } = useParams();
  const navigate = useNavigate();
  const [week, setWeek] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(new Set());

  useEffect(() => {
    if (weekParam) setWeek(parseInt(weekParam));
    else {
      const stored = getStoredWeek();
      if (stored) setWeek(stored);
      else getCurrentWeek().then(setWeek);
    }
  }, [weekParam]);

  useEffect(() => {
    if (!week) return;
    setLoading(true);
    getShoppingList(week)
      .then((data) => setItems(data.items ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [week]);

  const handleToggle = async (itemId) => {
    if (toggling.has(itemId)) return;
    setToggling((s) => new Set(s).add(itemId));
    // Optimistic update
    setItems((prev) => prev.map((it) => it.id === itemId ? { ...it, checked: !it.checked } : it));
    try {
      const updated = await toggleShoppingItem(week, itemId);
      setItems((prev) => prev.map((it) => it.id === updated.id ? updated : it));
    } catch {
      // Revert on error
      setItems((prev) => prev.map((it) => it.id === itemId ? { ...it, checked: !it.checked } : it));
    } finally {
      setToggling((s) => { const n = new Set(s); n.delete(itemId); return n; });
    }
  };

  const checkedCount = items.filter((it) => it.checked).length;
  const totalCount = items.length;
  const pct = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  const groups = items.reduce((acc, item) => {
    const cat = item.categorie ?? "Overig";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});
  const sortedGroups = Object.entries(groups).sort(
    ([a], [b]) => (CAT_ORDER.indexOf(a) === -1 ? 99 : CAT_ORDER.indexOf(a)) -
                  (CAT_ORDER.indexOf(b) === -1 ? 99 : CAT_ORDER.indexOf(b))
  );

  return (
    <div className="bg-bg min-h-screen pb-[100px]">
      <div className="h-[54px]" />

      {/* Header */}
      <div className="px-5 pt-[14px] pb-1 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-[38px] h-[38px] rounded-full border border-line bg-surface grid place-items-center text-ink2 flex-shrink-0"
        >
          <ChevronLeft size={18} strokeWidth={1.6} />
        </button>
        <div className="flex-1">
          <p className="eyebrow">Week {week ?? "…"} · {totalCount} items</p>
          <h1 className="text-[22px] font-semibold mt-[2px]" style={{ letterSpacing: '-0.5px' }}>Boodschappen</h1>
        </div>
      </div>

      {/* Week selector */}
      <div className="px-5 pt-3 flex gap-[6px]">
        {[1,2,3,4,5,6,7,8].map((w) => (
          <button
            key={w}
            onClick={() => setWeek(w)}
            className="flex-1 h-8 rounded-[8px] text-[11px] font-semibold transition-colors"
            style={{
              background: week === w ? '#1f3a2c' : '#ffffff',
              color: week === w ? '#fff' : '#5d655c',
              border: week === w ? 'none' : '1px solid #e7e4dc',
            }}
          >{w}</button>
        ))}
      </div>

      {/* Progress */}
      <div className="px-5 pt-4">
        <div className="flex justify-between text-[11px] text-ink2 mb-[6px]">
          <span>{checkedCount} van {totalCount} afgevinkt</span>
          <span>{pct}%</span>
        </div>
        <div className="h-1 rounded-sm overflow-hidden" style={{ background: '#efece4' }}>
          <div className="h-full rounded-sm transition-all duration-300" style={{ width: `${pct}%`, background: '#1f3a2c' }} />
        </div>
      </div>

      {loading && (
        <div className="px-5 mt-5 space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-[100px] bg-surface rounded-[14px] border border-line animate-pulse" />)}
        </div>
      )}

      {!loading && totalCount === 0 && (
        <p className="text-center text-ink3 text-[13px] py-12">Geen boodschappen voor week {week}</p>
      )}

      {!loading && sortedGroups.map(([cat, catItems]) => (
        <div key={cat} className="px-5 mt-5">
          <p className="eyebrow mb-2">{cat}</p>
          <div className="bg-surface border border-line rounded-[14px] overflow-hidden">
            {catItems.map((item, idx) => {
              const isVoorraad = item.hoeveelheid?.startsWith("uit voorraad");
              return (
                <button
                  key={item.id}
                  onClick={() => handleToggle(item.id)}
                  disabled={toggling.has(item.id)}
                  className="w-full flex items-center gap-3 px-[14px] py-3 text-left transition-opacity"
                  style={{
                    borderBottom: idx < catItems.length - 1 ? '1px solid #efece4' : 'none',
                    opacity: item.checked || isVoorraad ? 0.4 : 1,
                  }}
                >
                  <div
                    className="w-5 h-5 rounded-[6px] flex-shrink-0 grid place-items-center transition-colors"
                    style={{
                      border: item.checked ? 'none' : '1.5px solid #e7e4dc',
                      background: item.checked ? '#1f3a2c' : 'transparent',
                    }}
                  >
                    {item.checked && <Check size={12} strokeWidth={2.5} className="text-white" />}
                  </div>
                  <span
                    className="flex-1 text-[14px]"
                    style={{ textDecoration: item.checked ? 'line-through' : 'none' }}
                  >
                    {item.product}
                  </span>
                  <span className="text-[12px] text-ink3 flex-shrink-0 text-right max-w-[110px]">
                    {isVoorraad ? "voorraad" : item.hoeveelheid}
                  </span>
                  {item.prijs_indicatie && !isVoorraad && (
                    <span className="text-[11px] text-ink3 flex-shrink-0">
                      €{item.prijs_indicatie.toFixed(2).replace('.', ',')}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
