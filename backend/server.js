require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const mealPlanRoutes = require('./routes/mealPlanRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

app.get('/api', (req, res) => {
    res.send('Recipe API is running...');
});

app.use('/api/auth', userRoutes);
app.use('/api', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/mealplans', mealPlanRoutes);

app.use(express.static(path.join(__dirname, '../frontend/public')));
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'public', 'index.html'));
});

const mongoUri = process.env.MONGO_URI;
mongoose.connect(mongoUri, { /* options */ })
    .then(() => console.log('MongoDB connected successfully!'))
    .catch(err => console.error('MongoDB connection error:', err));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Access API at http://localhost:${PORT}/api`);
    console.log(`Access Frontend at http://localhost:${PORT}`);
});