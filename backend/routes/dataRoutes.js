const express = require('express');
const router = express.Router();
const Data = require('../models/Data');

// @route   POST /api/data/add
// @desc    Add a new data entry
// @access  Public
router.post('/add', async (req, res) => {
    try {
        const { value, category } = req.body;

        // Validate that value is provided and is a number, and category is a string
        if (value === undefined || typeof value !== 'number') {
            return res.status(400).json({ message: 'Please provide a valid numeric value' });
        }
        if (!category || typeof category !== 'string') {
            return res.status(400).json({ message: 'Please provide a valid category string' });
        }

        // Create new data entry
        const newData = new Data({
            value,
            category
        });

        // Save to database
        const savedData = await newData.save();
        res.status(201).json(savedData);
    } catch (error) {
        console.error('Error adding data:', error);
        res.status(500).json({ message: 'Server error while adding data' });
    }
});

// @route   GET /api/data
// @desc    Fetch all data entries
// @access  Public
router.get('/', async (req, res) => {
    try {
        // Fetch all data from database, sorted by newest first
        const allData = await Data.find().sort({ createdAt: -1 });
        res.status(200).json(allData);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ message: 'Server error while fetching data' });
    }
});

// @route   GET /api/data/stats
// @desc    Return rich statistics for sales data
// @access  Public
router.get('/stats', async (req, res) => {
    try {
        // Calculate basic stats
        const basicStats = await Data.aggregate([
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                    total: { $sum: '$value' },
                    average: { $avg: '$value' },
                    max: { $max: '$value' },
                    min: { $min: '$value' }
                }
            }
        ]);

        // Calculate category breakdown
        const categoryStats = await Data.aggregate([
            {
                $group: {
                    _id: { $ifNull: ['$category', 'Unknown'] },
                    total: { $sum: '$value' }
                }
            },
            {
                $project: {
                    _id: 0,
                    category: '$_id',
                    total: 1
                }
            },
            { $sort: { total: -1 } }
        ]);

        if (basicStats.length === 0) {
            return res.status(200).json({
                count: 0,
                total: 0,
                average: 0,
                max: 0,
                min: 0,
                topCategory: 'None',
                categoryBreakdown: []
            });
        }

        const statsData = basicStats[0];
        const topCategory = categoryStats.length > 0 ? categoryStats[0].category : 'None';

        res.status(200).json({
            count: statsData.count,
            total: statsData.total,
            average: statsData.average,
            max: statsData.max,
            min: statsData.min,
            topCategory: topCategory,
            categoryBreakdown: categoryStats
        });
    } catch (error) {
        console.error('Error calculating stats:', error);
        res.status(500).json({ message: 'Server error while calculating stats' });
    }
});

module.exports = router;
