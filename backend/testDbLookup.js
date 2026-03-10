// Quick diagnostic: check DB for user ID from JWT
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    // The user ID observed in the JWT payload
    const userId = '69a78fab8199ab191dee8bf2';
    const user = await User.findById(userId);
    console.log("User lookup result:", user ? JSON.stringify(user, null, 2) : "NOT FOUND - ID might be wrong");
    console.log("\nListing all users:");
    const allUsers = await User.find().select('_id userId role');
    allUsers.forEach(u => console.log(u._id.toString(), u.userId, u.role));
    mongoose.disconnect();
});
