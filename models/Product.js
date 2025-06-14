const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['Living Room', 'Bedroom', 'Kitchen', 'Dining']
    },
    price: {
        type: String,
        required: [true, 'Price is required']
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    images: {
        main: {
            type: String,
            required: [true, 'Main image is required']
        },
        thumbnails: [{
            type: String,
            required: [true, 'Thumbnail images are required']
        }]
    },
    alt: {
        type: String,
        required: [true, 'Alt text is required']
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    }
}, {
    timestamps: true
});

// Pre-delete middleware to clean up carts
productSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
    try {
        console.log('Pre-delete middleware triggered for product:', this._id);
        const User = mongoose.model('User');
        await User.removeProductFromAllCarts(this._id);
        console.log(`Pre-delete: Removed product ${this._id} from all carts`);
        next();
    } catch (error) {
        console.error('Error in pre-delete middleware:', error);
        next(error);
    }
});

// Pre-delete middleware for findByIdAndDelete
productSchema.pre('findByIdAndDelete', async function(next) {
    try {
        const productId = this.getQuery()._id;
        console.log('Pre-delete middleware triggered for findByIdAndDelete:', productId);
        const User = mongoose.model('User');
        await User.removeProductFromAllCarts(productId);
        console.log(`Pre-delete: Removed product ${productId} from all carts`);
        next();
    } catch (error) {
        console.error('Error in pre-delete middleware:', error);
        next(error);
    }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product; 