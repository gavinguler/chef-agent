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

export const getStockStatus = (ingredientNames) =>
  api.post("/api/product-mappings/stock-status", ingredientNames).then((r) => r.data);

export const deductStock = (ingredientNames) =>
  api.post("/api/product-mappings/deduct-stock", ingredientNames).then((r) => r.data);

export const getStockBalances = () =>
  api.get("/api/product-mappings/stock-balances").then((r) => r.data);

export const addStockDirect = (productId, quantity = 1) =>
  api.post("/api/product-mappings/add-stock-direct", { product_id: productId, quantity }).then((r) => r.data);

export const deductStockDirect = (productId, quantity = 1) =>
  api.post("/api/product-mappings/deduct-stock-direct", { product_id: productId, quantity }).then((r) => r.data);

export const suggestRecipeFromStock = () =>
  api.post("/api/recipes/suggest-from-stock").then((r) => r.data);

export const generateWeekPlan = (mealTypes, lockedSlots = {}) =>
  api.post("/api/meal-plans/generate", { meal_types: mealTypes, locked_slots: lockedSlots }).then((r) => r.data);

export const applyWeekPlan = (week, slots) =>
  api.post(`/api/meal-plans/apply?week=${week}`, { slots }).then((r) => r.data);

export const getTemplates = () =>
  api.get("/api/templates").then((r) => r.data);

export const saveTemplate = (naam, slots) =>
  api.post("/api/templates", { naam, slots }).then((r) => r.data);

export const deleteTemplate = (id) =>
  api.delete(`/api/templates/${id}`);

export const applyTemplate = (id, week) =>
  api.post(`/api/templates/${id}/apply?week=${week}`).then((r) => r.data);

export const setMeal = (week, dag, mealType, receptId) =>
  api.put(`/api/meal-plans/week/${week}/dag/${dag}/maaltijd/${mealType}`, { recept_id: receptId }).then((r) => r.data);
