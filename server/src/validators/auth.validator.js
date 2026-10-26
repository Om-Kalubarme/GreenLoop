import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(120),
  email: z.string().email('Must be a valid email address').max(255),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
  role: z.enum(['donor', 'recipient', 'admin']).default('recipient'),
  city: z.string().min(2, 'City is required').max(100),
  preferred_categories: z.array(
    z.enum(['cardboard', 'plastic', 'glass', 'wood', 'textile', 'metal', 'other'])
  ).default([]),
});

export const loginSchema = z.object({
  email: z.string().email('Must be a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(120).optional(),
  city: z.string().min(2, 'City must be at least 2 characters').max(100).optional(),
  preferred_categories: z.array(
    z.enum(['cardboard', 'plastic', 'glass', 'wood', 'textile', 'metal', 'other'])
  ).optional(),
});
