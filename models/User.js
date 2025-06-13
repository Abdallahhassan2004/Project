const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        trim: true,
        minlength: [3, 'Username must be at least 3 characters long'],
        maxlength: [20, 'Username cannot exceed 20 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long']
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    cart: [{
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        name: String,
        price: Number,
        image: String,
        quantity: {
            type: Number,
            default: 1
        }
    }],
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date
    }
}, {
    timestamps: true
});

// Add any pre-save hooks or methods here
userSchema.pre('save', function(next) {
    // Add any pre-save logic here
    next();
});

// Static method to remove a product from all users' carts
userSchema.statics.removeProductFromAllCarts = async function(productId) {
    try {
        const result = await this.updateMany(
            { 'cart.id': productId },
            { $pull: { cart: { id: productId } } }
        );
        console.log(`Removed product ${productId} from ${result.modifiedCount} users' carts`);
        return result;
    } catch (error) {
        console.error('Error removing product from carts:', error);
        throw error;
    }
};

const User = mongoose.model('User', userSchema);

module.exports = User; 