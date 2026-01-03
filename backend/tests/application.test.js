import request from 'supertest';
import { app } from '../src/app.js';
import { User } from '../src/models/user.model.js';
import { Company } from '../src/models/company.model.js';
import { Job } from '../src/models/job.model.js';
import { Application } from '../src/models/application.model.js';

describe("Application Routes", () => {
    let studentToken, recruiterToken, otherRecruiterToken, jobId, studentId, application, recruiterId;

    beforeEach(async () => {
        const student = await User.create({ fullName: "Student Applicant", email: "student@app.com", password: "password", role: "student", phoneNumber: "123123123" });
        const recruiter = await User.create({ fullName: "Recruiter App", email: "recruiter@app.com", password: "password", role: "recruiter", phoneNumber: "321321321" });
        const otherRecruiter = await User.create({ fullName: "Other Recruiter", email: "other@rec.com", password: "p", role: "recruiter", phoneNumber: "555" });
        const company = await Company.create({ name: "Apply Company", owner: recruiter._id, location: "Test" });
        const job = await Job.create({ title: "Apply Job", postedBy: recruiter._id, company: company._id, description: "d", requirements: ["r"], salary: 1, location: "l", jobType: "Full-time", experienceLevel: "Entry-level" });
        application = await Application.create({ job: job._id, applicant: student._id });

        studentToken = student.generateAccessToken();
        recruiterToken = recruiter.generateAccessToken();
        otherRecruiterToken = otherRecruiter.generateAccessToken();
        jobId = job._id;
        studentId = student._id;
        recruiterId = recruiter._id;
    });

    test("POST /api/v1/applications/apply/:jobId - should allow a student to apply for a job", async () => {
        const newJob = await Job.create({ title: "New Apply Job", postedBy: recruiterId, company: (await Company.findOne())._id, description: "d", requirements: ["r"], salary: 1, location: "l", jobType: "Full-time", experienceLevel: "Entry-level" });
        const res = await request(app).post(`/api/v1/applications/apply/${newJob._id}`).set("Authorization", `Bearer ${studentToken}`);
        expect(res.statusCode).toEqual(201);
    });

    test("GET /api/v1/applications/job/:jobId/applicants - should get all applicants for a job", async () => {
        const res = await request(app).get(`/api/v1/applications/job/${jobId}/applicants`).set("Authorization", `Bearer ${recruiterToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.length).toBe(1);
    });

    test("PATCH /api/v1/applications/:applicationId/status - should update an application's status", async () => {
        const res = await request(app).patch(`/api/v1/applications/${application._id}/status`).set("Authorization", `Bearer ${recruiterToken}`).send({ status: "accepted" });
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.status).toBe("accepted");
    });


    test("POST /api/v1/applications/apply/:jobId - should fail if user already applied", async () => {
        const res = await request(app).post(`/api/v1/applications/apply/${jobId}`).set("Authorization", `Bearer ${studentToken}`);
        expect(res.statusCode).toEqual(400);
    });

    test("PATCH /api/v1/applications/:applicationId/status - should fail with an invalid status", async () => {
        const res = await request(app).patch(`/api/v1/applications/${application._id}/status`).set("Authorization", `Bearer ${recruiterToken}`).send({ status: "interviewing" });
        expect(res.statusCode).toEqual(400);
    });

    test("PATCH /api/v1/applications/:applicationId/status - should fail if user is not the job poster", async () => {
        const res = await request(app).patch(`/api/v1/applications/${application._id}/status`).set("Authorization", `Bearer ${otherRecruiterToken}`).send({ status: "rejected" });
        expect(res.statusCode).toEqual(403);
    });

    test("GET /api/v1/applications/my-applications - should fetch the student's own applications", async () => {
        const res = await request(app)
            .get("/api/v1/applications/my-applications")
            .set("Authorization", `Bearer ${studentToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0].job.title).toBe("Apply Job");
    });


    test("GET /api/v1/applications/my-applications - should return empty array for a new user", async () => {
        const newUser = await User.create({ fullName: "New Student", email: "new@student.com", password: "p", role: "student", phoneNumber: "999" });
        const newToken = newUser.generateAccessToken();
        const res = await request(app)
            .get("/api/v1/applications/my-applications")
            .set("Authorization", `Bearer ${newToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.data).toEqual([]);
    });

    test("GET /api/v1/applications/job/:jobId/applicants - should return empty array for a job with no applicants", async () => {
        const newJob = await Job.create({ title: "Job with No Apps", postedBy: recruiterId, company: (await Company.findOne())._id, description: "d", requirements: ["r"], salary: 1, location: "l", jobType: "Full-time", experienceLevel: "Entry-level" });
        const res = await request(app)
            .get(`/api/v1/applications/job/${newJob._id}/applicants`)
            .set("Authorization", `Bearer ${recruiterToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.data).toEqual([]);
    });
});