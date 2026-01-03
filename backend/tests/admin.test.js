import request from 'supertest';
import { app } from '../src/app.js';
import { User } from '../src/models/user.model.js';
import { Company } from '../src/models/company.model.js';
import { ChatbotSetting } from '../src/models/chatbotSetting.model.js';

describe("Admin Routes", () => {
    let adminToken, studentToken, recruiter;

    beforeEach(async () => {
        const admin = await User.create({ fullName: "Admin User", email: "admin@test.com", password: "adminpassword", role: "admin", phoneNumber: "5555555555" });
        const student = await User.create({ fullName: "Student User", email: "student@test.com", password: "password", role: "student", phoneNumber: "111222333" });
        recruiter = await User.create({ fullName: "Recruiter User", email: "rec@test.com", password: "p", role: "recruiter", phoneNumber: "444" });
        adminToken = admin.generateAccessToken();
        studentToken = student.generateAccessToken();
    });

    test("GET /api/v1/admin/users - should fetch all users", async () => {
        const res = await request(app)
            .get("/api/v1/admin/users")
            .set("Authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.length).toBe(3);
    });

    test("GET /api/v1/admin/companies - should fetch all companies", async () => {
        await Company.create({ name: "Admin View Co", owner: recruiter._id, location: "Test" });
        const res = await request(app)
            .get("/api/v1/admin/companies")
            .set("Authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.length).toBe(1);
    });

    test("PATCH /api/v1/admin/companies/:companyId/toggle-verification - should toggle verification", async () => {
        const company = await Company.create({ name: "Verify Co", owner: recruiter._id, verified: false, location: "Test" });
        const res = await request(app)
            .patch(`/api/v1/admin/companies/${company._id}/toggle-verification`)
            .set("Authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.verified).toBe(true);
    });

    test("GET /api/v1/admin/users - should fail if user is not an admin", async () => {
        const res = await request(app)
            .get("/api/v1/admin/users")
            .set("Authorization", `Bearer ${studentToken}`);
        expect(res.statusCode).toEqual(403);
        expect(res.body.message).toContain("Admin rights required");
    });

    test("GET /api/v1/admin/chatbot-settings - should fetch chatbot settings", async () => {
        const res = await request(app)
            .get("/api/v1/admin/chatbot-settings")
            .set("Authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.data).toHaveProperty("systemPrompt");
    });

    test("PUT /api/v1/admin/chatbot-settings - should update the system prompt", async () => {
        const newPrompt = "You are a new test bot.";
        const res = await request(app)
            .put("/api/v1/admin/chatbot-settings")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ systemPrompt: newPrompt });
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.systemPrompt).toBe(newPrompt);
        
        const settings = await ChatbotSetting.findOne();
        expect(settings.systemPrompt).toBe(newPrompt);
    });

    test("PATCH /api/v1/admin/companies/:companyId/toggle-verification - should return 404 for invalid companyId", async () => {
        const invalidId = '605c72a6b2e3e81e34a70654'; 
        const res = await request(app)
            .patch(`/api/v1/admin/companies/${invalidId}/toggle-verification`)
            .set("Authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toBe("Company not found");
    });

    test("GET /api/v1/admin/companies - should return an empty array when no companies exist", async () => {
        const res = await request(app)
            .get("/api/v1/admin/companies")
            .set("Authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.data).toEqual([]);
    });

    test("PUT /api/v1/admin/chatbot-settings - should fail if systemPrompt is empty", async () => {
        const res = await request(app)
            .put("/api/v1/admin/chatbot-settings")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ systemPrompt: "" }); 
        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toContain("System prompt content is required");
    });
    
    test("GET /api/v1/admin/users - should fetch only the admin user if no others exist", async () => {
        await User.deleteMany({ role: { $ne: 'admin' } });
        const res = await request(app)
            .get("/api/v1/admin/users")
            .set("Authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0].role).toBe('admin');
    });

    test("GET /api/v1/admin/chatbot-settings - should fail if a non-admin tries to access", async () => {
        const res = await request(app)
            .get("/api/v1/admin/chatbot-settings")
            .set("Authorization", `Bearer ${studentToken}`); 
        expect(res.statusCode).toEqual(403);
    });
});