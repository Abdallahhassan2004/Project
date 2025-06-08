const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: [true, 'Room ID is required']
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    status: {
        type: String,
        enum: {
            values: ['pending', 'confirmed', 'cancelled'],
            message: '{VALUE} is not a valid status'
        },
        default: 'pending'
    },
    numberOfAttendees: {
        type: Number,
        required: [true, 'Number of attendees is required'],
        min: [1, 'Number of attendees must be at least 1']
    },
    bookingDate: {
        type: Date,
        required: [true, 'Booking date is required'],
        min: [new Date(), 'Booking date cannot be in the past']
    },
    duration: {
        type: Number,
        required: [true, 'Duration is required'],
        min: [1, 'Duration must be at least 1 hour'],
        max: [24, 'Duration cannot exceed 24 hours']
    }
}, {
    timestamps: true
});

// Add index for faster queries
bookingSchema.index({ roomId: 1, bookingDate: 1 });
bookingSchema.index({ userId: 1 });
bookingSchema.index({ status: 1 });

// Add validation to ensure number of attendees doesn't exceed room capacity
bookingSchema.pre('save', async function(next) {
    try {
        const Room = mongoose.model('Room');
        const room = await Room.findById(this.roomId);
        
        if (!room) {
            throw new Error('Room not found');
        }
        
        if (this.numberOfAttendees > room.capacity) {
            throw new Error('Number of attendees exceeds room capacity');
        }
        
        next();
    } catch (error) {
        next(error);
    }
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking; 