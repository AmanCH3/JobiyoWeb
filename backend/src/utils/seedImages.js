
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Load env vars immediately
dotenv.config({ path: "./.env" });

const seedImages = async () => {
    try {
        // Dynamic imports ensure env vars are loaded BEFORE these modules initialize
        const { default: connectDB } = await import("../config/db.js");
        const { User } = await import("../models/user.model.js");
        const { Company } = await import("../models/company.model.js");
        const { uploadOnCloudinary } = await import("./cloudinary.js");

        await connectDB();
        console.log("Connected to DB");

        const sourcePath = path.resolve("../frontend/public/placeholder.jpg");
        const tempPath = path.resolve("./public/temp/seed-placeholder.jpg");
        
        if (!fs.existsSync(path.dirname(tempPath))) {
            fs.mkdirSync(path.dirname(tempPath), { recursive: true });
        }
        
        fs.copyFileSync(sourcePath, tempPath);
        console.log("Copied seed image to temp:", tempPath);

        const uploadResult = await uploadOnCloudinary(tempPath);

        if (!uploadResult) {
            throw new Error("uploadOnCloudinary returned null");
        }

        const secureUrl = uploadResult.secure_url;
        console.log("Image uploaded to Cloudinary:", secureUrl);

        const updateCompanies = await Company.updateMany(
            { $or: [{ logo: { $exists: false } }, { logo: "" }] },
            { $set: { logo: secureUrl } }
        );
        console.log(`Updated ${updateCompanies.modifiedCount} companies.`);

        const updateUsers = await User.updateMany(
             { $or: [{ "profile.avatar": { $exists: false } }, { "profile.avatar": "" }] },
            { $set: { "profile.avatar": secureUrl } }
        );
        console.log(`Updated ${updateUsers.modifiedCount} users.`);

        console.log("Seeding completed successfully.");
        process.exit(0);

    } catch (error) {
        console.error("Seeding failed with error:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        process.exit(1);
    }
};

seedImages();
