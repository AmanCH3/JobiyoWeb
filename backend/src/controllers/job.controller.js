import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Job } from "../models/job.model.js";
import { Company } from "../models/company.model.js";
import { JobPromotion } from "../models/jobPromotion.model.js";


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
    
    // 1. Fetch Pinned Promotions (Top Block) - Only for Page 1
    let pinnedJobs = [];
    let pinnedJobIds = [];
    
    if (Number(page) === 1) {
        // Find active promotions with pinEnabled
        const pinnedPromos = await JobPromotion.find({
            status: "ACTIVE",
            pinEnabled: true
        })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate({
            path: "job",
            populate: { path: "company", select: "name logo" }
        });
        
        pinnedJobs = pinnedPromos.map(p => {
             if (!p.job) return null;
             // Attach promotion info to the job object for frontend formatting
             const j = p.job.toObject();
             j.promotion = { type: p.planType, label: "Promoted" };
             return j;
        }).filter(Boolean);

        pinnedJobIds = pinnedJobs.map(j => j._id);
    }

    // 2. Main Search Query
    const query = {
        _id: { $nin: pinnedJobIds } // Exclude pinned jobs from main list
    };

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

    // 3. Lookup Promotions for Ranking Boost
    // Join with Active Promotions to determining boost score
    aggregationPipeline.push({
        $lookup: {
            from: "jobpromotions",
            let: { jobId: "$_id" },
            pipeline: [
                { $match: { 
                    $expr: { 
                        $and: [
                           { $eq: ["$job", "$$jobId"] },
                           { $eq: ["$status", "ACTIVE"] }
                        ]
                    }
                }},
                { $limit: 1 } // One job can have multiple, but logic implies one active at a time usually
            ],
            as: "activePromotion"
        }
    });

    // 4. Calculate Sort Score
    // If active promotion exists, use its boostScore, else 0.
    aggregationPipeline.push({
        $addFields: {
            promotion: { $arrayElemAt: ["$activePromotion", 0] },
            sortScore: { 
                $ifNull: [ { $arrayElemAt: ["$activePromotion.boostScore", 0] }, 0 ] 
            }
        }
    });

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

    // 5. Sorting: Boost Score DESC, then CreatedAt DESC
    aggregationPipeline.push({ 
        $sort: { 
            sortScore: -1, 
            createdAt: -1 
        } 
    });

    const skip = (page - 1) * limit;
    aggregationPipeline.push({ $skip: skip });
    aggregationPipeline.push({ $limit: Number(limit) });

    const totalJobs = await Job.countDocuments(query);
    const jobs = await Job.aggregate(aggregationPipeline);

    const finalJobs = jobs.map(job => ({
        ...job, 
        company: job.companyDetails, 
        companyDetails: undefined,
        // Ensure promotion object structure is consistent
        promotion: job.promotion ? { type: job.promotion.planType, label: "Featured" } : null 
    }));

    // If page 1, we might want to return pinned jobs separately, 
    // OR merge them if the frontend expects a single list.
    // Requirement "Step A: show a top Pinned Promoted block" implies separate UI section usually,
    // but often APIs return them combined or in a 'pinned' field.
    // I will return them in a separate 'pinned' field to allow flexible UI rendering.

    return res.status(200).json(new ApiResponse(200, {
        pinned: pinnedJobs,
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