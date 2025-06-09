require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const connectDB = require('../models/db');

const products = [
    // Living Room Products
    {
        name: 'Modern Living Room',
        category: 'Living Room',
        price: '£1,299',
        description: 'A stunning modern living room set featuring comfortable seating, elegant coffee table, and stylish decor elements.',
        images: {
            main: 'L1/L1.avif',
            thumbnails: ['L1/L1.avif', 'L1/L1.2.avif', 'L1/L1.3.avif', 'L1/L1.4.avif', 'L1/L1.5.avif']
        },
        alt: 'Modern living room with contemporary furniture'
    },
    {
        name: 'Contemporary Living Room',
        category: 'Living Room',
        price: '£1,499',
        description: 'Elegant contemporary living room set with premium materials and sophisticated design.',
        images: {
            main: 'L2/L2.avif',
            thumbnails: ['L2/L2.avif', 'L2/L2.2.avif', 'L2/L2.3.avif', 'L2/L2.4.avif', 'L2/L2.5.avif']
        },
        alt: 'Contemporary living room design'
    },
    {
        name: 'Luxury Living Room',
        category: 'Living Room',
        price: '£1,699',
        description: 'Premium luxury living room collection featuring high-end furniture pieces and sophisticated design elements.',
        images: {
            main: 'L3/L3.avif',
            thumbnails: ['L3/L3.avif', 'L3/L3.2.avif', 'L3/L3.3.avif', 'L3/L3.4.avif', 'L3/L3.5.avif']
        },
        alt: 'Luxury living room interior'
    },
    {
        name: 'Minimalist Living Room',
        category: 'Living Room',
        price: '£1,399',
        description: 'Clean and minimalist living room set with essential furniture pieces and subtle design elements.',
        images: {
            main: 'L4/L4.avif',
            thumbnails: ['L4/L4.avif', 'L4/L4.2.avif', 'L4/L4.3.avif', 'L4/L4.4.avif', 'L4/L4.5.avif']
        },
        alt: 'Minimalist living room design'
    },
    {
        name: 'Scandinavian Living Room',
        category: 'Living Room',
        price: '£1,599',
        description: 'Beautiful Scandinavian-inspired living room set featuring natural materials and functional design.',
        images: {
            main: 'L5/L5.avif',
            thumbnails: ['L5/L5.avif', 'L5/L5.2.avif', 'L5/L5.3.avif', 'L5/L5.4.avif', 'L5/L5.5.avif']
        },
        alt: 'Scandinavian style living room'
    },
    {
        name: 'Art Deco Living Room',
        category: 'Living Room',
        price: '£1,799',
        description: 'Stunning Art Deco living room collection featuring bold geometric patterns and luxurious materials.',
        images: {
            main: 'L6/L6.avif',
            thumbnails: ['L6/L6.avif', 'L6/L6.2.avif', 'L6/L6.3.avif', 'L6/L6.4.avif', 'L6/L6.5.avif']
        },
        alt: 'Art deco living room interior'
    },

    // Bedroom Products
    {
        name: 'Modern Bedroom Set',
        category: 'Bedroom',
        price: '£1,299',
        description: 'A stunning modern bedroom set featuring a comfortable bed, matching nightstands, and a stylish dresser.',
        images: {
            main: 'b1/5.jpg',
            thumbnails: ['b1/1.jpg', 'b1/2.jpg', 'b1/3.jpg', 'b1/4.jpg', 'b1/5.jpg']
        },
        alt: 'Modern bedroom with contemporary furniture'
    },
    {
        name: 'Contemporary Bedroom',
        category: 'Bedroom',
        price: '£1,499',
        description: 'Elegant contemporary bedroom set with premium materials and sophisticated design.',
        images: {
            main: 'b2/5.jpg',
            thumbnails: ['b2/1.jpg', 'b2/2.jpg', 'b2/3.jpg', 'b2/4.jpg', 'b2/5.jpg']
        },
        alt: 'Contemporary bedroom design'
    },
    {
        name: 'Luxury Bedroom Space',
        category: 'Bedroom',
        price: '£1,699',
        description: 'Premium luxury bedroom collection featuring high-end furniture pieces and sophisticated design elements.',
        images: {
            main: 'b3/5.jpg',
            thumbnails: ['b3/1.jpg', 'b3/2.jpg', 'b3/3.jpg', 'b3/4.jpg', 'b3/5.jpg']
        },
        alt: 'Luxury bedroom interior'
    },
    {
        name: 'Minimalist Bedroom',
        category: 'Bedroom',
        price: '£1,399',
        description: 'Clean and minimalist bedroom set with essential furniture pieces and subtle design elements.',
        images: {
            main: 'b4/5.jpg',
            thumbnails: ['b4/1.jpg', 'b4/2.jpg', 'b4/3.jpg', 'b4/4.jpg', 'b4/5.jpg']
        },
        alt: 'Minimalist bedroom design'
    },
    {
        name: 'Scandinavian Bedroom',
        category: 'Bedroom',
        price: '£1,599',
        description: 'Beautiful Scandinavian-inspired bedroom set featuring natural materials and functional design.',
        images: {
            main: 'b5/5.jpg',
            thumbnails: ['b5/1.jpg', 'b5/2.jpg', 'b5/3.jpg', 'b5/4.jpg', 'b5/5.jpg']
        },
        alt: 'Scandinavian style bedroom'
    },
    {
        name: 'Art Deco Bedroom',
        category: 'Bedroom',
        price: '£1,799',
        description: 'Stunning Art Deco bedroom collection featuring bold geometric patterns and luxurious materials.',
        images: {
            main: 'b6/5.jpg',
            thumbnails: ['b6/1.jpg', 'b6/2.jpg', 'b6/3.jpg', 'b6/4.jpg', 'b6/5.jpg']
        },
        alt: 'Art deco bedroom interior'
    },

    // Kitchen Products
    {
        name: 'Modern Kitchen',
        category: 'Kitchen',
        price: '£1,499',
        description: 'Transform your kitchen with this modern design. Features sleek cabinets and modern appliances.',
        images: {
            main: 'kitchen 1/d1.jpg',
            thumbnails: ['kitchen 1/d1.jpg', 'kitchen 1/kit1 2.jpg', 'kitchen 1/kit1 3.jpg', 'kitchen 1/kit1 4.jpg', 'kitchen 1/kit1 5.jpg']
        },
        alt: 'Modern Kitchen'
    },
    {
        name: 'Contemporary Kitchen',
        category: 'Kitchen',
        price: '£1,599',
        description: 'Upgrade your kitchen with this contemporary design. Featuring clean lines and modern finishes.',
        images: {
            main: 'kitchen 2/kit2 2.jpg',
            thumbnails: ['kitchen 2/kit2 1.jpg', 'kitchen 2/kit2 2.jpg', 'kitchen 2/kit2 3.jpg', 'kitchen 2/kit2 4.jpg', 'kitchen 2/kit2 5.jpg']
        },
        alt: 'Contemporary Kitchen'
    },
    {
        name: 'Classic Kitchen',
        category: 'Kitchen',
        price: '£1,800',
        description: 'Timeless classic kitchen design with traditional elements and modern functionality.',
        images: {
            main: 'kitchen 3/kit3 1.jpg',
            thumbnails: ['kitchen 3/kit3 1.jpg', 'kitchen 3/kit3 2.jpg', 'kitchen 3/kit3 3.jpg', 'kitchen 3/kit3 4.jpg', 'kitchen 3/kit3 5.jpg']
        },
        alt: 'Classic Kitchen'
    },
    {
        name: 'Rustic Kitchen',
        category: 'Kitchen',
        price: '£1,650',
        description: 'Warm and inviting rustic kitchen with natural materials and traditional charm.',
        images: {
            main: 'kitchen 4/kit4 1.jpg',
            thumbnails: ['kitchen 4/kit4 1.jpg', 'kitchen 4/kit4 2.jpg', 'kitchen 4/kit4 3.jpg', 'kitchen 4/kit4 4.jpg', 'kitchen 4/kit4 5.jpg']
        },
        alt: 'Rustic Kitchen'
    },
    {
        name: 'Minimalist Kitchen',
        category: 'Kitchen',
        price: '£1,750',
        description: 'Clean and efficient minimalist kitchen design with smart storage solutions.',
        images: {
            main: 'kitchen 5/kit5 1.jpg',
            thumbnails: ['kitchen 5/kit5 1.jpg', 'kitchen 5/kit5 2.jpg', 'kitchen 5/kit5 3.jpg', 'kitchen 5/kit5 4.jpg', 'kitchen 5/kit5 5.jpg']
        },
        alt: 'Minimalist Kitchen'
    },
    {
        name: 'Luxury Kitchen',
        category: 'Kitchen',
        price: '£1,900',
        description: 'High-end luxury kitchen design with premium materials and state-of-the-art appliances.',
        images: {
            main: 'kitchen 6/kit6 2.jpg',
            thumbnails: ['kitchen 6/kit6 1.jpg', 'kitchen 6/kit6 2.jpg', 'kitchen 6/kit6 3.jpg', 'kitchen 6/kit6 4.jpg', 'kitchen 6/kit6 5.jpg']
        },
        alt: 'Luxury Kitchen'
    },

    // Dining Room Products
    {
        name: 'Traditional Dining',
        category: 'Dining',
        price: '£1,499',
        description: 'Transform your dining with this traditional dining set. Includes a solid wood table and six upholstered chairs.',
        images: {
            main: 'd1/1d.webp',
            thumbnails: ['d1/1d.webp', 'd1/2d.webp', 'd1/3d.webp', 'd1/4d.webp', 'd1/5d.webp']
        },
        alt: 'Luxury dining'
    },
    {
        name: 'Modern Dining',
        category: 'Dining',
        price: '£1,599',
        description: 'Upgrade your dining space with this modern dining set. Featuring a sleek glass table and contemporary chairs.',
        images: {
            main: 'd2/1di.avif',
            thumbnails: ['d2/1di.avif', 'd2/2di.avif', 'd2/3di.avif', 'd2/4di.avif', 'd2/5di.avif']
        },
        alt: 'Modern dining room'
    },
    {
        name: 'Vintage Dining',
        category: 'Dining',
        price: '£1,800',
        description: 'Add character to your home with this vintage dining set. The distressed wood finish and classic design create a timeless look.',
        images: {
            main: 'd3/1di.webp',
            thumbnails: ['d3/1di.webp', 'd3/2di.webp', 'd3/3di.webp', 'd3/4di.webp', 'd3/5di.webp']
        },
        alt: 'Vintage dining room'
    },
    {
        name: 'Rustic Dining',
        category: 'Dining',
        price: '£165',
        description: 'Bring natural warmth to your dining room with this rustic dining set. Made from reclaimed wood with a natural finish.',
        images: {
            main: 'd4/1di.webp',
            thumbnails: ['d4/1di.webp', 'd4/2di.webp', 'd4/3di.webp', 'd4/4di.webp', 'd4/5di.webp']
        },
        alt: 'Rustic dining room'
    },
    {
        name: 'Marble Granite Dining',
        category: 'Dining',
        price: '£450',
        description: 'Elegant marble and granite dining set that combines luxury with durability. Perfect for both casual and formal dining.',
        images: {
            main: 'd5/1di.webp',
            thumbnails: ['d5/1di.webp', 'd5/2di.webp', 'd5/3di.webp', 'd5/4di.webp', 'd5/5di.webp']
        },
        alt: 'Marble granite dining room'
    },
    {
        name: 'Glass Modernity Dining',
        category: 'Dining',
        price: '£550',
        description: 'Contemporary glass dining set that brings light and space to your dining area. Features a tempered glass table with modern metal frame.',
        images: {
            main: 'd6/1di.webp',
            thumbnails: ['d6/1di.webp', 'd6/2di.webp', 'd6/3di.webp', 'd6/4di.webp', 'd6/5di.webp']
        },
        alt: 'Glass modernity dining room'
    }
];

const seedProducts = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        // Clear existing products
        await Product.deleteMany({});
        console.log('Cleared existing products');

        // Insert new products
        const insertedProducts = await Product.insertMany(products);
        console.log(`Successfully inserted ${insertedProducts.length} products`);

        // Disconnect from MongoDB
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');

    } catch (error) {
        console.error('Error seeding products:', error);
        process.exit(1);
    }
};

// Run the seed function
seedProducts(); 