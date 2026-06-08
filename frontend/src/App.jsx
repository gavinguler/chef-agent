import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/Home";
import Recipes from "./pages/Recipes";
import WeekPlan from "./pages/WeekPlan";
import WeekPlanGenerator from "./pages/WeekPlanGenerator";
import RecipeDetail from "./pages/RecipeDetail";
import RecipeForm from "./pages/RecipeForm";
import SettingsPage from "./pages/Settings";
import Shopping from "./pages/Shopping";
import Voorraad from "./pages/Voorraad";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/recepten" element={<Recipes />} />
        <Route path="/recepten/nieuw" element={<RecipeForm />} />
        <Route path="/recepten/:id" element={<RecipeDetail />} />
        <Route path="/recepten/:id/bewerken" element={<RecipeForm />} />
        <Route path="/weekplan" element={<WeekPlan />} />
        <Route path="/weekplan/genereren" element={<WeekPlanGenerator />} />
        <Route path="/instellingen" element={<SettingsPage />} />
        <Route path="/boodschappen" element={<Shopping />} />
        <Route path="/boodschappen/:week" element={<Shopping />} />
        <Route path="/voorraad" element={<Voorraad />} />
      </Routes>
    </BrowserRouter>
  );
}
