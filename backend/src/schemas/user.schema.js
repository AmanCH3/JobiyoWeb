import { z } from 'zod';

/**
 * User/Profile Update Schemas
 */

export const updateProfileSchema = z.object({
  body: z.object({
    fullname: z.string().min(2).optional(),
    phoneNumber: z.string().optional(),
    bio: z.string().max(500, "Bio is too long").optional(),
    // Allow nested profile object if your API supports it, but keep it strict
    profile: z.object({
        skills: z.array(z.string()).optional(),
        resume: z.string().url().optional(),
    }).strict().optional(),
  }).strict(),
  
  params: z.object({
      id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ID")
  }).optional() // Optional or required depending on if ID is in token or params
});
