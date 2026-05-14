import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Pencil, MoreHorizontal, Sparkles, ArrowRight, RefreshCw } from "lucide-react";
import { getRecipe, updateRecipe, aiFillMacros, refreshRecipeImage } from "../api/client";

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [imageRefreshing, setImageRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getRecipe(id)
      .then((r) => { setRecipe(r); setForm(r); })
      .catch(() => setError("Recept niet gevonden"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateRecipe(id, form);
      setRecipe(updated); setForm(updated); setEditing(false);
    } catch { setError("Opslaan mislukt"); }
    finally { setSaving(false); }
  };

  const handleRefreshImage = async () => {
    setImageRefreshing(true);
    setError(null);
    try {
      const updated = await refreshRecipeImage(id);
      setRecipe(updated);
    } catch (e) {
      const msg = e?.response?.data?.detail;
      setError(msg || "Afbeelding vernieuwen mislukt");
    } finally { setImageRefreshing(false); }
  };

  const handleAiFill = async () => {
    if (!form.naam || !form.instructies) return;
    setAiLoading(true);
    try {
      const result = await aiFillMacros(form.naam, form.instructies.split("\n").filter(Boolean));
      setForm((f) => ({ ...f, ...result }));
    } catch { setError("AI service niet beschikbaar"); }
    finally { setAiLoading(false); }
  };

  if (loading) return (
    <div className="bg-bg min-h-screen">
      <div className="h-[300px] bg-line2 animate-pulse" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-line2 rounded-[8px] animate-pulse w-2/3" />
        <div className="h-4 bg-line2 rounded-[8px] animate-pulse w-1/2" />
      </div>
    </div>
  );

  if (error && !recipe) return (
    <div className="bg-bg min-h-screen p-5">
      <button onClick={() => navigate(-1)} className="text-brand text-[13px] mb-4 flex items-center gap-1">
        <ChevronLeft size={16} strokeWidth={1.8} /> Terug
      </button>
      <p className="text-[13px]" style={{ color: '#c2603a' }}>{error}</p>
    </div>
  );

  const macros = [
    [recipe.kcal, "kcal"],
    [recipe.eiwit_g ? `${Math.round(recipe.eiwit_g)}g` : null, "eiwit"],
    [recipe.vet_g ? `${Math.round(recipe.vet_g)}g` : null, "vet"],
    [recipe.koolhydraten_g ? `${Math.round(recipe.koolhydraten_g)}g` : null, "KH"],
  ].filter(([v]) => v != null);

  const rawLines = recipe.instructies
    ? recipe.instructies.split("\n").map(l => l.trim()).filter(Boolean)
    : [];

  const INGREDIENT_RE = /^([-•*–]\s*|(\d[\d/,.½¼¾]*\s*(g|ml|kg|l|dl|el|tl|stuks?|blikjes?|zakjes?|teen|takjes?|snufjes?|bosjes?|handvol|kop|eetlepel|theelepel)\b))/i;

  const hasStructure = rawLines.some(l =>
    INGREDIENT_RE.test(l) || /^(stap\s*\d|(\d+)\s*[.:)]\s+\S)/i.test(l)
  );
  const ingredients = [];
  const steps = [];

  if (hasStructure) {
    rawLines.forEach(line => {
      if (INGREDIENT_RE.test(line)) {
        ingredients.push(line.replace(/^[-•*–]\s*/, ""));
      } else {
        steps.push(line);
      }
    });
  } else {
    steps.push(...rawLines);
  }

  const displaySteps = steps
    .map(s => s.replace(/^stap\s*\d+\s*[.:)?\s]*/i, "").replace(/^\d+\s*[.:)]\s*/, "").trim())
    .filter(Boolean);

  if (editing) {
    return (
      <div className="bg-bg min-h-screen pb-[100px]">
        <div className="h-[54px]" />
        <div className="px-5 pt-[14px] pb-4 flex items-center gap-3">
          <button onClick={() => { setEditing(false); setForm(recipe); setError(null); }}
            className="w-[38px] h-[38px] rounded-full border border-line bg-surface grid place-items-center text-ink2 flex-shrink-0">
            <ChevronLeft size={18} strokeWidth={1.6} />
          </button>
          <h1 className="h1-page text-[20px]">Recept bewerken</h1>
        </div>

        <div className="px-5 space-y-3 pb-8">
          {error && <p className="text-[12px] px-3 py-2 rounded-[10px]" style={{ color: '#c2603a', background: '#fdeee8' }}>{error}</p>}

          {[["Naam", "naam", "text"], ["Kcal", "kcal", "number"], ["Eiwit (g)", "eiwit_g", "number"], ["Vet (g)", "vet_g", "number"], ["KH (g)", "koolhydraten_g", "number"]].map(([label, key, type]) => (
            <div key={key}>
              <p className="text-[11px] text-ink3 mb-1 font-medium uppercase tracking-wide">{label}</p>
              <input
                type={type}
                className="w-full border border-line bg-line2 rounded-[10px] px-3 py-[10px] text-[13px] focus:outline-none focus:ring-1 focus:ring-brand"
                value={form[key] ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, [key]: type === "number" && e.target.value !== "" ? Number(e.target.value) : e.target.value || null }))}
              />
            </div>
          ))}

          <div>
            <p className="text-[11px] text-ink3 mb-1 font-medium uppercase tracking-wide">Categorie</p>
            <select
              className="w-full border border-line bg-line2 rounded-[10px] px-3 py-[10px] text-[13px]"
              value={form.categorie || ""}
              onChange={(e) => setForm((f) => ({ ...f, categorie: e.target.value }))}
            >
              <option value="ontbijt">Ontbijt</option>
              <option value="lunch">Lunch</option>
              <option value="diner">Diner</option>
              <option value="snack">Snack</option>
            </select>
          </div>

          <div>
            <p className="text-[11px] text-ink3 mb-1 font-medium uppercase tracking-wide">Bereiding / ingrediënten</p>
            <textarea
              className="w-full border border-line bg-line2 rounded-[10px] px-3 py-[10px] text-[13px] h-40 resize-none focus:outline-none focus:ring-1 focus:ring-brand"
              value={form.instructies || ""}
              onChange={(e) => setForm((f) => ({ ...f, instructies: e.target.value }))}
              placeholder={"Stap 1: ...\nStap 2: ...\n\nOf per ingrediënt:\n450g gehakt\n..."}
            />
          </div>

          <button type="button" onClick={handleAiFill} disabled={aiLoading || saving}
            className="w-full flex items-center justify-center gap-2 border border-line bg-surface text-ink2 text-[13px] font-medium py-[11px] rounded-[12px] disabled:opacity-50">
            <Sparkles size={15} strokeWidth={1.6} style={{ color: '#c2603a' }} />
            {aiLoading ? "AI bezig..." : "Macro's schatten op basis van bereiding"}
          </button>

          <button onClick={handleSave} disabled={saving}
            className="w-full bg-brand text-white text-[13px] font-semibold py-[13px] rounded-[12px] disabled:opacity-50">
            {saving ? "Opslaan..." : "Opslaan"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg min-h-screen pb-[110px]">
      {/* Hero photo area */}
      <div className="relative h-[300px] bg-line2 flex items-end justify-center overflow-hidden">
        {recipe.image_url && (
          <img
            src={recipe.image_url}
            alt={recipe.naam}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        {!recipe.image_url && (
          <span className="text-ink3 text-[13px] mb-4">{recipe.naam}</span>
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 60%)' }} />
        <button
          onClick={handleRefreshImage}
          disabled={imageRefreshing}
          className="absolute bottom-3 right-3 w-[34px] h-[34px] rounded-full grid place-items-center disabled:opacity-50"
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)' }}
          title="Andere afbeelding"
        >
          <RefreshCw size={15} strokeWidth={1.8} color="#fff" className={imageRefreshing ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Glass back button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-[56px] left-4 w-[38px] h-[38px] rounded-full grid place-items-center text-ink"
        style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)' }}
      >
        <ChevronLeft size={18} strokeWidth={1.8} />
      </button>

      {/* Glass action buttons */}
      <div className="absolute top-[56px] right-4 flex gap-2">
        <button
          onClick={() => setEditing(true)}
          className="w-[38px] h-[38px] rounded-full grid place-items-center text-ink"
          style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)' }}
        >
          <Pencil size={16} strokeWidth={1.6} />
        </button>
        <button
          className="w-[38px] h-[38px] rounded-full grid place-items-center text-ink"
          style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)' }}
        >
          <MoreHorizontal size={18} strokeWidth={1.6} />
        </button>
      </div>

      <div className="px-5 pt-6">
        {error && (
          <p className="text-[12px] px-3 py-2 mb-3 rounded-[10px]" style={{ color: '#c2603a', background: '#fdeee8' }}>{error}</p>
        )}
        {/* Category pill */}
        <span className="inline-flex items-center px-2 py-[3px] rounded-[6px] text-[11px] font-medium"
          style={{ background: '#e9efe6', color: '#1f3a2c' }}>
          {recipe.categorie ?? "recept"}{recipe.vlees_type ? ` · ${recipe.vlees_type}` : ""}
        </span>

        <h1 className="h1-page mt-[10px] mb-[6px]">{recipe.naam}</h1>
        {recipe.beschrijving && (
          <p className="text-[13px] text-ink2 mb-0">{recipe.beschrijving}</p>
        )}

        {/* Macros 4-up grid */}
        {macros.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mt-[18px]">
            {macros.map(([v, l]) => (
              <div key={l} className="bg-surface border border-line rounded-[12px] py-[10px] text-center">
                <p className="text-[16px] font-semibold" style={{ letterSpacing: '-0.3px' }}>{v}</p>
                <p className="eyebrow mt-[2px]">{l}</p>
              </div>
            ))}
          </div>
        )}

        {/* Instructions */}
        {rawLines.length > 0 ? (
          <>
            {ingredients.length > 0 && (
              <>
                <p className="eyebrow mt-6 mb-3">Ingrediënten</p>
                <div className="space-y-[10px]">
                  {ingredients.map((ing, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="mt-[7px] w-[6px] h-[6px] rounded-full flex-shrink-0" style={{ background: '#c2603a' }} />
                      <span className="text-[14px] leading-[1.5]">{ing}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {displaySteps.length > 0 && (
              <>
                <p className="eyebrow mt-6 mb-4">Bereiding</p>
                <div className="space-y-5">
                  {displaySteps.map((step, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <span
                        className="flex-shrink-0 w-8 h-8 rounded-full text-white text-[13px] font-bold grid place-items-center"
                        style={{ background: '#1a1f1a' }}
                      >
                        {i + 1}
                      </span>
                      <p className="text-[14px] leading-[1.65] pt-[5px] flex-1">{step}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="mt-6 px-4 py-6 rounded-[14px] border border-line text-center" style={{ borderStyle: 'dashed' }}>
            <p className="text-[13px] text-ink3">Nog geen bereiding — klik op bewerken om stappen toe te voegen</p>
          </div>
        )}

        {/* AI macro button */}
        <button
          onClick={handleAiFill}
          disabled={aiLoading}
          className="w-full mt-3 flex items-center justify-center gap-2 border border-line bg-surface text-ink2 text-[13px] font-medium py-[11px] rounded-[12px] disabled:opacity-50"
        >
          <Sparkles size={15} strokeWidth={1.6} style={{ color: '#c2603a' }} />
          {aiLoading ? "AI bezig..." : "Macro's opnieuw schatten"}
        </button>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-[88px] left-1/2 -translate-x-1/2 w-full max-w-[402px] px-4">
        <button
          className="w-full flex items-center justify-between px-4 py-[14px] rounded-[14px] text-white"
          style={{ background: '#1a1f1a', boxShadow: '0 12px 32px rgba(0,0,0,0.18)' }}
          onClick={() => navigate(-1)}
        >
          <span className="text-[14px] font-semibold">Terug naar weekplan</span>
          <ArrowRight size={18} strokeWidth={1.6} />
        </button>
      </div>
    </div>
  );
}
