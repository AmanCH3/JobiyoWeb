import { z } from 'zod';

/**
 * Job (Product) CRUD Schemas
 */

export const createJobSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title too short"),
    description: z.string().min(10, "Description required"),
    requirements: z.array(z.string()).min(1),
    salary: z.number().positive().optional(),
    location: z.string().min(2),
    jobType: z.enum(['Remote', 'Onsite', 'Hybrid']),
    // Example of a nested object configuration
    meta: z.object({
        visaSponsorship: z.boolean().optional(),
        urgent: z.boolean().optional()
    }).strict().optional() 
  }).strict()
});


export const updateJobSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Job ID")
  }),
  body: z.object({
    title: z.string().min(3).optional(),
    description: z.string().min(10).optional(),
    requirements: z.array(z.string()).optional(),
    salary: z.number().positive().optional(),
    location: z.string().optional(),
    jobType: z.enum(['Remote', 'Onsite', 'Hybrid']).optional(),
  }).strict()
});

export const getJobSchema = z.object({
    params: z.object({
      id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Job ID")
    })
});
