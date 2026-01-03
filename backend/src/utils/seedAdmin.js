import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../models/user.model.js";
import connectDB from "../config/db.js";
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const seedAdmin = async () => {
    await connectDB();

    try {
        const adminEmail = process.env.ADMIN_EMAIL;
        
        const adminExists = await User.findOne({ email: adminEmail });

        if (adminExists) {
            console.log("Admin user already exists. No action taken.");
            return;
        }

        const adminData = {
            fullName: process.env.ADMIN_FULL_NAME,
            email: adminEmail,
            phoneNumber: process.env.ADMIN_PHONE,
            password: process.env.ADMIN_PASSWORD, 
            role: 'admin',
        };

        await User.create(adminData);
        console.log("Admin user seeded successfully!");

    } catch (error) {
        console.error("Error seeding admin user:", error);
    } finally {
        mongoose.connection.close();
    }
};

seedAdmin();