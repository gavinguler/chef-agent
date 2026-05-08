import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getRecipes, createRecipe, deleteRecipe, aiFillMacros } from "../api/client";
import RecipeCard from "../components/RecipeCard";

export default function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [initialized, setInitialized] = useState(false);
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

  const handleDelete = async (id) => {
    if (!confirm("Recept verwijderen?")) return;
    try {
      await deleteRecipe(id);
      setRecipes((r) => r.filter((x) => x.id !== id));
    } catch { alert("Verwijderen mislukt"); }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-900 via-green-800 to-green-700 px-5 pt-12 pb-5">
        <div className="flex items-center justify-between">
          <h1 className="text-white text-2xl font-bold tracking-tight">Recepten</h1>
          <button
            onClick={() => { setShowForm((v) => !v); setError(null); }}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
              showForm ? "bg-white/20 text-white" : "bg-white text-green-800"
            }`}
          >
            {showForm ? "Annuleer" : "+ Nieuw"}
          </button>
        </div>

        {/* Search */}
        <div className="mt-4 bg-white/15 backdrop-blur rounded-2xl px-4 py-2.5 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            aria-label="Zoek recept"
            className="flex-1 bg-transparent text-white placeholder-white/60 text-sm focus:outline-none"
            placeholder="Zoek recept..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="px-4 pt-4">
        {/* Nieuw recept form */}
        {showForm && (
          <form onSubmit={handleCreate} className="bg-white rounded-2xl shadow-card-md p-4 mb-4">
            <p className="font-bold text-gray-800 mb-3">Nieuw recept</p>
            <input
              className="w-full border border-gray-100 bg-gray-50 rounded-xl px-3 py-2.5 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-brand"
              placeholder="Naam recept"
              value={formData.naam}
              onChange={(e) => handleFormDataChange("naam", e.target.value)}
              required
            />
            <select
              className="w-full border border-gray-100 bg-gray-50 rounded-xl px-3 py-2.5 text-sm mb-2"
              value={formData.categorie}
              onChange={(e) => handleFormDataChange("categorie", e.target.value)}
            >
              <option value="ontbijt">🥣 Ontbijt</option>
              <option value="lunch">🥗 Lunch</option>
              <option value="diner">🍽️ Diner</option>
              <option value="snack">🍎 Snack</option>
            </select>
            <textarea
              className="w-full border border-gray-100 bg-gray-50 rounded-xl px-3 py-2.5 text-sm mb-2 h-20 resize-none focus:outline-none focus:ring-2 focus:ring-brand"
              placeholder={"Ingrediënten (één per regel)\nbijv:\n450g gehakt\n200g pasta"}
              value={formData.ingredienten}
              onChange={(e) => handleFormDataChange("ingredienten", e.target.value)}
            />
            {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
            {macros && (
              <div className="flex gap-2 mb-3 flex-wrap">
                <span className="bg-green-50 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">
                  {macros.eiwit_g}g eiwit
                </span>
                <span className="bg-amber-50 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full">
                  {macros.kcal} kcal
                </span>
                <span className="bg-orange-50 text-orange-700 text-xs font-bold px-2.5 py-1 rounded-full">
                  {macros.vet_g}g vet
                </span>
                <span className="bg-violet-50 text-violet-700 text-xs font-bold px-2.5 py-1 rounded-full">
                  {macros.koolhydraten_g}g KH
                </span>
              </div>
            )}
            <div className="flex gap-2">
              <button
                type="button" onClick={handleAiFill} disabled={loading || saving}
                className="flex-1 bg-gray-50 border border-gray-100 text-gray-700 text-sm font-semibold py-2.5 rounded-xl disabled:opacity-50"
              >
                {loading ? "AI bezig..." : "🤖 Macro's schatten"}
              </button>
              <button
                type="submit" disabled={loading || saving}
                className="flex-1 bg-brand text-white text-sm font-bold py-2.5 rounded-xl disabled:opacity-50"
              >
                {saving ? "Opslaan..." : "Opslaan"}
              </button>
            </div>
          </form>
        )}

        {/* Recipe list */}
        <div className="space-y-2 pb-4">
          {initialized && recipes.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-12">Geen recepten gevonden</p>
          )}
          {recipes.map((r) => (
            <RecipeCard key={r.id} recipe={r} onDelete={handleDelete} />
          ))}
        </div>
      </div>
    </div>
  );
}
