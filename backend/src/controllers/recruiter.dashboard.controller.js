import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Company } from "../models/company.model.js";
import { Job } from "../models/job.model.js";
import { Application } from "../models/application.model.js";

const getRecruiterStats = asyncHandler(async (req, res) => {
    const recruiterId = req.user._id;

    const totalCompanies = await Company.countDocuments({ owner: recruiterId });
    const totalJobs = await Job.countDocuments({ postedBy: recruiterId });

    const recruiterJobs = await Job.find({ postedBy: recruiterId }).select('_id');
    const jobIds = recruiterJobs.map(job => job._id);
    
    const totalApplicants = await Application.countDocuments({ job: { $in: jobIds } });

    const stats = {
        totalCompanies,
        totalJobs,
        totalApplicants,
    };

    return res.status(200).json(new ApiResponse(200, stats, "Recruiter stats fetched successfully"));
});

const getRecentApplicants = asyncHandler(async (req, res) => {
    const recruiterId = req.user._id;

    const recruiterJobs = await Job.find({ postedBy: recruiterId }).select('_id');
    const jobIds = recruiterJobs.map(job => job._id);
    
    const recentApplicants = await Application.find({ job: { $in: jobIds } })
        .sort({ createdAt: -1 }) 
        .limit(5) 
        .populate({ 
            path: 'applicant',
            select: 'fullName email profile.avatar'
        })
        .populate({ 
            path: 'job',
            select: 'title'
        });

    return res.status(200).json(new ApiResponse(200, recentApplicants, "Recent applicants fetched successfully"));
});

export {getRecruiterStats,getRecentApplicants}