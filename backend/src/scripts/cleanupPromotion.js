import dotenv from "dotenv";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Company } from "../models/company.model.js";
import { Job } from "../models/job.model.js";
import { JobPromotion } from "../models/jobPromotion.model.js";
import connectDB from "../config/db.js";

dotenv.config({ path: "./.env" });

const cleanup = async () => {
    try {
        await connectDB();
        console.log("DB Connected");

        const user = await User.findOne({ email: "test_recruiter@example.com" });
        if (user) {
            console.log("Deleting User:", user._id);
            await JobPromotion.deleteMany({ recruiter: user._id });
            await Job.deleteMany({ postedBy: user._id });
            await Company.deleteMany({ userId: user._id }); // or owner: user._id check schema
             // Check Company schema in previous step logic or just iterate
            await Company.deleteMany({ name: "Test Corp" }); 
            await User.findByIdAndDelete(user._id);
            console.log("Cleanup complete");
        } else {
            console.log("Test user not found, nothing to clean.");
        }

        process.exit(0);
    } catch (error) {
        console.error("Cleanup failed:", error);
        process.exit(1);
    }
};

cleanup();
