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

        // Generate salted passwords
        const adminSalt = await bcrypt.genSalt(10);
        const driverSalt = await bcrypt.genSalt(10);
        const parentSalt = await bcrypt.genSalt(10);
        const parentSalt2 = await bcrypt.genSalt(10);
        const adminPassword = await bcrypt.hash('Admin@123', adminSalt);
        const driverPassword = await bcrypt.hash('Driver@123', driverSalt);
        const parentPassword = await bcrypt.hash('Parent@123', parentSalt);
        const parentPassword2 = await bcrypt.hash('Parent@123', parentSalt2);

        const users = [
            {
                userId: 'admin1',
                email: 'admin@visageroute.edu.pk',
                password: adminPassword,
                role: 'admin'
            },
            {
                userId: 'DR1001',
                email: 'sadaat.malik@visageroute.edu.pk',
                password: driverPassword,
                role: 'driver'
            },
            {
                userId: 'DR1002',
                email: 'ali.raza@visageroute.edu.pk',
                password: driverPassword,
                role: 'driver'
            },
            {
                userId: 'parent1',
                email: 'mrs.safdr@gmail.com',
                password: parentPassword,
                role: 'parent'
            },
            {
                userId: 'parent2',
                email: 'parent2@gmail.com',
                password: parentPassword2,
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
