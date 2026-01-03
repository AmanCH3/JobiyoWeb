import request from 'supertest';
import { app } from '../src/app.js';
import { User } from '../src/models/user.model.js';
import { Company } from '../src/models/company.model.js';
import { Job } from '../src/models/job.model.js';

describe("Job Routes", () => {
    let recruiterToken, otherRecruiterToken, recruiterId, companyId;

    beforeEach(async () => {
        const recruiter = await User.create({ fullName: "Job Recruiter", email: "recruiter@job.com", password: "p", role: "recruiter", phoneNumber: "9998887776"});
        const otherRecruiter = await User.create({ fullName: "Other Job Rec", email: "other@job.com", password: "p", role: "recruiter", phoneNumber: "111222333" });
        recruiterId = recruiter._id;
        recruiterToken = recruiter.generateAccessToken();
        otherRecruiterToken = otherRecruiter.generateAccessToken();
        const company = await Company.create({ name: "Job Company", owner: recruiterId, location: "Test" });
        companyId = company._id;
    });

    const jobData = { title: "Software Engineer", description: "Desc", requirements: ["JS"], salary: 120000, location: "Remote", jobType: "Full-time", experienceLevel: "Mid-level" };

    test("POST /api/v1/jobs - should post a new job", async () => {
        const res = await request(app).post("/api/v1/jobs").set("Authorization", `Bearer ${recruiterToken}`).send({ ...jobData, companyId });
        expect(res.statusCode).toEqual(201);
    });

    test("GET /api/v1/jobs - should get jobs posted by the recruiter", async () => {
        await Job.create({ ...jobData, company: companyId, postedBy: recruiterId });
        const res = await request(app).get("/api/v1/jobs").set("Authorization", `Bearer ${recruiterToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.length).toBe(1);
    });

    test("PATCH /api/v1/jobs/:id - should update a job posting", async () => {
        const job = await Job.create({ ...jobData, company: companyId, postedBy: recruiterId });
        const res = await request(app).patch(`/api/v1/jobs/${job._id}`).set("Authorization", `Bearer ${recruiterToken}`).send({ title: "Senior SE" });
        expect(res.statusCode).toEqual(200);
    });

    test("DELETE /api/v1/jobs/:id - should delete a job", async () => {
        const job = await Job.create({ ...jobData, company: companyId, postedBy: recruiterId });
        const res = await request(app).delete(`/api/v1/jobs/${job._id}`).set("Authorization", `Bearer ${recruiterToken}`);
        expect(res.statusCode).toEqual(200);
    });
   
    test("GET /api/v1/jobs/public - should fetch and filter public jobs", async () => {
        await Job.create({ ...jobData, title: "React Dev", company: companyId, postedBy: recruiterId });
        const res = await request(app).get("/api/v1/jobs/public?keyword=React");
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.jobs.length).toBe(1);
    });

    test("POST /api/v1/jobs - should fail if company is owned by another recruiter", async () => {
        const res = await request(app).post("/api/v1/jobs").set("Authorization", `Bearer ${otherRecruiterToken}`).send({ ...jobData, companyId });
        expect(res.statusCode).toEqual(403);
    });

    test("PATCH /api/v1/jobs/:id - should fail if user did not post the job", async () => {
        const job = await Job.create({ ...jobData, company: companyId, postedBy: recruiterId });
        const res = await request(app).patch(`/api/v1/jobs/${job._id}`).set("Authorization", `Bearer ${otherRecruiterToken}`).send({ title: "New Title" });
        expect(res.statusCode).toEqual(403);
    });
    
    test("GET /api/v1/jobs/public - should correctly apply pagination", async () => {
        for (let i = 0; i < 3; i++) { await Job.create({ ...jobData, title: `Job ${i}`, company: companyId, postedBy: recruiterId }); }
        const res = await request(app).get("/api/v1/jobs/public?page=2&limit=2");
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.jobs.length).toBe(1);
    });

    test("GET /api/v1/jobs/public - should filter by jobType and location", async () => {
        await Job.create({ ...jobData, location: "New York", jobType: "Full-time", company: companyId, postedBy: recruiterId });
        await Job.create({ ...jobData, location: "New York", jobType: "Part-time", company: companyId, postedBy: recruiterId });
        const res = await request(app).get("/api/v1/jobs/public?location=New%20York&jobType=Full-time");
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.jobs.length).toBe(1);
    });

    test("GET /api/v1/jobs/public/:id - should fetch a single public job by its ID", async () => {
        const job = await Job.create({ ...jobData, company: companyId, postedBy: recruiterId });
        const res = await request(app).get(`/api/v1/jobs/public/${job._id}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.title).toBe("Software Engineer");
    });

    test("GET /api/v1/jobs/public/:id - should return 404 for a non-existent job ID", async () => {
        const invalidId = '605c72a6b2e3e81e34a70654';
        const res = await request(app).get(`/api/v1/jobs/public/${invalidId}`);
        expect(res.statusCode).toEqual(404);
    });

    test("GET /api/v1/jobs - should return an empty array if recruiter has posted no jobs", async () => {
        const res = await request(app)
            .get("/api/v1/jobs")
            .set("Authorization", `Bearer ${otherRecruiterToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.data).toEqual([]);
    });

    test("GET /api/v1/jobs/public - should return empty array if keyword matches no jobs", async () => {
        await Job.create({ ...jobData, title: "React Dev", company: companyId, postedBy: recruiterId });
        const res = await request(app).get("/api/v1/jobs/public?keyword=NodeJS");
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.jobs).toEqual([]);
    });
});