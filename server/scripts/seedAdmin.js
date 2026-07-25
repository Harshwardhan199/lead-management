const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../src/models/user.model');

const seedAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/lead_management';
    await mongoose.connect(mongoUri);

    // Check if an admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin already exists.');
      await mongoose.connection.close();
      process.exit(0);
    }

    const adminName = process.env.ADMIN_NAME || 'Super Admin';
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123!';

    const adminUser = new User({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
    });

    await adminUser.save();
    console.log(`Initial admin account created successfully (${adminEmail}).`);
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`[SEED ERROR] Failed to seed admin: ${error.message}`);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

seedAdmin();
