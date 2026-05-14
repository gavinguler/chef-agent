import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Home from "./pages/Home";
import Recipes from "./pages/Recipes";
import WeekPlan from "./pages/WeekPlan";
import RecipeDetail from "./pages/RecipeDetail";
import Settings from "./pages/Settings";

const navClass = ({ isActive }) =>
  `flex-1 py-3 text-center text-xs flex flex-col items-center gap-0.5 ${isActive ? "text-brand" : "text-gray-500 hover:text-brand"}`;

export default function App() {
  return (
    <BrowserRouter>
      <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recepten" element={<Recipes />} />
          <Route path="/recepten/:id" element={<RecipeDetail />} />
          <Route path="/weekplan" element={<WeekPlan />} />
          <Route path="/instellingen" element={<Settings />} />
        </Routes>
        <nav aria-label="Hoofdnavigatie" className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 flex">
          <NavLink to="/" end className={navClass}>
            <span aria-hidden="true" className="text-lg">🏠</span>Home
          </NavLink>
          <NavLink to="/recepten" className={navClass}>
            <span aria-hidden="true" className="text-lg">📖</span>Recepten
          </NavLink>
          <NavLink to="/weekplan" className={navClass}>
            <span aria-hidden="true" className="text-lg">📅</span>Week
          </NavLink>
          <NavLink to="/instellingen" className={navClass}>
            <span aria-hidden="true" className="text-lg">⚙️</span>Instellingen
          </NavLink>
        </nav>
      </div>
    </BrowserRouter>
  );
}
