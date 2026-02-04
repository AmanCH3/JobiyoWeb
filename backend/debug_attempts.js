import mongoose from 'mongoose';
import { LoginAttempt } from './src/models/loginAttempt.model.js';
import dotenv from 'dotenv'; 

dotenv.config();

import connectDB from './src/config/db.js';

const checkAttempts = async () => {
    try {
        await connectDB();
        console.log("Connected to DB.");
        
        const attempts = await LoginAttempt.find({});
        console.log("Current Login Attempts:");
        console.log(JSON.stringify(attempts, null, 2));
        
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.disconnect();
    }
};

checkAttempts();
