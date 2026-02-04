import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Company } from "../models/company.model.js";
import { ChatbotSetting } from "../models/chatbotSetting.model.js";
import { logActivity } from "../utils/activityLogger.js"; // Simulate some logs? (optional, logs are usually auto-generated)
import connectDB from "../config/db.js";
import dotenv from 'dotenv';
import bcrypt from "bcryptjs";

dotenv.config({ path: './.env' });

const seedProfessionalAdminData = async () => {
    await connectDB();

    try {
        console.log("Starting Admin Data Seeding...");

        // 1. Create System Admin
        // Check if admin exists
        let admin = await User.findOne({ email: process.env.ADMIN_EMAIL || "admin@jobiyo.com" });
        if (!admin) {
            console.log("Creating System Admin...");
            const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || "admin123", 10);
            admin = await User.create({
                fullName: process.env.ADMIN_FULL_NAME || "System Administrator",
                email: process.env.ADMIN_EMAIL || "admin@jobiyo.com",
                phoneNumber: process.env.ADMIN_PHONE || "9800000000",
                password: hashedPassword, 
                role: "admin",
                isEmailVerified: true
            });
             // Fix manual hash vs pre-save hook double hash issue
             // If we used User.create with plain text password, the pre-save hook handles hashing.
             // If we pass hashed, and hook runs, it might double hash?
             // user.model.js pre-save: if (!this.isModified("password")) return next();
             // So if we pass plain text, hook works. Let's do that for simplicity, assuming hook works.
             // Wait, previous simple seedAdmin used plain text.
             // But let's be safe and use findOneAndUpdate to force plain text if needed or just use user creation flow carefully.
             // Re-creating if needed.
             if (await bcrypt.compare(process.env.ADMIN_PASSWORD || "admin123", admin.password)) {
                 // password matches
             } else {
                 // update password
                 admin.password = process.env.ADMIN_PASSWORD || "admin123";
                 await admin.save();
             }
        } 
        console.log("Admin User Verified:", admin.email);


        // 2. Create Mixed Bag of Companies (Verified vs Pending) to give Admin work to do
        console.log("Seeding Companies for Admin Verification Queue...");
        
        // A recruiter to own these
        let recruiter = await User.findOne({ role: "recruiter" });
        if (!recruiter) {
            recruiter = await User.create({
                fullName: "Pending Company Owner",
                email: "pendingowner@example.com",
                password: "password123",
                role: "recruiter"
            });
        }

        const pendingCompanies = [
            { name: "Startup Alpha", loc: "Kathmandu", web: "https://alpha.com", desc: "A new fintech startup looking for verification." },
            { name: "Beta Solutions", loc: "Pokhara", web: "https://beta.com", desc: "Outsourcing firm awaiting approval." },
            { name: "Gamma Tech", loc: "Lalitpur", web: "https://gamma.com", desc: "AI research lab." }
        ];

        for (const c of pendingCompanies) {
            const exists = await Company.findOne({ name: c.name });
            if (!exists) {
                await Company.create({
                    name: c.name,
                    location: c.loc,
                    website: c.web,
                    description: c.desc,
                    owner: recruiter._id,
                    verified: false // PENDING!
                });
            }
        }
        console.log("Pending companies seeded.");

        // 3. Initialize Chatbot Settings
        console.log("Initializing Chatbot Settings...");
        const settings = await ChatbotSetting.findOne({ singletonKey: "Jobiyo-main-settings" });
        if (!settings) {
            await ChatbotSetting.create({
                systemPrompt: `You are "Jobiyo Helper", a friendly AI assistant... (Professional Prompt)`,
                updatedBy: admin._id
            });
        }

        console.log("Admin Data Seeding Completed!");
        console.log("Credentials:");
        console.log(`Email: ${process.env.ADMIN_EMAIL || "admin@jobiyo.com"}`);
        console.log(`Password: ${process.env.ADMIN_PASSWORD || "admin123"}`);

    } catch (error) {
        console.error("Error seeding admin data:", error);
    } finally {
        mongoose.connection.close();
        process.exit(0);
    }
};

seedProfessionalAdminData();
