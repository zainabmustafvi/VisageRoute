require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI;

const seedUsers = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB Atlas for seeding');

        // Clear existing test users to prevent duplication
        await User.deleteMany({});
        console.log('Cleared existing users');

        // Generate salted password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('securepassword123', salt);

        const users = [
            {
                userId: 'admin1',
                password: hashedPassword,
                role: 'admin'
            },
            {
                userId: 'driver1',
                password: hashedPassword,
                role: 'driver'
            },
            {
                userId: 'parent1',
                password: hashedPassword,
                role: 'parent'
            }
        ];

        await User.insertMany(users);
        console.log('Test users securely seeded!');
        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedUsers();
