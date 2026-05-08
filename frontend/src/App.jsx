import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { Home, BookOpen, Calendar, ShoppingCart, Settings } from "lucide-react";
import HomePage from "./pages/Home";
import Recipes from "./pages/Recipes";
import WeekPlan from "./pages/WeekPlan";
import RecipeDetail from "./pages/RecipeDetail";
import SettingsPage from "./pages/Settings";
import Shopping from "./pages/Shopping";

const NAV = [
  { to: "/", end: true, Icon: Home, label: "Home" },
  { to: "/recepten", Icon: BookOpen, label: "Recepten" },
  { to: "/weekplan", Icon: Calendar, label: "Week" },
  { to: "/boodschappen", Icon: ShoppingCart, label: "Boodschappen" },
  { to: "/instellingen", Icon: Settings, label: "Instellingen" },
];

export default function App() {
  return (
    <BrowserRouter>
      <div className="max-w-[402px] mx-auto min-h-screen relative">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/recepten" element={<Recipes />} />
          <Route path="/recepten/:id" element={<RecipeDetail />} />
          <Route path="/weekplan" element={<WeekPlan />} />
          <Route path="/instellingen" element={<SettingsPage />} />
          <Route path="/boodschappen" element={<Shopping />} />
          <Route path="/boodschappen/:week" element={<Shopping />} />
        </Routes>

        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[402px] bg-bg border-t border-line flex pb-7 pt-2">
          {NAV.map(({ to, end, Icon, label }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-[3px] ${isActive ? "text-brand" : "text-ink3"}`
              }>
              {({ isActive }) => (
                <>
                  <Icon size={22} strokeWidth={isActive ? 2 : 1.6} />
                  <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 500, letterSpacing: '0.2px' }}>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </BrowserRouter>
  );
}
