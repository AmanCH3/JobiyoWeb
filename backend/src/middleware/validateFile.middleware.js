import { fileTypeFromBuffer } from 'file-type';
import fs from 'fs';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Middleware to validate file content (Magic Numbers)
 * Ensures that files claimed to be images/documents actually have the correct signature.
 */
export const validateFileContents = asyncHandler(async (req, res, next) => {
    if (!req.files && !req.file) {
        return next();
    }

    // Helper to validate a single file
    const validateFile = async (file) => {
        try {
            // Read the first 4100 bytes (enough for most magic numbers)
            const buffer = Buffer.alloc(4100);
            const fd = fs.openSync(file.path, 'r');
            fs.readSync(fd, buffer, 0, 4100, 0);
            fs.closeSync(fd);

            const type = await fileTypeFromBuffer(buffer);
            
            // Define expected types map
            // Extension -> Allowed Mime Types
            const mimeTypeMap = {
                'jpg': ['image/jpeg'],
                'jpeg': ['image/jpeg'],
                'png': ['image/png'],
                'gif': ['image/gif'],
                'webp': ['image/webp'],
                'pdf': ['application/pdf'],
                'doc': ['application/msword'], // file-type might define older DOC differently, but often application/x-cfb
                'docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'] 
            };

            // Get extension without dot
            const rawExt = file.originalname.split('.').pop().toLowerCase();
            
            // If we can't detect type (e.g. text files), and we expect a binary format, that's suspicious.
            // But if we allow things like .doc (CFB format), file-type supports it.
            
            // Special handling:
            // file-type returns undefined for unknown types (like plain text, or some obscure formats)
            // If type is undefined, and we expect a robust format (like image/pdf), it's a fail.
            
            if (!type) {
                // If it's a binary format we expect to detect, fail.
                // Text files might return undefined.
                // Assuming we only allow images and PDFs/Docs...
                
                // Allow empty/unknown if it's not a known dangerous extension? No, strict.
                throw new ApiError(400, "File content unrecognized or corrupt.");
            }

            const allowedMimes = mimeTypeMap[rawExt] || mimeTypeMap[type.ext]; // cross-check
            
            // If the detected extension doesn't match the filename extension logic:
            // e.g. file is .jpg, but detected as .png -> usually safeish (image to image), but strict checking is better.
            
            // Better logic: Does the detected MIME type match what we expect for the *declared* extension?
            const expectedMimes = mimeTypeMap[rawExt];
            
            if (!expectedMimes) {
                 // Extension not in our strict map (maybe we forgot one?), but if it passed Multer, it's in allowlist.
                 // If Multer allowlist has something we don't map here, we might block valid files.
                 // let's sync strictly with Multer allowlist.
                 // .jpg, .jpeg, .png, .gif, .webp, .pdf, .doc, .docx
                 throw new ApiError(400, `Extension .${rawExt} is not supported by content validation.`);
            }

            if (!expectedMimes.includes(type.mime)) {
                 console.log(`[SECURITY] File Content Mismatch! File: ${file.originalname}, Declared: ${rawExt}, Detected: ${type.mime}`);
                 throw new ApiError(400, "File content does not match extension (Magic Number Mismatch).");
            }
            
        } catch (error) {
            // Cleanup: Delete the bad file immediately
             try {
                if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
             } catch (unlinkError) {
                 console.error("Failed to delete invalid file:", unlinkError);
             }
             
             throw error instanceof ApiError ? error : new ApiError(400, "File validation failed.");
        }
    };

    // Handle both req.file (single) and req.files (multiple/fields)
    const filesToValidate = [];

    if (req.file) {
        filesToValidate.push(req.file);
    }

    if (req.files) {
        if (Array.isArray(req.files)) {
             filesToValidate.push(...req.files);
        } else {
             // Object (fields)
             Object.values(req.files).forEach(fileArray => {
                 filesToValidate.push(...fileArray);
             });
        }
    }

    for (const file of filesToValidate) {
        await validateFile(file);
    }

    next();
});
