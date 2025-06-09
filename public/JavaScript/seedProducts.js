const mongoose = require('mongoose');
const Product = require('../../models/Product');
const connectDB = require('../../models/db');

const products = [
    // Living Room Products
    {
        name: 'Modern Living Room',
        category: 'Living Room',
        price: '£1,299',
        description: 'A stunning modern living room set featuring comfortable seating, elegant coffee table, and stylish decor elements.',
        images: {
            main: '/Images/livingRooms/L1/L1.avif',
            thumbnails: [
                '/Images/livingRooms/L1/L1.avif',
                '/Images/livingRooms/L1/L1.2.avif',
                '/Images/livingRooms/L1/L1.3.avif',
                '/Images/livingRooms/L1/L1.4.avif',
                '/Images/livingRooms/L1/L1.5.avif'
            ]
        },
        alt: 'Modern living room with contemporary furniture'
    },
    {
        name: 'Contemporary Living Room',
        category: 'Living Room',
        price: '£1,499',
        description: 'Elegant contemporary living room set with premium materials and sophisticated design.',
        images: {
            main: '/Images/livingRooms/L2/L2.avif',
            thumbnails: [
                '/Images/livingRooms/L2/L2.avif',
                '/Images/livingRooms/L2/L2.2.avif',
                '/Images/livingRooms/L2/L2.3.avif',
                '/Images/livingRooms/L2/L2.4.avif',
                '/Images/livingRooms/L2/L2.5.avif'
            ]
        },
        alt: 'Contemporary living room design'
    },

    // Bedroom Products
    {
        name: 'Modern Bedroom Set',
        category: 'Bedroom',
        price: '£1,299',
        description: 'A stunning modern bedroom set featuring a comfortable bed, matching nightstands, and a stylish dresser.',
        images: {
            main: '/Images/bedrooms/b1/5.jpg',
            thumbnails: [
                '/Images/bedrooms/b1/1.jpg',
                '/Images/bedrooms/b1/2.jpg',
                '/Images/bedrooms/b1/3.jpg',
                '/Images/bedrooms/b1/4.jpg',
                '/Images/bedrooms/b1/5.jpg'
            ]
        },
        alt: 'Modern bedroom with contemporary furniture'
    },
    {
        name: 'Luxury Bedroom',
        category: 'Bedroom',
        price: '£1,699',
        description: 'Premium luxury bedroom collection featuring high-end furniture pieces and sophisticated design elements.',
        images: {
            main: '/Images/bedrooms/b2/5.jpg',
            thumbnails: [
                '/Images/bedrooms/b2/1.jpg',
                '/Images/bedrooms/b2/2.jpg',
                '/Images/bedrooms/b2/3.jpg',
                '/Images/bedrooms/b2/4.jpg',
                '/Images/bedrooms/b2/5.jpg'
            ]
        },
        alt: 'Luxury bedroom interior'
    },

    // Kitchen Products
    {
        name: 'Modern Kitchen',
        category: 'Kitchen',
        price: '£1,499',
        description: 'Transform your kitchen with this modern design. Features sleek cabinets and modern appliances.',
        images: {
            main: '/Images/kitchen/kitchen 1/d1.jpg',
            thumbnails: [
                '/Images/kitchen/kitchen 1/d1.jpg',
                '/Images/kitchen/kitchen 1/kit1 2.jpg',
                '/Images/kitchen/kitchen 1/kit1 3.jpg',
                '/Images/kitchen/kitchen 1/kit1 4.jpg',
                '/Images/kitchen/kitchen 1/kit1 5.jpg'
            ]
        },
        alt: 'Modern Kitchen'
    },
    {
        name: 'Contemporary Kitchen',
        category: 'Kitchen',
        price: '£1,599',
        description: 'Upgrade your kitchen with this contemporary design. Featuring clean lines and modern finishes.',
        images: {
            main: '/Images/kitchen/kitchen 2/kit2 2.jpg',
            thumbnails: [
                '/Images/kitchen/kitchen 2/kit2 1.jpg',
                '/Images/kitchen/kitchen 2/kit2 2.jpg',
                '/Images/kitchen/kitchen 2/kit2 3.jpg',
                '/Images/kitchen/kitchen 2/kit2 4.jpg',
                '/Images/kitchen/kitchen 2/kit2 5.jpg'
            ]
        },
        alt: 'Contemporary Kitchen'
    },

    // Dining Room Products
    {
        name: 'Traditional Dining',
        category: 'Dining',
        price: '£1,499',
        description: 'Transform your dining with this traditional dining set. Includes a solid wood table and six upholstered chairs.',
        images: {
            main: '/Images/dining/d1/1d.webp',
            thumbnails: [
                '/Images/dining/d1/1d.webp',
                '/Images/dining/d1/2d.webp',
                '/Images/dining/d1/3d.webp',
                '/Images/dining/d1/4d.webp',
                '/Images/dining/d1/5d.webp'
            ]
        },
        alt: 'Traditional dining room set'
    },
    {
        name: 'Modern Dining',
        category: 'Dining',
        price: '£1,599',
        description: 'Upgrade your dining space with this modern dining set. Featuring a sleek glass table and contemporary chairs.',
        images: {
            main: '/Images/dining/d2/1di.avif',
            thumbnails: [
                '/Images/dining/d2/1di.avif',
                '/Images/dining/d2/2di.avif',
                '/Images/dining/d2/3di.avif',
                '/Images/dining/d2/4di.avif',
                '/Images/dining/d2/5di.avif'
            ]
        },
        alt: 'Modern dining room set'
    }
];

const seedProducts = async () => {
    try {
        // Connect to MongoDB
        await connectDB();
        console.log('Connected to MongoDB');

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