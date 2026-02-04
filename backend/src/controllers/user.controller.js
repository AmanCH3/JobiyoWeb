import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import path from "path";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";
import { getPasswordResetTemplate, get2FAVerificationTemplate, getVerificationEmailTemplate } from "../utils/emailTemplates.js";
import { OAuth2Client } from 'google-auth-library';
import { LoginAttempt } from "../models/loginAttempt.model.js";
import { 
    validatePasswordPolicy, 
    isPasswordReused, 
    pushPasswordHistory,
    isPasswordExpired 
} from "../utils/passwordUtils.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { COOKIE_OPTIONS, ACCESS_COOKIE_OPTIONS, REFRESH_COOKIE_OPTIONS } from "../constants.js";
import { RefreshToken } from "../models/refreshToken.model.js";
import { logActivity } from "../utils/activityLogger.js";
import speakeasy from "speakeasy";
import QRCode from "qrcode";

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
  console.log("Register Request Body:", { fullName, email, phoneNumber, role, password: password ? "***" : "MISSING" });

  if ([fullName, email, phoneNumber, password, role].some((field) => field?.trim() === "")) {
    console.error("Validation Failed: Missing required fields");
    throw new ApiError(400, "All fields are required");
  }

  // Validate Password Policy
  const passwordCheck = validatePasswordPolicy(password, { fullName });
  if (!passwordCheck.isValid) {
      console.error("Password Policy Failed:", passwordCheck.message, passwordCheck.details);
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

  // Generate 6 digit OTP for Email Verification
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  createdUser.emailVerificationOTP = otp;
  createdUser.emailVerificationOTPExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes
  await createdUser.save({ validateBeforeSave: false });

  // Send Verification Email
  try {
      console.log(`[REGISTRATION] Sending verification email to: ${createdUser.email}`);
      await sendEmail({
          email: createdUser.email,
          subject: "Verify your email address - Jobiyo",
          html: getVerificationEmailTemplate(otp, createdUser.email)
      });
      console.log(`[REGISTRATION] ✅ Verification email sent successfully to: ${createdUser.email}`);
  } catch (emailError) {
      console.error("[REGISTRATION] ❌ Failed to send verification email:", emailError);
      console.error("[REGISTRATION] Error details:", {
          name: emailError.name,
          message: emailError.message,
          code: emailError.code,
          command: emailError.command
      });
      // We don't rollback registration, but user will need to resend OTP logic if we implemented resend
      // for now, allow them to proceed to verify step (they might not get email, which is an issue)
      // Ideally rollback or warn.
  }

  req.user = createdUser; // Set for logger
  await logActivity({ req, action: "AUTH_REGISTER_INIT", severity: "INFO", entityType: "USER", entityId: createdUser._id });

  return res.status(201).json(new ApiResponse(201, { email: createdUser.email }, "User registered successfully. Please verify your email."));
});

const verifyEmail = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        throw new ApiError(400, "Email and OTP are required");
    }

    const user = await User.findOne({
        email,
        emailVerificationOTP: otp,
        emailVerificationOTPExpiry: { $gt: Date.now() }
    });

    if (!user) {
        throw new ApiError(400, "Invalid or Expired OTP");
    }

    user.isEmailVerified = true;
    user.emailVerificationOTP = undefined;
    user.emailVerificationOTPExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    await logActivity({ 
        req, 
        action: "AUTH_EMAIL_VERIFIED", 
        severity: "INFO", 
        entityType: "USER", 
        entityId: user._id,
        user: user // ensure user is attached for log logic
    });

    return res
        .status(200)
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
                "Email verified successfully. You are now logged in."
            )
        );
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

  if (!user.isEmailVerified) {
      throw new ApiError(403, "Please verify your email address before logging in.", { requiresVerification: true, email: user.email });
  }

  if (user.role !== role) {
    throw new ApiError(403, `User is not registered as a ${role}.`);
  }
  
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    // Atomic increment to prevent race conditions
    const updatedAttempt = await LoginAttempt.findOneAndUpdate(
        { email },
        { $inc: { attempts: 1 } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    if (updatedAttempt.attempts >= 5 && (!updatedAttempt.blockExpires || updatedAttempt.blockExpires < Date.now())) {
        updatedAttempt.blockExpires = Date.now() + 10 * 60 * 1000; // 10 minutes block
        await updatedAttempt.save();
        
        // Log Suspicious Activity
        await logActivity({ 
            req, 
            action: "SUSPICIOUS_ACTIVITY", 
            status: "FAIL", 
            severity: "CRITICAL", 
            category: "SECURITY",
            metadata: { email, reason: "Rate limit triggered (5 failed attempts)" } 
        });

        // Throw 429 immediately so user knows they are blocked
        throw new ApiError(429, "Too many login attempts. Account locked for 10 minutes.");
    }

    // Log normal login failure
    await logActivity({ 
        req, 
        action: "AUTH_LOGIN_FAIL", 
        status: "FAIL", 
        severity: "WARN", 
        category: "SECURITY",
        metadata: { email, reason: "Invalid credentials" } 
    });

    throw new ApiError(401, "Invalid user credentials");
  }

  // Clear failed attempts on successful login
  if (existingAttempt) {
      await LoginAttempt.deleteOne({ email });
  }

  // Check for 2FA
  if (user.twoFactorEnabled) {
      // Priority: Google Authenticator > Email
      if (user.twoFactorSecret) {
          return res.status(200).json(
              new ApiResponse(200, { requiresVerification: true, email: user.email, method: 'authenticator' }, "Please enter code from Authenticator App")
          );
      }

      // Legacy/Fallback: Email OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.loginOTP = otp;
      user.loginOTPExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes
      await user.save({ validateBeforeSave: false });

      const message = `Your 2FA verification code is: ${otp}`;
      const htmlEmail = get2FAVerificationTemplate(otp);

      try {
          await sendEmail({
              email: user.email,
              subject: `Jobiyo Login Verification`,
              message,
              html: htmlEmail,
          });

          return res.status(200).json(
              new ApiResponse(200, { requiresVerification: true, email: user.email, method: 'email' }, "2FA verification code sent to your email")
          );
      } catch (error) {
          user.loginOTP = undefined;
          user.loginOTPExpiry = undefined;
          await user.save({ validateBeforeSave: false });
          throw new ApiError(500, "Failed to send verification email");
      }
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken -loginOTP -loginOTPExpiry");

  // Check if password is expired
  const passwordExpired = isPasswordExpired(user);

  // SESSION FIXATION PROTECTION:
  // 1. Clear any existing session cookies before setting new ones to ensure no pre-login context remains.
  // 2. generateAccessAndRefreshTokens() above rotates the refresh token in the DB, invalidating any old tokens.
  // Manually attach user to req for logging since verifyJWT didn't run
  req.user = loggedInUser;
  await logActivity({ req, action: "AUTH_LOGIN", severity: "INFO", category: "SECURITY" });

  // Build response message
  let message = "User logged In Successfully";
  if (passwordExpired) {
      message = "Login successful, but your password has expired. Please change it immediately.";
  }

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
          passwordExpired, // Include expiry flag in response
        },
        message
      )
    );
});

const verifyLoginOTP = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        throw new ApiError(400, "Email and OTP are required");
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.twoFactorEnabled && user.twoFactorSecret) {
        // Verify Google Authenticator Code
        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: otp,
            window: 1 // Allow 30s slack
        });

        if (!verified) {
            throw new ApiError(400, "Invalid 2FA Code");
        }
    } else {
        // Verify Email OTP (Legacy)
        if (
            !user.loginOTP || 
            user.loginOTP !== otp || 
            !user.loginOTPExpiry || 
            user.loginOTPExpiry < Date.now()
        ) {
            throw new ApiError(400, "Invalid or Expired OTP");
        }

        // Clear OTP only for email flow (as it's one-time)
        user.loginOTP = undefined;
        user.loginOTPExpiry = undefined;
        await user.save({ validateBeforeSave: false });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken -loginOTP -loginOTPExpiry");

    req.user = loggedInUser;
    await logActivity({ req, action: "AUTH_LOGIN_2FA", severity: "INFO", category: "SECURITY" });

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
                "2FA Verified Successfully"
            )
        );
});

const setup2FA = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    
    // Generate a temporary secret
    const secret = speakeasy.generateSecret({
        name: `Jobiyo (${user.email})`
    });

    // Generate QR Code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    return res.status(200).json(
        new ApiResponse(200, { 
            secret: secret.base32, 
            qrCode: qrCodeUrl 
        }, "Scan this QR code with your authenticator app")
    );
});

const verify2FASetup = asyncHandler(async (req, res) => {
    const { token, secret } = req.body;
    
    if (!token || !secret) {
        throw new ApiError(400, "Token and secret are required");
    }

    const verified = speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token
    });

    if (!verified) {
        throw new ApiError(400, "Invalid verification code");
    }

    const user = await User.findById(req.user._id);
    user.twoFactorEnabled = true;
    user.twoFactorSecret = secret;
    await user.save({ validateBeforeSave: false });

    await logActivity({ 
        req, 
        action: "AUTH_2FA_ENABLED", 
        severity: "INFO", 
        category: "SECURITY"
    });

    return res.status(200).json(
        new ApiResponse(200, { twoFactorEnabled: true }, "2FA Enabled Successfully")
    );
});

const toggle2FA = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    
    // This endpoint now only supports DISABLING 2FA
    // To enable, use setup2FA and verify2FASetup
    if (!user.twoFactorEnabled) {
         throw new ApiError(400, "To enable 2FA, please use the setup process.");
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined; // Clear the secret for security when disabled
    await user.save({ validateBeforeSave: false });

    await logActivity({ 
        req, 
        action: "AUTH_2FA_DISABLED", 
        severity: "INFO", 
        category: "SECURITY"
    });

    return res.status(200).json(
        new ApiResponse(200, { twoFactorEnabled: false }, "Two-Factor Authentication Disabled")
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
    await logActivity({ req, action: "AUTH_LOGOUT", severity: "INFO", category: "SECURITY" });

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
    existingToken.revoked = new Date();
    existingToken.replacedByToken = newTokenHash;
    await existingToken.save();
    
    await logActivity({ req, action: "SESSION_REFRESHED", severity: "INFO", category: "SECURITY" });
    
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
        throw new ApiError(409, "This password was used recently. Please choose a new password you haven't used in your last 5 passwords.", [], "", "PASSWORD_REUSED");
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
    await logActivity({ req, action: "AUTH_PASSWORD_RESET", severity: "WARN", category: "SECURITY", entityType: "USER", entityId: user._id });

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
        throw new ApiError(409, "This password was used recently. Please choose a new password you haven't used in your last 5 passwords.", [], "", "PASSWORD_REUSED");
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

    await logActivity({ req, action: "AUTH_PASSWORD_CHANGE", severity: "INFO", category: "SECURITY", entityType: "USER", entityId: user._id });

    return res
        .status(200)
        .clearCookie("accessToken", COOKIE_OPTIONS)
        .clearCookie("refreshToken", COOKIE_OPTIONS)
        .cookie("accessToken", accessToken, ACCESS_COOKIE_OPTIONS)
        .cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS)
        .json(new ApiResponse(200, { accessToken, refreshToken }, "Password changed successfully"));
});

const googleAuth = asyncHandler(async (req, res) => {
    const { idToken, accessToken, role } = req.body;

    let googleId, email, name, picture;

    try {
        if (accessToken) {
            // Verify using Access Token
            const response = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`);
            email = response.data.email;
            name = response.data.name;
            picture = response.data.picture;
            googleId = response.data.sub;
        } else if (idToken) {
            // Verify using ID Token
            const ticket = await client.verifyIdToken({
                idToken,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            googleId = payload.sub;
            email = payload.email;
            name = payload.name;
            picture = payload.picture;
        } else {
             throw new ApiError(400, "Google Token is required");
        }

        let user = await User.findOne({ email });

        if (user) {
            if (!user.googleId) {
                user.googleId = googleId;
                user.authProvider = 'google';
                if (!user.profile?.avatar) {
                    user.profile = { ...user.profile, avatar: picture };
                }
                user.isEmailVerified = true;
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
                phoneNumber: "",
                isEmailVerified: true 
            });
        }

        const { accessToken: newAccessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

        req.user = loggedInUser;
        await logActivity({ req, action: "AUTH_LOGIN_GOOGLE", severity: "INFO", category: "SECURITY", entityType: "USER", entityId: loggedInUser._id });

        return res
            .status(200)
            .cookie("accessToken", newAccessToken, ACCESS_COOKIE_OPTIONS)
            .cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS)
            .json(new ApiResponse(200, { user: loggedInUser, accessToken: newAccessToken, refreshToken }, "Google login successful"));

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
    refreshAccessToken,
    verifyLoginOTP,
    toggle2FA,
    verifyEmail, // Exported
    setup2FA,
    verify2FASetup
};