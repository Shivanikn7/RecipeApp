import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import Modal from 'react-modal';
import API from './api';

const allIngredients = [
  // ... (same as before, or even more)
  'Eggs', 'Milk', 'Flour', 'Sugar', 'Salt', 'Butter', 'Chicken', 'Rice', 'Tomato', 'Onion',
  'Garlic', 'Ginger', 'Pepper', 'Cheese', 'Potato', 'Carrot', 'Beans', 'Peas', 'Spinach', 'Broccoli',
  'Mushroom', 'Cottage Cheese', 'Fish', 'Beef', 'Lamb', 'Coriander', 'Cumin', 'Chili', 'Oil', 'Vinegar',
  'Soy Sauce', 'Yogurt', 'Lemon', 'Honey', 'Oats', 'Bread', 'Pasta', 'Corn', 'Apple', 'Banana',
  'Orange', 'Grapes', 'Strawberry', 'Blueberry', 'Pumpkin', 'Cabbage', 'Cauliflower', 'Celery', 'Mint',
  'Basil', 'Rosemary', 'Thyme', 'Saffron', 'Cardamom', 'Cloves', 'Mustard', 'Sesame', 'Peanut', 'Walnut',
  'Cashew', 'Almond', 'Coconut', 'Avocado', 'Zucchini', 'Eggplant', 'Bell Pepper', 'Chickpeas', 'Lentils',
  'Tofu', 'Shrimp', 'Crab', 'Squid', 'Duck', 'Turkey', 'Maple Syrup', 'Molasses', 'Dates', 'Fig', 'Pear',
  'Pineapple', 'Mango', 'Papaya', 'Kiwi', 'Watermelon', 'Cantaloupe', 'Radish', 'Turnip', 'Leek', 'Scallion',
  'Artichoke', 'Asparagus', 'Okra', 'Pak Choi', 'Kale', 'Arugula', 'Parsnip', 'Rutabaga', 'Sweet Potato', 'Quinoa'
].map(ing => ({ value: ing, label: ing }));

const units = [
  'g', 'kg', 'ml', 'l', 'cup', 'tbsp', 'tsp', 'piece', 'slice', 'pinch', 'handful'
];

const chefImg = "https://cdn.pixabay.com/photo/2014/04/03/10/32/chef-312186_1280.png";
const recipeBgUrl = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80';

export default function AddRecipe({ token, onLogout, onRecipeAdded, editRecipe }) {
  const [form, setForm] = useState({
    name: '',
    ingredients: [],
    instructions: '',
    calories: '',
    protein: '',
    image: ''
  });
  const [ingredientRows, setIngredientRows] = useState([
    { ingredient: null, quantity: '', unit: '' }
  ]);
  const [msg, setMsg] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [editId, setEditId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  // Move fetchRecipes outside useEffect to avoid dependency warning
  const fetchRecipes = React.useCallback(async () => {
    const res = await fetch('/api/recipes', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setRecipes(Array.isArray(data) ? data : []);
  }, [token]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  // When editRecipe changes, populate form for editing
  useEffect(() => {
    if (editRecipe && editRecipe._id) {
      setEditId(editRecipe._id);
      setForm({
        name: editRecipe.name || '',
        instructions: editRecipe.instructions || '',
        calories: editRecipe.calories || '',
        protein: editRecipe.protein || '',
        image: editRecipe.image || ''
      });
      setIngredientRows(
        Array.isArray(editRecipe.ingredients) && editRecipe.ingredients.length > 0
          ? editRecipe.ingredients.map(ing => ({
              ingredient: ing.name ? { value: ing.name, label: ing.name } : null,
              quantity: ing.quantity || '',
              unit: ing.unit || ''
            }))
          : [{ ingredient: null, quantity: '', unit: '' }]
      );
    } else {
      setEditId(null);
      setForm({ name: '', ingredients: [], instructions: '', calories: '', protein: '', image: '' });
      setIngredientRows([{ ingredient: null, quantity: '', unit: '' }]);
    }
  }, [editRecipe]);

  // Ingredient row handlers
  const handleIngredientChange = (idx, field, value) => {
    const updated = [...ingredientRows];
    updated[idx][field] = value;
    setIngredientRows(updated);
  };

  const addIngredientRow = () => {
    setIngredientRows([...ingredientRows, { ingredient: null, quantity: '', unit: '' }]);
  };

  const removeIngredientRow = idx => {
    setIngredientRows(ingredientRows.filter((_, i) => i !== idx));
  };

  // Form field changes
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  // Submit (add or update)
  const handleSubmit = async e => {
    e.preventDefault();
    const ingredients = ingredientRows
      .filter(row => row.ingredient && row.quantity)
      .map(row => ({
        name: row.ingredient.value,
        quantity: row.quantity,
        unit: row.unit
      }));
    const payload = {
      name: form.name,
      ingredients,
      instructions: form.instructions,
      calories: form.calories,
      protein: form.protein,
      image: form.image
    };
    if (editId) {
      await fetch(`/api/recipes/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      setMsg('Recipe updated!');
    } else {
      await API.addRecipe(token, payload);
      setMsg('Recipe added!');
      if (onRecipeAdded) onRecipeAdded();
    }
    setForm({ name: '', ingredients: [], instructions: '', calories: '', protein: '', image: '' });
    setIngredientRows([{ ingredient: null, quantity: '', unit: '' }]);
    setEditId(null);
    fetchRecipes();
  };

  // E-book modal
  const openRecipeModal = recipe => {
    setSelectedRecipe(recipe);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedRecipe(null);
  };

  return (
    <div style={{
      background: `url(${recipeBgUrl}) center/cover no-repeat`,
      borderRadius: '18px',
      padding: '2.5rem 2rem 1.5rem 2rem',
      boxShadow: '0 4px 32px rgba(0,0,0,0.16)',
      margin: '2.5rem auto',
      maxWidth: 950,
      minHeight: 650,
      position: 'relative',
      color: '#fff',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(44,62,80,0.7)',
        zIndex: 1
      }}></div>
      <div style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 }}>
          <img src={chefImg} alt="Chef" style={{ width: 90, height: 90, borderRadius: '50%', background: '#fff', boxShadow: '0 2px 8px #2222', marginBottom: 8 }} />
          <div style={{ fontStyle: 'italic', color: '#ffe082', fontSize: '1.1rem', marginBottom: 8 }}>
            “Cooking is at once child’s play and adult joy. And cooking done with care is an act of love.” – Craig Claiborne
          </div>
        </div>
        <h2 style={{ textAlign: 'center', marginBottom: '1.2rem', color: '#ffe082', fontSize: '2.1rem' }}>
          Add Recipe (e-Book)
        </h2>
        <form onSubmit={handleSubmit} style={{
          display: 'flex', flexDirection: 'column', gap: '1.3rem', maxWidth: 800, margin: '0 auto', background: 'rgba(255,255,255,0.07)', borderRadius: 12, padding: '2rem 2.5rem'
        }}>
          <input
            name="name"
            placeholder="Recipe Title"
            value={form.name}
            onChange={handleChange}
            required
            style={{ borderRadius: 8, border: 'none', padding: '0.9rem', fontSize: '1.15rem', width: '100%' }}
          />
          <input
            name="image"
            placeholder="Image URL (required)"
            value={form.image}
            onChange={handleChange}
            required
            style={{ borderRadius: 8, border: 'none', padding: '0.9rem', fontSize: '1.08rem', width: '100%' }}
          />
          {form.image && (
            <div style={{ textAlign: 'center', margin: '10px 0' }}>
              <img
                src={form.image}
                alt="Preview"
                style={{ maxWidth: 220, maxHeight: 120, borderRadius: 8, boxShadow: '0 2px 8px #2222', border: '2px solid #ffe082' }}
                onError={e => {
                  if (e.target.src !== chefImg) {
                    e.target.onerror = null;
                    e.target.src = chefImg;
                  }
                }}
              />
            </div>
          )}
          <div>
            <label style={{ fontWeight: 'bold', color: '#ffe082', fontSize: '1.1rem' }}>Ingredients (with quantity & unit)</label>
            {ingredientRows.map((row, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                <div style={{ flex: 2 }}>
                  <Select
                    options={allIngredients}
                    value={row.ingredient}
                    onChange={val => handleIngredientChange(idx, 'ingredient', val)}
                    placeholder="Ingredient"
                    styles={{
                      control: base => ({
                        ...base,
                        borderRadius: 8,
                        minHeight: 44,
                        fontSize: '1.08rem',
                        width: '100%',
                        background: '#fff',
                        color: '#222',
                      }),
                      menu: base => ({ ...base, zIndex: 9999, width: '100%' }),
                    }}
                    menuPlacement="auto"
                    menuPosition="fixed"
                    maxMenuHeight={220}
                  />
                </div>
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="Qty"
                  value={row.quantity}
                  onChange={e => handleIngredientChange(idx, 'quantity', e.target.value)}
                  style={{ flex: 1, borderRadius: 8, border: 'none', padding: '0.7rem', fontSize: '1.08rem' }}
                  required={!!row.ingredient}
                />
                <select
                  value={row.unit}
                  onChange={e => handleIngredientChange(idx, 'unit', e.target.value)}
                  style={{ flex: 1, borderRadius: 8, border: 'none', padding: '0.7rem', fontSize: '1.08rem' }}
                  required={!!row.ingredient}
                >
                  <option value="">Unit</option>
                  {units.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
                <button type="button" onClick={() => removeIngredientRow(idx)}
                  style={{
                    background: '#d32f2f', color: '#fff', border: 'none', borderRadius: 7, padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '1rem'
                  }}>×</button>
              </div>
            ))}
            <button type="button" onClick={addIngredientRow}
              style={{
                background: '#43a047', color: '#fff', border: 'none', borderRadius: 7, padding: '0.5rem 1.2rem', cursor: 'pointer', fontSize: '1rem', marginTop: 4
              }}>+ Add Ingredient</button>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <input
              name="calories"
              type="number"
              min="0"
              placeholder="Calories"
              value={form.calories}
              onChange={handleChange}
              style={{ borderRadius: 8, border: 'none', padding: '0.9rem', fontSize: '1.1rem', flex: 1 }}
            />
            <input
              name="protein"
              type="number"
              min="0"
              placeholder="Protein (g)"
              value={form.protein}
              onChange={handleChange}
              style={{ borderRadius: 8, border: 'none', padding: '0.9rem', fontSize: '1.1rem', flex: 1 }}
            />
          </div>
          <textarea
            name="instructions"
            placeholder="Instructions"
            value={form.instructions}
            onChange={handleChange}
            required
            style={{ borderRadius: 8, border: 'none', padding: '0.9rem', fontSize: '1.13rem', minHeight: 100, width: '100%' }}
          />
          <button type="submit" style={{
            background: '#ffb300', color: '#222', border: 'none', borderRadius: 8,
            padding: '1rem', fontWeight: 'bold', fontSize: '1.18rem', cursor: 'pointer', marginTop: '0.5rem', width: '100%'
          }}>
            Add Recipe
          </button>
          <button type="button" style={{
            background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8,
            padding: '0.9rem', fontWeight: 'bold', fontSize: '1.08rem', cursor: 'pointer', width: '100%'
          }}>
            Generate AI Cooking Video
          </button>
        </form>
        {msg && <div className="msg" style={{
          textAlign: 'center', marginTop: '1rem', color: '#ffe082', fontWeight: 'bold', fontSize: '1.1rem'
        }}>{msg}</div>}
        <h3 style={{ color: '#ffe082', marginTop: '2.5rem', textAlign: 'center', fontSize: '1.3rem' }}>Your Recipes</h3>
        <div style={{
          marginTop: 18, display: 'flex', flexWrap: 'wrap', gap: 18, maxWidth: 900, marginLeft: 'auto', marginRight: 'auto', justifyContent: 'center'
        }}>
          {recipes.map(r => (
            <div key={r._id} onClick={() => openRecipeModal(r)} style={{
              background: '#fffbe7', borderRadius: 14, padding: '1.2rem', color: '#222',
              boxShadow: '0 2px 8px rgba(76, 175, 80, 0.07)', display: 'flex', flexDirection: 'column', gap: 8,
              cursor: 'pointer', minWidth: 260, maxWidth: 320, minHeight: 180, transition: 'box-shadow 0.2s', border: '2px solid #ffe082'
            }}>
              {r.image && <img src={r.image} alt={r.name} style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 10, marginBottom: 8 }} />}
              <div style={{ fontWeight: 'bold', fontSize: '1.15rem', textAlign: 'center' }}>{r.name}</div>
              <div style={{ fontSize: '0.98rem', color: '#888', textAlign: 'center' }}>
                {r.calories && <>Calories: <b>{r.calories}</b> kcal &nbsp;</>}
                {r.protein && <>Protein: <b>{r.protein}</b> g</>}
              </div>
              <div style={{ fontSize: '0.97rem', color: '#555', textAlign: 'center', fontStyle: 'italic', marginTop: 4 }}>
                Click to view e-book
              </div>
            </div>
          ))}
        </div>
        <button onClick={onLogout} style={{
          background: '#222', color: '#fff', border: 'none', borderRadius: 8, padding: '1rem', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', width: '100%', marginTop: '2.5rem', marginBottom: '0.5rem'
        }}>Logout</button>
      </div>
      <Modal
        isOpen={modalOpen}
        onRequestClose={closeModal}
        style={{
          overlay: { background: 'rgba(44,62,80,0.7)', zIndex: 1000 },
          content: {
            maxWidth: 500, margin: 'auto', borderRadius: 18, padding: '2.5rem 2rem', background: '#fffbe7', color: '#222', boxShadow: '0 4px 32px #2222'
          }
        }}
        ariaHideApp={false}
      >
        {selectedRecipe && (
          <div>
            {/* E-book cover image */}
            {selectedRecipe.image && (
              <div style={{
                width: '100%',
                height: 220,
                background: `url(${selectedRecipe.image}) center/cover no-repeat`,
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                marginBottom: 18,
                boxShadow: '0 2px 12px #2222',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'flex-end',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <img src={chefImg} alt="Chef" style={{ width: 60, height: 60, borderRadius: '50%', background: '#fff', boxShadow: '0 2px 8px #2222', margin: 16, border: '3px solid #ffe082' }} />
              </div>
            )}
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <h2 style={{ color: '#ffb300', margin: 0 }}>{selectedRecipe.name}</h2>
              <div style={{ fontSize: '1.05rem', color: '#888', marginBottom: 8 }}>
                {selectedRecipe.calories && <>Calories: <b>{selectedRecipe.calories}</b> kcal &nbsp;</>}
                {selectedRecipe.protein && <>Protein: <b>{selectedRecipe.protein}</b> g</>}
              </div>
            </div>
            {/* Recipe Image Section */}
            {selectedRecipe.image && (
              <div style={{ textAlign: 'center', marginBottom: 18 }}>
                <img src={selectedRecipe.image} alt={selectedRecipe.name} style={{ maxWidth: 320, maxHeight: 180, borderRadius: 12, boxShadow: '0 2px 8px #2222', border: '2px solid #ffe082' }} />
                <div style={{ color: '#888', fontSize: '0.98rem', marginTop: 4 }}>Recipe Image</div>
              </div>
            )}
            <div>
              <h4 style={{ color: '#1976d2', marginBottom: 6 }}>Ingredients</h4>
              <ul style={{ margin: '0.3rem 0 1.2rem 1.2rem' }}>
                {selectedRecipe.ingredients && selectedRecipe.ingredients.map((ing, idx) => (
                  <li key={idx} style={{ fontSize: '1.08rem' }}>
                    {ing.quantity} {ing.unit} {ing.name}
                  </li>
                ))}
              </ul>
              <h4 style={{ color: '#1976d2', marginBottom: 6 }}>Instructions</h4>
              <div style={{ fontSize: '1.08rem', whiteSpace: 'pre-line' }}>{selectedRecipe.instructions}</div>
            </div>
            <button onClick={closeModal} style={{
              background: '#d32f2f', color: '#fff', border: 'none', borderRadius: 8, padding: '0.8rem 1.5rem', fontWeight: 'bold', fontSize: '1.08rem', cursor: 'pointer', marginTop: 24, display: 'block', marginLeft: 'auto', marginRight: 'auto'
            }}>Close</button>
          </div>
        )}
      </Modal>
    </div>
  );
}