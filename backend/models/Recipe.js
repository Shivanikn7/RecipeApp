const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    ingredients: {
        type: [
            {
                name: { type: String, required: true },
                quantity: { type: String, required: true },
                unit: { type: String, required: true }
            }
        ],
        required: true
    },
    instructions: {
        type: String,
        required: true
    },
    category: { type: String, enum: ['High Protein', 'Veggie', 'Non-Veg', 'Chicken', 'Liquid', 'Other'], default: 'Other' },
    image: {
        type: String,
        required: false
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
});

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;