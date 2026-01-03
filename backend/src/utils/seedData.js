import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Company } from "../models/company.model.js";
import { Job } from "../models/job.model.js";
import connectDB from "../config/db.js";
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const seedAllData = async () => {
    await connectDB();

    try {
        console.log("Clearing existing data...");
        await User.deleteMany({});
        await Company.deleteMany({});
        await Job.deleteMany({});
        console.log("Data cleared successfully.");

        console.log("Creating users...");
        const recruiters = await User.create([
            {
                fullName: "Rajesh Hamal",
                email: "recruiter1@Jobiyo.com",
                phoneNumber: "9800000001",
                password: "password123",
                role: "recruiter",
            },
            {
                fullName: "Priyanka Karki",
                email: "recruiter2@Jobiyo.com",
                phoneNumber: "9800000002",
                password: "password123",
                role: "recruiter",
            }
        ]);

        await User.create([
            {
                fullName: "Sita Rai",
                email: "student1@Jobiyo.com",
                phoneNumber: "9811111111",
                password: "password123",
                role: "student",
                profile: {
                    skills: ["JavaScript", "React", "Node.js"]
                }
            },
            {
                fullName: "Gopal Thapa",
                email: "student2@Jobiyo.com",
                phoneNumber: "9822222222",
                password: "password123",
                role: "student",
                profile: {
                    skills: ["Python", "Django", "Data Analysis"]
                }
            }
        ]);
        console.log("Users created successfully.");

        console.log("Creating companies...");
        const companyData = [
            { name: "Leapfrog Technology", location: "Kathmandu" },
            { name: "F1Soft International", location: "Lalitpur" },
            { name: "CloudFactory Nepal", location: "Kathmandu" },
            { name: "Verisk Nepal", location: "Kathmandu" },
            { name: "YoungInnovations", location: "Lalitpur" },
            { name: "Chaudhary Group", location: "Birgunj" },
            { name: "Himalayan Bank", location: "Kathmandu" },
            { name: "Surya Nepal Pvt. Ltd.", location: "Biratnagar" },
            { name: "Dabur Nepal", location: "Birgunj" },
            { name: "Gorkha Brewery", location: "Hetauda" },
            { name: "WorldLink Communications", location: "Pokhara" },
            { name: "Vianet Communications", location: "Butwal" },
            { name: "Ncell Axiata", location: "Lalitpur" },
            { name: "Nepal Telecom", location: "Kathmandu" },
            { name: "Janaki Technology", location: "Janakpur" },
            { name: "Fusemachines Nepal", location: "Kathmandu" },
            { name: "EB Pearls", location: "Pokhara" },
            { name: "Cotiviti Nepal", location: "Kathmandu" },
            { name: "Sarash Tech", location: "Bhaktapur" },
            { name: "Incessant Rain Studios", location: "Lalitpur" }
        ];

        const companies = [];
        for (let i = 0; i < companyData.length; i++) {
            const company = await Company.create({
                ...companyData[i],
                description: `A leading company in ${companyData[i].location}, focused on innovation and excellence.`,
                website: `https://www.${companyData[i].name.toLowerCase().replace(/ /g, '')}.com.np`,
                owner: recruiters[i % 2]._id, 
                verified: true,
            });
            companies.push(company);
        }
        console.log("Companies created successfully.");

        console.log("Creating jobs...");
        const jobTitles = [
            "Software Engineer",
            "Marketing Officer",
            "Accountant",
            "Human Resources Manager",
            "Customer Support Representative",
            "Graphic Designer"
        ];
        const jobRequirements = [
            ["Bachelors in Computer Science", "2+ years experience in a related field", "Proficient in English"],
            ["BBA or equivalent", "Strong communication skills", "Experience with digital marketing tools"],
            ["BBS/BBA with specialization in finance", "Knowledge of accounting software", "Attention to detail"],
            ["Masters in Human Resource Management", "5+ years of experience", "Excellent interpersonal skills"],
            ["+2 graduate or equivalent", "Good communication skills", "Ability to work in shifts"],
            ["Proficient in Adobe Creative Suite", "Creative portfolio", "1+ year of experience"]
        ];

        for (const company of companies) {
            for (let j = 0; j < 6; j++) {
                await Job.create({
                    title: jobTitles[j],
                    description: `We are looking for a dynamic and motivated ${jobTitles[j]} to join our team at ${company.name}.`,
                    requirements: jobRequirements[j],
                    salary: 40000 + (j * 5000), 
                    location: company.location,
                    jobType: "Full-time",
                    experienceLevel: "Mid-level",
                    company: company._id,
                    postedBy: company.owner,
                });
            }
        }
        console.log("Jobs created successfully.");


    } catch (error) {
        console.error("Error seeding data:", error);
    } finally {
        mongoose.connection.close();
        console.log("Database connection closed.");
    }
};

seedAllData();