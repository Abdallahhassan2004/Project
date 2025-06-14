const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        unique: true,
        required: true,
        default: function() {
            // Generate a unique order number: ORD + timestamp + random 4 digits
            const timestamp = Date.now().toString();
            const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            return `ORD${timestamp}${random}`;
        }
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, required: true, default: 1 },
            price: { type: Number, required: true }
        }
    ],
    status: {
        type: String,
        enum: ['pending', 'processing', 'delivered', 'cancelled'],
        default: 'pending'
    },
    total: { type: Number, required: true },
    shippingAddress: {
        fullName: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true }
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema); 