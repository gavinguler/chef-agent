import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
});

export const getRecipes = (search = "") =>
  api.get(`/api/recipes${search ? `?search=${encodeURIComponent(search)}` : ""}`).then((r) => r.data);

export const createRecipe = (data) =>
  api.post("/api/recipes", data).then((r) => r.data);

export const deleteRecipe = (id) =>
  api.delete(`/api/recipes/${id}`);

export const getRecipe = (id) =>
  api.get(`/api/recipes/${id}`).then((r) => r.data);

export const updateRecipe = (id, data) =>
  api.put(`/api/recipes/${id}`, data).then((r) => r.data);

export const getCurrentWeek = () =>
  api.get("/api/meal-plans/current-week").then((r) => r.data.week);

export const getWeekPlan = (week) =>
  api.get(`/api/meal-plans/week/${week}`).then((r) => r.data);

export const getShoppingList = (week) =>
  api.get(`/api/shopping/week/${week}`).then((r) => r.data);

export const aiFillMacros = (naam, ingredienten) =>
  api.post("/api/recipes/ai-fill-macros", { naam, ingredienten }).then((r) => r.data);

export const getNotificationSettings = () =>
  api.get("/api/notifications/settings").then((r) => r.data);

export const updateNotificationSettings = (data) =>
  api.put("/api/notifications/settings", data).then((r) => r.data);

export const testDailyMessage = () =>
  api.post("/api/notifications/test-daily").then((r) => r.data);

export const testShoppingReminder = () =>
  api.post("/api/notifications/test-shopping").then((r) => r.data);
