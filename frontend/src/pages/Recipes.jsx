import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { getRecipes } from "../api/client";
import {
  IOSStatusBar, IOSLargeHeader, IOSGroupHeader, IOSGroup, IOSRow,
  IOSSearchField, IOSSegmented, IOSTabBar,
} from "../components/IOSPrimitives";
import DesktopShell from "../components/DesktopShell";

const FILTERS = ["Alle", "Diner", "Lunch", "Veggie"];

function useRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getRecipes().then(setRecipes).finally(() => setLoading(false));
  }, []);
  return { recipes, loading };
}

export default function Recipes() {
  const navigate = useNavigate();
  const { recipes, loading } = useRecipes();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Alle");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const filtered = useMemo(() => {
    return recipes.filter(r => {
      const matchSearch = !debounced || r.naam?.toLowerCase().includes(debounced.toLowerCase());
      const matchFilter = filter === "Alle"
        || (filter === "Diner" && r.categorie?.toLowerCase() === "diner")
        || (filter === "Lunch" && r.categorie?.toLowerCase() === "lunch")
        || (filter === "Veggie" && r.is_vegetarisch);
      return matchSearch && matchFilter;
    });
  }, [recipes, debounced, filter]);

  return (
    <>
      {/* ── Mobile ── */}
      <div className="lg:hidden min-h-screen bg-bg pb-[100px]">
        <IOSStatusBar />
        <IOSLargeHeader
          title="Recepten"
          accessory={
            <button className="w-[32px] h-[32px] rounded-full bg-brand flex items-center justify-center">
              <Plus size={20} className="text-white" />
            </button>
          }
        />

        <IOSSearchField placeholder="Zoek recepten..." value={search} onChange={setSearch} />
        <IOSSegmented items={FILTERS} value={filter} onChange={setFilter} />

        <IOSGroupHeader>{filtered.length} gerechten</IOSGroupHeader>
        <IOSGroup>
          {loading ? (
            <div className="h-32 animate-pulse" />
          ) : filtered.map((r, i) => (
            <IOSRow
              key={r.id}
              icon={
                r.image_url
                  ? <img src={r.image_url} alt={r.naam} className="w-full h-full object-cover rounded-[7px]" />
                  : <span className="text-[16px]">🍽️</span>
              }
              iconBg={r.image_url ? "transparent" : "#e5e5ea"}
              title={r.naam}
              sub={[r.categorie, r.eiwit_g ? `${Math.round(r.eiwit_g)}g eiwit` : null, r.kcal ? `${r.kcal} kcal` : null].filter(Boolean).join(' · ')}
              last={i === filtered.length - 1}
              onClick={() => navigate(`/recepten/${r.id}`)}
            />
          ))}
        </IOSGroup>

        <IOSTabBar />
      </div>

      {/* ── Desktop ── */}
      <div className="hidden lg:block">
        <DesktopShell
          title="Recepten"
          subtitle={`${filtered.length} gerechten`}
          accessory={
            <button className="flex items-center gap-2 px-4 py-2 rounded-[8px] bg-brand text-white text-[14px] font-semibold">
              <Plus size={16} />
              Nieuw recept
            </button>
          }
        >
          {/* Filter bar */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex gap-2">
              {FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="px-3 py-[6px] rounded-full text-[13px] font-medium transition-colors"
                  style={filter === f
                    ? { background: '#1f7a4d', color: '#fff' }
                    : { background: 'rgba(120,120,128,0.16)', color: 'rgba(60,60,67,0.6)' }
                  }
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="animate-pulse bg-surface rounded-[12px] h-64" />
          ) : (
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
              {filtered.map(r => (
                <div
                  key={r.id}
                  onClick={() => navigate(`/recepten/${r.id}`)}
                  className="bg-surface rounded-[12px] overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="h-[130px] bg-fill flex items-center justify-center">
                    {r.image_url
                      ? <img src={r.image_url} alt={r.naam} className="w-full h-full object-cover" />
                      : <span className="text-4xl">🍽️</span>
                    }
                  </div>
                  <div className="p-3">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-ink2">{r.categorie}</p>
                    <p className="text-[15px] font-semibold text-ink mt-1 leading-snug">{r.naam}</p>
                    <p className="text-[12px] text-ink2 mt-1">
                      {[r.eiwit_g ? `${Math.round(r.eiwit_g)}g eiwit` : null, r.kcal ? `${r.kcal} kcal` : null].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DesktopShell>
      </div>
    </>
  );
}
