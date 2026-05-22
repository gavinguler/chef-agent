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

export const toggleShoppingItem = (week, itemId) =>
  api.patch(`/api/shopping/week/${week}/items/${itemId}/check`).then((r) => r.data);

export const aiFillMacros = (naam, ingredienten) =>
  api.post("/api/recipes/ai-fill-macros", { naam, ingredienten }).then((r) => r.data);

export const refreshRecipeImage = (id) =>
  api.post(`/api/recipes/${id}/refresh-image`).then((r) => r.data);

export const fillRecipeInstructions = (id) =>
  api.post(`/api/recipes/${id}/fill-instructions`).then((r) => r.data);

export const fillRecipeIngredients = (id) =>
  api.post(`/api/recipes/${id}/fill-ingredients`).then((r) => r.data);

export const fillAllIngredients = () =>
  api.post("/api/recipes/fill-all-ingredients").then((r) => r.data);

export const getNotificationSettings = () =>
  api.get("/api/notifications/settings").then((r) => r.data);

export const updateNotificationSettings = (data) =>
  api.put("/api/notifications/settings", data).then((r) => r.data);

export const testDailyMessage = () =>
  api.post("/api/notifications/test-daily").then((r) => r.data);

export const testShoppingReminder = () =>
  api.post("/api/notifications/test-shopping").then((r) => r.data);

export const enrichShoppingPrices = (week) =>
  api.post(`/api/shopping/week/${week}/enrich-prices`).then((r) => r.data);

export const getProductMappings = () =>
  api.get("/api/product-mappings").then((r) => r.data);

export const upsertProductMapping = (ingredient_name, bonnetjes_product_id, bonnetjes_product_name) =>
  api.put("/api/product-mappings", { ingredient_name, bonnetjes_product_id, bonnetjes_product_name }).then((r) => r.data);

export const deleteProductMapping = (ingredient_name) =>
  api.delete(`/api/product-mappings/${encodeURIComponent(ingredient_name)}`);

export const searchBonnetjesProducts = (q) =>
  api.get("/api/product-mappings/bonnetjes-search", { params: { q } }).then((r) => r.data);

export const resolveIngredientPrices = (names) =>
  api.post("/api/product-mappings/resolve-prices", names).then((r) => r.data);
