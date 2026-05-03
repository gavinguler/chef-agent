import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
});

export const getRecipes = (search = "") =>
  api.get(`/api/recipes${search ? `?search=${search}` : ""}`).then((r) => r.data);

export const createRecipe = (data) =>
  api.post("/api/recipes", data).then((r) => r.data);

export const deleteRecipe = (id) =>
  api.delete(`/api/recipes/${id}`);

export const getWeekPlan = (week) =>
  api.get(`/api/meal-plans/week/${week}`).then((r) => r.data);

export const getShoppingList = (week) =>
  api.get(`/api/shopping/week/${week}`).then((r) => r.data);

export const aiFillMacros = (naam, ingredienten) =>
  api.post("/api/recipes/ai-fill-macros", { naam, ingredienten }).then((r) => r.data);
