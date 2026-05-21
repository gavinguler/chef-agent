import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getCurrentWeek, getShoppingList, toggleShoppingItem, enrichShoppingPrices,
  getProductMappings, upsertProductMapping, deleteProductMapping, searchBonnetjesProducts,
} from "../api/client";
import { getStoredWeek } from "../lib/weekStorage";
import { IOSStatusBar, IOSLargeHeader, IOSGroupHeader, IOSTabBar } from "../components/IOSPrimitives";
import DesktopShell from "../components/DesktopShell";

function parseShoppingData(data) {
  const grouped = {};
  for (const item of data.items ?? []) {
    const cat = item.categorie ?? "overig";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push({ ...item, naam: item.product });
  }
  return { week: data.week, categories: Object.entries(grouped).map(([naam, items]) => ({ naam, items })) };
}

function useShoppingData(week) {
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!week) return;
    setLoading(true);
    getShoppingList(week)
      .then(data => setList(parseShoppingData(data)))
      .catch(() => setList(null))
      .finally(() => setLoading(false));
  }, [week]);

  return { list, setList, loading };
}

function LinkSheet({ item, mappings, onSave, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);
  const current = mappings[item.naam];

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!query.trim()) { setResults([]); return; }
      setSearching(true);
      try {
        const data = await searchBonnetjesProducts(query.trim());
        setResults(data.items ?? []);
      } catch { setResults([]); }
      finally { setSearching(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  async function handleSelect(product) {
    setSaving(true);
    try {
      await upsertProductMapping(item.naam, product.id, product.name);
      onSave();
    } finally { setSaving(false); }
  }

  async function handleRemove() {
    setSaving(true);
    try {
      await deleteProductMapping(item.naam);
      onSave();
    } finally { setSaving(false); }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end lg:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.35)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full lg:max-w-md bg-bg rounded-t-[20px] lg:rounded-[16px] p-5 pb-8 lg:pb-5"
        style={{ boxShadow: '0 -4px 24px rgba(0,0,0,0.12)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[16px] font-semibold text-ink">Koppel product</p>
            <p className="text-[13px] text-ink2 mt-0.5">{item.naam}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(120,120,128,0.16)' }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
        </div>

        {/* Current mapping */}
        {current && (
          <div className="mb-3 flex items-center justify-between px-3 py-2.5 rounded-[10px]" style={{ background: 'rgba(31,122,77,0.1)', border: '1px solid rgba(31,122,77,0.2)' }}>
            <div>
              <p className="text-[13px] font-medium" style={{ color: '#1f7a4d' }}>Gekoppeld: {current.bonnetjes_product_name}</p>
            </div>
            <button onClick={handleRemove} disabled={saving} className="text-[12px] font-medium px-2 py-1 rounded-[6px]" style={{ color: '#c0392b', background: 'rgba(192,57,43,0.08)' }}>
              Verwijder
            </button>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-3">
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Zoek product in Bonnetjes…"
            className="w-full px-3 py-2.5 rounded-[10px] text-[15px] text-ink outline-none"
            style={{ background: 'rgba(120,120,128,0.12)', border: '1px solid transparent' }}
          />
          {searching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: '#1f7a4d', borderTopColor: 'transparent' }} />
          )}
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="rounded-[10px] overflow-hidden" style={{ border: '0.5px solid rgba(60,60,67,0.12)' }}>
            {results.map((p, i) => (
              <button
                key={p.id}
                onClick={() => handleSelect(p)}
                disabled={saving}
                className="w-full flex items-center justify-between px-3 py-[10px] text-left hover:bg-black/[0.03] transition-colors"
                style={i < results.length - 1 ? { borderBottom: '0.5px solid rgba(60,60,67,0.1)' } : {}}
              >
                <span className="text-[14px] text-ink">{p.name}</span>
                {p.latest_price != null && (
                  <span className="text-[13px] text-ink2 ml-3 flex-shrink-0">€{p.latest_price.toFixed(2)}</span>
                )}
              </button>
            ))}
          </div>
        )}
        {query.trim() && !searching && results.length === 0 && (
          <p className="text-[13px] text-ink2 text-center py-3">Geen producten gevonden</p>
        )}
      </div>
    </div>
  );
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

  const { list, setList, loading } = useShoppingData(week);

  const [checked, setChecked] = useState(new Set());
  const [enriching, setEnriching] = useState(false);
  const [mappings, setMappings] = useState({});
  const [linkItem, setLinkItem] = useState(null);

  useEffect(() => {
    getProductMappings()
      .then(data => {
        const map = {};
        for (const m of data) map[m.ingredient_name] = m;
        setMappings(map);
      })
      .catch(() => {});
  }, []);

  // Sync checked state from API response
  useEffect(() => {
    if (!list) return;
    const apiChecked = new Set(
      list.categories.flatMap(cat => cat.items.filter(item => item.checked).map(item => item.id))
    );
    setChecked(apiChecked);
  }, [list]);

  async function handleMappingSaved() {
    const data = await getProductMappings().catch(() => []);
    const map = {};
    for (const m of data) map[m.ingredient_name] = m;
    setMappings(map);
    setLinkItem(null);
  }

  async function handleEnrichPrices() {
    if (!week || enriching) return;
    setEnriching(true);
    try {
      await enrichShoppingPrices(week);
      const data = await getShoppingList(week);
      setList(parseShoppingData(data));
    } catch {
      // silently ignore
    } finally {
      setEnriching(false);
    }
  }

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

  const allFlatItems = categories.flatMap(cat => cat.items ?? cat.boodschappen ?? []);
  const priceItems = allFlatItems.filter(item => item.prijs_indicatie != null);
  const totalPrice = priceItems.reduce((sum, item) => sum + item.prijs_indicatie, 0);
  const hasPrices = priceItems.length > 0;

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
                    className="flex items-center gap-3 px-4 py-[11px] min-h-[44px]"
                    style={i < items.length - 1 ? { borderBottom: '0.5px solid rgba(60,60,67,0.12)' } : {}}
                  >
                    <div
                      onClick={() => toggle(itemId)}
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors duration-150 cursor-pointer"
                      style={isDone ? { background: '#1f7a4d', borderColor: '#1f7a4d' } : { borderColor: 'rgba(60,60,67,0.3)' }}
                    >
                      {isDone && <svg width="12" height="10" viewBox="0 0 12 10" fill="none"><path d="M1 5l3 3 7-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                    </div>
                    {item.hoeveelheid && <span className="w-[60px] flex-shrink-0 text-[14px] text-ink2" onClick={() => toggle(itemId)}>{item.hoeveelheid}</span>}
                    <span className="flex-1 text-[17px] text-ink cursor-pointer" onClick={() => toggle(itemId)} style={isDone ? { textDecoration: 'line-through', opacity: 0.45 } : {}}>
                      {item.naam}
                    </span>
                    {item.prijs_indicatie != null && (
                      <span className="text-[13px] text-ink2 ml-2 flex-shrink-0" style={isDone ? { opacity: 0.45 } : {}}>
                        €{item.prijs_indicatie.toFixed(2)}
                      </span>
                    )}
                    <button
                      onClick={() => setLinkItem(item)}
                      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ml-1"
                      style={mappings[item.naam] ? { background: 'rgba(31,122,77,0.15)', color: '#1f7a4d' } : { background: 'rgba(120,120,128,0.1)', color: 'rgba(60,60,67,0.4)' }}
                    >
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M5 8l-3 3a2 2 0 002.83 2.83L8 10M8 5l3-3a2 2 0 00-2.83-2.83L5 3M4.5 8.5l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                    </button>
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
                    className="flex items-center gap-3 px-4 py-[10px] min-h-[42px] hover:bg-black/[0.02] transition-colors group"
                    style={i < items.length - 1 ? { borderBottom: '0.5px solid rgba(60,60,67,0.08)' } : {}}
                  >
                    <div
                      onClick={() => toggle(itemId)}
                      className="w-[22px] h-[22px] rounded-full flex-shrink-0 flex items-center justify-center transition-colors cursor-pointer"
                      style={isDone ? { background: '#1f7a4d' } : { border: '1.5px solid rgba(60,60,67,0.3)' }}
                    >
                      {isDone && <svg width="11" height="9" viewBox="0 0 11 9" fill="none"><path d="M1 4.5l3 3 6-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                    </div>
                    {item.hoeveelheid && (
                      <span onClick={() => toggle(itemId)} className="w-[64px] flex-shrink-0 text-[13px] text-ink2 tabular-nums cursor-pointer">{item.hoeveelheid}</span>
                    )}
                    <span
                      onClick={() => toggle(itemId)}
                      className="flex-1 text-[14px] text-ink cursor-pointer"
                      style={isDone ? { textDecoration: 'line-through', color: 'rgba(60,60,67,0.4)' } : {}}
                    >
                      {item.naam}
                    </span>
                    {item.prijs_indicatie != null && (
                      <span className="text-[13px] tabular-nums ml-3 flex-shrink-0" style={{ color: isDone ? 'rgba(60,60,67,0.4)' : 'rgba(60,60,67,0.6)' }}>
                        €{item.prijs_indicatie.toFixed(2)}
                      </span>
                    )}
                    <button
                      onClick={() => setLinkItem(item)}
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={mappings[item.naam] ? { background: 'rgba(31,122,77,0.15)', color: '#1f7a4d', opacity: 1 } : { background: 'rgba(120,120,128,0.1)', color: 'rgba(60,60,67,0.4)' }}
                    >
                      <svg width="11" height="11" viewBox="0 0 13 13" fill="none"><path d="M5 8l-3 3a2 2 0 002.83 2.83L8 10M8 5l3-3a2 2 0 00-2.83-2.83L5 3M4.5 8.5l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                    </button>
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

        <div className="px-4 mb-3 flex items-center justify-between">
          <span className="text-[13px] text-ink2">{totalItems} items · {checkedCount} afgevinkt{hasPrices ? ` · ±€${totalPrice.toFixed(2)}` : ""}</span>
          {list && (
            <button
              onClick={handleEnrichPrices}
              disabled={enriching}
              className="text-[13px] font-medium px-3 py-1 rounded-[8px]"
              style={{ background: 'rgba(31,122,77,0.12)', color: enriching ? 'rgba(31,122,77,0.5)' : '#1f7a4d' }}
            >
              {enriching ? "Ophalen…" : "Prijzen ophalen"}
            </button>
          )}
        </div>

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
          subtitle={week ? `Week ${week} · ${checkedCount} van ${totalItems} afgevinkt${hasPrices ? ` · ±€${totalPrice.toFixed(2)}` : ""}` : undefined}
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

                  <div className="bg-surface rounded-[12px] p-4" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-ink2 mb-3">Prijzen</p>
                    {hasPrices ? (
                      <div className="flex items-baseline gap-1 mb-3">
                        <span className="text-[24px] font-bold text-ink">€{totalPrice.toFixed(2)}</span>
                        <span className="text-[13px] text-ink2">indicatie</span>
                      </div>
                    ) : (
                      <p className="text-[13px] text-ink2 mb-3">Nog geen prijzen opgehaald</p>
                    )}
                    <button
                      onClick={handleEnrichPrices}
                      disabled={enriching}
                      className="w-full py-[8px] rounded-[8px] text-[13px] font-semibold transition-opacity"
                      style={{ background: enriching ? 'rgba(31,122,77,0.5)' : '#1f7a4d', color: '#fff', opacity: enriching ? 0.7 : 1 }}
                    >
                      {enriching ? "Ophalen…" : "Prijzen ophalen"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DesktopShell>
      </div>

      {linkItem && (
        <LinkSheet
          item={linkItem}
          mappings={mappings}
          onSave={handleMappingSaved}
          onClose={() => setLinkItem(null)}
        />
      )}
    </>
  );
}
