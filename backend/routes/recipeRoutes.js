const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const Recipe = require('../models/Recipe');
const router = express.Router();

// Get all recipes for user
router.get('/', protect, async (req, res) => {
  const recipes = await Recipe.find({ user: req.user._id });
  res.json(recipes);
});

// Add recipe
router.post('/', protect, async (req, res) => {
  const { name, ingredients, instructions } = req.body;
  const recipe = new Recipe({
    name,
    ingredients,
    instructions,
    user: req.user._id
  });
  await recipe.save();
  res.status(201).json(recipe);
});

// Update recipe
router.put('/:id', protect, async (req, res) => {
  const recipe = await Recipe.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true }
  );
  res.json(recipe);
});

// Delete recipe
router.delete('/:id', protect, async (req, res) => {
  await Recipe.deleteOne({ _id: req.params.id, user: req.user._id });
  res.json({ message: 'Recipe deleted' });
});

module.exports = router;