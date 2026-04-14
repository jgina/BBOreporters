const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const createAdmin = async () => {
  try {
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'ChangeMe123!';

    const existing = await User.findOne({ username });
    if (existing) {
      console.log(`Admin user already exists: ${username}`);
      process.exit(0);
    }

    await User.create({ username, password, role: 'admin' });
    console.log(`Admin user created: ${username}`);
    process.exit(0);
  } catch (error) {
    console.error('Failed to create admin user', error);
    process.exit(1);
  }
};

createAdmin();
