import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Recipes from "./pages/Recipes";
import WeekPlan from "./pages/WeekPlan";

export default function App() {
  return (
    <BrowserRouter>
      <div className="max-w-md mx-auto min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recepten" element={<Recipes />} />
          <Route path="/weekplan" element={<WeekPlan />} />
        </Routes>
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 flex">
          <Link to="/" className="flex-1 py-3 text-center text-xs text-gray-500 hover:text-brand flex flex-col items-center gap-0.5">
            <span className="text-lg">🏠</span>Home
          </Link>
          <Link to="/recepten" className="flex-1 py-3 text-center text-xs text-gray-500 hover:text-brand flex flex-col items-center gap-0.5">
            <span className="text-lg">📖</span>Recepten
          </Link>
          <Link to="/weekplan" className="flex-1 py-3 text-center text-xs text-gray-500 hover:text-brand flex flex-col items-center gap-0.5">
            <span className="text-lg">📅</span>Week
          </Link>
        </nav>
      </div>
    </BrowserRouter>
  );
}
