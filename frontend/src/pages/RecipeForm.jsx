import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { getRecipe, createRecipe, updateRecipe, aiFillMacros } from "../api/client";
import {
  IOSStatusBar, IOSLargeHeader, IOSGroupHeader, IOSGroup, IOSTabBar,
} from "../components/IOSPrimitives";
import DesktopShell from "../components/DesktopShell";

const CATEGORIEEN = ["diner", "lunch", "ontbijt", "snack", "veggie"];
const CAT_LABEL = { diner: "Diner", lunch: "Lunch", ontbijt: "Ontbijt", snack: "Snack", veggie: "Veggie" };

const EMPTY = {
  naam: "", categorie: "diner", beschrijving: "", ingredienten: "", instructies: "",
  kcal: "", eiwit_g: "", vet_g: "", koolhydraten_g: "", vlees_type: "",
};

function toFormValues(r) {
  return {
    naam: r.naam ?? "",
    categorie: r.categorie ?? "diner",
    beschrijving: r.beschrijving ?? "",
    ingredienten: r.ingredienten ?? "",
    instructies: r.instructies ?? "",
    kcal: r.kcal ?? "",
    eiwit_g: r.eiwit_g ?? "",
    vet_g: r.vet_g ?? "",
    koolhydraten_g: r.koolhydraten_g ?? "",
    vlees_type: r.vlees_type ?? "",
  };
}

function toPayload(form) {
  return {
    naam: form.naam,
    categorie: form.categorie || null,
    beschrijving: form.beschrijving || null,
    ingredienten: form.ingredienten || null,
    instructies: form.instructies || null,
    kcal: form.kcal !== "" ? Number(form.kcal) : null,
    eiwit_g: form.eiwit_g !== "" ? Number(form.eiwit_g) : null,
    vet_g: form.vet_g !== "" ? Number(form.vet_g) : null,
    koolhydraten_g: form.koolhydraten_g !== "" ? Number(form.koolhydraten_g) : null,
    vlees_type: form.vlees_type || null,
    bron: "handmatig",
  };
}

const inputCls = "w-full bg-transparent text-[17px] text-ink outline-none placeholder:text-ink3";
const textareaCls = "w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-ink3 resize-none";

export default function RecipeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isEdit) return;
    getRecipe(id).then(r => setForm(toFormValues(r))).finally(() => setLoading(false));
  }, [id, isEdit]);

  function set(field, val) {
    setForm(f => ({ ...f, [field]: val }));
  }

  async function save() {
    if (!form.naam.trim()) { setError("Naam is verplicht"); return; }
    setSaving(true);
    setError(null);
    try {
      const payload = toPayload(form);
      const saved = isEdit ? await updateRecipe(id, payload) : await createRecipe(payload);
      navigate(`/recepten/${saved.id}`);
    } catch {
      setError("Opslaan mislukt. Probeer opnieuw.");
      setSaving(false);
    }
  }

  async function handleAiFill() {
    setAiLoading(true);
    try {
      const result = await aiFillMacros(form.naam, (form.ingredienten || "").split("\n").filter(Boolean));
      setForm(f => ({ ...f, ...Object.fromEntries(
        Object.entries(result).filter(([, v]) => v != null).map(([k, v]) => [k, v])
      )}));
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

  const title = isEdit ? "Bewerken" : "Nieuw recept";

  const MacroGrid = () => (
    <div className="grid grid-cols-2">
      {[
        { field: "kcal", label: "Calorieën", unit: "kcal" },
        { field: "eiwit_g", label: "Eiwit", unit: "g" },
        { field: "vet_g", label: "Vet", unit: "g" },
        { field: "koolhydraten_g", label: "Koolhyd.", unit: "g" },
      ].map(({ field, label, unit }, i) => (
        <div
          key={field}
          className="px-4 py-[11px]"
          style={{
            borderRight: i % 2 === 0 ? '0.5px solid rgba(60,60,67,0.12)' : 'none',
            borderBottom: i < 2 ? '0.5px solid rgba(60,60,67,0.12)' : 'none',
          }}
        >
          <p className="text-[11px] text-ink2 mb-1">{label}</p>
          <div className="flex items-baseline gap-1">
            <input
              type="number"
              inputMode="decimal"
              className="w-full bg-transparent text-[17px] text-ink font-semibold outline-none"
              placeholder="—"
              value={form[field]}
              onChange={e => set(field, e.target.value)}
            />
            <span className="text-[13px] text-ink2 flex-shrink-0">{unit}</span>
          </div>
        </div>
      ))}
    </div>
  );

  const FormFields = () => (
    <>
      <IOSGroupHeader>Naam</IOSGroupHeader>
      <IOSGroup>
        <div className="px-4 py-[11px]">
          <input
            className={inputCls}
            placeholder="Naam recept…"
            value={form.naam}
            onChange={e => set("naam", e.target.value)}
            autoFocus={!isEdit}
          />
        </div>
      </IOSGroup>

      <IOSGroupHeader>Categorie</IOSGroupHeader>
      <IOSGroup>
        <div className="px-4 py-3 flex gap-[6px] flex-wrap">
          {CATEGORIEEN.map(c => (
            <button
              key={c}
              onClick={() => set("categorie", c)}
              className="px-3 py-[5px] rounded-full text-[13px] font-semibold transition-colors"
              style={form.categorie === c
                ? { background: '#1f7a4d', color: '#fff' }
                : { background: 'rgba(120,120,128,0.16)', color: 'rgba(60,60,67,0.7)' }
              }
            >
              {CAT_LABEL[c]}
            </button>
          ))}
        </div>
      </IOSGroup>

      <IOSGroupHeader>Beschrijving</IOSGroupHeader>
      <IOSGroup>
        <div className="px-4 py-[11px]">
          <textarea
            className={textareaCls}
            placeholder="Korte omschrijving…"
            rows={2}
            value={form.beschrijving}
            onChange={e => set("beschrijving", e.target.value)}
          />
        </div>
      </IOSGroup>

      <IOSGroupHeader>Ingrediënten</IOSGroupHeader>
      <IOSGroup footer="Één ingrediënt per regel">
        <div className="px-4 py-[11px]">
          <textarea
            className={textareaCls}
            placeholder={"200g kipfilet\n150g rijst\n1 el olijfolie"}
            rows={5}
            value={form.ingredienten}
            onChange={e => set("ingredienten", e.target.value)}
          />
        </div>
      </IOSGroup>

      <IOSGroupHeader>Bereiding</IOSGroupHeader>
      <IOSGroup>
        <div className="px-4 py-[11px]">
          <textarea
            className={textareaCls}
            placeholder={"Stap 1: …\nStap 2: …"}
            rows={6}
            value={form.instructies}
            onChange={e => set("instructies", e.target.value)}
          />
        </div>
      </IOSGroup>

      <IOSGroupHeader>Macro's</IOSGroupHeader>
      <IOSGroup>
        <MacroGrid />
      </IOSGroup>

      <IOSGroupHeader>Vlees type</IOSGroupHeader>
      <IOSGroup footer="Optioneel — bijv. kip, rund, vis, lam">
        <div className="px-4 py-[11px]">
          <input
            className={inputCls}
            placeholder="bijv. kip, rund, vis…"
            value={form.vlees_type}
            onChange={e => set("vlees_type", e.target.value)}
          />
        </div>
      </IOSGroup>

      <IOSGroupHeader>AI — Macro's schatten</IOSGroupHeader>
      <IOSGroup footer="Gebruikt de ingrediënten die je hierboven hebt ingevuld.">
        <div className="px-4 py-3">
          <button
            onClick={handleAiFill}
            disabled={aiLoading || (!form.ingredienten?.trim() && !form.naam.trim())}
            className="flex items-center gap-2 px-4 py-[9px] rounded-[9px] text-white text-[14px] font-semibold disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #af52de, #5856d6)' }}
          >
            <Sparkles size={15} />
            {aiLoading ? "Bezig…" : "Macro's schatten met AI"}
          </button>
        </div>
      </IOSGroup>

      {error && <p className="px-4 pt-2 pb-1 text-[14px] text-red-500">{error}</p>}
    </>
  );

  return (
    <>
      {/* ── Mobile ── */}
      <div className="lg:hidden min-h-screen bg-bg pb-[100px]">
        <IOSStatusBar />
        <IOSLargeHeader
          title={title}
          onBack={() => navigate(-1)}
          accessory={
            <button
              onClick={save}
              disabled={saving}
              className="text-brand text-[17px] font-semibold disabled:opacity-40"
            >
              {saving ? "…" : "Opslaan"}
            </button>
          }
        />
        <FormFields />
        <IOSTabBar />
      </div>

      {/* ── Desktop ── */}
      <div className="hidden lg:block">
        <DesktopShell
          title={title}
          subtitle={isEdit ? "Recept bewerken" : "Nieuw recept toevoegen"}
          accessory={
            <div className="flex gap-2">
              <button
                onClick={() => navigate(-1)}
                className="px-3 py-[6px] rounded-[7px] text-[13px] font-medium"
                style={{ background: 'rgba(120,120,128,0.14)', color: 'rgba(60,60,67,0.7)' }}
              >
                Annuleren
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="px-4 py-[6px] rounded-[7px] bg-brand text-white text-[13px] font-semibold disabled:opacity-40"
              >
                {saving ? "Opslaan…" : "Opslaan"}
              </button>
            </div>
          }
        >
          <div className="flex h-full overflow-hidden">
            {/* Left: form */}
            <div className="flex-1 overflow-y-auto">
              <FormFields />
            </div>

            {/* Right: AI + macro preview */}
            <div
              className="w-[300px] flex-shrink-0 overflow-y-auto p-5 space-y-4"
              style={{ borderLeft: '0.5px solid rgba(60,60,67,0.08)', background: '#fafafa' }}
            >
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink2 mb-1">AI Macro's</p>
                <p className="text-[12px] text-ink2 mb-3">Vul eerst ingrediënten in het formulier in.</p>
                <button
                  onClick={handleAiFill}
                  disabled={aiLoading || (!form.ingredienten?.trim() && !form.naam.trim())}
                  className="w-full flex items-center justify-center gap-2 py-[9px] rounded-[8px] text-white text-[13px] font-semibold disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg, #af52de, #5856d6)' }}
                >
                  <Sparkles size={14} />
                  {aiLoading ? "Bezig…" : "Schatten"}
                </button>
              </div>

              {(form.kcal || form.eiwit_g || form.vet_g || form.koolhydraten_g) && (
                <div className="rounded-[10px] p-4" style={{ background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-ink2 mb-3">Huidige macro's</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Kcal", v: form.kcal, unit: "" },
                      { label: "Eiwit", v: form.eiwit_g, unit: "g" },
                      { label: "Vet", v: form.vet_g, unit: "g" },
                      { label: "Koolhyd.", v: form.koolhydraten_g, unit: "g" },
                    ].map(({ label, v, unit }) => (
                      <div key={label}>
                        <p className="text-[10px] text-ink2 uppercase tracking-wide">{label}</p>
                        <p className="text-[18px] font-bold text-ink">{v ? `${v}${unit}` : "—"}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </DesktopShell>
      </div>
    </>
  );
}
