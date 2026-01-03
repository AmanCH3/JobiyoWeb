import request from 'supertest';
import { app } from '../src/app.js';
import { User } from '../src/models/user.model.js';
import { Company } from '../src/models/company.model.js';
import { Job } from '../src/models/job.model.js';
import { Application } from '../src/models/application.model.js';
import { Interview } from '../src/models/interview.model.js';
import { Chat } from '../src/models/chat.model.js';

describe("Additional Feature Routes", () => {
    let recruiter, student, otherRecruiter, recruiterToken, studentToken, otherRecruiterToken, application, job;

    beforeEach(async () => {
        recruiter = await User.create({ fullName: "Interviewer", email: "interviewer@test.com", password: "password", role: "recruiter", phoneNumber: "123" });
        student = await User.create({ fullName: "Interviewee", email: "interviewee@test.com", password: "password", role: "student", phoneNumber: "456" });
        otherRecruiter = await User.create({ fullName: "Other Rec", email: "otherrec@test.com", password: "p", role: "recruiter", phoneNumber: "789" });
        
        const company = await Company.create({ name: "Interview Co", owner: recruiter._id, location: "Test" });
        job = await Job.create({ title: "Interview Job", postedBy: recruiter._id, company: company._id, description: "d", requirements: ["r"], salary: 1, location: "l", jobType: "Full-time", experienceLevel: "Entry-level" });
        application = await Application.create({ job: job._id, applicant: student._id });
       
        recruiterToken = recruiter.generateAccessToken();
        studentToken = student.generateAccessToken();
        otherRecruiterToken = otherRecruiter.generateAccessToken();
    });

    test("GET /api/v1/interviews/my-interviews - student should see their interviews", async () => {
        await Interview.create({ application: application._id, recruiter: recruiter._id, student: student._id, interviewType: "online", date: "2025-10-10", time: "14:00", locationOrLink: "link" });
        const res = await request(app).get("/api/v1/interviews/my-interviews").set("Authorization", `Bearer ${studentToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.length).toBe(1);
    });

    test("GET /api/v1/recruiter-dashboard/stats - should get recruiter stats", async () => {
        const res = await request(app).get("/api/v1/recruiter-dashboard/stats").set("Authorization", `Bearer ${recruiterToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.data).toEqual({ totalCompanies: 1, totalJobs: 1, totalApplicants: 1 });
    });
   
    test("POST /api/v1/chats - should access or create a chat between two users", async () => {
        const res = await request(app).post("/api/v1/chats").set("Authorization", `Bearer ${studentToken}`).send({ userId: recruiter._id });
        expect([200, 201]).toContain(res.statusCode);
    });
    
    test("POST & GET /api/v1/chats/messages - should send and then fetch messages", async () => {
        const chat = await Chat.create({ users: [student._id, recruiter._id] });
        const messageContent = "Hello, recruiter!";
        const sendRes = await request(app).post('/api/v1/chats/messages').set('Authorization', `Bearer ${studentToken}`).send({ chatId: chat._id, content: messageContent });
        expect(sendRes.statusCode).toEqual(201);
        const fetchRes = await request(app).get(`/api/v1/chats/messages/${chat._id}`).set('Authorization', `Bearer ${recruiterToken}`);
        expect(fetchRes.statusCode).toEqual(200);
        expect(fetchRes.body.data.length).toBe(1);
    });

    test("GET /api/v1/interviews/my-interviews - recruiter should see their scheduled interviews", async () => {
        await Interview.create({ application: application._id, recruiter: recruiter._id, student: student._id, interviewType: "inoffice", date: "2025-11-11", time: "10:00", locationOrLink: "Office" });
        const res = await request(app).get("/api/v1/interviews/my-interviews").set("Authorization", `Bearer ${recruiterToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.length).toBe(1);
    });
    
    test("POST /api/v1/interviews/schedule - should fail if recruiter did not post the job", async () => {
        const res = await request(app).post('/api/v1/interviews/schedule').set('Authorization', `Bearer ${otherRecruiterToken}`).send({ applicationId: application._id, interviewType: 'online', date: '2025-12-01', time: '11:00', locationOrLink: 'link' });
        expect(res.statusCode).toEqual(403);
    });
    
    test("POST /api/v1/interviews/schedule - should fail if fields are missing", async () => {
        const res = await request(app).post('/api/v1/interviews/schedule').set('Authorization', `Bearer ${recruiterToken}`).send({ applicationId: application._id });
        expect(res.statusCode).toEqual(400);
    });

    
    test("POST /api/v1/chatbot/query - should fail if the query is empty", async () => {
        const res = await request(app)
            .post('/api/v1/chatbot/query')
            .send({ query: "" });
        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toBe("Query is required.");
    });

    test("GET /api/v1/chats - should return an empty array for a user with no chats", async () => {
        const newUser = await User.create({ fullName: "Chatless User", email: "chatless@test.com", password: "p", role: "student", phoneNumber: "888" });
        const newToken = newUser.generateAccessToken();
        const res = await request(app)
            .get("/api/v1/chats")
            .set("Authorization", `Bearer ${newToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.data).toEqual([]);
    });

    test("POST /api/v1/chats/messages - should fail if chatId is invalid", async () => {
        const invalidId = '605c72a6b2e3e81e34a70654';
        const res = await request(app)
            .post('/api/v1/chats/messages')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({ chatId: invalidId, content: "Sending to nowhere" });
        expect(res.statusCode).toEqual(500); 
    });
});