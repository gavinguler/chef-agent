import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRecipe, updateRecipe, aiFillMacros } from "../api/client";

const CATEGORY_EMOJI = { ontbijt: "🥣", lunch: "🥗", diner: "🍽️", snack: "🍎" };
const CATEGORY_BG = { ontbijt: "from-amber-800 to-amber-600", lunch: "from-sky-800 to-sky-600", diner: "from-green-900 to-green-700", snack: "from-rose-800 to-rose-600" };

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
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
    <div className="min-h-screen">
      <div className="h-48 bg-gray-200 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-6 bg-gray-100 rounded-xl animate-pulse w-2/3" />
        <div className="h-4 bg-gray-100 rounded-xl animate-pulse w-1/2" />
      </div>
    </div>
  );

  if (error && !recipe) return (
    <div className="p-4">
      <button onClick={() => navigate(-1)} className="text-brand text-sm mb-4 flex items-center gap-1">
        ← Terug
      </button>
      <p className="text-red-500 text-sm">{error}</p>
    </div>
  );

  const headerGradient = CATEGORY_BG[recipe.categorie] || "from-green-900 to-green-700";

  return (
    <div className="min-h-screen">
      {!editing ? (
        <>
          {/* Header */}
          <div className={`bg-gradient-to-br ${headerGradient} px-5 pt-12 pb-6`}>
            <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-white/70 text-sm mb-4">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Terug
            </button>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-3xl mb-2">{CATEGORY_EMOJI[recipe.categorie] || "🍴"}</div>
                <h1 className="text-white text-xl font-bold leading-tight">{recipe.naam}</h1>
                <p className="text-white/60 text-sm mt-1 capitalize">
                  {recipe.categorie}{recipe.vlees_type ? ` · ${recipe.vlees_type}` : ""}
                </p>
              </div>
              <button
                onClick={() => setEditing(true)}
                className="flex-shrink-0 bg-white/15 text-white text-xs font-semibold px-3 py-1.5 rounded-full"
              >
                Bewerk
              </button>
            </div>
          </div>

          <div className="px-4 pt-4 pb-24">
            {/* Macros */}
            {(recipe.kcal || recipe.eiwit_g || recipe.vet_g || recipe.koolhydraten_g) && (
              <div className="grid grid-cols-4 gap-2 mb-4">
                {recipe.kcal && <MacroTile label="Kcal" value={recipe.kcal} color="amber" />}
                {recipe.eiwit_g && <MacroTile label="Eiwit" value={`${Math.round(recipe.eiwit_g)}g`} color="green" />}
                {recipe.vet_g && <MacroTile label="Vet" value={`${Math.round(recipe.vet_g)}g`} color="orange" />}
                {recipe.koolhydraten_g && <MacroTile label="KH" value={`${Math.round(recipe.koolhydraten_g)}g`} color="violet" />}
              </div>
            )}

            {recipe.beschrijving && (
              <Section title="Beschrijving">
                <p className="text-gray-700 text-sm leading-relaxed">{recipe.beschrijving}</p>
              </Section>
            )}

            <Section title="Bereiding">
              {recipe.instructies ? (
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{recipe.instructies}</p>
              ) : (
                <p className="text-gray-400 text-sm italic">Nog geen bereiding. Klik op Bewerk om toe te voegen.</p>
              )}
            </Section>
          </div>
        </>
      ) : (
        <>
          <div className={`bg-gradient-to-br ${headerGradient} px-5 pt-12 pb-6`}>
            <button onClick={() => { setEditing(false); setForm(recipe); setError(null); }} className="flex items-center gap-1 text-white/70 text-sm mb-4">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Annuleer
            </button>
            <h1 className="text-white text-xl font-bold">Recept bewerken</h1>
          </div>

          <div className="px-4 pt-4 pb-24 space-y-3">
            {error && <p className="text-red-500 text-xs bg-red-50 rounded-xl px-3 py-2">{error}</p>}

            <Field label="Naam">
              <input className={inputClass} value={form.naam || ""} onChange={(e) => setForm((f) => ({ ...f, naam: e.target.value }))} />
            </Field>

            <Field label="Categorie">
              <select className={inputClass} value={form.categorie || ""} onChange={(e) => setForm((f) => ({ ...f, categorie: e.target.value }))}>
                <option value="ontbijt">🥣 Ontbijt</option>
                <option value="lunch">🥗 Lunch</option>
                <option value="diner">🍽️ Diner</option>
                <option value="snack">🍎 Snack</option>
              </select>
            </Field>

            <Field label="Beschrijving">
              <textarea className={`${inputClass} h-16 resize-none`} value={form.beschrijving || ""} onChange={(e) => setForm((f) => ({ ...f, beschrijving: e.target.value }))} placeholder="Korte omschrijving..." />
            </Field>

            <Field label="Bereiding / ingrediënten">
              <textarea className={`${inputClass} h-40 resize-none`} value={form.instructies || ""} onChange={(e) => setForm((f) => ({ ...f, instructies: e.target.value }))} placeholder={"Stap 1: ...\nStap 2: ...\n\nOf per ingrediënt:\n450g gehakt\n..."} />
            </Field>

            <div className="grid grid-cols-2 gap-2">
              {[["kcal","Kcal"],["eiwit_g","Eiwit (g)"],["vet_g","Vet (g)"],["koolhydraten_g","KH (g)"]].map(([key, label]) => (
                <Field key={key} label={label}>
                  <input className={inputClass} type="number" value={form[key] ?? ""} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value ? Number(e.target.value) : null }))} />
                </Field>
              ))}
            </div>

            <button type="button" onClick={handleAiFill} disabled={aiLoading || saving}
              className="w-full bg-gray-50 border border-gray-100 text-gray-700 text-sm font-semibold py-3 rounded-xl disabled:opacity-50">
              {aiLoading ? "AI bezig..." : "🤖 Macro's schatten op basis van bereiding"}
            </button>

            <button onClick={handleSave} disabled={saving}
              className="w-full bg-brand text-white text-sm font-bold py-3 rounded-xl disabled:opacity-50">
              {saving ? "Opslaan..." : "Opslaan"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function MacroTile({ label, value, color }) {
  const colors = {
    amber: "bg-amber-50 text-amber-700",
    green: "bg-green-50 text-green-700",
    orange: "bg-orange-50 text-orange-700",
    violet: "bg-violet-50 text-violet-700",
  };
  return (
    <div className={`${colors[color]} rounded-2xl p-3 text-center`}>
      <p className="text-xs font-semibold opacity-60 mb-0.5">{label}</p>
      <p className="text-sm font-bold leading-tight">{value}</p>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-card p-4 mb-3">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{title}</p>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <p className="text-xs text-gray-500 font-semibold mb-1.5">{label}</p>
      {children}
    </div>
  );
}

const inputClass = "w-full border border-gray-100 bg-gray-50 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand";
