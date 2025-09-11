
import React, { useState, useEffect } from 'react';
import MealPlanner from './MealPlanner';
import API from './api';
import AddRecipe from './AddRecipe';
import Modal from 'react-modal';
import { FaHome, FaBook, FaCalendarAlt, FaShoppingCart, FaUser } from 'react-icons/fa';
import MealPlannerWithCart from './MealPlanner';
export default Dashboard;

const demoUsers = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' }
];

function Dashboard({ user = "User", token, onLogout }) {
  // Message for week meal plan section: date, time, weekend note
  const getWeekPlanMessage = () => {
    const now = new Date();
    const day = now.toLocaleDateString(undefined, { weekday: 'long' });
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let msg = `Today is ${day}, ${date}. Current time: ${time}.`;
    if (now.getDay() === 0) msg += ' It\'s Sunday! Enjoy your weekend.';
    else if (now.getDay() === 6) msg += ' It\'s Saturday! Plan something special.';
    return msg;
  };
  const [mealPlanModalOpen, setMealPlanModalOpen] = useState(false);
  // Load today's plan from localStorage (simulate DB)
  const getTodayKey = () => {
    const today = new Date();
    return `mealplan_${today.getFullYear()}_${today.getMonth()+1}_${today.getDate()}`;
  };
  const [todayPlan, setTodayPlan] = useState(() => {
    const key = getTodayKey();
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : { Breakfast: '', Lunch: '', Dinner: '', Snack1: '', Snack2: '' };
  });
  const [tab, setTab] = useState('dashboard');
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [mealPlans, setMealPlans] = useState([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
    const monday = new Date(now.setDate(diff));
    monday.setHours(0,0,0,0);
    return monday;
  });
  const [currentMealPlan, setCurrentMealPlan] = useState([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [recipes, setRecipes] = useState([]);
  const [editRecipe, setEditRecipe] = useState(null); // For editing
  const [successMsg, setSuccessMsg] = useState('');
  // Fetch all recipes from backend on mount or when token changes
  // Always fetch recipes when addModalOpen closes (after adding)
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const res = await fetch('/api/recipes', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setRecipes(Array.isArray(data) ? data : []);
      } catch (err) {
        setRecipes([]);
      }
    };
    if (token) fetchRecipes();
  }, [token, addModalOpen]);

  // Load meal plans from backend
  useEffect(() => {
    const loadMealPlans = async () => {
      if (!token) return;
      const data = await API.getMealPlans(token);
      setMealPlans(Array.isArray(data) ? data : []);
    };
    loadMealPlans();
  }, [token]);

  // Set currentMealPlan for the week
  useEffect(() => {
    const weekPlan = mealPlans.find(mp => new Date(mp.weekStart).toDateString() === currentWeekStart.toDateString());
    setCurrentMealPlan(weekPlan ? weekPlan.plan : []);
  }, [mealPlans, currentWeekStart]);

  // Handler to save meal plan
  const handleSaveMealPlan = async (plan) => {
    await API.saveMealPlan(token, currentWeekStart, plan);
    // Reload meal plans
    const data = await API.getMealPlans(token);
    setMealPlans(Array.isArray(data) ? data : []);
  };
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [filter, setFilter] = useState('All');
  const [users] = useState(demoUsers);

  // Personalized greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Calculate today's nutritional intake (all macros)
  const getTodayTotals = () => {
    let todayIdx = new Date().getDay() - 1;
    if (todayIdx < 0) todayIdx = 6;
    const slots = ['Breakfast','Lunch','Dinner','Snack 1','Snack 2'];
    const slotKeys = ['Breakfast','Lunch','Dinner','Snack1','Snack2'];
    let cals = 0, protein = 0, carbs = 0, fats = 0;
    let slotDetails = {};
    if (Array.isArray(currentMealPlan) && currentMealPlan.length === 7) {
      const todayPlan = currentMealPlan[todayIdx];
      if (todayPlan) {
        slotKeys.forEach((slotKey, i) => {
          const recipeId = todayPlan[slots[i]] || todayPlan[slotKey] || '';
          const r = recipes.find(r => r._id === recipeId);
          if (r) {
            cals += Number(r.calories)||0;
            protein += Number(r.protein)||0;
            carbs += Number(r.carbs)||0;
            fats += Number(r.fats)||0;
            slotDetails[slots[i]] = {
              name: r.name,
              calories: r.calories||0,
              protein: r.protein||0,
              carbs: r.carbs||0,
              fats: r.fats||0
            };
          } else {
            slotDetails[slots[i]] = null;
          }
        });
      }
    }
    return { cals, protein, carbs, fats, slotDetails };
  };

  // Calculate weekly nutrition summary for each day
  const getWeekNutritionSummary = () => {
    const slots = ['Breakfast','Lunch','Dinner','Snack 1','Snack 2'];
    const slotKeys = ['Breakfast','Lunch','Dinner','Snack1','Snack2'];
    const dayNames = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    let weekSummary = dayNames.map((day, idx) => {
      let cals = 0, protein = 0, carbs = 0, fats = 0;
      if (Array.isArray(currentMealPlan) && currentMealPlan.length === 7) {
        let plan = currentMealPlan[idx];
        if (plan) {
          // Support both backend format (with slots array) and frontend format (object with slot keys)
          if (Array.isArray(plan.slots)) {
            // Backend format: { day, slots: [ {slot, recipe} ] }
            plan.slots.forEach(slotObj => {
              const recipeId = slotObj.recipe;
              const r = recipes.find(r => r._id === recipeId);
              if (r) {
                cals += Number(r.calories)||0;
                protein += Number(r.protein)||0;
                carbs += Number(r.carbs)||0;
                fats += Number(r.fats)||0;
              }
            });
          } else {
            // Frontend format: { Breakfast, Lunch, ... }
            slotKeys.forEach((slotKey, i) => {
              const recipeId = plan[slots[i]] || plan[slotKey] || '';
              const r = recipes.find(r => r._id === recipeId);
              if (r) {
                cals += Number(r.calories)||0;
                protein += Number(r.protein)||0;
                carbs += Number(r.carbs)||0;
                fats += Number(r.fats)||0;
              }
            });
          }
        }
      }
      return { day, cals, protein, carbs, fats };
    });
    return weekSummary;
  };
  // For week meal plan: get special suggestion for Saturday/Sunday
  const getSpecialSuggestion = (dayIdx) => {
    const dayNames = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    if (dayIdx === 5) return 'Try a healthy smoothie or salad!';
    if (dayIdx === 6) return 'Make a special dessert or family meal!';
    return '';
  };

  // For Recipe Highlights: show highlight for today's main meal or special
  const getRecipeHighlight = () => {
    const now = new Date();
    let todayIdx = now.getDay() - 1;
    if (todayIdx < 0) todayIdx = 6;
    const slots = ['Breakfast','Lunch','Dinner','Snack 1','Snack 2'];
    const slotKeys = ['Breakfast','Lunch','Dinner','Snack1','Snack2'];
    let highlight = '';
    if (Array.isArray(currentMealPlan) && currentMealPlan.length === 7) {
      const todayPlan = currentMealPlan[todayIdx];
      if (todayPlan) {
        // Pick main meal for highlight (Dinner > Lunch > Breakfast)
        let mainSlot = 'Dinner';
        let recipeId = todayPlan[mainSlot] || todayPlan[mainSlot.replace(' ', '')] || '';
        let r = recipes.find(r => r._id === recipeId);
        if (!r) {
          mainSlot = 'Lunch';
          recipeId = todayPlan[mainSlot] || todayPlan[mainSlot.replace(' ', '')] || '';
          r = recipes.find(r => r._id === recipeId);
        }
        if (!r) {
          mainSlot = 'Breakfast';
          recipeId = todayPlan[mainSlot] || todayPlan[mainSlot.replace(' ', '')] || '';
          r = recipes.find(r => r._id === recipeId);
        }
        if (r) {
          highlight = `Today's highlight: ${r.name} (${mainSlot}) - ${r.calories} kcal, ${r.protein}g protein.`;
        }
      }
    }
    // Special for Sunday
    if (now.getDay() === 0 || now.getDay() === 7) {
      highlight += ' Sunday Special: Try a new dessert or family recipe!';
    }
    return highlight || 'No highlight for today.';
  };

  // Suggest next meal based on time and today's plan
  const getNextMeal = () => {
    const now = new Date();
    const hour = now.getHours();
    let mealSlot = '';
    if (hour >= 18) mealSlot = 'Dinner';
    else if (hour >= 12.5) mealSlot = 'Lunch';
    else if (hour >= 8) mealSlot = 'Breakfast';
    else if (hour >= 6) mealSlot = 'Breakfast';
    else mealSlot = 'Snack 1';
    // Find today's plan
    let todayIdx = now.getDay() - 1;
    if (todayIdx < 0) todayIdx = 6;
    let recipeName = 'No meal planned';
    if (Array.isArray(currentMealPlan) && currentMealPlan.length === 7) {
      const todayPlan = currentMealPlan[todayIdx];
      if (todayPlan) {
        const recipeId = todayPlan[mealSlot] || todayPlan[mealSlot.replace(' ', '')] || '';
        const r = recipes.find(r => r._id === recipeId);
        if (r) recipeName = r.name;
      }
    }
    return { name: mealSlot, recipe: recipeName };
  };
  const todayTotals = getTodayTotals();
  const nextMeal = getNextMeal();

  // Card actions
  const handleLike = id => setRecipes(recipes.map(r => r._id === id ? { ...r, liked: !r.liked } : r));
  const handleFavorite = id => setRecipes(recipes.map(r => r._id === id ? { ...r, favorite: !r.favorite } : r));
  const handleDelete = id => setRecipes(recipes.filter(r => r._id !== id));
  // Edit handler
  const handleEdit = recipe => {
    setEditRecipe(recipe);
    setAddModalOpen(true);
  };

  // Filter, sort, search
  const filteredRecipes = recipes
    .filter(r => (filter === 'All' || (r.tags && r.tags.includes && r.tags.includes(filter))))
    .filter(r => r.name && r.name.toLowerCase().includes(search.toLowerCase()));

  // Sort logic (simple demo)
  const sortedRecipes = [...filteredRecipes].sort((a, b) => {
    if (sort === 'newest') return b._id.localeCompare(a._id);
    if (sort === 'oldest') return a._id.localeCompare(b._id);
    if (sort === 'calories') return b.calories - a.calories;
    return 0;
  });

  return (
    <div className="dashboard-responsive-bg" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e3f2fd 0%, #fff 100%)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '2vw 0' }}>
      {/* Sidebar Navigation */}
      <aside style={{ width: 90, background: darkMode ? '#222' : '#e3f2fd', borderTopLeftRadius: 18, borderBottomLeftRadius: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2.5rem 0', gap: 32, minHeight: '80vh', boxShadow: '0 2px 12px #1976d220' }}>
        <img src="https://cdn-icons-png.flaticon.com/512/1046/1046857.png" alt="logo" style={{ width: 48, height: 48, borderRadius: 12, background: '#fff', boxShadow: '0 2px 8px #2222', marginBottom: 18 }} />
        <button onClick={() => setTab('dashboard')} style={{ background: tab==='dashboard' ? '#1976d2' : 'transparent', color: tab==='dashboard' ? '#fff' : '#1976d2', border: 'none', borderRadius: 12, padding: 14, marginBottom: 8 }}><FaHome size={28} /></button>
        <button onClick={() => setTab('recipes')} style={{ background: tab==='recipes' ? '#1976d2' : 'transparent', color: tab==='recipes' ? '#fff' : '#1976d2', border: 'none', borderRadius: 12, padding: 14, marginBottom: 8 }}><FaBook size={28} /></button>
        <button onClick={() => setTab('mealplan')} style={{ background: tab==='mealplan' ? '#1976d2' : 'transparent', color: tab==='mealplan' ? '#fff' : '#1976d2', border: 'none', borderRadius: 12, padding: 14, marginBottom: 8 }}><FaCalendarAlt size={28} /></button>
        <button onClick={() => setCartModalOpen(true)} style={{ background: 'transparent', color: '#1976d2', border: 'none', borderRadius: 12, padding: 14, marginBottom: 8 }}><FaShoppingCart size={28} /></button>
        <button onClick={() => setUserModalOpen(true)} style={{ background: 'transparent', color: '#1976d2', border: 'none', borderRadius: 12, padding: 14, marginBottom: 8 }}><FaUser size={28} /></button>
        <button onClick={onLogout} style={{ background: '#d32f2f', color: '#fff', border: 'none', borderRadius: 12, padding: 14, marginTop: 32 }} title="Logout"><FaUser size={28} /></button>
      </aside>
      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', width: '100%' }}>
        <div className="dashboard-main-card" style={{ width: '100%', maxWidth: 900, background: '#fff', borderRadius: 18, boxShadow: '0 8px 32px rgba(44,62,80,0.13)', padding: '2.5rem 2.5rem 2.5rem 2.5rem', margin: '2vw auto', minHeight: 600, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
        {tab === 'dashboard' && (
          <>
            {/* Personalized Greeting and Next Meal */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
              <h1 style={{ fontWeight: 800, fontSize: '2.1rem', color: '#1976d2', marginBottom: 6, textAlign: 'center', wordBreak: 'break-word' }}>{getGreeting()},<br />{user}!</h1>
              <div style={{ fontSize: '1.08rem', color: '#388e3c', fontWeight: 600, textAlign: 'center', marginBottom: 4 }}>Your next meal is <b>{nextMeal.name}</b> today: <span style={{ color: '#1976d2' }}>{nextMeal.recipe}</span></div>
              <div style={{ fontSize: '1.01rem', color: '#1976d2', fontWeight: 500, marginTop: 4, textAlign: 'center' }}>
                Today's Intake: <b>{todayTotals.cals}</b> kcal, <b>{todayTotals.protein}</b>g protein, <b>{todayTotals.carbs}</b>g carbs, <b>{todayTotals.fats}</b>g fats
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                  style={{ background: '#1976d2', color: '#fff', borderRadius: 8, fontWeight: 700, fontSize: '1.08rem', padding: '0.7rem 1.2rem', border: 'none', minWidth: 120 }}
                  onClick={() => {
                    if (!token) {
                      // Redirect to login page if not logged in
                      window.location.href = '/login';
                      return;
                    }
                    setTab('recipes');
                    setEditRecipe(null); // Always clear edit state for Add
                    setTimeout(() => setAddModalOpen(true), 0); // Ensure state is cleared before opening modal
                  }}
                >+ Add Recipe</button>
                <button
                  style={{ background: '#43a047', color: '#fff', borderRadius: 8, fontWeight: 700, fontSize: '1.08rem', padding: '0.7rem 1.2rem', border: 'none', minWidth: 120 }}
                  onClick={() => setMealPlanModalOpen(true)}
                >+ Plan a Meal</button>
                {/* Removed '+ Add Shopping Item' button */}
      {/* Cart Modal */}
      <Modal
        isOpen={cartModalOpen}
        onRequestClose={() => setCartModalOpen(false)}
        style={{
          overlay: { background: 'rgba(44,62,80,0.7)', zIndex: 1000 },
          content: { maxWidth: 400, margin: 'auto', borderRadius: 18, padding: '2rem', background: darkMode ? '#222' : '#fff', color: darkMode ? '#fff' : '#222' }
        }}
        ariaHideApp={false}
      >
        <h2 style={{ color: '#1976d2', marginBottom: 18 }}>Shopping List</h2>
        <MealPlannerWithCart showOnlyCart />
        <div style={{ textAlign: 'center', marginTop: 18 }}>
          <button onClick={() => setCartModalOpen(false)} style={{ background: '#d32f2f', color: '#fff', border: 'none', borderRadius: 8, padding: '0.8rem 1.5rem', fontWeight: 700, fontSize: '1.08rem' }}>Close</button>
        </div>
      </Modal>

      {/* User Info Modal */}
      <Modal
        isOpen={userModalOpen}
        onRequestClose={() => setUserModalOpen(false)}
        style={{
          overlay: { background: 'rgba(44,62,80,0.7)', zIndex: 1000 },
          content: { maxWidth: 350, margin: 'auto', borderRadius: 18, padding: '2rem', background: darkMode ? '#222' : '#fff', color: darkMode ? '#fff' : '#222' }
        }}
        ariaHideApp={false}
      >
        <h2 style={{ color: '#1976d2', marginBottom: 18 }}>User Info</h2>
        <div style={{ marginBottom: 16 }}><b>Name:</b> {user}</div>
        <div style={{ marginBottom: 16 }}><b>Email:</b> {user && user.email ? user.email : 'user@example.com'}</div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 600, color: '#1976d2', marginRight: 8 }}>Dark Mode:</label>
          <input type="checkbox" checked={darkMode} onChange={e => setDarkMode(e.target.checked)} />
        </div>
        <div style={{ textAlign: 'center', marginTop: 18 }}>
          <button onClick={() => setUserModalOpen(false)} style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, padding: '0.8rem 1.5rem', fontWeight: 700, fontSize: '1.08rem' }}>Close</button>
        </div>
      </Modal>
                {/* Plan a Meal Modal */}
                <Modal
                  isOpen={mealPlanModalOpen}
                  onRequestClose={() => setMealPlanModalOpen(false)}
                  style={{
                    overlay: { background: 'rgba(44,62,80,0.7)', zIndex: 1000 },
                    content: { maxWidth: 500, margin: 'auto', borderRadius: 18, padding: '2rem', background: '#fff' }
                  }}
                  ariaHideApp={false}
                >
                  <h2 style={{ color: '#43a047', marginBottom: 18 }}>Plan Today's Meals</h2>
                  {['Breakfast', 'Lunch', 'Dinner', 'Snack 1', 'Snack 2'].map(slot => (
                    <div key={slot} style={{ marginBottom: 16 }}>
                      <label style={{ fontWeight: 600, color: '#1976d2', marginRight: 8 }}>{slot.replace('Snack', 'Snack ')}</label>
                      <select
                        value={todayPlan[slot.replace(' ', '')]}
                        onChange={e => setTodayPlan(plan => ({ ...plan, [slot.replace(' ', '')]: e.target.value }))}
                        style={{ borderRadius: 8, border: '1.5px solid #bdbdbd', padding: '0.6rem', fontSize: '1.05rem', minWidth: 180 }}
                      >
                        <option value=''>-- Select Recipe --</option>
                        {recipes.map(r => (
                          <option key={r._id} value={r._id}>{r.name}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                  <div style={{ textAlign: 'center', marginTop: 18 }}>
                    <button
                      onClick={async () => {
                        // Find the index for today (0=Monday, 6=Sunday)
                        const today = new Date();
                        let dayIdx = today.getDay() - 1;
                        if (dayIdx < 0) dayIdx = 6; // Sunday as last index
                        const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
                        const slots = ['Breakfast','Lunch','Dinner','Snack 1','Snack 2'];
                        // Build a week plan array of 7 objects (one for each day)
                        let weekPlan = Array.isArray(currentMealPlan) && currentMealPlan.length === 7
                          ? [...currentMealPlan]
                          : Array(7).fill(null).map(() => ({ Breakfast: '', Lunch: '', Dinner: '', Snack1: '', Snack2: '' }));
                        // Update only today's plan
                        // Map todayPlan keys to match slots with spaces
                        const todayPlanWithSpaces = {};
                        slots.forEach(slot => {
                          const key = slot.replace(' ', '');
                          todayPlanWithSpaces[slot] = todayPlan[key] || '';
                        });
                        weekPlan[dayIdx] = { ...todayPlanWithSpaces };
                        // Transform to backend format: [{day, slots:[{slot, recipe}]}]
                        const backendPlan = days.map((day, i) => ({
                          day,
                          slots: slots.map(slot => ({ slot, recipe: weekPlan[i][slot] || null }))
                        }));
                        // Call API with correct structure
                        await API.saveMealPlan(token, currentWeekStart, backendPlan);
                        // Reload meal plans
                        const data = await API.getMealPlans(token);
                        setMealPlans(Array.isArray(data) ? data : []);
                        // Also update localStorage for instant feedback (optional)
                        localStorage.setItem(getTodayKey(), JSON.stringify(todayPlan));
                        setMealPlanModalOpen(false);
                      }}
                      style={{ background: '#43a047', color: '#fff', border: 'none', borderRadius: 8, padding: '0.8rem 1.5rem', fontWeight: 700, fontSize: '1.08rem', marginRight: 12 }}
                    >Save Plan</button>
                    <button
                      onClick={() => setMealPlanModalOpen(false)}
                      style={{ background: '#d32f2f', color: '#fff', border: 'none', borderRadius: 8, padding: '0.8rem 1.5rem', fontWeight: 700, fontSize: '1.08rem' }}
                    >Cancel</button>
                  </div>
                </Modal>
                <button style={{ background: '#ffb300', color: '#222', borderRadius: 8, fontWeight: 700, fontSize: '1.08rem', padding: '0.8rem 1.5rem', border: 'none' }}>+ Add Shopping Item</button>
              </div>
            </div>
            {/* Meal Plan Widget with special suggestions for Sat/Sun */}
            <div style={{ marginBottom: 32, width: '100%' }}>
              <h2 style={{ color: '#1976d2', fontWeight: 700, marginBottom: 12, textAlign: 'center' }}>This Week's Meal Plan</h2>
              <div style={{ marginBottom: 8, color: '#1976d2', fontWeight: 500, fontSize: '1.05rem', textAlign: 'center' }}>{getWeekPlanMessage()}</div>
            </div>
            {/* Nutrition Summary */}
            <div style={{ marginBottom: 32, width: '100%' }}>
              <h2 style={{ color: '#43a047', fontWeight: 700, marginBottom: 12, textAlign: 'center' }}>Today's Nutritional Snapshot</h2>
              <div style={{ background: '#f3faff', borderRadius: 14, padding: 18, minHeight: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1976d2', fontWeight: 600, fontSize: '1.15rem', flexDirection: 'column', width: '100%' }}>
                <div style={{ textAlign: 'center' }}>Calories: <b style={{ margin: '0 8px' }}>{todayTotals.cals}</b> kcal | Protein: <b style={{ margin: '0 8px' }}>{todayTotals.protein}</b> g | Carbs: <b style={{ margin: '0 8px' }}>{todayTotals.carbs}</b> g | Fats: <b style={{ margin: '0 8px' }}>{todayTotals.fats}</b> g</div>
                <div style={{ marginTop: 8, fontSize: '1.01rem', color: '#388e3c', textAlign: 'center', width: '100%' }}>
                  {Object.entries(todayTotals.slotDetails || {}).map(([slot, detail]) => detail ? `${slot}: ${detail.name} (${detail.calories} kcal, ${detail.protein}g protein)` : `${slot}: -`).join(' | ')}
                </div>
              </div>
            </div>
            {/* Weekly Nutrition Summary (Your Dietary Goals) */}
            <div style={{ marginBottom: 32, width: '100%' }}>
              <h2 style={{ color: '#1976d2', fontWeight: 700, marginBottom: 12, textAlign: 'center' }}>Your Dietary Goals</h2>
              <div style={{ background: '#f3faff', borderRadius: 14, padding: 18, minHeight: 80, color: '#1976d2', fontWeight: 600, fontSize: '1.13rem', width: '100%' }}>
                <div style={{ marginBottom: 8 }}>
                  Calories: <b>2000</b> kcal/day &nbsp;|&nbsp; Protein: <b>120g</b> &nbsp;|&nbsp; Carbs: <b>250g</b> &nbsp;|&nbsp; Fats: <b>60g</b>
                </div>
                <div style={{ fontWeight: 500, color: '#388e3c', fontSize: '1.05rem', marginBottom: 4 }}>This Week's Totals:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {getWeekNutritionSummary().map(day => (
                    <div key={day.day} style={{ fontSize: '1.01rem', color: '#1976d2' }}>
                      {day.day}: <b>{day.cals}</b> kcal, <b>{day.protein}</b>g protein, <b>{day.carbs}</b>g carbs, <b>{day.fats}</b>g fats
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Recipe Highlights */}
            <div style={{ width: '100%' }}>
              <h2 style={{ color: '#ff9800', fontWeight: 700, marginBottom: 12, textAlign: 'center' }}>Recipe Highlights</h2>
              <div style={{ background: '#f3faff', borderRadius: 14, padding: 18, minHeight: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff9800', fontWeight: 600, fontSize: '1.12rem', textAlign: 'center', width: '100%' }}>
                {getRecipeHighlight()}
              </div>
            </div>
          </>
        )}
        {tab === 'mealplan' && (
          <MealPlanner
            token={token}
            recipes={recipes}
            mealPlans={mealPlans}
            currentWeekStart={currentWeekStart}
            setCurrentWeekStart={setCurrentWeekStart}
            weekPlan={currentMealPlan}
            onSaveMealPlan={handleSaveMealPlan}
          />
        )}
        {tab === 'recipes' && (
          <div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 18 }}>
              <input type="text" placeholder="Search recipes..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 2, borderRadius: 8, border: '1.5px solid #bdbdbd', padding: '0.7rem', fontSize: '1.08rem' }} />
              <select value={filter} onChange={e => setFilter(e.target.value)} style={{ borderRadius: 8, border: '1.5px solid #bdbdbd', padding: '0.7rem', fontSize: '1.08rem' }}>
                <option value="All">All</option>
                <option value="Breakfast">Breakfast</option>
                <option value="Healthy">Healthy</option>
                <option value="Italian">Italian</option>
                <option value="Dessert">Dessert</option>
              </select>
              <select value={sort} onChange={e => setSort(e.target.value)} style={{ borderRadius: 8, border: '1.5px solid #bdbdbd', padding: '0.7rem', fontSize: '1.08rem' }}>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="calories">Highest Calories</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'flex-start' }}>
              {sortedRecipes.map(r => (
                <div key={r._id} style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 8px rgba(76, 175, 80, 0.07)', width: 270, minHeight: 340, display: 'flex', flexDirection: 'column', position: 'relative', padding: 0, overflow: 'hidden' }}>
                  <img src={r.image} alt={r.name} style={{ width: '100%', height: 140, objectFit: 'cover', borderTopLeftRadius: 14, borderTopRightRadius: 14 }} />
                  <div style={{ padding: '1.1rem 1.2rem 0.7rem 1.2rem', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700, fontSize: '1.13rem', color: '#1976d2' }}>{r.name}</span>
                      <span style={{ fontSize: '0.95rem', color: '#888', fontWeight: 600 }}>{r.difficulty}</span>
                    </div>
                    <div style={{ fontSize: '0.98rem', color: '#555', marginBottom: 2 }}>{r.description}</div>
                    <div style={{ fontSize: '0.97rem', color: '#888', display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span>⭐ {Math.round((r.calories/100 + r.protein/10)*10)/10}</span>
                      <span>{r.time}</span>
                      <span>{r.servings} servings</span>
                    </div>
                    <div style={{ fontSize: '0.97rem', color: '#388e3c', fontWeight: 600 }}>
                      {r.calories} kcal | {r.protein}g protein
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <button onClick={() => handleLike(r._id)} style={{ background: r.liked ? '#ffb300' : '#e0e0e0', color: r.liked ? '#fff' : '#555', border: 'none', borderRadius: 7, padding: '0.5rem 1rem', fontWeight: 700, cursor: 'pointer' }}>Like</button>
                      <button onClick={() => handleFavorite(r._id)} style={{ background: r.favorite ? '#d32f2f' : '#e0e0e0', color: r.favorite ? '#fff' : '#555', border: 'none', borderRadius: 7, padding: '0.5rem 1rem', fontWeight: 700, cursor: 'pointer' }}>Favorite</button>
                      <button style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 7, padding: '0.5rem 1rem', fontWeight: 700, cursor: 'pointer' }}>Add to Meal Plan</button>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <button onClick={() => handleEdit(r)} style={{ background: '#43a047', color: '#fff', border: 'none', borderRadius: 7, padding: '0.5rem 1rem', fontWeight: 700, cursor: 'pointer' }}>Edit</button>
                      <button onClick={() => handleDelete(r._id)} style={{ background: '#d32f2f', color: '#fff', border: 'none', borderRadius: 7, padding: '0.5rem 1rem', fontWeight: 700, cursor: 'pointer' }}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Only one AddRecipe modal, outside the recipe cards loop */}
        <Modal
          isOpen={addModalOpen}
          onRequestClose={() => {
            setAddModalOpen(false);
            setEditRecipe(null);
          }}
          style={{
            overlay: { background: 'rgba(44,62,80,0.7)', zIndex: 1000 },
            content: { maxWidth: 950, margin: 'auto', borderRadius: 18, padding: 0, background: 'transparent', border: 'none' }
          }}
          ariaHideApp={false}
        >
          <AddRecipe
            token={token}
            onLogout={onLogout}
            onRecipeAdded={() => {
              setAddModalOpen(false);
              setEditRecipe(null);
              setSuccessMsg(editRecipe ? 'Recipe updated!' : 'Recipe added!');
              setTimeout(() => setSuccessMsg(''), 3000);
            }}
            editRecipe={editRecipe}
          />
          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <button onClick={() => {
              setAddModalOpen(false);
              setEditRecipe(null);
            }} style={{ background: '#d32f2f', color: '#fff', border: 'none', borderRadius: 8, padding: '0.8rem 1.5rem', fontWeight: 'bold', fontSize: '1.08rem', cursor: 'pointer', marginTop: 8 }}>Close</button>
          </div>
        </Modal>
          </div>
        )}
        {tab === 'favorites' && (
          <div>
            <h2 style={{ color: '#d32f2f', fontWeight: 700, marginBottom: 18 }}>Favorite Recipes</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'flex-start' }}>
              {recipes.filter(r => r.favorite).map(r => (
                <div key={r._id} style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 8px rgba(76, 175, 80, 0.07)', width: 270, minHeight: 340, display: 'flex', flexDirection: 'column', position: 'relative', padding: 0, overflow: 'hidden' }}>
                  <img src={r.image} alt={r.name} style={{ width: '100%', height: 140, objectFit: 'cover', borderTopLeftRadius: 14, borderTopRightRadius: 14 }} />
                  <div style={{ padding: '1.1rem 1.2rem 0.7rem 1.2rem', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700, fontSize: '1.13rem', color: '#1976d2' }}>{r.name}</span>
                      <span style={{ fontSize: '0.95rem', color: '#888', fontWeight: 600 }}>{r.difficulty}</span>
                    </div>
            {successMsg && (
              <div style={{ background: '#d4edda', color: '#155724', borderRadius: 8, padding: '0.8rem 1.2rem', marginBottom: 16, fontWeight: 600, fontSize: '1.08rem', border: '1.5px solid #c3e6cb' }}>{successMsg}</div>
            )}
                    <div style={{ fontSize: '0.98rem', color: '#555', marginBottom: 2 }}>{r.description}</div>
                    <div style={{ fontSize: '0.97rem', color: '#888', display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span>⭐ {Math.round((r.calories/100 + r.protein/10)*10)/10}</span>
                      <span>{r.time}</span>
                      <span>{r.servings} servings</span>
                    </div>
                    <div style={{ fontSize: '0.97rem', color: '#388e3c', fontWeight: 600 }}>
                      {r.calories} kcal | {r.protein}g protein
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === 'users' && (
          <div>
            <h2 style={{ color: '#1976d2', fontWeight: 700, marginBottom: 18 }}>Users</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#f3faff', borderRadius: 12 }}>
              <thead>
                <tr style={{ background: '#e3f2fd', color: '#1976d2', fontWeight: 700 }}>
                  <th style={{ padding: '0.7rem' }}>Name</th>
                  <th style={{ padding: '0.7rem' }}>Email</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #bdbdbd' }}>
                    <td style={{ padding: '0.7rem' }}>{u.name}</td>
                    <td style={{ padding: '0.7rem' }}>{u.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </div>
      </main>
    </div>
  );
}

