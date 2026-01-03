import request from 'supertest';
import { app } from '../src/app.js';
import { User } from '../src/models/user.model.js';
import { Company } from '../src/models/company.model.js';
import { Job } from '../src/models/job.model.js';

describe("Company Routes", () => {
    let recruiterToken, otherRecruiterToken, recruiterId;

    beforeEach(async () => {
        const recruiter = await User.create({ fullName: "Recruiter Test", email: "recruiter@company.com", password: "password123", role: "recruiter", phoneNumber: "9876543210" });
        const otherRecruiter = await User.create({ fullName: "Other Recruiter", email: "other@rec.com", password: "p", role: "recruiter", phoneNumber: "111" });
        recruiterId = recruiter._id;
        recruiterToken = recruiter.generateAccessToken();
        otherRecruiterToken = otherRecruiter.generateAccessToken();
    });

    test("POST /api/v1/companies - should create a new company", async () => {
        const res = await request(app).post("/api/v1/companies").set("Authorization", `Bearer ${recruiterToken}`).send({ name: "New Tech Inc.", description: "A cool tech company.", location: "San Francisco" });
        expect(res.statusCode).toEqual(201);
    });

    test("GET /api/v1/companies - should get companies owned by the recruiter", async () => {
        await Company.create({ name: "My Company", owner: recruiterId, location: "Test" });
        const res = await request(app).get("/api/v1/companies").set("Authorization", `Bearer ${recruiterToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.length).toBe(1);
    });

    test("PATCH /api/v1/companies/:id - should update a company", async () => {
        const company = await Company.create({ name: "Old Name", owner: recruiterId, location: "Test" });
        const res = await request(app).patch(`/api/v1/companies/${company._id}`).set("Authorization", `Bearer ${recruiterToken}`).send({ name: "New Updated Name" });
        expect(res.statusCode).toEqual(200);
    });

    test("DELETE /api/v1/companies/:id - should delete a company", async () => {
        const company = await Company.create({ name: "To Delete", owner: recruiterId, location: "Test" });
        const res = await request(app).delete(`/api/v1/companies/${company._id}`).set("Authorization", `Bearer ${recruiterToken}`);
        expect(res.statusCode).toEqual(200);
    });

    test("GET /api/v1/companies/public - should fetch all verified companies", async () => {
        await Company.create({ name: "Verified Co", owner: recruiterId, verified: true, location: "Test" });
        await Company.create({ name: "Unverified Co", owner: recruiterId, verified: false, location: "Test" });
        const res = await request(app).get("/api/v1/companies/public");
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.length).toBe(1);
    });

    test("POST /api/v1/companies - should fail if company name already exists", async () => {
        await Company.create({ name: "Existing Company", owner: recruiterId, location: "Test" });
        const res = await request(app).post("/api/v1/companies").set("Authorization", `Bearer ${recruiterToken}`).send({ name: "Existing Company", location: "Anywhere" });
        expect(res.statusCode).toEqual(409);
    });

    test("PATCH /api/v1/companies/:id - should fail if user does not own the company", async () => {
        const company = await Company.create({ name: "Someone Elses Co", owner: recruiterId, location: "Test" });
        const res = await request(app).patch(`/api/v1/companies/${company._id}`).set("Authorization", `Bearer ${otherRecruiterToken}`).send({ name: "Hacked Name" });
        expect(res.statusCode).toEqual(403);
    });

    test("DELETE /api/v1/companies/:id - should fail if user does not own the company", async () => {
        const company = await Company.create({ name: "Another To Delete", owner: recruiterId, location: "Test" });
        const res = await request(app).delete(`/api/v1/companies/${company._id}`).set("Authorization", `Bearer ${otherRecruiterToken}`);
        expect(res.statusCode).toEqual(403);
    });

    test("DELETE /api/v1/companies/:id - should also delete all associated jobs", async () => {
        const company = await Company.create({ name: "Company With Jobs", owner: recruiterId, location: "Test" });
        await Job.create({ title: "Job to be deleted", company: company._id, postedBy: recruiterId, description: "d", requirements: ["r"], salary: 1, location: "l", jobType: "Full-time", experienceLevel: "Entry-level" });
        await request(app).delete(`/api/v1/companies/${company._id}`).set("Authorization", `Bearer ${recruiterToken}`);
        const jobs = await Job.find({ company: company._id });
        expect(jobs.length).toBe(0);
    });

    test("GET /api/v1/companies/public/:companyId - should return 404 for an unverified company", async () => {
        const company = await Company.create({ name: "Private Co", owner: recruiterId, verified: false, location: "Test" });
        const res = await request(app).get(`/api/v1/companies/public/${company._id}`);
        expect(res.statusCode).toEqual(404);
    });
    
    test("GET /api/v1/companies/public/:companyId - should fetch public company details with jobs", async () => {
        const company = await Company.create({ name: "Public Job Co", owner: recruiterId, verified: true, location: "Test" });
        await Job.create({ title: "Public Job 1", company: company._id, postedBy: recruiterId, description: "d", requirements: ["r"], salary: 1, location: "l", jobType: "Full-time", experienceLevel: "Entry-level" });
        const res = await request(app).get(`/api/v1/companies/public/${company._id}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.company.name).toBe("Public Job Co");
        expect(res.body.data.jobs.length).toBe(1);
        expect(res.body.data.jobs[0].title).toBe("Public Job 1");
    });

    test("GET /api/v1/companies/:id - owner should get their own company by ID", async () => {
        const company = await Company.create({ name: "My Private Company", owner: recruiterId, location: "Test" });
        const res = await request(app)
            .get(`/api/v1/companies/${company._id}`)
            .set("Authorization", `Bearer ${recruiterToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.name).toBe("My Private Company");
    });

    test("GET /api/v1/companies/:id - should return 404 for a non-existent company ID", async () => {
        const invalidId = '605c72a6b2e3e81e34a70654';
        const res = await request(app)
            .get(`/api/v1/companies/${invalidId}`)
            .set("Authorization", `Bearer ${recruiterToken}`);
        expect(res.statusCode).toEqual(404);
    });

    test("GET /api/v1/companies/:id - should fail if recruiter does not own the company", async () => {
        const company = await Company.create({ name: "Other's Private Company", owner: recruiterId, location: "Test" });
        const res = await request(app)
            .get(`/api/v1/companies/${company._id}`)
            .set("Authorization", `Bearer ${otherRecruiterToken}`);
        expect(res.statusCode).toEqual(200); 
    });

    test("GET /api/v1/companies/public/:companyId - should return company details and empty jobs array", async () => {
        const company = await Company.create({ name: "Public No-Job Co", owner: recruiterId, verified: true, location: "Test" });
        const res = await request(app).get(`/api/v1/companies/public/${company._id}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.company.name).toBe("Public No-Job Co");
        expect(res.body.data.jobs).toEqual([]);
    });
});