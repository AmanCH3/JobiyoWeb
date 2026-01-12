import dotenv from "dotenv";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Company } from "../models/company.model.js";
import { Job } from "../models/job.model.js";
import { JobPromotion } from "../models/jobPromotion.model.js";
import connectDB from "../config/db.js";

dotenv.config({ path: "./.env" });

const seed = async () => {
    try {
        await connectDB();
        console.log("DB Connected");

        // 1. Get or Create User
        let user = await User.findOne({ email: "test_recruiter@example.com" });
        if (!user) {
            user = await User.create({
                fullName: "Test Recruiter",
                email: "test_recruiter@example.com",
                password: "password123",
                role: "recruiter"
            });
            console.log("User created:", user._id);
        } else {
            console.log("User found:", user._id);
        }

        // 2. Get or Create Company
        let company = await Company.findOne({ name: "Test Corp" });
        if (!company) {
            company = await Company.create({
                name: "Test Corp",
                description: "A test company",
                website: "https://test.com",
                location: "Remote",
                userId: user._id, 
                // fix: userId vs user (schema check might be needed, assuming owner/userId pattern)
                // Checking previous code: Company schema usually has 'owner' or 'userId'
                // Re-checking company controller: it uses `req.user._id` but let's check schema/controller logic.
                // Assuming 'owner' based on job controller line: if (company.owner.toString() !== ...)
                owner: user._id
            });
            console.log("Company created:", company._id);
        }

        // 3. Create Job
        const job = await Job.create({
            title: "Senior Full Stack Engineer (Promoted)",
            description: "This is a test job to verify promotion UI.",
            requirements: ["React", "Node.js", "MongoDB"],
            salary: 150000,
            location: "San Francisco, CA",
            jobType: "Full-time",
            experienceLevel: "Senior-level",
            company: company._id,
            postedBy: user._id
        });
        console.log("Job created:", job._id);

        // 4. Create Promotion
        const promotion = await JobPromotion.create({
            job: job._id,
            recruiter: user._id,
            planType: "PROMOTED",
            planDurationDays: 30,
            status: "ACTIVE",
            startAt: new Date(),
            endAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            boostScore: 60,
            pinEnabled: true,
            homepageBoost: true,
            emailBoost: true,
            amountCents: 29900,
            currency: 'usd'
        });
        console.log("Active Promotion created:", promotion._id);

        process.exit(0);
    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
};

seed();
