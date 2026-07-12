require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI;

const seedUsers = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB Atlas for seeding');

        await User.deleteMany({});
        console.log('Cleared existing users');

        const adminSalt = await bcrypt.genSalt(10);
        const driverSalt = await bcrypt.genSalt(10);
        const parentSalt = await bcrypt.genSalt(10);
        const parentSalt2 = await bcrypt.genSalt(10);

        const users = [
            {
                userId: 'admin1',
                email: 'admin@visageroute.edu.pk',
                password: await bcrypt.hash('Admin@123', adminSalt),
                role: 'admin'
            },
            {
                userId: 'DR1001',
                email: 'sadaat.malik@visageroute.edu.pk',
                password: await bcrypt.hash('Driver@123', driverSalt),
                role: 'driver'
            },
            {
                userId: 'DR1002',
                email: 'ali.raza@visageroute.edu.pk',
                password: await bcrypt.hash('Driver@123', driverSalt),
                role: 'driver'
            },
            {
                userId: 'parent1',
                email: 'mrs.safdr@gmail.com',
                password: await bcrypt.hash('Parent@123', parentSalt),
                role: 'parent'
            },
            {
                userId: 'parent2',
                email: 'parent2@gmail.com',
                password: await bcrypt.hash('Parent@123', parentSalt2),
                role: 'parent'
            }
        ];

        await User.insertMany(users);
        console.log('Test users securely seeded with lowercase email rules!');
        process.exit();
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedUsers();