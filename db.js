const mongoose = require('mongoose');
require("dotenv").config();

const uri = process.env.MONGO_URI;



mongoose.connect(uri, {
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));