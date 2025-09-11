import React, { useState } from 'react';
import { FaShoppingCart } from 'react-icons/fa';
import MealPlanner from './MealPlanner';

// ...existing code...// ...existing code...

function MealPlannerWrapper({ recipes, todayPlan, weekPlan = [], onSaveMealPlan }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const slots = ['Breakfast','Lunch','Dinner','Snack 1','Snack 2'];

  // ...existing code...


  const slotKeys = ['Breakfast','Lunch','Dinner','Snack1','Snack2'];
  // Use todayPlan for the first row (today), fallback to empty for others
  // If weekPlan is provided from backend, use it; else fallback to todayPlan/local
  const getInitialPlan = () => {
    if (weekPlan && weekPlan.length === days.length) {
      // Convert weekPlan [{day, slots:[{slot, recipe}]}] to 2D array of recipeIds
      return weekPlan.map(dayObj => slots.map(slotName => {
        const slotObj = dayObj.slots.find(s => s.slot === slotName);
        return slotObj ? slotObj.recipe : null;
      }));
    }
    const plan = days.map(() => Array(slots.length).fill(null));
    if (todayPlan) {
      // Map slot names to indices
      const slotMap = { Breakfast: 0, Lunch: 1, Dinner: 2, Snack1: 3, Snack2: 4 };
      Object.entries(todayPlan).forEach(([slot, val]) => {
        if (slotMap[slot] !== undefined && val) plan[0][slotMap[slot]] = val;
      });
    }
    return plan;
  };
  const [mealPlan, setMealPlan] = useState(getInitialPlan);

  // When weekPlan changes, update mealPlan
  React.useEffect(() => {
    setMealPlan(getInitialPlan());
    // eslint-disable-next-line
  }, [JSON.stringify(weekPlan)]);
  // Convert mealPlan 2D array to backend format
  const toBackendPlan = () => days.map((day, i) => ({
    day,
    slots: slots.map((slot, j) => ({ slot, recipe: mealPlan[i][j] }))
  }));
  // Save button handler
  const handleSave = async () => {
    const backendPlan = toBackendPlan();
    if (onSaveMealPlan) {
      await onSaveMealPlan(backendPlan);
    }
    // Optionally update local state to reflect backend format immediately
    // setMealPlan(getInitialPlan());
  };

  // Calculate daily totals
  const getDayTotals = dayIdx => {
    let cals=0, protein=0, carbs=0, fats=0;
    // Use slotKeys to get correct recipe IDs for each slot
    slotKeys.forEach((slotKey, i) => {
      const recipeId = mealPlan[dayIdx][i];
      const r = recipes.find(r => r._id === recipeId);
      if (r) {
        cals += Number(r.calories)||0;
        protein += Number(r.protein)||0;
        if (r.carbs) carbs += Number(r.carbs)||0;
        if (r.fats) fats += Number(r.fats)||0;
      }
    });
    return { cals, protein, carbs, fats };
  };

  // Handler: assign recipe to slot (with category filter)
  const handleSlotClick = (dayIdx, slotIdx) => {
    // Filter recipes by selectedCategory
    const filteredRecipes = selectedCategory === 'All' ? recipes : recipes.filter(r => r.category === selectedCategory);
    if (filteredRecipes.length === 0) {
      alert('No recipes available for this category!');
      return;
    }
    const recipeName = prompt(`Type recipe name to add (Category: ${selectedCategory}):\n${filteredRecipes.map(r => r.name).join(', ')}`);
    if (!recipeName) return;
    const found = filteredRecipes.find(r => r.name.toLowerCase() === recipeName.toLowerCase());
    if (!found) return alert('Recipe not found!');
    // Only update the selected slot, retain all other slots for the day
    setMealPlan(mp => mp.map((row,i) => {
      if (i !== dayIdx) return row;
      // Copy the row and update only the selected slot
      const newRow = [...row];
      newRow[slotIdx] = found._id;
      return newRow;
    }));
  };

  // Unique categories from recipes
  const categories = Array.from(new Set(recipes.map(r => r.category || 'Other')));
  categories.unshift('All');

  return (
    <div style={{ display: 'flex', gap: 32 }}>
      {/* Sidebar for goals and daily totals */}
      <div style={{ minWidth: 260, background: '#f3faff', borderRadius: 14, padding: 18, height: 'fit-content', boxShadow: '0 2px 8px #2222' }}>
        <h3 style={{ color: '#1976d2', fontWeight: 700, marginBottom: 12 }}>Your Dietary Goals</h3>
        <div style={{ fontSize: '1.08rem', color: '#333', marginBottom: 8 }}>
          <b>Calories:</b> 2000 kcal/day<br />
          <b>Protein:</b> 120g<br />
          <b>Carbs:</b> 250g<br />
          <b>Fats:</b> 60g
        </div>
        <h4 style={{ color: '#388e3c', margin: '18px 0 8px 0' }}>Today's Totals</h4>
        <div style={{ fontSize: '1.08rem', color: '#1976d2', marginBottom: 8 }}>
          {days.map((day, i) => {
            const t = getDayTotals(i);
            return (
              <div key={day} style={{ marginBottom: 6 }}>
                <b>{day}:</b> {t.cals} kcal, {t.protein}g protein, {t.carbs||0}g carbs, {t.fats||0}g fats
              </div>
            );
          })}
        </div>

        {/* Grocery List and Cart removed */}
      </div>
      {/* Meal Planner Calendar Grid */}
      <div style={{ flex: 1 }}>
        {/* Category Filter */}
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <label style={{ fontWeight: 600, color: '#1976d2' }}>Filter by Category:</label>
          <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} style={{ borderRadius: 8, padding: '0.5rem 1rem', fontSize: '1.08rem' }}>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <h2 style={{ color: '#1976d2', fontWeight: 700, marginBottom: 18 }}>Meal Planner</h2>
        <button onClick={handleSave} style={{ background: '#43a047', color: '#fff', borderRadius: 8, fontWeight: 700, fontSize: '1.08rem', padding: '0.7rem 1.2rem', border: 'none', marginBottom: 12 }}>Save Meal Plan</button>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, background: '#e3f2fd', borderRadius: 12, padding: 8 }}>
          <div style={{ fontWeight: 700, color: '#1976d2', textAlign: 'center' }}>Day</div>
          {slots.map(slot => <div key={slot} style={{ fontWeight: 700, color: '#1976d2', textAlign: 'center' }}>{slot}</div>)}
          {days.map((day, dayIdx) => (
            <React.Fragment key={day}>
              <div style={{ fontWeight: 700, color: '#388e3c', textAlign: 'center', background: '#fff', borderRadius: 8, padding: 8 }}>{day}</div>
              {slots.map((slot, slotIdx) => {
                const recipeId = mealPlan[dayIdx][slotIdx];
                const recipe = recipes.find(r => r._id === recipeId);
                return (
                  <div key={slotIdx} style={{ background: '#fff', borderRadius: 8, minHeight: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 4, boxShadow: '0 1px 4px #2221', cursor: 'pointer', position: 'relative' }} onClick={() => handleSlotClick(dayIdx, slotIdx)}>
                    {recipe ? (
                      <>
                        {recipe.image && <img src={recipe.image} alt={recipe.name} style={{ width: 48, height: 36, objectFit: 'cover', borderRadius: 6, marginBottom: 2 }} />}
                        <span style={{ color: '#1976d2', fontWeight: 600, fontSize: '1.01rem' }}>{recipe.name}</span>
                        <span style={{ color: '#888', fontSize: '0.97rem' }}>{recipe.calories} kcal</span>
                      </>
                    ) : (
                      <span style={{ color: '#bbb', fontSize: '0.98rem' }}>[Click to add meal]</span>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
        <div style={{ marginTop: 18, color: '#888', fontSize: '1.08rem' }}>
          <b>A Step-by-Step Guide</b><br />
          The Meal Planner interface is your digital calendar for food. Your primary goal here is to strategically fill your days with meals that align with your dietary goals.<br /><br />
          <ol style={{ marginLeft: 18 }}>
            <li><b>Understand the Layout & Your Goals:</b> Observe the calendar, locate your dietary goals, and watch daily totals update as you add meals.</li>
            <li><b>Start Planning Your Meals:</b> Click a meal slot to add meals. Add custom foods as needed.</li>
            <li><b>Monitor Your Dietary Goals in Real-Time:</b> Watch daily totals and adjust meals or servings to stay on track.</li>
            <li><b>Utilize Smart Features:</b> Use swap, auto-fill, and analyze plan features if available.</li>
            <li><b>Manage Your Plan:</b> Move, copy, clear, print, or export your plan as needed.</li>
            <li><b>Generate Your Shopping List:</b> When ready, generate and review your shopping list.</li>
          </ol>
          <b>Summary:</b> Look at your calendar and goals, fill meal slots, watch totals, adjust, and generate your shopping list for success!
        </div>
      </div>
    </div>
  );
}

export default MealPlannerWrapper;
