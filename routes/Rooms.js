const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const { auth, adminAuth } = require('../middleware/auth');

// Get all rooms with optional filters
router.get('/', async (req, res) => {
    try {
        const { location, floor, isAvailable, minCapacity } = req.query;
        const query = {};

        if (location) query.location = location;
        if (floor) query.floor = floor;
        if (isAvailable) query.isAvailable = isAvailable === 'true';
        if (minCapacity) query.capacity = { $gte: parseInt(minCapacity) };

        const rooms = await Room.find(query);
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get single room with its average rating
router.get('/:id', async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        // Get average rating
        const Review = require('../models/Review');
        const averageRating = await Review.getAverageRating(room._id);

        res.json({
            ...room.toObject(),
            averageRating
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create room (admin only)
router.post('/', adminAuth, async (req, res) => {
    try {
        const { name, description, capacity, location, floor } = req.body;

        // Validate required fields
        if (!name || !capacity || !location || floor === undefined) {
            return res.status(400).json({ 
                message: 'Missing required fields',
                required: ['name', 'capacity', 'location', 'floor']
            });
        }

        const room = new Room({
            name,
            description,
            capacity,
            location,
            floor
        });

        await room.save();
        res.status(201).json(room);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Room name already exists' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update room (admin only)
router.put('/:id', adminAuth, async (req, res) => {
    try {
        const { name, description, capacity, isAvailable, location, floor } = req.body;
        const updateData = {};

        if (name) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (capacity) updateData.capacity = capacity;
        if (isAvailable !== undefined) updateData.isAvailable = isAvailable;
        if (location) updateData.location = location;
        if (floor !== undefined) updateData.floor = floor;

        const room = await Room.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        res.json(room);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Room name already exists' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete room (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        // Check if room has any bookings
        const Booking = require('../models/Booking');
        const hasBookings = await Booking.exists({ roomId: room._id });
        if (hasBookings) {
            return res.status(400).json({ 
                message: 'Cannot delete room with existing bookings' 
            });
        }

        await room.remove();
        res.json({ message: 'Room deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router; 