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
    }
}, {
    timestamps: true
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product; 