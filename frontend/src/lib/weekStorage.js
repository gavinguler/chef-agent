const KEY = "currentCycleWeek";
export const getStoredWeek = () => {
  const v = localStorage.getItem(KEY);
  return v ? parseInt(v, 10) : null;
};
export const setStoredWeek = (w) => localStorage.setItem(KEY, String(w));
export const clearStoredWeek = () => localStorage.removeItem(KEY);
