import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, Sparkles, Image } from "lucide-react";
import { getRecipe, aiFillMacros, refreshRecipeImage } from "../api/client";
import {
  IOSStatusBar, IOSLargeHeader, IOSGroupHeader, IOSGroup, IOSRow, IOSTabBar,
} from "../components/IOSPrimitives";
import DesktopShell, { Panel, Stat } from "../components/DesktopShell";

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  useEffect(() => {
    getRecipe(id).then(setRecipe).finally(() => setLoading(false));
  }, [id]);

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

  const macros = [
    { label: "Calorieën", value: recipe.kcal ? `${recipe.kcal} kcal` : "—" },
    { label: "Eiwit",     value: recipe.eiwit_g ? `${Math.round(recipe.eiwit_g)}g` : "—" },
    { label: "Vet",       value: recipe.vet_g ? `${Math.round(recipe.vet_g)}g` : "—" },
    { label: "Koolhydraten", value: recipe.koolhydraten_g ? `${Math.round(recipe.koolhydraten_g)}g` : "—" },
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
            className="absolute top-4 right-4 w-[34px] h-[34px] rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)' }}
          >
            <Star size={18} className="text-ink" />
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
              2 porties{recipe.bereidingstijd_min ? ` · ${recipe.bereidingstijd_min} min` : ""}
            </p>
          </div>

          <IOSGroupHeader>Macro's</IOSGroupHeader>
          <IOSGroup>
            {macros.map((m, i) => (
              <IOSRow key={m.label} title={m.label} detail={m.value} last={i === macros.length - 1} />
            ))}
          </IOSGroup>

          <IOSGroupHeader>Ingrediënten</IOSGroupHeader>
          <IOSGroup>
            {ingredienten.map((ing, i) => (
              <IOSRow key={i} title={ing} last={i === ingredienten.length - 1} />
            ))}
          </IOSGroup>

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
              icon={<Sparkles size={16} className="text-white" />}
              iconBg="#af52de"
              title="Macro's opnieuw schatten met AI"
              last
              onClick={aiLoading ? undefined : handleAiFill}
              detail={aiLoading ? "…" : undefined}
            />
          </IOSGroup>
        </div>

        <IOSTabBar />
      </div>

      {/* ── Desktop ── */}
      <div className="hidden lg:block">
        <DesktopShell
          title={recipe.naam}
          subtitle={recipe.categorie}
          accessory={
            <div className="flex gap-3">
              <button
                onClick={handleRefreshImage}
                disabled={imageLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-[8px] text-[14px] font-semibold text-white disabled:opacity-50"
                style={{ background: '#0a84ff' }}
              >
                <Image size={16} />
                {imageLoading ? "Bezig…" : "Foto genereren"}
              </button>
              <button
                onClick={handleAiFill}
                disabled={aiLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-[8px] text-[14px] font-semibold text-white disabled:opacity-50"
                style={{ background: '#af52de' }}
              >
                <Sparkles size={16} />
                {aiLoading ? "Bezig…" : "AI Macro's"}
              </button>
            </div>
          }
        >
          <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 360px' }}>
            {/* Left */}
            <div className="space-y-6">
              {recipe.image_url && (
                <div className="rounded-[12px] overflow-hidden h-[320px]">
                  <img src={recipe.image_url} alt={recipe.naam} className="w-full h-full object-cover" />
                </div>
              )}
              {bereidingSteps.length > 0 && (
                <div className="bg-surface rounded-[12px] p-6">
                  <p className="text-[13px] font-bold uppercase tracking-wide text-ink2 mb-4">Bereiding</p>
                  <ol className="space-y-3">
                    {bereidingSteps.map((step, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-brand text-white text-[12px] font-bold flex items-center justify-center flex-shrink-0 mt-px">
                          {i + 1}
                        </span>
                        <p className="text-[15px] text-ink leading-relaxed">{step}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>

            {/* Right */}
            <div className="space-y-4">
              <Panel title="Macro's">
                <div className="grid grid-cols-2 gap-4">
                  {macros.map(m => <Stat key={m.label} label={m.label} v={m.value} />)}
                </div>
              </Panel>
              <Panel title="Ingrediënten">
                {ingredienten.map((ing, i) => (
                  <div key={i} className={`py-[10px] text-[14px] text-ink ${i < ingredienten.length - 1 ? 'border-b border-sep' : ''}`}>
                    {ing}
                  </div>
                ))}
              </Panel>
            </div>
          </div>
        </DesktopShell>
      </div>
    </>
  );
}
