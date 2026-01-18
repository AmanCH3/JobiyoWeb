import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    googleId: {
      type: String,
    },
    role: {
      type: String,
      enum: ["student", "recruiter", "admin"],
      required: true,
    },
    refreshToken: {
      type: String,
    },
    profile: {
      bio: { type: String },
      skills: [{ type: String }],
      resume: { type: String }, 
      resumeOriginalName: { type: String },
      avatar: { type: String }
    },
    resetPasswordOTP: {
      type: String
    },
    resetPasswordOTPExpiry: {
      type: Date
    },
    passwordChangedAt: {
      type: Date,
    },
    passwordExpiresAt: {
      type: Date,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    loginOTP: {
      type: String
    },
    loginOTPExpiry: {
      type: Date
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationOTP: {
      type: String
    },
    emailVerificationOTPExpiry: {
      type: Date
    },
    passwordHistory: [
      {
        hash: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  // If password is modified, update history and timestamps
  // Note: We need to handle the history push carefully. 
  // Ideally, the controller should check for reuse BEFORE setting the new password.
  // Here we just ensure the CURRENT (old) password is saved to history before overwriting?
  // Actually, Mongoose 'this.password' is already the NEW value here if we set it.
  // So managing history typically happens better in the controller or a method before reassignment.
  // However, the prompt asked to "Add helper utils... pushPasswordHistory". 
  // But for the model update, let's at least set the timestamps.
  
  this.passwordChangedAt = new Date();
  
  // Default expiry (can be overridden if using util)
  const PASSWORD_EXPIRE_DAYS = 90;
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + PASSWORD_EXPIRE_DAYS);
  this.passwordExpiresAt = expiry;

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      fullName: this.fullName,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);