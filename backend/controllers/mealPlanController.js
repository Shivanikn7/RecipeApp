const { now } = require('mongoose');
const MealPlan = require('../models/MealPlan');
const asyncHandler = require('express-async-handler');

// @desc Create a new meal plan
// @route POST /api/mealplans
// @access Private
const createMealPlan = asyncHandler(async (req, res) => {
    const { weekStart, plan } = req.body;

    // Remove existing plan for this user/week if exists
    await MealPlan.deleteMany({ user: req.user._id, weekStart });

    const mealPlan = await MealPlan.create({
        weekStart,
        plan,
        user: req.user._id,
    });

    res.status(201).json(mealPlan);
});

// @desc Get all meal plans
// @route GET /api/mealplans
// @access Private
const getMealPlans = asyncHandler(async (req, res) => {
    const mealPlans = await MealPlan.find({ user: req.user._id });
    res.json(mealPlans);
});

// @desc Get a meal plan by ID
// @route GET /api/mealplans/:id
// @access Private
const getMealPlanById = asyncHandler(async (req, res) => {
    const mealPlan = await MealPlan.findById(req.params.id);

    if (!mealPlan || mealPlan.user.toString() !== req.user._id.toString()) {
        res.status(404);
        throw new Error('Meal plan not found');
    }

    res.json(mealPlan);
});

// @desc Update a meal plan
// @route PUT /api/mealplans/:id
// @access Private
const updateMealPlan = asyncHandler(async (req, res) => {
    const { weekStart, plan } = req.body;

    const mealPlan = await MealPlan.findById(req.params.id);

    if (!mealPlan || mealPlan.user.toString() !== req.user._id.toString()) {
        res.status(404);
        throw new Error('Meal plan not found');
    }

    mealPlan.weekStart = weekStart || mealPlan.weekStart;
    mealPlan.plan = plan || mealPlan.plan;

    const updatedMealPlan = await mealPlan.save();
    res.json(updatedMealPlan);
});

// @desc Delete a meal plan
// @route DELETE /api/mealplans/:id
// @access Private
const deleteMealPlan = asyncHandler(async (req, res) => {
    const mealPlan = await MealPlan.findById(req.params.id);

    if (!mealPlan || mealPlan.user.toString() !== req.user._id.toString()) {
        res.status(404);
        throw new Error('Meal plan not found');
    }

    await mealPlan.remove();
    res.status(204).send();
});

module.exports = {
    createMealPlan,
    getMealPlans,
    getMealPlanById,
    updateMealPlan,
    deleteMealPlan,
};