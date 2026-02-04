import { z } from 'zod';

/**
 * Authentication Schemas
 */

export const registerSchema = z.object({
  body: z.object({
    fullname: z.string().min(2, "Fullname must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(['student', 'recruiter', 'admin']).optional(), // Optional if default is student
    phoneNumber: z.string().optional(),
  }).strict() // Reject unknown keys
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  }).strict()
});
