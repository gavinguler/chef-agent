import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { getRecipes } from "../api/client";
import {
  IOSStatusBar, IOSLargeHeader, IOSGroupHeader, IOSGroup, IOSRow,
  IOSSearchField, IOSSegmented, IOSTabBar,
} from "../components/IOSPrimitives";
import DesktopShell, { DesktopSearch } from "../components/DesktopShell";

const FILTERS = ["Alle", "Diner", "Lunch", "Ontbijt", "Snack", "Veggie"];

function useRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getRecipes().then(setRecipes).finally(() => setLoading(false));
  }, []);
  return { recipes, loading };
}

function SidebarFilterGroup({ title, items, onSelect }) {
  return (
    <div className="mb-5">
      <p className="text-[11px] font-bold uppercase tracking-wide text-ink2 mb-2">{title}</p>
      {items.map(({ label, count, active }) => (
        <button
          key={label}
          onClick={() => onSelect(label)}
          className="w-full flex items-center gap-2 px-2 py-[5px] rounded-[5px] text-left transition-colors"
          style={{ background: active ? 'rgba(0,0,0,0.05)' : 'transparent' }}
        >
          <div
            className="w-[14px] h-[14px] rounded-[3px] flex-shrink-0 flex items-center justify-center"
            style={active
              ? { background: '#1f7a4d' }
              : { border: '1.5px solid rgba(60,60,67,0.3)' }
            }
          >
            {active && (
              <svg width="10" height="10" viewBox="0 0 10 10">
                <path d="M1.5 5l2 2 5-5" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" />
              </svg>
            )}
          </div>
          <span className="flex-1 text-[13px]" style={{ color: active ? '#000' : 'rgba(60,60,67,0.8)', fontWeight: active ? 600 : 500 }}>
            {label}
          </span>
          {count > 0 && (
            <span className="text-[11px] text-ink2">{count}</span>
          )}
        </button>
      ))}
    </div>
  );
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
      const matchFilter = filter === "Alle" || r.categorie?.toLowerCase() === filter.toLowerCase();
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
            <button
              onClick={() => navigate('/recepten/nieuw')}
              className="w-[32px] h-[32px] rounded-full bg-brand flex items-center justify-center"
            >
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
              sub={[r.categorie, r.eiwit_g ? `${Math.round(r.eiwit_g / (r.porties || 1))}g eiwit` : null, r.kcal ? `${Math.round(r.kcal / (r.porties || 1))} kcal` : null].filter(Boolean).join(' · ')}
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
          subtitle={`${filtered.length} gerechten in je bibliotheek`}
          accessory={
            <div className="flex items-center gap-2">
              <DesktopSearch value={search} onChange={setSearch} placeholder="Zoek recepten…" />
              <button
                onClick={() => navigate('/recepten/nieuw')}
                className="flex items-center gap-1.5 px-3 py-[6px] rounded-[7px] bg-brand text-white text-[13px] font-semibold"
              >
                <Plus size={14} /> Nieuw recept
              </button>
            </div>
          }
        >
          <div className="flex h-full">
            {/* Filter sidebar */}
            <aside
              className="flex-shrink-0 overflow-y-auto"
              style={{ width: 200, padding: '20px 14px', borderRight: '0.5px solid rgba(60,60,67,0.1)' }}
            >
              <SidebarFilterGroup
                title="Categorie"
                items={FILTERS.map(f => ({
                  label: f,
                  count: f === 'Alle' ? recipes.length : recipes.filter(r => r.categorie?.toLowerCase() === f.toLowerCase()).length,
                  active: filter === f,
                }))}
                onSelect={setFilter}
              />
            </aside>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {/* Filter chips */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-2 flex-wrap">
                  {FILTERS.map(f => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className="px-3 py-[5px] rounded-full text-[12px] font-semibold transition-colors"
                      style={filter === f
                        ? { background: '#1f3a2c', color: '#fff' }
                        : { background: 'rgba(120,120,128,0.14)', color: 'rgba(60,60,67,0.7)' }
                      }
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <span className="text-[12px] text-ink2 flex-shrink-0 ml-4">
                  Sorteer: <strong className="text-ink">Recent ↓</strong>
                </span>
              </div>

              {loading ? (
                <div className="animate-pulse bg-surface rounded-[12px] h-64" />
              ) : (
                <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))' }}>
                  {filtered.map(r => (
                    <div
                      key={r.id}
                      onClick={() => navigate(`/recepten/${r.id}`)}
                      className="bg-surface rounded-[10px] overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                      style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
                    >
                      <div className="h-[130px] bg-fill flex items-center justify-center">
                        {r.image_url
                          ? <img src={r.image_url} alt={r.naam} className="w-full h-full object-cover" />
                          : <span className="text-3xl">🍽️</span>
                        }
                      </div>
                      <div className="p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-brand">{r.categorie}</p>
                        <p className="text-[13px] font-semibold text-ink mt-1 leading-snug">{r.naam}</p>
                        <p className="text-[11px] text-ink2 mt-1">
                          {[r.eiwit_g ? `${Math.round(r.eiwit_g / (r.porties || 1))}g eiwit` : null, r.kcal ? `${Math.round(r.kcal / (r.porties || 1))} kcal` : null].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DesktopShell>
      </div>
    </>
  );
}
