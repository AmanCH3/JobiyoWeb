import request from 'supertest';
import { app } from '../src/app.js';
import { User } from '../src/models/user.model.js';
import { Job } from '../src/models/job.model.js';
import { Company } from '../src/models/company.model.js';

describe("User Routes", () => {
    let recruiterId, companyId;

    beforeEach(async () => {
        const recruiter = await User.create({ fullName: "Recruiter For Jobs", email: "rec@jobs.com", password: "p", role: "recruiter", phoneNumber: "98765" });
        const company = await Company.create({ name: "Recommender Co", owner: recruiter._id, location: "Test" });
        recruiterId = recruiter._id;
        companyId = company._id;
    });

    const registerUserHelper = async (email, role) => {
        await User.create({ fullName: "Test", email, password: "password123", role, phoneNumber: Math.random().toString().slice(2, 12) });
    };

    test("POST /api/v1/users/register - should register a new user", async () => {
        const res = await request(app).post("/api/v1/users/register").send({ fullName: "Test User", email: "test@example.com", phoneNumber: "1234567890", password: "password123", role: "student", recaptchaToken: "test-token" });
        expect(res.statusCode).toEqual(201);
    });

    test("POST /api/v1/users/login - should log in a user successfully", async () => {
        await registerUserHelper("login@example.com", "student");
        const res = await request(app).post("/api/v1/users/login").send({ email: "login@example.com", password: "password123", role: "student", recaptchaToken: "test-token" });
        expect(res.statusCode).toEqual(200);
    });

    test("GET /api/v1/users/current-user - should get the current user's profile", async () => {
        const user = await User.create({ fullName: "Current", email: "current@example.com", password: "p", role: "student", phoneNumber: "987" });
        const token = user.generateAccessToken();
        const res = await request(app).get("/api/v1/users/current-user").set("Authorization", `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
    });

    test("PATCH /api/v1/users/update-profile - should update user profile", async () => {
        const user = await User.create({ fullName: "Update User", email: "update@example.com", password: "p", role: "student", phoneNumber: "981" });
        const token = user.generateAccessToken();
        const res = await request(app).patch("/api/v1/users/update-profile").set("Authorization", `Bearer ${token}`).send({ fullName: "Updated Name" });
        expect(res.statusCode).toEqual(200);
    });

    test("GET /api/v1/users/profile/:userId - should get a user's public profile", async () => {
        const userToView = await User.create({ fullName: "Public", email: "public@example.com", password: "p", role: "student", phoneNumber: "111" });
        const token = (await User.create({ fullName: "Viewer", email: "viewer@example.com", password: "p", role: "recruiter", phoneNumber: "444" })).generateAccessToken();
        const res = await request(app).get(`/api/v1/users/profile/${userToView._id}`).set("Authorization", `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
    });

    test("POST /api/v1/users/login - should fail with wrong password", async () => {
        await registerUserHelper("secure@user.com", "student");
        const res = await request(app).post("/api/v1/users/login").send({ email: "secure@user.com", password: "wrong_password", role: "student", recaptchaToken: "test-token" });
        expect(res.statusCode).toEqual(401);
    });

    test("POST /api/v1/users/register - should fail if email already exists", async () => {
        await registerUserHelper("duplicate@example.com", "student");
        const res = await request(app).post("/api/v1/users/register").send({ fullName: "Another User", email: "duplicate@example.com", phoneNumber: "1111111111", password: "password123", role: "student", recaptchaToken: "test-token" });
        expect(res.statusCode).toEqual(409);
    });
    
    test("POST /api/v1/users/login - should fail if role is incorrect", async () => {
        await registerUserHelper("student@role.com", "student");
        const res = await request(app).post("/api/v1/users/login").send({ email: "student@role.com", password: "password123", role: "recruiter", recaptchaToken: "test-token" });
        expect(res.statusCode).toEqual(403);
    });
    
    test("GET /api/v1/users/recommendations - should return latest jobs if user has no skills", async () => {
        const user = await User.create({ fullName: "No Skills User", email: "noskills@example.com", password: "p", role: "student", phoneNumber: "12345" });
        const token = user.generateAccessToken();
        await Job.create({ title: "Latest Job", company: companyId, postedBy: recruiterId, description: "d", requirements: ["r"], salary: 1, location: "l", jobType: "Full-time", experienceLevel: "Entry-level" });
        const res = await request(app).get('/api/v1/users/recommendations').set("Authorization", `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toContain("No skills found");
    });

    test("GET /api/v1/users/recommendations - should return jobs matching user skills", async () => {
        const user = await User.create({ fullName: "Skilled User", email: "skilled@user.com", password: "p", role: "student", phoneNumber: "54321", profile: { skills: ["React", "Node.js"] } });
        const token = user.generateAccessToken();

        await Job.create({ title: "React Developer", requirements: ["React"], company: companyId, postedBy: recruiterId, description: "d", salary: 1, location: "l", jobType: "Full-time", experienceLevel: "Entry-level" });
        await Job.create({ title: "Angular Developer", requirements: ["Angular"], company: companyId, postedBy: recruiterId, description: "d", salary: 1, location: "l", jobType: "Full-time", experienceLevel: "Entry-level" });
        
        const res = await request(app).get('/api/v1/users/recommendations').set("Authorization", `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0].title).toBe("React Developer");
    });

    test("PATCH /api/v1/users/update-profile - should update only the user bio", async () => {
        const user = await User.create({ fullName: "Bio User", email: "bio@user.com", password: "p", role: "student", phoneNumber: "123123" });
        const token = user.generateAccessToken();
        const res = await request(app).patch('/api/v1/users/update-profile').set("Authorization", `Bearer ${token}`).send({ bio: "This is my new bio." });
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.profile.bio).toBe("This is my new bio.");
        expect(res.body.data.fullName).toBe("Bio User"); 
    });

    test("GET /api/v1/users/profile/:userId - should return 404 for non-existent user", async () => {
        const invalidId = '605c72a6b2e3e81e34a70654';
        const token = (await User.create({ fullName: "Token Giver", email: "token@giver.com", password: "p", role: "student", phoneNumber: "321321" })).generateAccessToken();
        const res = await request(app).get(`/api/v1/users/profile/${invalidId}`).set("Authorization", `Bearer ${token}`);
        expect(res.statusCode).toEqual(404);
    });

    test("POST /api/v1/users/login - should not return password in user object", async () => {
        await registerUserHelper("nopass@example.com", "student");
        const res = await request(app).post("/api/v1/users/login").send({ email: "nopass@example.com", password: "password123", role: "student", recaptchaToken: "test-token" });
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.user.password).toBeUndefined();
        expect(res.body.data.user.refreshToken).toBeUndefined();
    });
});