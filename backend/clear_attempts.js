import mongoose from 'mongoose';
import { LoginAttempt } from './src/models/loginAttempt.model.js';
import connectDB from './src/config/db.js';
import dotenv from 'dotenv'; 

dotenv.config();

const clearAttempts = async () => {
    try {
        await connectDB();
        console.log("Connected to DB.");
        
        await LoginAttempt.deleteMany({});
        console.log("All login attempts cleared.");
        
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.disconnect();
    }
};

clearAttempts();
