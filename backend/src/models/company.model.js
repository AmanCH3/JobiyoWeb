import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Company name is required"],
      unique: true,
    },
    description: {
      type: String,
    },
    website: {
      type: String,
    },
    location: {
      type: String,
    },
    logo: {
      type: String,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    verified: { 
        type: Boolean,
        default: false,
    }
  },
  { timestamps: true }
);

export const Company = mongoose.model("Company", companySchema);