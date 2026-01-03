import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Job } from "../models/job.model.js";
import { Company } from "../models/company.model.js";


const postJob = asyncHandler(async (req, res) => {
    const { title, description, requirements, salary, location, jobType, experienceLevel, companyId } = req.body;

    if (!title || !description || !salary || !location || !jobType || !experienceLevel || !companyId) {
        throw new ApiError(400, "All required fields must be provided");
    }

    const company = await Company.findById(companyId);
    if (!company) {
        throw new ApiError(404, "Company not found");
    }

    if (company.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only post jobs for your own companies");
    }

    const job = await Job.create({
        title,
        description,
        requirements,
        salary,
        location,
        jobType,
        experienceLevel,
        company: companyId,
        postedBy: req.user._id,
    });

    return res.status(201).json(new ApiResponse(201, job, "Job posted successfully"));
});


const getMyPostedJobs = asyncHandler(async (req, res) => {
    const jobs = await Job.find({ postedBy: req.user._id }).populate('company', 'name logo');
    return res.status(200).json(new ApiResponse(200, jobs, "Jobs fetched successfully"));
});

const updateJob = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const job = await Job.findById(id);

    if (!job) {
        throw new ApiError(404, "Job not found");
    }

    if (job.postedBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this job");
    }

    const updatedJob = await Job.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    return res.status(200).json(new ApiResponse(200, updatedJob, "Job updated successfully"));
});


const deleteJob = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const job = await Job.findById(id);

    if (!job) {
        throw new ApiError(404, "Job not found");
    }

    if (job.postedBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this job");
    }
    
    await job.deleteOne();

    return res.status(200).json(new ApiResponse(200, {}, "Job deleted successfully"));
});

 const getAllJobsPublic = asyncHandler(async (req, res) => {
    const { keyword, location, jobType, salaryMin, salaryMax, page = 1, limit = 9 } = req.query;
    
    const query = {};

    if (keyword) {
        query.$or = [
            { title: { $regex: keyword, $options: "i" } },
            { "company.name": { $regex: keyword, $options: "i" } },
            { requirements: { $regex: keyword, $options: "i" } }
        ];
    }
    if (location) {
        query.location = { $regex: location, $options: "i" };
    }
    if (jobType) {
        query.jobType = jobType;
    }
    if (salaryMin || salaryMax) {
        query.salary = {};
        if (salaryMin) query.salary.$gte = Number(salaryMin);
        if (salaryMax) query.salary.$lte = Number(salaryMax);
    }
    
    const aggregationPipeline = [];

    const matchStage = { $match: query };
    aggregationPipeline.push(matchStage);

    aggregationPipeline.push({
        $lookup: {
            from: "companies",
            localField: "company",
            foreignField: "_id",
            as: "companyDetails"
        }
    });
    aggregationPipeline.push({ $unwind: "$companyDetails" });

    if (keyword) {
         matchStage.$match.$or.push({ "companyDetails.name": { $regex: keyword, $options: "i" } });
    }

    const skip = (page - 1) * limit;
    aggregationPipeline.push({ $skip: skip });
    aggregationPipeline.push({ $limit: Number(limit) });

    const totalJobs = await Job.countDocuments(query);
    const jobs = await Job.aggregate(aggregationPipeline);

    const finalJobs = jobs.map(job => ({...job, company: job.companyDetails, companyDetails: undefined}));

    return res.status(200).json(new ApiResponse(200, {
        jobs: finalJobs,
        totalPages: Math.ceil(totalJobs / limit),
        currentPage: Number(page)
    }, "Jobs fetched successfully"));
});

const getJobByIdPublic = asyncHandler(async (req, res) => {
    const job = await Job.findById(req.params.id)
        .populate('company')
        .populate({
            path: 'applications',
            select: 'applicant'
        });

    if (!job) {
        throw new ApiError(404, "Job not found");
    }

    return res.status(200).json(new ApiResponse(200, job, "Job details fetched successfully"));
});

export { postJob, getMyPostedJobs, updateJob, deleteJob,getAllJobsPublic,getJobByIdPublic };