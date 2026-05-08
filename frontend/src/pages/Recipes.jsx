import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, Plus, ChevronRight, Sparkles } from "lucide-react";
import { getRecipes, createRecipe, deleteRecipe, aiFillMacros } from "../api/client";

const FILTERS = ["Alle", "Diner", "Lunch", "Ontbijt", "Snack"];

export default function Recipes() {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [activeFilter, setActiveFilter] = useState("Alle");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ naam: "", ingredienten: "", categorie: "diner" });
  const [macros, setMacros] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("new") === "1") setShowForm(true);
  }, [searchParams]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    getRecipes(debouncedSearch)
      .then((data) => { if (!cancelled) { setRecipes(data); setInitialized(true); } })
      .catch(console.error);
    return () => { cancelled = true; };
  }, [debouncedSearch]);

  const filteredRecipes = activeFilter === "Alle"
    ? recipes
    : recipes.filter(r => r.categorie?.toLowerCase() === activeFilter.toLowerCase());

  const handleFormDataChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "naam" || field === "ingredienten") setMacros(null);
  };

  const handleAiFill = async () => {
    if (!formData.naam || !formData.ingredienten) return;
    setLoading(true); setError(null);
    try {
      setMacros(await aiFillMacros(formData.naam, formData.ingredienten.split("\n").filter(Boolean)));
    } catch { setError("AI service niet beschikbaar"); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true); setError(null);
    try {
      await createRecipe({ naam: formData.naam, categorie: formData.categorie, ...macros });
      setFormData({ naam: "", ingredienten: "", categorie: "diner" });
      setMacros(null); setShowForm(false);
      getRecipes(debouncedSearch).then(setRecipes).catch(console.error);
    } catch { setError("Opslaan mislukt, probeer opnieuw"); }
    finally { setSaving(false); }
  };

  return (
    <div className="bg-bg min-h-screen pb-[100px]">
      <div className="h-[54px]" />

      {/* Header */}
      <div className="px-5 pt-[14px] pb-3 flex justify-between items-center">
        <h1 className="h1-page">Recepten</h1>
        <button
          onClick={() => { setShowForm((v) => !v); setError(null); }}
          className="h-9 px-[14px] rounded-[18px] flex items-center gap-[5px] text-[13px] font-medium"
          style={{ background: showForm ? '#e7e4dc' : '#1a1f1a', color: showForm ? '#1a1f1a' : '#fff' }}
        >
          <Plus size={16} strokeWidth={1.8} /> {showForm ? "Annuleer" : "Nieuw"}
        </button>
      </div>

      {/* Search */}
      <div className="px-5 pb-3">
        <div className="flex items-center gap-2 px-[14px] py-[10px] bg-surface rounded-[12px] border border-line">
          <Search size={16} strokeWidth={1.6} className="text-ink3 flex-shrink-0" />
          <input
            aria-label="Zoek recept"
            className="flex-1 bg-transparent text-[14px] text-ink placeholder-ink3 focus:outline-none"
            placeholder="Zoek recept..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Filter chips */}
      <div className="px-5 pb-4 flex gap-[6px] flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className="px-3 py-[5px] rounded-[14px] text-[12px] font-medium transition-colors"
            style={{
              background: activeFilter === f ? '#1a1f1a' : '#ffffff',
              color: activeFilter === f ? '#fff' : '#5d655c',
              border: activeFilter === f ? 'none' : '1px solid #e7e4dc',
            }}
          >{f}</button>
        ))}
      </div>

      {/* New recipe form */}
      {showForm && (
        <div className="px-5 mb-4">
          <form onSubmit={handleCreate} className="bg-surface rounded-[14px] border border-line p-4">
            <p className="text-[13px] font-semibold mb-3">Nieuw recept</p>
            <input
              className="w-full border border-line bg-line2 rounded-[10px] px-3 py-[10px] text-[13px] mb-2 focus:outline-none focus:ring-1 focus:ring-brand"
              placeholder="Naam recept"
              value={formData.naam}
              onChange={(e) => handleFormDataChange("naam", e.target.value)}
              required
            />
            <select
              className="w-full border border-line bg-line2 rounded-[10px] px-3 py-[10px] text-[13px] mb-2"
              value={formData.categorie}
              onChange={(e) => handleFormDataChange("categorie", e.target.value)}
            >
              <option value="ontbijt">Ontbijt</option>
              <option value="lunch">Lunch</option>
              <option value="diner">Diner</option>
              <option value="snack">Snack</option>
            </select>
            <textarea
              className="w-full border border-line bg-line2 rounded-[10px] px-3 py-[10px] text-[13px] mb-2 h-20 resize-none focus:outline-none focus:ring-1 focus:ring-brand"
              placeholder={"Ingrediënten (één per regel)\nbijv:\n450g gehakt\n200g pasta"}
              value={formData.ingredienten}
              onChange={(e) => handleFormDataChange("ingredienten", e.target.value)}
            />
            {error && <p className="text-[12px] mb-2" style={{ color: '#c2603a' }}>{error}</p>}
            {macros && (
              <div className="flex gap-2 mb-3 flex-wrap">
                <span className="text-[11px] font-medium px-2 py-1 rounded-[6px]" style={{ background: '#e9efe6', color: '#1f3a2c' }}>{macros.eiwit_g}g eiwit</span>
                <span className="text-[11px] font-medium px-2 py-1 rounded-[6px]" style={{ background: '#fef3e2', color: '#92400e' }}>{macros.kcal} kcal</span>
                <span className="text-[11px] font-medium px-2 py-1 rounded-[6px]" style={{ background: '#fdeee8', color: '#9a3412' }}>{macros.vet_g}g vet</span>
                <span className="text-[11px] font-medium px-2 py-1 rounded-[6px]" style={{ background: '#f0ebff', color: '#5b21b6' }}>{macros.koolhydraten_g}g KH</span>
              </div>
            )}
            <div className="flex gap-2">
              <button
                type="button" onClick={handleAiFill} disabled={loading || saving}
                className="flex-1 flex items-center justify-center gap-[6px] border border-line bg-line2 text-ink2 text-[13px] font-medium py-[10px] rounded-[10px] disabled:opacity-50"
              >
                <Sparkles size={14} strokeWidth={1.6} style={{ color: '#c2603a' }} />
                {loading ? "AI bezig..." : "Macro's schatten"}
              </button>
              <button
                type="submit" disabled={loading || saving}
                className="flex-1 bg-brand text-white text-[13px] font-medium py-[10px] rounded-[10px] disabled:opacity-50"
              >
                {saving ? "Opslaan..." : "Opslaan"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Recipe list */}
      <div className="px-5 flex flex-col gap-[10px]">
        {initialized && filteredRecipes.length === 0 && (
          <p className="text-center text-ink3 text-[13px] py-12">Geen recepten gevonden</p>
        )}
        {filteredRecipes.map((r) => (
          <button
            key={r.id}
            onClick={() => navigate(`/recepten/${r.id}`)}
            className="bg-surface rounded-[14px] border border-line p-[10px] flex gap-3 items-center text-left w-full"
          >
            <div className="w-16 h-16 rounded-[10px] bg-line2 flex-shrink-0 flex items-center justify-center">
              <span className="text-[22px]">{r.categorie === "ontbijt" ? "🥣" : r.categorie === "lunch" ? "🥗" : r.categorie === "snack" ? "🍎" : "🍽️"}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="eyebrow mb-[2px]">{r.categorie ?? "recept"}</p>
              <p className="text-[14px] font-semibold tracking-tight truncate mb-[5px]">{r.naam}</p>
              <div className="flex gap-[10px] text-[11px] text-ink2">
                {r.eiwit_g && <span>{Math.round(r.eiwit_g)}g eiwit</span>}
                {r.eiwit_g && r.kcal && <span>·</span>}
                {r.kcal && <span>{r.kcal} kcal</span>}
              </div>
            </div>
            <ChevronRight size={16} strokeWidth={1.6} className="text-ink3 flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}
