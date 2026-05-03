import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getRecipes, createRecipe, deleteRecipe, aiFillMacros } from "../api/client";
import RecipeCard from "../components/RecipeCard";

export default function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ naam: "", ingredienten: "", categorie: "diner" });
  const [macros, setMacros] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("new") === "1") setShowForm(true);
  }, [searchParams]);

  useEffect(() => {
    getRecipes(search).then(setRecipes).catch(console.error);
  }, [search]);

  const handleAiFill = async () => {
    if (!formData.naam || !formData.ingredienten) return;
    setLoading(true);
    setError(null);
    try {
      const result = await aiFillMacros(
        formData.naam,
        formData.ingredienten.split("\n").filter(Boolean)
      );
      setMacros(result);
    } catch {
      setError("AI service niet beschikbaar");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const payload = {
      naam: formData.naam,
      categorie: formData.categorie,
      ...macros,
    };
    await createRecipe(payload);
    setFormData({ naam: "", ingredienten: "", categorie: "diner" });
    setMacros(null);
    setShowForm(false);
    getRecipes(search).then(setRecipes);
  };

  const handleDelete = async (id) => {
    if (!confirm("Recept verwijderen?")) return;
    await deleteRecipe(id);
    setRecipes((r) => r.filter((x) => x.id !== id));
  };

  return (
    <div className="p-4 pb-20">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">Recepten</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-brand text-white text-sm font-semibold px-3 py-1.5 rounded-lg"
        >
          {showForm ? "Annuleer" : "➕ Nieuw"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm">
          <p className="font-semibold text-gray-800 mb-3">Nieuw recept</p>
          <input
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-brand"
            placeholder="Naam recept"
            value={formData.naam}
            onChange={(e) => setFormData({ ...formData, naam: e.target.value })}
            required
          />
          <select
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-2"
            value={formData.categorie}
            onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
          >
            <option value="ontbijt">Ontbijt</option>
            <option value="lunch">Lunch</option>
            <option value="diner">Diner</option>
            <option value="snack">Snack</option>
          </select>
          <textarea
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-2 h-20 resize-none focus:outline-none focus:ring-2 focus:ring-brand"
            placeholder={"Ingrediënten (één per regel)\nbijv:\n450g gehakt\n200g pasta"}
            value={formData.ingredienten}
            onChange={(e) => setFormData({ ...formData, ingredienten: e.target.value })}
          />
          {error && (
            <p className="text-red-600 text-xs mb-2">{error}</p>
          )}
          {macros && (
            <div className="flex gap-2 mb-3 flex-wrap">
              <span className="bg-green-50 text-green-700 text-xs font-semibold px-2 py-1 rounded-md">
                Eiwit: {macros.eiwit_g}g
              </span>
              <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-1 rounded-md">
                {macros.kcal} kcal
              </span>
              <span className="bg-orange-50 text-orange-700 text-xs font-semibold px-2 py-1 rounded-md">
                Vet: {macros.vet_g}g
              </span>
              <span className="bg-purple-50 text-purple-700 text-xs font-semibold px-2 py-1 rounded-md">
                KH: {macros.koolhydraten_g}g
              </span>
            </div>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAiFill}
              disabled={loading}
              className="flex-1 border border-gray-200 text-gray-700 text-sm font-medium py-2 rounded-lg disabled:opacity-50"
            >
              {loading ? "AI bezig..." : "🤖 Macro's schatten"}
            </button>
            <button
              type="submit"
              className="flex-1 bg-brand text-white text-sm font-semibold py-2 rounded-lg"
            >
              Opslaan
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 flex items-center gap-2 mb-4 shadow-sm">
        <span className="text-gray-400">🔍</span>
        <input
          className="flex-1 text-sm text-gray-700 focus:outline-none"
          placeholder="Zoek recept..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        {recipes.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">Geen recepten gevonden</p>
        )}
        {recipes.map((r) => (
          <RecipeCard key={r.id} recipe={r} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
}
