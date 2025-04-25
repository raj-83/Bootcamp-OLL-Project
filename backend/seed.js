import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './models/admin.model.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const adminExists = await Admin.findOne({ email: 'admin@oll.com' });
    if (adminExists) {
      console.log('Admin user already exists');
      process.exit();
    }

    // Create admin user
    const admin = await Admin.create({
      name: 'Admin User',
      email: 'admin@oll.com',
      password: 'admin123', // This will be hashed by the pre-save middleware
      phone: '1234567890',
      jobTitle: 'System Administrator',
      department: 'IT',
      bio: 'System administrator for OLL Business Bootcamp',
      responsibilities: ['System Management', 'User Management', 'Content Management']
    });

    console.log('Admin user created successfully:', admin);
    process.exit();
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin(); 