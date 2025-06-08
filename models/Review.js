const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
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
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5']
    },
    comment: {
        type: String,
        trim: true,
        maxlength: [500, 'Comment cannot exceed 500 characters']
    }
}, {
    timestamps: true
});

// Add index for faster queries
reviewSchema.index({ roomId: 1 });
reviewSchema.index({ userId: 1 });

// Add validation to ensure one review per user per room
reviewSchema.index({ roomId: 1, userId: 1 }, { unique: true });

// Add method to calculate average rating for a room
reviewSchema.statics.getAverageRating = async function(roomId) {
    const result = await this.aggregate([
        { $match: { roomId: roomId } },
        { $group: { _id: null, averageRating: { $avg: '$rating' } } }
    ]);
    return result[0]?.averageRating || 0;
};

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review; 