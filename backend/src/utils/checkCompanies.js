
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

const checkCompanies = async () => {
    try {
        const { default: connectDB } = await import("../config/db.js");
        const { Company } = await import("../models/company.model.js");

        await connectDB();
        console.log("Connected to DB");

        const companies = await Company.find({}, "name");
        console.log("--- Company List ---");
        companies.forEach(c => console.log(c.name));
        console.log("--------------------");
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkCompanies();
