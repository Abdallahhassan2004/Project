const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const { auth, adminAuth } = require('../middleware/auth');

// Get all bookings (admin only)
router.get('/', adminAuth, async (req, res) => {
    try {
        const { status, startDate, endDate } = req.query;
        const query = {};

        if (status) query.status = status;
        if (startDate || endDate) {
            query.bookingDate = {};
            if (startDate) query.bookingDate.$gte = new Date(startDate);
            if (endDate) query.bookingDate.$lte = new Date(endDate);
        }

        const bookings = await Booking.find(query)
            .populate('roomId', 'name location floor')
            .populate('userId', 'username email')
            .sort({ bookingDate: 1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get user's bookings
router.get('/my-bookings', auth, async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user._id })
            .populate('roomId', 'name location floor')
            .sort({ bookingDate: 1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create booking
router.post('/', auth, async (req, res) => {
    try {
        const { roomId, numberOfAttendees, bookingDate, duration } = req.body;

        // Validate required fields
        if (!roomId || !numberOfAttendees || !bookingDate || !duration) {
            return res.status(400).json({
                message: 'Missing required fields',
                required: ['roomId', 'numberOfAttendees', 'bookingDate', 'duration']
            });
        }

        // Check if room exists and is available
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }
        if (!room.isAvailable) {
            return res.status(400).json({ message: 'Room is not available' });
        }

        // Check if room is already booked for the requested time
        const existingBooking = await Booking.findOne({
            roomId,
            bookingDate: new Date(bookingDate),
            status: { $ne: 'cancelled' }
        });

        if (existingBooking) {
            return res.status(400).json({ message: 'Room is already booked for this time' });
        }

        // Create booking
        const booking = new Booking({
            roomId,
            userId: req.user._id,
            numberOfAttendees,
            bookingDate: new Date(bookingDate),
            duration
        });

        await booking.save();
        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update booking status (admin only)
router.put('/:id/status', adminAuth, async (req, res) => {
    try {
        const { status } = req.body;
        if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Cancel booking
router.delete('/:id', auth, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check if user owns the booking or is admin
        if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Check if booking can be cancelled (e.g., not in the past)
        if (new Date(booking.bookingDate) < new Date()) {
            return res.status(400).json({ message: 'Cannot cancel past bookings' });
        }

        booking.status = 'cancelled';
        await booking.save();
        res.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router; 