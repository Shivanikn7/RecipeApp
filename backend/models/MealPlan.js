const mongoose = require('mongoose');

const mealPlanSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    weekStart: {
        type: Date,
        required: true
    },
    plan: [{
        day: { type: String, required: true }, // e.g., Monday
        slots: [{
            slot: { type: String, required: true }, // e.g., Breakfast
            recipe: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }
        }]
    }]
}, {
    timestamps: true
});

const MealPlan = mongoose.model('MealPlan', mealPlanSchema);

module.exports = MealPlan;