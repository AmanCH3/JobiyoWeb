import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";


export const applyForJob = asyncHandler(async (req, res) => {
    const { jobId } = req.params;
    const applicantId = req.user._id;
      const io = req.app.get("io");


    const job = await Job.findById(jobId);
    if (!job) {
        throw new ApiError(404, "Job not found");
    }
    io.to(job.postedBy.toString()).emit("newApplication", {
        message: `You have a new application for "${job.title}" from ${req.user.fullName}.`,
        jobId: job._id,
    });
    const alreadyApplied = await Application.findOne({ job: jobId, applicant: applicantId });
    if (alreadyApplied) {
        throw new ApiError(400, "You have already applied for this job");
    }

    const application = await Application.create({
        job: jobId,
        applicant: applicantId,
    });

    job.applications.push(application._id);
    await job.save();

    return res.status(201).json(new ApiResponse(201, application, "Applied for job successfully"));
});

export const getMyApplications = asyncHandler(async (req, res) => {
    const applications = await Application.find({ applicant: req.user._id })
        .populate({
            path: 'job',
            populate: {
                path: 'company',
                select: 'name logo'
            }
        })
        .sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, applications, "Your applications fetched successfully"));
});

export const getJobApplicants = asyncHandler(async (req, res) => {
    const { jobId } = req.params;
    const applications = await Application.find({ job: jobId })
        .populate('applicant', 'fullName email profile');

    return res.status(200).json(new ApiResponse(200, applications, "Applicants fetched successfully"));
});

export const updateApplicationStatus = asyncHandler(async (req, res) => {
    const { applicationId } = req.params;
    const { status } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
        throw new ApiError(400, "Invalid status provided");
    }

    const application = await Application.findById(applicationId);
    if (!application) {
        throw new ApiError(404, "Application not found");
    }

    const job = await Job.findById(application.job);
    if (job.postedBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this application's status");
    }

    application.status = status;
    await application.save();
    const io = req.app.get("io");
    io.to(application.applicant.toString()).emit("applicationStatusUpdate", {
        message: `Your application for "${job.title}" has been ${application.status}.`,
        applicationId: application._id,
        status: application.status,
    });

    return res.status(200).json(new ApiResponse(200, application, "Application status updated successfully"));
});