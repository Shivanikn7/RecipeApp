const Recipe = require('../models/Recipe');
const asyncHandler = require('express-async-handler');

// @desc Create a new recipe
// @route POST /api/recipes
// @access Private
const createRecipe = asyncHandler(async (req, res) => {
    const { name, description, ingredients, instructions, calories, protein, carbs, fats, image, tags } = req.body;

    // Helper: categorize recipe based on keywords
    function categorizeRecipe({ name = '', description = '', ingredients = [] }) {
      const text = `${name} ${description} ${Array.isArray(ingredients) ? ingredients.map(i => (i.name || i)).join(' ') : ''}`.toLowerCase();
      if (/chicken/.test(text)) return 'Chicken';
      if (/egg|fish|meat|mutton|beef|prawn|shrimp/.test(text)) return 'Non-Veg';
      if (/paneer|tofu|dal|chickpea|lentil|beans|vegetable|veggie|broccoli|spinach|cauliflower|peas|cabbage/.test(text)) return 'Veggie';
      if (/shake|smoothie|juice|soup|broth|liquid|drink/.test(text)) return 'Liquid';
      if (/protein|whey|high protein|muscle|bodybuilding/.test(text)) return 'High Protein';
      return 'Other';
    }

    // Helper: suggest image URL if not provided
    function suggestImageUrl({ name = '', category = '' }) {
      const base = 'https://source.unsplash.com/featured/300x200?';
      if (category && category !== 'Other') return `${base}${encodeURIComponent(category + ' food')}`;
      if (name) return `${base}${encodeURIComponent(name)}`;
      return `${base}food`;
    }

    const category = categorizeRecipe({ name, description, ingredients });
    const imageUrl = image && image.trim() ? image : suggestImageUrl({ name, category });

    const recipe = await Recipe.create({
        name,
        description,
        ingredients,
        instructions,
        calories,
        protein,
        carbs,
        fats,
        image: imageUrl,
        tags,
        category,
        user: req.user._id, // Assuming req.user is set by authMiddleware
    });

    res.status(201).json(recipe);
});

// @desc Get all recipes
// @route GET /api/recipes
// @access Private
const getRecipes = asyncHandler(async (req, res) => {
    const recipes = await Recipe.find({ user: req.user._id });
    res.json(recipes);
});

// @desc Get a recipe by ID
// @route GET /api/recipes/:id
// @access Private
const getRecipeById = asyncHandler(async (req, res) => {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe || recipe.user.toString() !== req.user._id.toString()) {
        res.status(404);
        throw new Error('Recipe not found');
    }

    res.json(recipe);
});

// @desc Update a recipe
// @route PUT /api/recipes/:id
// @access Private
const updateRecipe = asyncHandler(async (req, res) => {
    const { name, description, ingredients, instructions, calories, protein, carbs, fats, image, tags } = req.body;

    const recipe = await Recipe.findById(req.params.id);

    if (!recipe || recipe.user.toString() !== req.user._id.toString()) {
        res.status(404);
        throw new Error('Recipe not found');
    }

    recipe.name = name || recipe.name;
    recipe.description = description || recipe.description;
    recipe.ingredients = ingredients || recipe.ingredients;
    recipe.instructions = instructions || recipe.instructions;
    recipe.calories = calories || recipe.calories;
    recipe.protein = protein || recipe.protein;
    recipe.carbs = carbs || recipe.carbs;
    recipe.fats = fats || recipe.fats;
    recipe.image = image || recipe.image;
    recipe.tags = tags || recipe.tags;

    const updatedRecipe = await recipe.save();
    res.json(updatedRecipe);
});

// @desc Delete a recipe
// @route DELETE /api/recipes/:id
// @access Private
const deleteRecipe = asyncHandler(async (req, res) => {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe || recipe.user.toString() !== req.user._id.toString()) {
        res.status(404);
        throw new Error('Recipe not found');
    }

    await recipe.remove();
    res.status(204).json({ message: 'Recipe removed' });
});

module.exports = {
    createRecipe,
    getRecipes,
    getRecipeById,
    updateRecipe,
    deleteRecipe,
};