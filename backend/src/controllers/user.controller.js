import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import path from "path";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating refresh and access tokens");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, phoneNumber, password, role } = req.body;

  if ([fullName, email, phoneNumber, password, role].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({ email });

  if (existedUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  const user = await User.create({
    fullName,
    email,
    phoneNumber,
    password,
    role,
  });

  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res.status(201).json(new ApiResponse(201, createdUser, "User registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    throw new ApiError(400, "Email, password, and role are required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  if (user.role !== role) {
    throw new ApiError(403, `User is not registered as a ${role}.`);
  }
  
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});

const updateProfile = asyncHandler(async (req, res) => {
    const { fullName, bio, skills } = req.body;
    const user = await User.findById(req.user._id);

    if (fullName) user.fullName = fullName;
    if (bio) user.profile.bio = bio;
    if (skills) user.profile.skills = skills.split(',').map(skill => skill.trim());

    if (req.files && req.files.resume) {
        const resumeFile = req.files.resume[0];
        const resumeLocalPath = resumeFile.path;

        if (path.extname(resumeFile.originalname).toLowerCase() === '.pdf') {
            console.log("PDF resume detected. Storing locally.");
            user.profile.resume = `/temp/${resumeFile.filename}`;
            user.profile.resumeOriginalName = resumeFile.originalname;
        } else {
            console.log("Non-PDF resume detected. Uploading to Cloudinary.");
            const resumeUpload = await uploadOnCloudinary(resumeLocalPath);
            if (!resumeUpload) {
                throw new ApiError(500, "Failed to upload resume to Cloudinary");
            }
            user.profile.resume = resumeUpload.url;
            user.profile.resumeOriginalName = resumeFile.originalname;
        }
    }
    
    if (req.files && req.files.avatar) {
        const avatarLocalPath = req.files.avatar[0].path;
        const avatarUpload = await uploadOnCloudinary(avatarLocalPath);
        if (!avatarUpload) throw new ApiError(500, "Failed to upload avatar");
        user.profile.avatar = avatarUpload.url;
    }

    await user.save({ validateBeforeSave: false });

    const updatedUser = await User.findById(req.user._id).select("-password -refreshToken");

    return res
        .status(200)
        .json(new ApiResponse(200, updatedUser, "Profile updated successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
      .status(200)
      .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

const getUserPublicProfile = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const user = await User.findById(userId).select("fullName email profile");
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    return res.status(200).json(new ApiResponse(200, user, "User profile fetched successfully"));
});

const getJobRecommendations = asyncHandler(async (req, res) => {
    const { Job } = await import("../models/job.model.js");
    const user = await User.findById(req.user._id);
    if (!user.profile?.skills || user.profile.skills.length === 0) {
        const latestJobs = await Job.find({}).sort({ createdAt: -1 }).limit(10).populate('company', 'name logo');
        return res.status(200).json(new ApiResponse(200, latestJobs, "No skills found, returning latest jobs."));
    }

    const userSkills = user.profile.skills.map(skill => new RegExp(skill, 'i'));

    const recommendedJobs = await Job.find({
        $or: [
            { title: { $in: userSkills } },
            { requirements: { $in: userSkills } }
        ]
    }).limit(10).populate('company', 'name logo');
    
    return res.status(200).json(new ApiResponse(200, recommendedJobs, "Job recommendations fetched successfully"));
});

export { registerUser, getUserPublicProfile, getJobRecommendations, loginUser, getCurrentUser, updateProfile };