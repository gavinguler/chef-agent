import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/Home";
import Recipes from "./pages/Recipes";
import WeekPlan from "./pages/WeekPlan";
import RecipeDetail from "./pages/RecipeDetail";
import SettingsPage from "./pages/Settings";
import Shopping from "./pages/Shopping";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/recepten" element={<Recipes />} />
        <Route path="/recepten/:id" element={<RecipeDetail />} />
        <Route path="/weekplan" element={<WeekPlan />} />
        <Route path="/instellingen" element={<SettingsPage />} />
        <Route path="/boodschappen" element={<Shopping />} />
        <Route path="/boodschappen/:week" element={<Shopping />} />
      </Routes>
    </BrowserRouter>
  );
}
