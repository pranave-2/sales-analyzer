const mongoose = require('mongoose');

// Define the schema for the Data collection
const dataSchema = new mongoose.Schema({
    value: {
        type: Number,
        required: [true, 'Please add a numeric value']
    },
    category: {
        type: String,
        required: [true, 'Please add a category']
    },
    createdAt: {
        type: Date,
        default: Date.now // Default to current date
    }
});

// Create and export the model
const Data = mongoose.model('Data', dataSchema);

module.exports = Data;
