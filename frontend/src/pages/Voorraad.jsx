import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Minus, Sparkles, ChevronRight } from "lucide-react";
import {
  getStockBalances, addStockDirect, deductStockDirect, suggestRecipeFromStock,
  getRecipes,
} from "../api/client";
import {
  IOSStatusBar, IOSLargeHeader, IOSGroupHeader, IOSGroup, IOSTabBar,
} from "../components/IOSPrimitives";
import DesktopShell from "../components/DesktopShell";

function scoreRecipe(recipe, balanceNames) {
  const lines = (recipe.ingredienten || "").split("\n").map(l => l.trim().toLowerCase()).filter(Boolean);
  if (!lines.length) return 0;
  const matches = lines.filter(line => balanceNames.some(name => line.includes(name))).length;
  return matches / lines.length;
}

export default function Voorraad() {
  const navigate = useNavigate();
  const [balances, setBalances] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suggesting, setSuggesting] = useState(false);
  const [adjusting, setAdjusting] = useState({});

  async function loadBalances() {
    try {
      const data = await getStockBalances();
      setBalances((data || []).filter(b => b.quantity > 0));
    } catch {
      setBalances([]);
    }
  }

  useEffect(() => {
    Promise.all([loadBalances(), getRecipes().then(setRecipes).catch(() => {})])
      .finally(() => setLoading(false));
  }, []);

  const balanceNames = useMemo(() => balances.map(b => b.product_name.toLowerCase()), [balances]);

  const rankedRecipes = useMemo(() => {
    return recipes
      .map(r => ({ ...r, score: scoreRecipe(r, balanceNames) }))
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }, [recipes, balanceNames]);

  async function handleAdd(productId) {
    setAdjusting(a => ({ ...a, [productId]: true }));
    try {
      await addStockDirect(productId, 1);
      await loadBalances();
    } finally {
      setAdjusting(a => ({ ...a, [productId]: false }));
    }
  }

  async function handleDeduct(productId) {
    setAdjusting(a => ({ ...a, [productId]: true }));
    try {
      await deductStockDirect(productId, 1);
      await loadBalances();
    } finally {
      setAdjusting(a => ({ ...a, [productId]: false }));
    }
  }

  async function handleSuggest() {
    setSuggesting(true);
    try {
      const result = await suggestRecipeFromStock();
      navigate('/recepten/nieuw', { state: { prefill: result } });
    } catch {
      // not enough orphaned stock — button shouldn't have been shown
    } finally {
      setSuggesting(false);
    }
  }

  const StockRow = ({ item }) => (
    <div className="flex items-center gap-3 px-4 py-[11px] border-b border-[rgba(60,60,67,0.08)] last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-[15px] text-ink font-medium truncate">{item.product_name}</p>
        <p className="text-[12px] text-ink2">{item.quantity}x op voorraad</p>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleDeduct(item.product_id)}
          disabled={adjusting[item.product_id]}
          className="w-[30px] h-[30px] rounded-full flex items-center justify-center disabled:opacity-40"
          style={{ background: 'rgba(255,59,48,0.1)', color: '#ff3b30' }}
        >
          <Minus size={14} />
        </button>
        <span className="w-[28px] text-center text-[15px] font-semibold text-ink">{item.quantity}</span>
        <button
          onClick={() => handleAdd(item.product_id)}
          disabled={adjusting[item.product_id]}
          className="w-[30px] h-[30px] rounded-full flex items-center justify-center disabled:opacity-40"
          style={{ background: 'rgba(52,199,89,0.12)', color: '#34c759' }}
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );

  const RecipeMatchRow = ({ recipe, last }) => (
    <div
      onClick={() => navigate(`/recepten/${recipe.id}`)}
      className="flex items-center gap-3 px-4 py-[11px] cursor-pointer active:bg-black/[0.03]"
      style={{ borderBottom: last ? 'none' : '0.5px solid rgba(60,60,67,0.08)' }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-[15px] text-ink font-medium truncate">{recipe.naam}</p>
        <p className="text-[12px] text-ink2">{recipe.categorie}</p>
      </div>
      <div className="flex items-center gap-2">
        <span
          className="text-[11px] font-semibold px-2 py-[2px] rounded-full"
          style={{ background: 'rgba(31,122,77,0.1)', color: '#1f7a4d' }}
        >
          {Math.round(recipe.score * 100)}% in huis
        </span>
        <ChevronRight size={14} className="text-ink3" />
      </div>
    </div>
  );

  const Content = () => (
    <>
      <IOSGroupHeader>{balances.length} producten op voorraad</IOSGroupHeader>
      <IOSGroup>
        {loading ? (
          <div className="h-32 animate-pulse" />
        ) : balances.length === 0 ? (
          <div className="px-4 py-8 text-center text-ink2 text-[14px]">Geen voorraad gevonden</div>
        ) : (
          balances.map(item => <StockRow key={item.product_id} item={item} />)
        )}
      </IOSGroup>

      {balances.length >= 3 && (
        <div className="px-4 mt-2 mb-1">
          <button
            onClick={suggesting ? undefined : handleSuggest}
            disabled={suggesting}
            className="w-full flex items-center justify-center gap-2 py-[11px] rounded-[12px] text-[15px] font-semibold disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #af52de, #5856d6)', color: '#fff' }}
          >
            <Sparkles size={16} />
            {suggesting ? "Bezig…" : "Suggereer recept op basis van voorraad"}
          </button>
        </div>
      )}

      {rankedRecipes.length > 0 && (
        <>
          <IOSGroupHeader>Wat kun je maken?</IOSGroupHeader>
          <IOSGroup>
            {rankedRecipes.map((r, i) => (
              <RecipeMatchRow key={r.id} recipe={r} last={i === rankedRecipes.length - 1} />
            ))}
          </IOSGroup>
        </>
      )}
    </>
  );

  return (
    <>
      {/* ── Mobile ── */}
      <div className="lg:hidden min-h-screen bg-bg pb-[100px]">
        <IOSStatusBar />
        <IOSLargeHeader title="Voorraad" />
        <Content />
        <IOSTabBar />
      </div>

      {/* ── Desktop ── */}
      <div className="hidden lg:block">
        <DesktopShell
          title="Voorraad"
          subtitle={`${balances.length} producten op voorraad`}
        >
          <div className="max-w-2xl mx-auto p-5">
            <Content />
          </div>
        </DesktopShell>
      </div>
    </>
  );
}
