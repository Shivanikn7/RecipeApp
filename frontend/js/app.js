// This file contains the JavaScript code for the frontend application, handling user interactions and making API requests.

document.addEventListener('DOMContentLoaded', () => {
    const apiUrl = '/api/auth'; // Base URL for API requests

    // Register User
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(registerForm);
            const data = Object.fromEntries(formData);

            try {
                const response = await fetch(`${apiUrl}/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });
                const result = await response.json();
                alert(result.message);
                if (response.ok) {
                    registerForm.reset();
                }
            } catch (error) {
                console.error('Error during registration:', error);
            }
        });
    }

    // Login User
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(loginForm);
            const data = Object.fromEntries(formData);

            try {
                const response = await fetch(`${apiUrl}/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });
                const result = await response.json();
                alert(result.message);
                if (response.ok) {
                    // Store token and redirect or update UI
                    localStorage.setItem('token', result.token);
                    window.location.href = '/dashboard'; // Redirect to dashboard or another page
                }
            } catch (error) {
                console.error('Error during login:', error);
            }
        });
    }

    // Fetch Recipes
    const fetchRecipes = async () => {
        try {
            const response = await fetch('/api/recipes', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            const recipes = await response.json();
            // Render recipes in the UI
            console.log(recipes);
        } catch (error) {
            console.error('Error fetching recipes:', error);
        }
    };

    // Call fetchRecipes on page load or specific event
    fetchRecipes();

    const dashboardSection = document.getElementById('dashboardSection');
    const authSection = document.getElementById('authSection');
    const userName = document.getElementById('userName');
    const tabBtns = document.querySelectorAll('.tabBtn');
    const tabContents = document.querySelectorAll('.tabContent');
    let token = null;

    // Show dashboard after login
    function showDashboard(username) {
        authSection.style.display = 'none';
        dashboardSection.style.display = 'block';
        userName.textContent = username;
        tabBtns[0].click();
        loadRecipes();
        loadMealPlans();
    }

    document.getElementById('logoutBtn').onclick = () => {
        token = null;
        dashboardSection.style.display = 'none';
        authSection.style.display = 'block';
        loginForm.style.display = 'flex';
        registerForm.style.display = 'none';
    };

    // Tab navigation
    tabBtns.forEach(btn => {
        btn.onclick = () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(tab => tab.style.display = 'none');
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab).style.display = 'block';
        };
    });

    // Auth logic
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginMsg = document.getElementById('loginMsg');
    const registerMsg = document.getElementById('registerMsg');
    const dashboardSection = document.getElementById('dashboardSection');
    const authSection = document.getElementById('authSection');
    const userName = document.getElementById('userName');
    let token = null;

    document.getElementById('showRegister').onclick = () => {
        loginForm.style.display = 'none';
        registerForm.style.display = 'flex';
        loginMsg.textContent = '';
        registerMsg.textContent = '';
    };
    document.getElementById('showLogin').onclick = () => {
        registerForm.style.display = 'none';
        loginForm.style.display = 'flex';
        loginMsg.textContent = '';
        registerMsg.textContent = '';
    };

    registerForm.onsubmit = async (e) => {
        e.preventDefault();
        registerMsg.textContent = '';
        const username = document.getElementById('registerUsername').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });
            const data = await res.json();
            if (res.ok) {
                registerMsg.style.color = 'green';
                registerMsg.textContent = 'Registration successful! Please login.';
                setTimeout(() => {
                    registerForm.style.display = 'none';
                    loginForm.style.display = 'flex';
                    registerMsg.textContent = '';
                }, 1500);
            } else {
                registerMsg.style.color = 'red';
                registerMsg.textContent = data.message || 'Registration failed.';
            }
        } catch (err) {
            registerMsg.style.color = 'red';
            registerMsg.textContent = 'Network error.';
        }
    };

    loginForm.onsubmit = async (e) => {
        e.preventDefault();
        loginMsg.textContent = '';
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok && data.token) {
                localStorage.setItem('token', data.token);
                token = data.token;
                // Show dashboard and hide auth section
                authSection.style.display = 'none';
                dashboardSection.style.display = 'block';
                userName.textContent = data.username || email;
                tabBtns[0].click();
                loadRecipes();
                loadMealPlan();
            } else {
                document.getElementById('loginMsg').textContent = data.message || 'Login failed.';
            }
        } catch (err) {
            loginMsg.textContent = 'Network error.';
        }
    };

    // --- Recipes CRUD ---
    const recipeForm = document.getElementById('recipeForm');
    const recipeList = document.getElementById('recipeList');
    let editRecipeId = null;

    async function loadRecipes() {
        recipeList.innerHTML = 'Loading...';
        const res = await fetch('/api/recipes', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const recipes = await res.json();
        recipeList.innerHTML = '';
        recipes.forEach(r => {
            const div = document.createElement('div');
            div.className = 'recipe-item';
            div.innerHTML = `
      <div>
        <strong>${r.name}</strong><br>
        <em>Ingredients:</em> ${Array.isArray(r.ingredients) ? r.ingredients.join(', ') : r.ingredients}<br>
        <em>Instructions:</em> ${r.instructions}
      </div>
      <div class="actions">
        <button onclick="editRecipe('${r._id}')">Edit</button>
        <button onclick="deleteRecipe('${r._id}')">Delete</button>
      </div>
    `;
            recipeList.appendChild(div);
        });
    }

    window.editRecipe = (id) => { /* ...implement as needed... */ };
    window.deleteRecipe = async (id) => {
        await fetch(`/api/recipes/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        loadRecipes();
    };

    recipeForm.onsubmit = async (e) => {
        e.preventDefault();
        const name = document.getElementById('recipeTitle').value;
        const ingredients = document.getElementById('recipeIngredients').value.split(',');
        const instructions = document.getElementById('recipeInstructions').value;
        await fetch('/api/recipes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ name, ingredients, instructions })
        });
        recipeForm.reset();
        loadRecipes();
    };

    // --- Protein Foods (example: filter recipes with 'protein' in title/ingredients) ---
    async function loadProteinFoods() {
        const res = await fetch('/api/recipes', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const recipes = await res.json();
        const proteinList = document.getElementById('proteinList');
        proteinList.innerHTML = '';
        recipes.filter(r =>
            (r.name || r.title).toLowerCase().includes('protein') ||
            (Array.isArray(r.ingredients) ? r.ingredients.join(', ').toLowerCase() : r.ingredients.toLowerCase()).includes('chicken') ||
            (Array.isArray(r.ingredients) ? r.ingredients.join(', ').toLowerCase() : r.ingredients.toLowerCase()).includes('egg') ||
            (Array.isArray(r.ingredients) ? r.ingredients.join(', ').toLowerCase() : r.ingredients.toLowerCase()).includes('paneer') ||
            (Array.isArray(r.ingredients) ? r.ingredients.join(', ').toLowerCase() : r.ingredients.toLowerCase()).includes('dal')
        ).forEach(r => {
            const div = document.createElement('div');
            div.className = 'recipe-item';
            div.innerHTML = `<strong>${r.name || r.title}</strong><br><em>Ingredients:</em> ${Array.isArray(r.ingredients) ? r.ingredients.join(', ') : r.ingredients}`;
            proteinList.appendChild(div);
        });
    }

    // --- Meal Plan ---
    document.getElementById('generateMealPlanBtn').onclick = async () => {
        const res = await fetch('/api/mealplans', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const plans = await res.json();
        const mealPlanList = document.getElementById('mealPlanList');
        mealPlanList.innerHTML = '';
        plans.forEach(plan => {
            const div = document.createElement('div');
            div.className = 'recipe-item';
            div.innerHTML = `<strong>${plan.name}</strong><br>${plan.plan}`;
            mealPlanList.appendChild(div);
        });
    };

    document.getElementById('generateShoppingListBtn').onclick = () => {
  // Open date range picker, fetch shopping list from backend, display in modal
};

    async function loadMealPlan() {
        // Optionally load meal plans on dashboard load
    }

    function renderCalendarView(selectedDate) {
      // For demo: show 7 days from today
      const calendar = document.getElementById('calendarView');
      calendar.innerHTML = '';
      const today = new Date();
      for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        const btn = document.createElement('button');
        btn.textContent = d.toLocaleDateString();
        btn.className = (selectedDate && d.toDateString() === selectedDate.toDateString()) ? 'selected' : '';
        btn.onclick = () => selectMealPlanDate(d);
        calendar.appendChild(btn);
      }
    }
    let currentMealPlanDate = new Date();
    function selectMealPlanDate(date) {
      currentMealPlanDate = date;
      document.getElementById('selectedDateLabel').textContent = date.toLocaleDateString();
      // Load meal plan for this date from backend
      loadMealPlanForDate(date);
      renderCalendarView(date);
    }

    // --- My Meal Plans: Event Delegation for .selectRecipeBtn ---
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('selectRecipeBtn')) {
        const meal = e.target.closest('.meal-slot').dataset.meal;
        openRecipeSelectModal(meal);
    }
});

// Modal logic for selecting and assigning a recipe to a meal slot
let availableRecipes = [];
let currentMealSlot = null;

async function openRecipeSelectModal(meal) {
    currentMealSlot = meal;
    const modal = document.getElementById('recipeSelectModal');
    modal.style.display = 'flex';
    // Fetch recipes if not already loaded
    if (!availableRecipes.length) {
        const res = await fetch('/api/recipes', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        availableRecipes = await res.json();
    }
    renderRecipeSearchResults(availableRecipes);
}

function renderRecipeSearchResults(recipes) {
    const resultsDiv = document.getElementById('recipeSearchResults');
    resultsDiv.innerHTML = '';
    recipes.forEach(recipe => {
        const div = document.createElement('div');
        div.className = 'recipe-search-item';
        div.innerHTML = `<strong>${recipe.name}</strong> <button class="assignRecipeBtn">Add</button><br><small>${recipe.ingredients.join(', ')}</small>`;
        div.querySelector('.assignRecipeBtn').onclick = () => assignRecipeToMealSlot(recipe);
        resultsDiv.appendChild(div);
    });
}

document.getElementById('recipeSearchInput').oninput = function() {
    const query = this.value.toLowerCase();
    const filtered = availableRecipes.filter(r => r.name.toLowerCase().includes(query));
    renderRecipeSearchResults(filtered);
};

document.querySelectorAll('#recipeSelectModal .close').forEach(btn => {
    btn.onclick = () => {
        document.getElementById('recipeSelectModal').style.display = 'none';
    };
});

async function assignRecipeToMealSlot(recipe) {
    // Save to backend (implement as needed)
    // For now, just update UI
    document.querySelector(`.meal-slot[data-meal="${currentMealSlot}"] .assignedRecipe`).textContent = recipe.name;
    document.getElementById('recipeSelectModal').style.display = 'none';
    updateNutritionSummary();
}

    function updateNutritionSummary() {
      // Fetch planned recipes for the day, sum nutrients
      // Example data:
      const totals = { calories: 1800, protein: 90, carbs: 200, fat: 60 };
      const goals = { calories: 2000, protein: 100, carbs: 250, fat: 70 }; // Fetch from user settings/backend

      ['calories', 'protein', 'carbs', 'fat'].forEach(nutrient => {
        const percent = Math.min(100, (totals[nutrient] / goals[nutrient]) * 100);
        document.getElementById(nutrient + 'Bar').style.width = percent + '%';
        document.getElementById(nutrient + 'Value').textContent = `${totals[nutrient]} / ${goals[nutrient]}`;
        // Color-coding: green if <100%, red if >100%
        document.getElementById(nutrient + 'Bar').style.background = percent > 100 ? '#f44336' : '';
      });
    }

    document.getElementById('dietaryGoalsForm').onsubmit = async (e) => {
      e.preventDefault();
      // Collect and send to backend
      // Close modal, update UI
    };
});