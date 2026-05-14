import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRecipe, updateRecipe, aiFillMacros } from "../api/client";

const CATEGORY_EMOJI = { ontbijt: "🥣", lunch: "🥗", diner: "🍽️", snack: "🍎" };

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
      setRecipe(updated);
      setForm(updated);
      setEditing(false);
    } catch {
      setError("Opslaan mislukt");
    } finally {
      setSaving(false);
    }
  };

  const handleAiFill = async () => {
    if (!form.naam || !form.instructies) return;
    setAiLoading(true);
    try {
      const result = await aiFillMacros(
        form.naam,
        form.instructies.split("\n").filter(Boolean)
      );
      setForm((f) => ({ ...f, ...result }));
    } catch {
      setError("AI service niet beschikbaar");
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return <div className="p-4 text-gray-400 text-sm">Laden...</div>;
  if (error && !recipe) return (
    <div className="p-4">
      <button onClick={() => navigate(-1)} className="text-brand text-sm mb-4">← Terug</button>
      <p className="text-red-600 text-sm">{error}</p>
    </div>
  );

  const r = editing ? form : recipe;

  return (
    <div className="p-4 pb-24">
      <button onClick={() => navigate(-1)} className="text-brand text-sm mb-4 flex items-center gap-1">
        ← Terug
      </button>

      {!editing ? (
        <>
          <div className="flex items-start gap-3 mb-4">
            <span className="text-3xl">{CATEGORY_EMOJI[recipe.categorie] || "🍴"}</span>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">{recipe.naam}</h1>
              <p className="text-gray-500 text-sm capitalize">{recipe.categorie}{recipe.vlees_type ? ` · ${recipe.vlees_type}` : ""}</p>
            </div>
            <button
              onClick={() => setEditing(true)}
              className="text-sm text-gray-500 border border-gray-200 rounded-lg px-3 py-1"
            >
              ✏️ Bewerk
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {recipe.kcal && <Stat label="Calorieën" value={`${recipe.kcal} kcal`} color="blue" />}
            {recipe.eiwit_g && <Stat label="Eiwit" value={`${recipe.eiwit_g}g`} color="green" />}
            {recipe.vet_g && <Stat label="Vet" value={`${recipe.vet_g}g`} color="orange" />}
            {recipe.koolhydraten_g && <Stat label="Koolhydraten" value={`${recipe.koolhydraten_g}g`} color="purple" />}
          </div>

          {recipe.beschrijving && (
            <Section title="Beschrijving">
              <p className="text-gray-700 text-sm whitespace-pre-wrap">{recipe.beschrijving}</p>
            </Section>
          )}

          <Section title="Bereiding">
            {recipe.instructies ? (
              <p className="text-gray-700 text-sm whitespace-pre-wrap">{recipe.instructies}</p>
            ) : (
              <p className="text-gray-400 text-sm italic">
                Nog geen instructies. Klik op Bewerk om ze toe te voegen.
              </p>
            )}
          </Section>
        </>
      ) : (
        <div className="flex flex-col gap-3">
          <h1 className="text-xl font-bold text-gray-900">Recept bewerken</h1>
          {error && <p className="text-red-600 text-xs">{error}</p>}

          <Field label="Naam">
            <input className={inputClass} value={form.naam || ""} onChange={(e) => setForm((f) => ({ ...f, naam: e.target.value }))} />
          </Field>

          <Field label="Categorie">
            <select className={inputClass} value={form.categorie || ""} onChange={(e) => setForm((f) => ({ ...f, categorie: e.target.value }))}>
              <option value="ontbijt">Ontbijt</option>
              <option value="lunch">Lunch</option>
              <option value="diner">Diner</option>
              <option value="snack">Snack</option>
            </select>
          </Field>

          <Field label="Beschrijving">
            <textarea className={`${inputClass} h-16 resize-none`} value={form.beschrijving || ""} onChange={(e) => setForm((f) => ({ ...f, beschrijving: e.target.value }))} placeholder="Korte omschrijving..." />
          </Field>

          <Field label="Bereiding / ingrediënten">
            <textarea className={`${inputClass} h-40 resize-none`} value={form.instructies || ""} onChange={(e) => setForm((f) => ({ ...f, instructies: e.target.value }))} placeholder={"Stap 1: ...\nStap 2: ...\n\nOf per ingrediënt:\n450g gehakt\n..."} />
          </Field>

          <div className="grid grid-cols-2 gap-2">
            {[["kcal","Kcal","number"],["eiwit_g","Eiwit (g)","number"],["vet_g","Vet (g)","number"],["koolhydraten_g","KH (g)","number"]].map(([key, label, type]) => (
              <Field key={key} label={label}>
                <input className={inputClass} type={type} value={form[key] ?? ""} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value ? Number(e.target.value) : null }))} />
              </Field>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAiFill}
            disabled={aiLoading || saving}
            className="border border-gray-200 text-gray-700 text-sm font-medium py-2 rounded-lg disabled:opacity-50"
          >
            {aiLoading ? "AI bezig..." : "🤖 Macro's schatten op basis van instructies"}
          </button>

          <div className="flex gap-2">
            <button onClick={() => { setEditing(false); setForm(recipe); setError(null); }} className="flex-1 border border-gray-200 text-gray-700 text-sm font-medium py-2 rounded-lg">
              Annuleer
            </button>
            <button onClick={handleSave} disabled={saving} className="flex-1 bg-green-600 text-white text-sm font-semibold py-2 rounded-lg disabled:opacity-50">
              {saving ? "Opslaan..." : "Opslaan"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, color }) {
  const colors = { blue: "bg-blue-50 text-blue-700", green: "bg-green-50 text-green-700", orange: "bg-orange-50 text-orange-700", purple: "bg-purple-50 text-purple-700" };
  return (
    <div className={`${colors[color]} rounded-xl p-3 text-center`}>
      <p className="text-xs font-semibold opacity-70">{label}</p>
      <p className="text-base font-bold">{value}</p>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-3 shadow-sm">
      <p className="text-xs font-bold text-gray-400 uppercase mb-2">{title}</p>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <p className="text-xs text-gray-500 font-semibold mb-1">{label}</p>
      {children}
    </div>
  );
}

const inputClass = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500";
