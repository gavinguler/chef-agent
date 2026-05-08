import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Home from "./pages/Home";
import Recipes from "./pages/Recipes";
import WeekPlan from "./pages/WeekPlan";
import RecipeDetail from "./pages/RecipeDetail";
import Settings from "./pages/Settings";

const navClass = ({ isActive }) =>
  `flex-1 py-2.5 text-center text-[10px] flex flex-col items-center gap-0.5 font-medium transition-colors ${
    isActive ? "text-brand" : "text-gray-400"
  }`;

export default function App() {
  return (
    <BrowserRouter>
      <div className="max-w-md mx-auto min-h-screen pb-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recepten" element={<Recipes />} />
          <Route path="/recepten/:id" element={<RecipeDetail />} />
          <Route path="/weekplan" element={<WeekPlan />} />
          <Route path="/instellingen" element={<Settings />} />
        </Routes>

        <nav
          aria-label="Hoofdnavigatie"
          className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/90 backdrop-blur-md border-t border-gray-200/80 flex"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <NavLink to="/" end className={navClass}>
            {({ isActive }) => (
              <>
                <svg width="22" height="22" viewBox="0 0 24 24" fill={isActive ? "#16a34a" : "none"} stroke={isActive ? "#16a34a" : "#9ca3af"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
                  <path d="M9 21V12h6v9"/>
                </svg>
                Home
              </>
            )}
          </NavLink>
          <NavLink to="/recepten" className={navClass}>
            {({ isActive }) => (
              <>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={isActive ? "#16a34a" : "#9ca3af"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
                </svg>
                Recepten
              </>
            )}
          </NavLink>
          <NavLink to="/weekplan" className={navClass}>
            {({ isActive }) => (
              <>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={isActive ? "#16a34a" : "#9ca3af"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                Week
              </>
            )}
          </NavLink>
          <NavLink to="/instellingen" className={navClass}>
            {({ isActive }) => (
              <>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={isActive ? "#16a34a" : "#9ca3af"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
                </svg>
                Instellingen
              </>
            )}
          </NavLink>
        </nav>
      </div>
    </BrowserRouter>
  );
}
