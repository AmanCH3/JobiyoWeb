import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Company } from "../models/company.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Job } from "../models/job.model.js";

const createCompany = asyncHandler(async (req, res) => {
    const { name, description, website, location } = req.body;

    if (!name) {
        throw new ApiError(400, "compaby name is required");
    }

    const existingCompany = await Company.findOne({ name });
    if (existingCompany) {
        throw new ApiError(409, "company with this name already exists");
    }

    let logoUrl = "";
    if (req.file) {
        const logoLocalPath = req.file.path;
        const logo = await uploadOnCloudinary(logoLocalPath);
        if (!logo) {
            throw new ApiError(500, "Failed to upload logo");
        }
        logoUrl = logo.url;
    }

    const company = await Company.create({
        name,
        description,
        website,
        location,
        logo: logoUrl,
        owner: req.user._id,
    });

    return res.status(201).json(new ApiResponse(201, company, "compnay created successfully"));
});

const getMyCompanies = asyncHandler(async (req, res) => {
    const companies = await Company.find({ owner: req.user._id });
    return res.status(200).json(new ApiResponse(200, companies, "Companies fetched successfully"));
});

 const getPublicCompanies = asyncHandler(async (req, res) => {
    const companies = await Company.find({ verified: true }).sort({ name: 1 });
    return res.status(200).json(new ApiResponse(200, companies, "Verified companies fetched successfully"));
});

const getCompanyById = asyncHandler(async (req, res) => {
    const company = await Company.findById(req.params.id);
    if (!company) {
        throw new ApiError(404, "Company not found");
    }
    return res.status(200).json(new ApiResponse(200, company, "Company Found successfully"));
});

const updateCompany = asyncHandler(async (req, res) => {
    const { name, description, website, location } = req.body;
    const company = await Company.findById(req.params.id);

    if (!company) {
        throw new ApiError(404, "Company not found");
    }

    if (company.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, " not authorizes");
    }
    
    company.name = name || company.name;
    company.description = description || company.description;
    company.website = website || company.website;
    company.location = location || company.location;
    
    if (req.file) {
        const logoLocalPath = req.file.path;
        const logo = await uploadOnCloudinary(logoLocalPath);
        if (!logo) throw new ApiError(500, "Failed to upload new logo");
        company.logo = logo.url;
    }

    const updatedCompany = await company.save();
    return res.status(200).json(new ApiResponse(200, updatedCompany, "Company updated successfully"));
});


const deleteCompany = asyncHandler(async (req, res) => {
    const company = await Company.findById(req.params.id);

    if (!company) {
        throw new ApiError(404, "Company not found");
    }
    
    if (company.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this company");
    }
    
    await company.deleteOne();
    
    await Job.deleteMany({ company: req.params.id });

    return res.status(200).json(new ApiResponse(200, {}, "Company and associated jobs deleted successfully"));
});

 const getCompanyDetailPublic = asyncHandler(async (req, res) => {
    const { companyId } = req.params;
    
    const company = await Company.findOne({ _id: companyId, verified: true });
    if (!company) {
        throw new ApiError(404, "Company not found or not verified");
    }

    const jobs = await Job.find({ company: companyId }).sort({ createdAt: -1 });

    const data = {
        company,
        jobs,
    };

    return res.status(200).json(new ApiResponse(200, data, "Company details fetched successfully"));
});


export { createCompany, getMyCompanies,getPublicCompanies,getCompanyDetailPublic, getCompanyById, updateCompany, deleteCompany };
