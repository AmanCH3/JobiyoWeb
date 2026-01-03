
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import https from "https";

// Load env vars immediately
dotenv.config({ path: "./.env" });

const companyDomains = {
    "Leapfrog Technology": "lftechnology.com",
    "F1Soft International": "f1soft.com",
    "CloudFactory Nepal": "cloudfactory.com",
    "Verisk Nepal": "verisk.com",
    "YoungInnovations": "younginnovations.com.np",
    "Chaudhary Group": "chaudharygroup.com",
    "Himalayan Bank": "himalayanbank.com",
    "Surya Nepal Pvt. Ltd.": "suryanepal.com", // might fail, fallback?
    "Dabur Nepal": "dabur.com",
    "Gorkha Brewery": "gorkhabrewery.com", // check domain
    "WorldLink Communications": "worldlink.com.np",
    "Vianet Communications": "vianet.com.np",
    "Ncell Axiata": "ncell.axiata.com", // try ncell.com.np
    "Nepal Telecom": "ntc.net.np",
    "Janaki Technology": "janakitech.com",
    "Fusemachines Nepal": "fusemachines.com",
    "EB Pearls": "ebpearls.com.au",
    "Cotiviti Nepal": "cotiviti.com",
    "Incessant Rain Studios": "incessantrain.com"
};

const downloadImage = (url, filepath) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filepath);
        https.get(url, (response) => {
            // Handle redirects
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                file.close();
                return resolve(downloadImage(response.headers.location, filepath));
            }

            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => {
                    file.close(resolve);
                });
            } else {
                file.close(); // Close before simple unlink
                fs.unlink(filepath, () => {}); 
                reject(`Server responded with ${response.statusCode}: ${url}`);
            }
        }).on('error', (err) => {
            fs.unlink(filepath, () => {});
            reject(err.message);
        });
    });
};

const seedRealLogos = async () => {
    try {
        const { default: connectDB } = await import("../config/db.js");
        const { Company } = await import("../models/company.model.js");
        const { uploadOnCloudinary } = await import("./cloudinary.js");

        await connectDB();
        console.log("Connected to DB");

        const tempDir = path.resolve("./public/temp");
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        for (const [name, domain] of Object.entries(companyDomains)) {
            console.log(`Processing ${name}...`);
            const company = await Company.findOne({ name });
            if (!company) {
                console.log(`Company ${name} not found in DB. Skipping.`);
                continue;
            }

            // Fallback to Google Favicon service which is more reliable
            const logoUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
            const localPath = path.join(tempDir, `${domain.replace(/\./g, '_')}.png`);

            try {
                console.log(`Downloading logo from ${logoUrl}...`);
                await downloadImage(logoUrl, localPath);
                
                console.log(`Uploading to Cloudinary...`);
                const uploadResult = await uploadOnCloudinary(localPath);

                if (uploadResult && uploadResult.secure_url) {
                    company.logo = uploadResult.secure_url;
                    await company.save();
                    console.log(`Updated ${name} with new logo: ${uploadResult.secure_url}`);
                } else {
                    console.error(`Failed to upload logo for ${name}`);
                }

            } catch (err) {
                console.error(`Failed to process ${name}: ${err}`);
                // Continue to next company even if one fails
            }
        }

        console.log("Seeding process completed.");
        process.exit(0);

    } catch (error) {
        console.error("Critical error in seeding script:", error);
        process.exit(1);
    }
};

seedRealLogos();
