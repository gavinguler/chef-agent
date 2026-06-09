import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Sparkles, Image, Pencil, BookOpen, ListPlus, Link, ShoppingBag, Trash2 } from "lucide-react";
import {
  getRecipe, aiFillMacros, refreshRecipeImage, fillRecipeInstructions, fillRecipeIngredients,
  getProductMappings, upsertProductMapping, deleteProductMapping, searchBonnetjesProducts,
  resolveIngredientPrices, getStockStatus, deductStock, deleteRecipe,
} from "../api/client";
import {
  IOSStatusBar, IOSLargeHeader, IOSGroupHeader, IOSGroup, IOSRow, IOSTabBar,
} from "../components/IOSPrimitives";
import DesktopShell, { Panel, Stat } from "../components/DesktopShell";

function IngredientLinkSheet({ ingredientLine, mappings, onSave, onClose }) {
  const [query, setQuery] = useState(ingredientLine);
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);
  const current = mappings[ingredientLine];

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
      await upsertProductMapping(ingredientLine, product.id, product.name);
      onSave();
    } finally { setSaving(false); }
  }

  async function handleRemove() {
    setSaving(true);
    try {
      await deleteProductMapping(ingredientLine);
      onSave();
    } finally { setSaving(false); }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end lg:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.35)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full lg:max-w-md bg-bg rounded-t-[20px] lg:rounded-[16px] p-5 pb-8 lg:pb-5" style={{ boxShadow: '0 -4px 24px rgba(0,0,0,0.12)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[16px] font-semibold text-ink">Koppel ingrediënt</p>
            <p className="text-[13px] text-ink2 mt-0.5">{ingredientLine}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(120,120,128,0.16)' }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
        </div>
        {current && (
          <div className="mb-3 flex items-center justify-between px-3 py-2.5 rounded-[10px]" style={{ background: 'rgba(31,122,77,0.1)', border: '1px solid rgba(31,122,77,0.2)' }}>
            <p className="text-[13px] font-medium" style={{ color: '#1f7a4d' }}>Gekoppeld: {current.bonnetjes_product_name}</p>
            <button onClick={handleRemove} disabled={saving} className="text-[12px] font-medium px-2 py-1 rounded-[6px]" style={{ color: '#c0392b', background: 'rgba(192,57,43,0.08)' }}>Verwijder</button>
          </div>
        )}
        <div className="relative mb-3">
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Zoek product in Bonnetjes…"
            className="w-full px-3 py-2.5 rounded-[10px] text-[15px] text-ink outline-none"
            style={{ background: 'rgba(120,120,128,0.12)' }}
          />
          {searching && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: '#1f7a4d', borderTopColor: 'transparent' }} />}
        </div>
        {results.length > 0 && (
          <div className="rounded-[10px] overflow-hidden" style={{ border: '0.5px solid rgba(60,60,67,0.12)' }}>
            {results.map((p, i) => (
              <button key={p.id} onClick={() => handleSelect(p)} disabled={saving}
                className="w-full flex items-center justify-between px-3 py-[10px] text-left hover:bg-black/[0.03] transition-colors"
                style={i < results.length - 1 ? { borderBottom: '0.5px solid rgba(60,60,67,0.1)' } : {}}
              >
                <span className="text-[14px] text-ink">{p.name}</span>
                {p.latest_price != null && <span className="text-[13px] text-ink2 ml-3 flex-shrink-0">€{p.latest_price.toFixed(2)}</span>}
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

function findPriceForIngredient(line, mappings) {
  const lower = line.toLowerCase();
  for (const [key, mapping] of Object.entries(mappings)) {
    if (lower === key.toLowerCase()) return mapping;
    if (lower.includes(key.toLowerCase())) return mapping;
  }
  return null;
}

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [instructionsLoading, setInstructionsLoading] = useState(false);
  const [ingredientsLoading, setIngredientsLoading] = useState(false);
  const [mappings, setMappings] = useState({});
  const [ingredientPrices, setIngredientPrices] = useState({});
  const [stockStatus, setStockStatus] = useState({});
  const [deducting, setDeducting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [linkIngredient, setLinkIngredient] = useState(null);

  useEffect(() => {
    getRecipe(id).then(setRecipe).finally(() => setLoading(false));
    getProductMappings().then(data => {
      const map = {};
      for (const m of data) map[m.ingredient_name] = m;
      setMappings(map);
    }).catch(() => {});
  }, [id]);

  // Resolve prices when recipe + mappings are both loaded
  useEffect(() => {
    if (!recipe?.ingredienten) return;
    const lines = recipe.ingredienten.split("\n").filter(Boolean);
    if (!lines.length) return;
    resolveIngredientPrices(lines).then(setIngredientPrices).catch(() => {});
  }, [recipe?.ingredienten, Object.keys(mappings).length]);

  // Fetch stock status from Bonnetjes
  useEffect(() => {
    if (!recipe?.ingredienten) return;
    const lines = recipe.ingredienten.split("\n").map(l => l.trim()).filter(Boolean);
    if (!lines.length) return;
    getStockStatus(lines).then(setStockStatus).catch(() => {});
  }, [recipe?.ingredienten, Object.keys(mappings).length]);

  async function handleRefreshImage() {
    if (!recipe) return;
    setImageLoading(true);
    try {
      const result = await refreshRecipeImage(recipe.id);
      setRecipe(r => ({ ...r, image_url: result.image_url }));
    } finally {
      setImageLoading(false);
    }
  }

  async function handleFillInstructions() {
    if (!recipe) return;
    setInstructionsLoading(true);
    try {
      const result = await fillRecipeInstructions(recipe.id);
      setRecipe(r => ({ ...r, instructies: result.instructies }));
    } finally {
      setInstructionsLoading(false);
    }
  }

  async function handleFillIngredients() {
    if (!recipe) return;
    setIngredientsLoading(true);
    try {
      const result = await fillRecipeIngredients(recipe.id);
      setRecipe(r => ({ ...r, ingredienten: result.ingredienten }));
    } finally {
      setIngredientsLoading(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Recept "${recipe.naam}" definitief verwijderen?`)) return;
    setDeleting(true);
    try {
      await deleteRecipe(recipe.id);
      navigate('/recepten');
    } finally {
      setDeleting(false);
    }
  }

  async function handleDeductStock() {
    if (!recipe?.ingredienten) return;
    setDeducting(true);
    const lines = recipe.ingredienten.split("\n").map(l => l.trim()).filter(Boolean);
    try {
      await deductStock(lines);
      const updated = await getStockStatus(lines);
      setStockStatus(updated);
    } finally {
      setDeducting(false);
    }
  }

  async function handleMappingSaved() {
    const data = await getProductMappings().catch(() => []);
    const map = {};
    for (const m of data) map[m.ingredient_name] = m;
    setMappings(map);
    setLinkIngredient(null);
  }

  async function handleAiFill() {
    if (!recipe) return;
    setAiLoading(true);
    try {
      const result = await aiFillMacros(recipe.naam, recipe.ingredienten);
      setRecipe(r => ({ ...r, ...result }));
    } finally {
      setAiLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="text-ink2">Recept niet gevonden</p>
      </div>
    );
  }

  const p = recipe.porties || 1;
  const macros = [
    { label: "Calorieën", value: recipe.kcal ? `${Math.round(recipe.kcal / p)} kcal` : "—" },
    { label: "Eiwit",     value: recipe.eiwit_g ? `${Math.round(recipe.eiwit_g / p)}g` : "—" },
    { label: "Vet",       value: recipe.vet_g ? `${Math.round(recipe.vet_g / p)}g` : "—" },
    { label: "Koolhydraten", value: recipe.koolhydraten_g ? `${Math.round(recipe.koolhydraten_g / p)}g` : "—" },
  ];

  const ingredienten = typeof recipe.ingredienten === "string"
    ? recipe.ingredienten.split("\n").filter(Boolean)
    : Array.isArray(recipe.ingredienten) ? recipe.ingredienten : [];

  const bereidingSteps = typeof recipe.instructies === "string"
    ? recipe.instructies.split("\n").filter(Boolean)
    : Array.isArray(recipe.instructies) ? recipe.instructies : [];

  return (
    <>
      {/* ── Mobile ── */}
      <div className="lg:hidden min-h-screen bg-bg pb-[100px]">
        <IOSStatusBar />

        {/* Hero photo */}
        <div className="relative h-[320px] bg-fill flex items-center justify-center">
          {recipe.image_url
            ? <img src={recipe.image_url} alt={recipe.naam} className="w-full h-full object-cover" />
            : <span className="text-6xl">🍽️</span>
          }
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 w-[34px] h-[34px] rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)' }}
          >
            <span className="text-brand text-[18px]">‹</span>
          </button>
          <button
            onClick={() => navigate(`/recepten/${recipe.id}/bewerken`)}
            className="absolute top-4 right-4 w-[34px] h-[34px] rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)' }}
          >
            <Pencil size={16} className="text-ink" />
          </button>
        </div>

        {/* Body */}
        <div className="pt-4">
          <div className="px-4 mb-4">
            <p className="text-[13px] font-bold uppercase tracking-wide text-brand mb-1">
              {recipe.categorie}{recipe.vlees_thema ? ` · ${recipe.vlees_thema}` : ""}
            </p>
            <h1 className="text-[28px] font-bold text-ink leading-tight mb-1">{recipe.naam}</h1>
            <p className="text-[15px] text-ink2">
              {p} {p === 1 ? 'portie' : 'porties'}{recipe.bereidingstijd_min ? ` · ${recipe.bereidingstijd_min} min` : ""}
            </p>
          </div>

          <IOSGroupHeader>Macro's — per portie</IOSGroupHeader>
          <IOSGroup>
            <div className="grid grid-cols-2">
              {macros.map(({ label, value }, i) => (
                <div
                  key={label}
                  className="px-4 py-[13px]"
                  style={{
                    borderRight: i % 2 === 0 ? '0.5px solid rgba(60,60,67,0.1)' : 'none',
                    borderBottom: i < 2 ? '0.5px solid rgba(60,60,67,0.1)' : 'none',
                  }}
                >
                  <p className="text-[11px] text-ink2 uppercase tracking-wide mb-1">{label}</p>
                  <p className="text-[22px] font-bold text-ink">{value}</p>
                </div>
              ))}
            </div>
          </IOSGroup>

          <IOSGroupHeader>Ingrediënten</IOSGroupHeader>
          <IOSGroup>
            {ingredienten.length > 0
              ? ingredienten.map((ing, i) => {
                  const resolved = ingredientPrices[ing];
                  const isLinked = !!findPriceForIngredient(ing, mappings);
                  const stock = stockStatus[ing];
                  const inStock = stock !== undefined && stock.quantity > 0;
                  const missing = stock !== undefined && stock.quantity === 0;
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-4 py-[11px] min-h-[44px]"
                      style={i < ingredienten.length - 1 ? { borderBottom: '0.5px solid rgba(60,60,67,0.12)' } : {}}
                    >
                      <span className="flex-1 text-[17px] text-ink">{ing}</span>
                      {inStock && (
                        <span className="text-[11px] font-semibold px-[6px] py-[2px] rounded-full flex-shrink-0" style={{ background: 'rgba(31,122,77,0.1)', color: '#1f7a4d' }}>
                          ✓ {stock.quantity}x
                        </span>
                      )}
                      {missing && (
                        <span className="text-[11px] font-semibold px-[6px] py-[2px] rounded-full flex-shrink-0" style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626' }}>
                          ✗ mis
                        </span>
                      )}
                      {resolved?.price != null && (
                        <span className="text-[13px] text-ink2 flex-shrink-0">€{resolved.price.toFixed(2)}</span>
                      )}
                      <button
                        onClick={() => setLinkIngredient(ing)}
                        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                        style={isLinked ? { background: 'rgba(31,122,77,0.15)', color: '#1f7a4d' } : { background: 'rgba(120,120,128,0.1)', color: 'rgba(60,60,67,0.35)' }}
                      >
                        <Link size={12} />
                      </button>
                    </div>
                  );
                })
              : <IOSRow title="Geen ingrediënten" last />
            }
          </IOSGroup>
          {Object.keys(stockStatus).length > 0 && (
            <div className="px-4 mt-2 mb-1">
              <button
                onClick={deducting ? undefined : handleDeductStock}
                disabled={deducting}
                className="w-full flex items-center justify-center gap-2 py-[11px] rounded-[12px] text-[15px] font-semibold disabled:opacity-50"
                style={{ background: 'rgba(0,122,255,0.1)', color: '#007aff' }}
              >
                <ShoppingBag size={16} />
                {deducting ? "Bezig…" : "Gebruik alles — trek af van voorraad"}
              </button>
            </div>
          )}

          {bereidingSteps.length > 0 && (
            <>
              <IOSGroupHeader>Bereiding</IOSGroupHeader>
              <IOSGroup>
                <div className="p-4">
                  {bereidingSteps.map((step, i) => (
                    <p key={i} className="text-[15px] text-ink leading-relaxed mb-2">{step}</p>
                  ))}
                </div>
              </IOSGroup>
            </>
          )}

          <IOSGroupHeader>AI</IOSGroupHeader>
          <IOSGroup>
            <IOSRow
              icon={<Image size={16} className="text-white" />}
              iconBg="#0a84ff"
              title="Foto genereren met AI"
              onClick={imageLoading ? undefined : handleRefreshImage}
              detail={imageLoading ? "…" : undefined}
            />
            <IOSRow
              icon={<ListPlus size={16} className="text-white" />}
              iconBg="#ff9500"
              title="Ingrediënten genereren met AI"
              onClick={ingredientsLoading ? undefined : handleFillIngredients}
              detail={ingredientsLoading ? "…" : undefined}
            />
            <IOSRow
              icon={<BookOpen size={16} className="text-white" />}
              iconBg="#34c759"
              title="Instructies genereren met AI"
              onClick={instructionsLoading ? undefined : handleFillInstructions}
              detail={instructionsLoading ? "…" : undefined}
            />
            <IOSRow
              icon={<Sparkles size={16} className="text-white" />}
              iconBg="#af52de"
              title="Macro's opnieuw schatten met AI"
              last
              onClick={aiLoading ? undefined : handleAiFill}
              detail={aiLoading ? "…" : undefined}
            />
          </IOSGroup>
        </div>

        <div className="px-4 mt-4 mb-2">
          <button
            onClick={deleting ? undefined : handleDelete}
            disabled={deleting}
            className="w-full flex items-center justify-center gap-2 py-[11px] rounded-[12px] text-[15px] font-semibold disabled:opacity-50"
            style={{ background: 'rgba(255,59,48,0.1)', color: '#ff3b30' }}
          >
            <Trash2 size={16} />
            {deleting ? "Verwijderen…" : "Verwijder recept"}
          </button>
        </div>

        <IOSTabBar />
      </div>

      {/* ── Desktop ── */}
      <div className="hidden lg:block">
        <DesktopShell
          title={`Recepten / ${recipe.naam}`}
          accessory={
            <div className="flex gap-2">
              <button
                onClick={handleRefreshImage}
                disabled={imageLoading}
                className="flex items-center gap-1.5 px-3 py-[6px] rounded-[7px] text-[13px] font-semibold disabled:opacity-50"
                style={{ background: 'rgba(120,120,128,0.14)', color: 'rgba(60,60,67,0.7)' }}
              >
                <Image size={14} />
                {imageLoading ? "Bezig…" : "Foto genereren"}
              </button>
              <button
                onClick={() => navigate(`/recepten/${recipe.id}/bewerken`)}
                className="flex items-center gap-1.5 px-3 py-[6px] rounded-[7px] bg-brand text-white text-[13px] font-semibold"
              >
                <Pencil size={14} />
                Bewerken
              </button>
            </div>
          }
        >
          <div className="grid h-full" style={{ gridTemplateColumns: '1fr 360px' }}>
            {/* Left — photo + bereiding */}
            <div className="overflow-y-auto p-6 space-y-5">
              <div
                className="rounded-[12px] overflow-hidden"
                style={{ height: 320, background: 'rgba(120,120,128,0.08)' }}
              >
                {recipe.image_url
                  ? <img src={recipe.image_url} alt={recipe.naam} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-6xl">🍽️</div>
                }
              </div>

              <div>
                <p className="text-[12px] font-bold uppercase tracking-wide text-brand mb-1">
                  {recipe.categorie}{recipe.vlees_thema ? ` · ${recipe.vlees_thema}` : ""}
                </p>
                <h1 className="text-[28px] font-bold text-ink mb-1 leading-tight">{recipe.naam}</h1>
                <p className="text-[14px] text-ink2">
                  {p} {p === 1 ? 'portie' : 'porties'}{recipe.bereidingstijd_min ? ` · ${recipe.bereidingstijd_min} min` : ""}
                </p>
              </div>

              {bereidingSteps.length > 0 && (
                <div>
                  <p className="text-[12px] font-bold uppercase tracking-wide text-ink2 mb-4">Bereiding</p>
                  <ol className="space-y-3">
                    {bereidingSteps.map((step, i) => (
                      <li key={i} className="flex gap-3">
                        <span
                          className="w-7 h-7 rounded-full text-white text-[12px] font-bold flex items-center justify-center flex-shrink-0 mt-px"
                          style={{ background: 'rgba(31,122,77,0.12)', color: '#1f7a4d' }}
                        >
                          {i + 1}
                        </span>
                        <p className="text-[15px] text-ink leading-relaxed pt-0.5">{step}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>

            {/* Right inspector */}
            <div
              className="overflow-y-auto p-5 space-y-4"
              style={{ borderLeft: '0.5px solid rgba(60,60,67,0.08)', background: '#fff' }}
            >
              <Panel title="Macro's">
                <p className="text-[11px] text-ink2 mb-3">per portie</p>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {macros.map(m => <Stat key={m.label} label={m.label} v={m.value} />)}
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleFillInstructions}
                    disabled={instructionsLoading}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-[8px] text-white text-[13px] font-semibold disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #30d158, #34c759)' }}
                  >
                    <BookOpen size={14} />
                    {instructionsLoading ? "Bezig…" : "Instructies genereren"}
                  </button>
                  <button
                    onClick={handleAiFill}
                    disabled={aiLoading}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-[8px] text-white text-[13px] font-semibold disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #af52de, #5856d6)' }}
                  >
                    <Sparkles size={14} />
                    {aiLoading ? "Bezig…" : "Macro's schatten met AI"}
                  </button>
                </div>
              </Panel>

              <Panel title="Ingrediënten" badge={p > 1 ? `${p} porties` : '1 portie'}>
                {ingredienten.length > 0 ? ingredienten.map((ing, i) => {
                  const resolved = ingredientPrices[ing];
                  const isLinked = !!findPriceForIngredient(ing, mappings);
                  const stock = stockStatus[ing];
                  const inStock = stock !== undefined && stock.quantity > 0;
                  const missing = stock !== undefined && stock.quantity === 0;
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-2 py-[8px] group"
                      style={i < ingredienten.length - 1 ? { borderBottom: '0.5px solid rgba(60,60,67,0.1)' } : {}}
                    >
                      <span className="flex-1 text-[13px] text-ink">{ing}</span>
                      {inStock && (
                        <span className="text-[10px] font-semibold px-[5px] py-[1px] rounded-full flex-shrink-0" style={{ background: 'rgba(31,122,77,0.1)', color: '#1f7a4d' }}>
                          ✓ {stock.quantity}x
                        </span>
                      )}
                      {missing && (
                        <span className="text-[10px] font-semibold px-[5px] py-[1px] rounded-full flex-shrink-0" style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626' }}>
                          ✗ mis
                        </span>
                      )}
                      {resolved?.price != null && (
                        <span className="text-[12px] text-ink2 tabular-nums flex-shrink-0">€{resolved.price.toFixed(2)}</span>
                      )}
                      <button
                        onClick={() => setLinkIngredient(ing)}
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={isLinked ? { background: 'rgba(31,122,77,0.15)', color: '#1f7a4d', opacity: 1 } : { background: 'rgba(120,120,128,0.1)', color: 'rgba(60,60,67,0.4)' }}
                      >
                        <Link size={10} />
                      </button>
                    </div>
                  );
                }) : (
                  <div className="py-2">
                    <p className="text-[13px] text-ink2 mb-2">Nog geen ingrediënten</p>
                    <button
                      onClick={handleFillIngredients}
                      disabled={ingredientsLoading}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-[8px] text-white text-[13px] font-semibold disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg, #ff9f0a, #ff9500)' }}
                    >
                      <ListPlus size={14} />
                      {ingredientsLoading ? "Bezig…" : "Genereren met AI"}
                    </button>
                  </div>
                )}
                {ingredienten.length > 0 && (
                  <div className="mt-2 flex flex-col gap-1.5">
                    {Object.keys(stockStatus).length > 0 && (
                      <button
                        onClick={deducting ? undefined : handleDeductStock}
                        disabled={deducting}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-[7px] text-[12px] font-semibold disabled:opacity-50"
                        style={{ background: 'rgba(0,122,255,0.1)', color: '#007aff' }}
                      >
                        <ShoppingBag size={12} />
                        {deducting ? "Bezig…" : "Gebruik alles — trek af van voorraad"}
                      </button>
                    )}
                    <button
                      onClick={handleFillIngredients}
                      disabled={ingredientsLoading}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-[7px] text-[12px] font-medium disabled:opacity-50"
                      style={{ background: 'rgba(255,149,0,0.1)', color: '#ff9500' }}
                    >
                      <ListPlus size={12} />
                      {ingredientsLoading ? "Bezig…" : "Opnieuw genereren"}
                    </button>
                  </div>
                )}
              </Panel>
            </div>
          </div>
          <div className="px-5 pb-4">
            <button
              onClick={deleting ? undefined : handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 px-3 py-[6px] rounded-[7px] text-[13px] font-semibold disabled:opacity-50"
              style={{ background: 'rgba(255,59,48,0.08)', color: '#ff3b30' }}
            >
              <Trash2 size={14} />
              {deleting ? "Verwijderen…" : "Verwijder recept"}
            </button>
          </div>
        </DesktopShell>
      </div>

      {linkIngredient && (
        <IngredientLinkSheet
          ingredientLine={linkIngredient}
          mappings={mappings}
          onSave={async () => {
            const data = await getProductMappings().catch(() => []);
            const map = {};
            for (const m of data) map[m.ingredient_name] = m;
            setMappings(map);
            setLinkIngredient(null);
            // Re-resolve prices with updated mappings
            if (ingredienten.length) {
              resolveIngredientPrices(ingredienten).then(setIngredientPrices).catch(() => {});
            }
          }}
          onClose={() => setLinkIngredient(null)}
        />
      )}
    </>
  );
}
