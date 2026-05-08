import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Check } from "lucide-react";
import { getShoppingList } from "../api/client";

export default function Shopping() {
  const { week } = useParams();
  const navigate = useNavigate();
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checked, setChecked] = useState({});

  useEffect(() => {
    getShoppingList(week)
      .then(setList)
      .catch(() => setList(null))
      .finally(() => setLoading(false));
  }, [week]);

  const allItems = list?.items ?? [];
  const checkedCount = Object.values(checked).filter(Boolean).length;
  const totalCount = allItems.length;
  const pct = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  const toggleItem = (key) => setChecked((c) => ({ ...c, [key]: !c[key] }));

  const groups = allItems.reduce((acc, item) => {
    const cat = item.categorie ?? "Overig";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

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
          <p className="eyebrow">Week {week} · {totalCount} items</p>
          <h1 className="text-[22px] font-semibold mt-[2px]" style={{ letterSpacing: '-0.5px' }}>Boodschappen</h1>
        </div>
        <span className="text-[11px] font-medium px-2 py-[3px] rounded-[6px]" style={{ background: '#e9efe6', color: '#1f3a2c' }}>
          {list?.geschatte_prijs ? `~ €${list.geschatte_prijs}` : `Week ${week}`}
        </span>
      </div>

      {/* Progress */}
      <div className="px-5 pt-[14px]">
        <div className="flex justify-between text-[11px] text-ink2 mb-[6px]">
          <span>{checkedCount} van {totalCount}</span>
          <span>{pct}%</span>
        </div>
        <div className="h-1 rounded-sm overflow-hidden" style={{ background: '#efece4' }}>
          <div className="h-full rounded-sm transition-all" style={{ width: `${pct}%`, background: '#1f3a2c' }} />
        </div>
      </div>

      {loading && (
        <div className="px-5 mt-5 space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-[120px] bg-surface rounded-[14px] border border-line animate-pulse" />)}
        </div>
      )}

      {!loading && totalCount === 0 && (
        <p className="text-center text-ink3 text-[13px] py-12">Geen boodschappen voor week {week}</p>
      )}

      {!loading && Object.entries(groups).map(([cat, items]) => (
        <div key={cat} className="px-5 mt-5">
          <p className="eyebrow mb-2">{cat}</p>
          <div className="bg-surface border border-line rounded-[14px] overflow-hidden">
            {items.map((item, idx) => {
              const key = `${cat}-${idx}`;
              const done = checked[key] ?? false;
              return (
                <button
                  key={key}
                  onClick={() => toggleItem(key)}
                  className="w-full flex items-center gap-3 px-[14px] py-3 text-left transition-opacity"
                  style={{
                    borderBottom: idx < items.length - 1 ? '1px solid #efece4' : 'none',
                    opacity: done ? 0.45 : 1,
                  }}
                >
                  <div
                    className="w-5 h-5 rounded-[6px] flex-shrink-0 grid place-items-center"
                    style={{
                      border: done ? 'none' : '1.5px solid #e7e4dc',
                      background: done ? '#1f3a2c' : 'transparent',
                    }}
                  >
                    {done && <Check size={12} strokeWidth={2.5} className="text-white" />}
                  </div>
                  <span className="w-14 text-[12px] text-ink3 flex-shrink-0">{item.hoeveelheid ?? ""}</span>
                  <span className="flex-1 text-[14px]" style={{ textDecoration: done ? 'line-through' : 'none' }}>
                    {item.naam ?? item.ingredient}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
