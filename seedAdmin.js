const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('./Models/Admin');

dotenv.config();

const createDefaultAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'Abhisekh@gmail.com' });

    if (existingAdmin) {
      console.log('⚠️  Admin with this email already exists');
      console.log('Admin Details:', {
        id: existingAdmin._id,
        fullName: existingAdmin.fullName,
        email: existingAdmin.email,
        createdAt: existingAdmin.createdAt,
      });
    } else {
      // Create default admin
      const newAdmin = new Admin({
        fullName: 'Abhisekh Rubur',
        email: 'Abhisekh@gmail.com',
        password: 'Abhisekh@1709',
        createdBy: null, // Default admin, created by system
      });

      await newAdmin.save();

      console.log('✅ Default admin created successfully!');
      console.log('Admin Details:', {
        id: newAdmin._id,
        fullName: newAdmin.fullName,
        email: newAdmin.email,
        createdAt: newAdmin.createdAt,
      });
    }

    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error creating default admin:', error.message);
    process.exit(1);
  }
};

createDefaultAdmin();
