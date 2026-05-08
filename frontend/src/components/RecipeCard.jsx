import { Link } from "react-router-dom";

const CATEGORY_EMOJI = { ontbijt: "🥣", lunch: "🥗", diner: "🍽️", snack: "🍎" };
const CATEGORY_BG = {
  ontbijt: "bg-amber-50",
  lunch: "bg-sky-50",
  diner: "bg-emerald-50",
  snack: "bg-rose-50",
};

export default function RecipeCard({ recipe, onDelete }) {
  return (
    <Link
      to={`/recepten/${recipe.id}`}
      className="bg-white rounded-2xl shadow-card flex items-center gap-3 px-4 py-3 active:scale-95 transition-transform"
    >
      <div className={`w-10 h-10 rounded-xl ${CATEGORY_BG[recipe.categorie] || "bg-gray-50"} flex items-center justify-center text-xl flex-shrink-0`}>
        {CATEGORY_EMOJI[recipe.categorie] || "🍴"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm truncate">{recipe.naam}</p>
        <p className="text-gray-400 text-xs mt-0.5">
          {recipe.vlees_type && <span>{recipe.vlees_type} · </span>}
          {recipe.eiwit_g && <span className="text-green-600 font-medium">{Math.round(recipe.eiwit_g)}g eiwit</span>}
          {recipe.kcal && <span> · {recipe.kcal} kcal</span>}
        </p>
      </div>
      {onDelete && (
        <button
          onClick={(e) => { e.preventDefault(); onDelete(recipe.id); }}
          className="text-gray-300 hover:text-red-400 text-lg w-7 h-7 flex items-center justify-center flex-shrink-0"
          aria-label="Verwijder recept"
        >
          ×
        </button>
      )}
    </Link>
  );
}
