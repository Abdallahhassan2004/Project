const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Room = require('../models/Room');
const { auth, adminAuth } = require('../middleware/auth');

// Get all reviews for a room
router.get('/room/:roomId', async (req, res) => {
    try {
        const reviews = await Review.find({ roomId: req.params.roomId })
            .populate('userId', 'username')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get room's average rating
router.get('/room/:roomId/average', async (req, res) => {
    try {
        const averageRating = await Review.getAverageRating(req.params.roomId);
        res.json({ averageRating });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Submit a review
router.post('/', auth, async (req, res) => {
    try {
        const { roomId, rating, comment } = req.body;

        // Validate required fields
        if (!roomId || !rating) {
            return res.status(400).json({
                message: 'Missing required fields',
                required: ['roomId', 'rating']
            });
        }

        // Check if room exists
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        // Check if user has already reviewed this room
        const existingReview = await Review.findOne({
            roomId,
            userId: req.user._id
        });

        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this room' });
        }

        // Create review
        const review = new Review({
            roomId,
            userId: req.user._id,
            rating,
            comment
        });

        await review.save();
        res.status(201).json(review);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'You have already reviewed this room' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update review
router.put('/:id', auth, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check if user owns the review
        if (review.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Update only provided fields
        if (rating !== undefined) review.rating = rating;
        if (comment !== undefined) review.comment = comment;

        await review.save();
        res.json(review);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete review
router.delete('/:id', auth, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check if user owns the review or is admin
        if (review.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await review.remove();
        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router; 