const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  createMealPlan,
  getMealPlans,
  getMealPlanById,
  updateMealPlan,
  deleteMealPlan
} = require('../controllers/mealPlanController');
const router = express.Router();

// CRUD routes for meal plans
router.route('/')
  .get(protect, getMealPlans)
  .post(protect, createMealPlan);

router.route('/:id')
  .get(protect, getMealPlanById)
  .put(protect, updateMealPlan)
  .delete(protect, deleteMealPlan);

module.exports = router;