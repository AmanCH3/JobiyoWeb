import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      console.error("Upload failed: No local file path provided.");
      return null;
    }

    const fileExtension = path.extname(localFilePath).toLowerCase();
    let resourceType = 'image';
    let folder = 'Jobiyo_images';

    if (['.pdf', '.doc', '.docx', '.txt', '.xls', '.xlsx'].includes(fileExtension)) {
      resourceType = 'raw';
      folder = 'Jobiyo_documents';
    } else if (['.mp4', '.mov', '.avi', '.webm'].includes(fileExtension)) {
      resourceType = 'video';
      folder = 'Jobiyo_videos';
    }

    console.log(`Uploading to Cloudinary: path=${localFilePath}, type=${resourceType}, folder=${folder}`);

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: resourceType,
      folder: folder,
    });

    console.log("File uploaded successfully. URL:", response.secure_url);

    fs.unlinkSync(localFilePath);

    return response;

  } catch (error) {
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    console.error("Cloudinary upload error:", error);
    return null;
  }
};

export { uploadOnCloudinary };