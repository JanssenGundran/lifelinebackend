const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/adminModel');  
require('dotenv').config();
const connectDB = require('./config');

const createAdmin = async () => {
    try {
        await connectDB();

        const existingAdmin = await Admin.findOne({ username: 'admin' });
        if (existingAdmin) {
            console.log('Admin user already exists.');
            return;
        }

        const hashedPassword = await bcrypt.hash('adminpassword', 10);
        const admin = new Admin({
            username: 'admin',
            password: hashedPassword,
            role: 'admin'
        });

        await admin.save();
        console.log('Admin user created successfully!');
        mongoose.connection.close();
    } catch (error) {
        console.error('Error creating admin:', error);
        mongoose.connection.close();
    }
};

createAdmin();
