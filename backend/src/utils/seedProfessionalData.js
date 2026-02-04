import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Company } from "../models/company.model.js";
import { Job } from "../models/job.model.js";
import { Application } from "../models/application.model.js";
import { Chat, Message } from "../models/chat.model.js";
import { Interview } from "../models/interview.model.js";
import connectDB from "../config/db.js";
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const seedProfessionalData = async () => {
    await connectDB();

    try {
        console.log("Starting Professional Data Seeding...");

        // 1. Find or Create Recruiter (Priyanka Karki)
        let recruiter = await User.findOne({ email: "recruiter2@jobiyo.com" });
        
        if (!recruiter) {
            console.log("Recruiter not found, creating new...");
            recruiter = await User.create({
                fullName: "Priyanka Karki",
                email: "recruiter2@jobiyo.com",
                phoneNumber: "9800000002",
                password: "password123", // Will be hashed by pre-save hook if creating new
                role: "recruiter",
                isEmailVerified: true,
                profile: {
                    bio: "Senior Talent Acquisition Specialist with 7+ years of experience in the tech industry. Passionate about connecting top talent with innovative companies.",
                    skills: ["Recruitment", "HR Management", "Technical Hiring", "Team Building"],
                    avatar: "https://res.cloudinary.com/demo/image/upload/v1680000000/woman_professional_headshot.jpg" // Placeholder or similar
                }
            });
        } else {
            console.log("Updating existing recruiter profile...");
            recruiter.profile = {
                bio: "Senior Talent Acquisition Specialist with over 7 years of experience in the tech industry. I specialize in identifying and nurturing top engineering talent for high-growth startups and established enterprises. Passionate about building diverse and inclusive teams.",
                skills: ["Technical Recruitment", "Talent Sourcing", "Interviewing", "Employee Relations", "HR Strategy"],
                avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" // Professional Woman Image
            };
            await recruiter.save({ validateBeforeSave: false });
        }

        // 2. Ensure Company "Verisk Nepal" exists and link it
        let company = await Company.findOne({ name: "Verisk Nepal" });
        if (!company) {
             company = await Company.create({
                 name: "Verisk Nepal",
                 description: "Verisk Nepal is a leading data analytics company serving customers in insurance, energy and specialized markets, and financial services.",
                 website: "https://www.verisk.com",
                 location: "Kathmandu",
                 owner: recruiter._id,
                 verified: true
             });
        } else if (company.owner.toString() !== recruiter._id.toString()) {
            // If company exists but owned by someone else (e.g. from seedData.js), let's just use it or creating a new specific one is safer?
            // Let's create a specific one for her to ensure she owns it.
            // actually, let's create "Innovate Tech" for her as a unique one.
            company = await Company.create({
                 name: "Innovate Tech Solutions",
                 description: "Innovate Tech is a cutting-edge software development firm specializing in AI and Machine Learning solutions.",
                 website: "https://innovatetech.com.np",
                 location: "Lalitpur",
                 owner: recruiter._id,
                 verified: true
            });
        }

        // 3. Ensure Jobs exist
        const jobs = await Job.find({ company: company._id });
        let targetJob;
        if (jobs.length === 0) {
            targetJob = await Job.create({
                title: "Senior Backend Engineer",
                description: "We are looking for an experienced Backend Engineer to join our core team. You will be responsible for building scalable APIs and microservices.",
                requirements: ["Node.js", "MongoDB", "AWS", "5+ years experience"],
                salary: 120000,
                location: "Lalitpur",
                jobType: "Full-time",
                experienceLevel: "Senior",
                company: company._id,
                postedBy: recruiter._id
            });
        } else {
            targetJob = jobs[0];
        }

        // 4. Create Students for Interaction
        const studentData = [
            {
                fullName: "Aarav Sharma",
                email: "aarav.sharma@example.com",
                role: "student",
                profile: { skills: ["Node.js", "React", "System Design"], bio: "Full stack developer with a passion for clean code." }
            },
            {
                fullName: "Riya Basnet",
                email: "riya.basnet@example.com",
                role: "student",
                profile: { skills: ["Python", "Django", "Machine Learning"], bio: "Data Scientist aspiring to work in AI." }
            }
        ];

        const students = [];
        for (const s of studentData) {
            let student = await User.findOne({ email: s.email });
            if (!student) {
                student = await User.create({
                    ...s,
                    password: "password123",
                    isEmailVerified: true
                });
            }
            students.push(student);
        }

        // 5. Create Applications
        for (const student of students) {
             const existingApp = await Application.findOne({ job: targetJob._id, applicant: student._id });
             if (!existingApp) {
                 await Application.create({
                     job: targetJob._id,
                     applicant: student._id,
                     status: "accepted"
                 });
             }
        }
        
        const app1 = await Application.findOne({ job: targetJob._id, applicant: students[0]._id });
        const app2 = await Application.findOne({ job: targetJob._id, applicant: students[1]._id });


        // 6. Seed Interviews
        console.log("Seeding Interviews...");
        await Interview.deleteMany({ recruiter: recruiter._id }); // Clear old ones for clean slate if re-running

        // Interview 1: Completed (Aarav)
        await Interview.create({
            application: app1._id,
            recruiter: recruiter._id,
            student: students[0]._id,
            interviewType: "online",
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            time: "10:00 AM",
            locationOrLink: "https://meet.google.com/abc-defg-hij",
            status: "completed"
        });

        // Interview 2: Scheduled (Riya)
        await Interview.create({
            application: app2._id,
            recruiter: recruiter._id,
            student: students[1]._id,
            interviewType: "inoffice",
            date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
            time: "2:00 PM",
            locationOrLink: "Innovate Tech HQ, 3rd Floor, Jhamsikhel",
            status: "scheduled"
        });


        // 7. Seed Chats
        console.log("Seeding Chats...");
        
        // Chat 1: Aarav (Professional, Technical) - After Interview
        let chat1 = await Chat.findOne({ users: { $all: [recruiter._id, students[0]._id] } });
        if (!chat1) {
            chat1 = await Chat.create({
                chatName: "Interview Follow-up",
                users: [recruiter._id, students[0]._id]
            });
        }
        
        await Message.deleteMany({ chat: chat1._id }); // Clear old msgs

        const msgs1 = [
            { sender: students[0], text: "Hi Priyanka, thanks for the interview earlier today. It was great learning about the team." },
            { sender: recruiter, text: "Hi Aarav, glad you enjoyed it! You did well on the system design portion." },
            { sender: students[0], text: "Thank you! When can I expect to hear about the next steps?" },
            { sender: recruiter, text: "We are debriefing tomorrow. I should have an update for you by Friday. Please send over those architecture diagrams we discussed in the meantime." },
            { sender: students[0], text: "Will do. Sending them shortly." }
        ];

        for (const m of msgs1) {
             const message = await Message.create({
                 sender: m.sender._id,
                 content: m.text,
                 chat: chat1._id
             });
             chat1.latestMessage = message._id;
        }
        await chat1.save();


        // Chat 2: Riya (Scheduling) - Before Interview
        let chat2 = await Chat.findOne({ users: { $all: [recruiter._id, students[1]._id] } });
        if (!chat2) {
            chat2 = await Chat.create({
                chatName: "Interview Scheduling",
                users: [recruiter._id, students[1]._id]
            });
        }

        await Message.deleteMany({ chat: chat2._id });

        const msgs2 = [
            { sender: recruiter, text: "Hi Riya, your profile looks impressive. Are you available for an interview this week?" },
            { sender: students[1], text: "Hello! Thank you for reaching out. Yes, I am available anytime after 1 PM on Thursday." },
            { sender: recruiter, text: "Thursday at 2 PM works perfect. Since you are in Lalitpur, would you prefer coming to our office?" },
            { sender: students[1], text: "Yes, in-office works for me." },
            { sender: recruiter, text: "Great. I have sent the calendar invite. See you then!" }
        ];

        for (const m of msgs2) {
             const message = await Message.create({
                 sender: m.sender._id,
                 content: m.text,
                 chat: chat2._id
             });
             chat2.latestMessage = message._id;
        }
        await chat2.save();

        console.log("Professional Data Seeding Completed Successfully!");
        console.log("Recruiter: recruiter2@jobiyo.com / password123");
        console.log("Company created: Innovate Tech Solutions");
        console.log("Interviews created: 2");
        console.log("Chats created: 2");

    } catch (error) {
        console.error("Error seeding professional data:", error);
    } finally {
        mongoose.connection.close();
        process.exit(0); // Ensure clean exit
    }
};

seedProfessionalData();
