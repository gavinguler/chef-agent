import { useEffect, useRef, useState } from "react";
import { getRecipes } from "../api/client";

export default function RecipePicker({ open, onClose, onSelect, categoryFilter, allowClear }) {
  const [search, setSearch] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setSearch("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await getRecipes(search);
        setRecipes(data);
      } catch { setRecipes([]); }
      finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [search, open]);

  if (!open) return null;

  // Matching category sorted first
  const sorted = [...recipes].sort((a, b) => {
    const aMatch = categoryFilter && a.categorie?.toLowerCase() === categoryFilter.toLowerCase();
    const bMatch = categoryFilter && b.categorie?.toLowerCase() === categoryFilter.toLowerCase();
    return (bMatch ? 1 : 0) - (aMatch ? 1 : 0);
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-end lg:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-[20px] lg:rounded-[16px] bg-bg flex flex-col"
        style={{ maxHeight: '80vh', boxShadow: '0 -4px 24px rgba(0,0,0,0.12)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
          <p className="text-[17px] font-semibold text-ink">Kies recept</p>
          <button onClick={onClose} className="text-[13px] text-brand font-medium">Sluiten</button>
        </div>

        {/* Search */}
        <div className="px-4 pb-3 flex-shrink-0">
          <input
            ref={inputRef}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Zoek recept…"
            className="w-full px-3 py-2.5 rounded-[10px] text-[15px] text-ink outline-none"
            style={{ background: 'rgba(120,120,128,0.12)' }}
          />
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 pb-6">
          {allowClear && (
            <button
              onClick={() => onSelect(null)}
              className="w-full flex items-center px-5 py-[11px] text-left"
              style={{ borderBottom: '0.5px solid rgba(60,60,67,0.1)' }}
            >
              <span className="text-[15px] font-medium" style={{ color: '#ff3b30' }}>
                Verwijder recept uit slot
              </span>
            </button>
          )}

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
            </div>
          ) : sorted.length === 0 ? (
            <p className="text-center text-[14px] text-ink2 py-8">Geen recepten gevonden</p>
          ) : sorted.map((r, i) => {
            const isHighlighted = categoryFilter &&
              r.categorie?.toLowerCase() === categoryFilter.toLowerCase();
            return (
              <button
                key={r.id}
                onClick={() => onSelect(r)}
                className="w-full flex items-center gap-3 px-5 py-[11px] text-left"
                style={i < sorted.length - 1 ? { borderBottom: '0.5px solid rgba(60,60,67,0.08)' } : {}}
              >
                <div
                  className="w-10 h-10 rounded-[8px] flex-shrink-0 overflow-hidden flex items-center justify-center"
                  style={{ background: 'rgba(120,120,128,0.1)' }}
                >
                  {r.image_url
                    ? <img src={r.image_url} alt="" className="w-full h-full object-cover" />
                    : <span className="text-[16px]">🍽️</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] text-ink font-medium truncate">{r.naam}</p>
                  <p className="text-[12px] text-ink2">{r.categorie}</p>
                </div>
                {isHighlighted && (
                  <span
                    className="text-[10px] font-semibold px-[6px] py-[2px] rounded-full flex-shrink-0"
                    style={{ background: 'rgba(31,122,77,0.12)', color: '#1f7a4d' }}
                  >
                    Aangeraden
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
