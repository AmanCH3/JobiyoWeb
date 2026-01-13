import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import path from "path";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";
import { getPasswordResetTemplate } from "../utils/emailTemplates.js";
import { OAuth2Client } from 'google-auth-library';
import { LoginAttempt } from "../models/loginAttempt.model.js";
import { 
    validatePasswordPolicy, 
    isPasswordReused, 
    pushPasswordHistory 
} from "../utils/passwordUtils.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { COOKIE_OPTIONS, ACCESS_COOKIE_OPTIONS, REFRESH_COOKIE_OPTIONS } from "../constants.js";
import { RefreshToken } from "../models/refreshToken.model.js";
import { logActivity } from "../utils/activityLogger.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Hash the refresh token for secure storage
    const tokenHash = crypto
        .createHash('sha256')
        .update(refreshToken)
        .digest('hex');

    // Create a new RefreshToken document
    await RefreshToken.create({
        user: userId,
        token: tokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days match REFRESH_COOKIE_OPTIONS
    });
    
    // We no longer store refreshToken on the User document itself
    // user.refreshToken = refreshToken; 
    // await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Token generation error:", error);
    throw new ApiError(500, "Something went wrong while generating refresh and access tokens");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, phoneNumber, password, role } = req.body;

  if ([fullName, email, phoneNumber, password, role].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  // Validate Password Policy
  const passwordCheck = validatePasswordPolicy(password, { fullName });
  if (!passwordCheck.isValid) {
      throw new ApiError(400, passwordCheck.message, passwordCheck.details, "", "WEAK_PASSWORD");
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

  req.user = createdUser; // Set for logger
  await logActivity({ req, action: "AUTH_REGISTER", severity: "INFO", entityType: "USER", entityId: createdUser._id });

  return res.status(201).json(new ApiResponse(201, createdUser, "User registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    throw new ApiError(400, "Email, password, and role are required");
  }

  const existingAttempt = await LoginAttempt.findOne({ email });

  if (existingAttempt && existingAttempt.blockExpires > Date.now()) {
      const timeLeft = Math.ceil((existingAttempt.blockExpires - Date.now()) / 60000); // Minutes
      throw new ApiError(429, `Too many login attempts. Please try again after ${timeLeft} minutes.`);
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
    if (existingAttempt) {
        existingAttempt.attempts += 1;
        if (existingAttempt.attempts >= 5) {
            existingAttempt.blockExpires = Date.now() + 10 * 60 * 1000; // 10 minutes block
        }
        await existingAttempt.save();
    } else {
        await LoginAttempt.create({
            email,
            attempts: 1,
        });
    }
    await logActivity({ 
        req, 
        action: "AUTH_LOGIN_FAIL", 
        status: "FAIL", 
        severity: "WARN", 
        metadata: { email, reason: "Invalid credentials" } 
    });
    throw new ApiError(401, "Invalid user credentials");
  }

  // Clear failed attempts on successful login
  if (existingAttempt) {
      await LoginAttempt.deleteOne({ email });
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  // SESSION FIXATION PROTECTION:
  // 1. Clear any existing session cookies before setting new ones to ensure no pre-login context remains.
  // 2. generateAccessAndRefreshTokens() above rotates the refresh token in the DB, invalidating any old tokens.
  // Manually attach user to req for logging since verifyJWT didn't run
  req.user = loggedInUser;
  await logActivity({ req, action: "AUTH_LOGIN", severity: "INFO" });

  return res
    .status(200)
    .clearCookie("accessToken", COOKIE_OPTIONS)
    .clearCookie("refreshToken", COOKIE_OPTIONS)
    .cookie("accessToken", accessToken, ACCESS_COOKIE_OPTIONS)
    .cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS)
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

    // Log the profile update
    await logActivity({ 
        req, 
        action: "PROFILE_UPDATE", 
        entityType: "USER", 
        entityId: updatedUser._id,
        metadata: { updatedFields: Object.keys(req.body) }
    });

    return res
        .status(200)
        .json(new ApiResponse(200, updatedUser, "Profile updated successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
      .status(200)
      .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {
    // If we have a refresh token in the cookie, revoke it specifically
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (incomingRefreshToken) {
        const tokenHash = crypto.createHash('sha256').update(incomingRefreshToken).digest('hex');
        await RefreshToken.findOneAndUpdate(
            { token: tokenHash },
            { revoked: new Date() }
        );
    }

    // Also clear the legacy field on User if it exists, just in case
    await User.findByIdAndUpdate(
        req.user._id,
        { $unset: { refreshToken: 1 } },
        { new: true }
    );

    // SESSION FIXATION PROTECTION:
    // Explicitly destroy the session by removing the refresh token from DB and clearing cookies.
    await logActivity({ req, action: "AUTH_LOGOUT", severity: "INFO" });

    return res
        .status(200)
        .clearCookie("accessToken", COOKIE_OPTIONS)
        .clearCookie("refreshToken", COOKIE_OPTIONS)
        .json(new ApiResponse(200, {}, "User logged out"))
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    // Verify JWT integrity FIRST
    let decodedToken;
    try {
        decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    } catch (error) {
        throw new ApiError(401, "Invalid refresh token")
    }

    // Verify against DB (Rotation & Reuse Detection)
    const tokenHash = crypto.createHash('sha256').update(incomingRefreshToken).digest('hex');
    const existingToken = await RefreshToken.findOne({ token: tokenHash });

    if (!existingToken) {
        // Token valid signature but not in DB? Possible compromised or very old.
        throw new ApiError(401, "Refresh token not found or invalid");
    }

    // REUSE DETECTION
    if (existingToken.revoked) {
        // CRITICAL: Attempt to use a revoked token. Assume theft.
        // Action: Revoke ALL tokens for this user family.
        await RefreshToken.updateMany(
            { user: decodedToken._id },
            { revoked: new Date() }
        );
        console.error(`[SECURITY] Refresh Token Reuse Detected! User: ${decodedToken._id}. All sessions revoked.`);
        throw new ApiError(403, "Security Alert: Session reuse detected. Please sign in again.");
    }
    
    // Check if user still exists
    const user = await User.findById(decodedToken?._id)
    if (!user) {
        throw new ApiError(401, "User not found")
    }

    // ROTATION:
    // 1. Mark current token as revoked (and replaced)
    // 2. Issue NEW tokens
    
    // We can't know the *next* token usage ID yet, but we will generate one.
    // Ideally we generate first.
    
    const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id);
    
    // Hash the NEW token to link them (optional chaining)
    const newTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');

    existingToken.revoked = new Date();
    existingToken.replacedByToken = newTokenHash;
    await existingToken.save();
    
    return res
    .status(200)
    .cookie("accessToken", accessToken, ACCESS_COOKIE_OPTIONS)
    .cookie("refreshToken", newRefreshToken, REFRESH_COOKIE_OPTIONS)
    .json(
        new ApiResponse(
            200,
            { accessToken, refreshToken: newRefreshToken },
            "Access token refreshed"
        )
    )
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

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set OTP and expiry (10 minutes)
    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpiry = Date.now() + 10 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    // Assuming Frontend runs on localhost:5173 for dev. Ideally use process.env.CORS_ORIGIN or a specific FRONTEND_URL env var.
    const resetUrl = `http://localhost:5173/forgot-password?email=${user.email}&otp=${otp}`;

    const message = `Your password reset OTP is :- \n\n ${otp} \n\nClick the link below to verify automatically:\n${resetUrl}\n\nIf you have not requested this email then, please ignore it.`;
    const htmlEmail = getPasswordResetTemplate(otp, resetUrl);

    try {
        await sendEmail({
            email: user.email,
            subject: `Jobiyo Password Recovery`,
            message,
            html: htmlEmail,
        });

        res.status(200).json(new ApiResponse(200, {}, `Email sent to ${user.email} successfully`));
    } catch (error) {
        user.resetPasswordOTP = undefined;
        user.resetPasswordOTPExpiry = undefined;

        await user.save({ validateBeforeSave: false });

        throw new ApiError(500, error.message);
    }
});

const verifyOTP = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        throw new ApiError(400, "Email and OTP are required");
    }

    const user = await User.findOne({ 
        email,
        resetPasswordOTP: otp,
        resetPasswordOTPExpiry: { $gt: Date.now() }
    });

    if (!user) {
        throw new ApiError(400, "Invalid or Expired OTP");
    }

    return res.status(200).json(new ApiResponse(200, {}, "OTP verified successfully"));
});

const resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findOne({ 
        email,
        resetPasswordOTP: otp,
        resetPasswordOTPExpiry: { $gt: Date.now() }
    });

    if (!user) {
        throw new ApiError(400, "Invalid or Expired OTP");
    }

    // Validate Password Policy
    const passwordCheck = validatePasswordPolicy(newPassword, user);
    if (!passwordCheck.isValid) {
        throw new ApiError(400, passwordCheck.message, passwordCheck.details, "", "WEAK_PASSWORD");
    }

    // Check for reuse
    if (await isPasswordReused(user, newPassword)) {
        throw new ApiError(409, "You cannot reuse a recent password.", [], "", "PASSWORD_REUSED");
    }

    // Push to history
    const hashedForHistory = await bcrypt.hash(newPassword, 10);
    pushPasswordHistory(user, hashedForHistory);

    user.password = newPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpiry = undefined;
    
    // SESSION PROTECTION:
    // Invalidate all existing sessions on password reset to prevent access with stolen tokens.
    // SESSION PROTECTION:
    // Invalidate all existing sessions on password reset to prevent access with stolen tokens.
    // user.refreshToken = undefined; // Deprecated
    await RefreshToken.updateMany(
        { user: user._id },
        { revoked: new Date() }
    );

    // Hack: Attach user to req for logging since this might be a public endpoint (forgot password flow)
    // Actually, req.user might be undefined if this is public.
    // The logger utility expects req.user. If undefined, it just logs unknown user.
    // We can manually reconstruct a partial user object for the logger.
    req.user = user; 
    await logActivity({ req, action: "AUTH_PASSWORD_RESET", severity: "WARN", entityType: "USER", entityId: user._id });

    await user.save();

    return res.status(200).json(new ApiResponse(200, {}, "Password reset successfully"));

});

const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password");
    }

    // Validate Password Policy
    const passwordCheck = validatePasswordPolicy(newPassword, user);
    if (!passwordCheck.isValid) {
        throw new ApiError(400, passwordCheck.message, passwordCheck.details, "", "WEAK_PASSWORD");
    }

    // Check for reuse
    if (await isPasswordReused(user, newPassword)) {
        throw new ApiError(409, "You cannot reuse a recent password.", [], "", "PASSWORD_REUSED");
    }

    // Push to history
    const hashedForHistory = await bcrypt.hash(newPassword, 10);
    pushPasswordHistory(user, hashedForHistory);

    user.password = newPassword;
    await user.save({ validateBeforeSave: false }); // Save password first

    // SESSION FIXATION PROTECTION:
    // Rotate tokens effectively.
    // Issue NEW cookies so the legitimate user stays logged in but with a fresh session.
    
    // Revoke ALL previous sessions (optional strictly, but good practice on password change to force others out)
    await RefreshToken.updateMany(
         { user: user._id },
         { revoked: new Date() }
    );
    
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    await logActivity({ req, action: "AUTH_PASSWORD_CHANGE", severity: "INFO", entityType: "USER", entityId: user._id });

    return res
        .status(200)
        .clearCookie("accessToken", COOKIE_OPTIONS)
        .clearCookie("refreshToken", COOKIE_OPTIONS)
        .cookie("accessToken", accessToken, ACCESS_COOKIE_OPTIONS)
        .cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS)
        .json(new ApiResponse(200, { accessToken, refreshToken }, "Password changed successfully"));
});

const googleAuth = asyncHandler(async (req, res) => {
    const { idToken, role } = req.body;

    if (!idToken) {
        throw new ApiError(400, "Google ID Token is required");
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        let user = await User.findOne({ email });

        if (user) {
            if (!user.googleId) {
                user.googleId = googleId;
                user.authProvider = 'google';
                if (!user.profile?.avatar) {
                    user.profile = { ...user.profile, avatar: picture };
                }
                await user.save({ validateBeforeSave: false });
            }
        } else {
            if (!role) {
                throw new ApiError(404, "User not found. Please register first with a role.");
            }

            user = await User.create({
                fullName: name,
                email,
                role,
                googleId,
                authProvider: 'google',
                profile: {
                    avatar: picture
                },
                phoneNumber: "" // Providing empty string since it's optional but might be expected
            });
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

        req.user = loggedInUser;
        await logActivity({ req, action: "AUTH_LOGIN_GOOGLE", severity: "INFO", entityType: "USER", entityId: loggedInUser._id });

        return res
            .status(200)
            .cookie("accessToken", accessToken, ACCESS_COOKIE_OPTIONS)
            .cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS)
            .json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "Google login successful"));

    } catch (error) {
        console.error("Google Auth Error:", error);
        throw new ApiError(401, error.message || "Invalid Google Token");
    }
});

export { 
    registerUser, 
    getUserPublicProfile, 
    getJobRecommendations, 
    loginUser, 
    getCurrentUser, 
    updateProfile, 
    forgotPassword, 
    verifyOTP, 
    resetPassword,
    changePassword,
    googleAuth,
    logoutUser,
    refreshAccessToken
};