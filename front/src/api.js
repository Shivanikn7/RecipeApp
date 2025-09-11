const API = {
  register: async (username, email, password) => {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    return res.json();
  },
  login: async (email, password) => {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },
  addRecipe: async (token, recipe) => {
    const res = await fetch('/api/recipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(recipe),
    });
    return res.json();
  },
  // Save meal plan for a week
  saveMealPlan: async (token, weekStart, plan) => {
    const res = await fetch('/api/mealplans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ weekStart, plan }),
    });
    return res.json();
  },
  // Load all meal plans for user
  getMealPlans: async (token) => {
    const res = await fetch('/api/mealplans', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },
};
export default API;