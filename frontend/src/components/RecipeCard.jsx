import { Link } from "react-router-dom";

const CATEGORY_EMOJI = {
  ontbijt: "🥣",
  lunch: "🥗",
  diner: "🍽️",
  snack: "🍎",
};

export default function RecipeCard({ recipe, onDelete }) {
  return (
    <Link
      to={`/recepten/${recipe.id}`}
      className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3 shadow-sm active:bg-gray-50"
    >
      <span className="text-2xl">{CATEGORY_EMOJI[recipe.categorie] || "🍴"}</span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm truncate">{recipe.naam}</p>
        <p className="text-gray-400 text-xs">
          {recipe.vlees_type && `${recipe.vlees_type} · `}
          {recipe.eiwit_g && `${Math.round(recipe.eiwit_g)}g eiwit`}
          {recipe.kcal && ` · ${recipe.kcal} kcal`}
        </p>
      </div>
      {onDelete && (
        <button
          onClick={(e) => { e.preventDefault(); onDelete(recipe.id); }}
          className="text-gray-300 hover:text-red-400 text-lg px-1"
          aria-label="Verwijder recept"
        >
          ×
        </button>
      )}
    </Link>
  );
}
