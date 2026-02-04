import multer from "multer";
import path from "path";
import { ApiError } from "../utils/ApiError.js";

// Allowed file extensions for different upload types
// Allowed file extensions for different upload types
const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const ALLOWED_RESUME_EXTENSIONS = ['.pdf', '.doc', '.docx'];

/**
 * Check for double extension attacks (e.g., file.php.jpeg)
 * @param {string} filename 
 * @returns {boolean} true if file has dangerous double extension
 */
const fileFilter = (req, file, cb) => {
    const originalName = file.originalname.toLowerCase();
    const ext = path.extname(originalName).toLowerCase();
    
    // Check for null bytes in filename (another attack vector)
    if (originalName.includes('\x00') || originalName.includes('%00')) {
        return cb(new ApiError(400, 'Invalid filename detected.'), false);
    }
    
    // Determine allowed extensions based on field name
    const fieldName = file.fieldname.toLowerCase();
    let allowedExtensions = [...ALLOWED_IMAGE_EXTENSIONS, ...ALLOWED_RESUME_EXTENSIONS];
    
    if (fieldName.includes('resume') || fieldName.includes('cv')) {
        allowedExtensions = ALLOWED_RESUME_EXTENSIONS;
    } else if (fieldName.includes('avatar') || fieldName.includes('logo') || fieldName.includes('image') || fieldName.includes('photo')) {
        allowedExtensions = ALLOWED_IMAGE_EXTENSIONS;
    }
    
    // Validate extension
    if (!allowedExtensions.includes(ext)) {
        return cb(new ApiError(400, `Invalid file type. Allowed: ${allowedExtensions.join(', ')}`), false);
    }
    
    // Accept the file
    cb(null, true);
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/temp");
    },
    filename: function (req, file, cb) {
        // Generate safe filename: timestamp + random string + original extension
        const ext = path.extname(file.originalname).toLowerCase();
        const safeName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}${ext}`;
        cb(null, safeName);
    },
});

export const upload = multer({ 
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max file size
    }
});