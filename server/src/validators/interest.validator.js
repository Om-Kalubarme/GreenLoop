import { z } from 'zod';

export const createInterestSchema = z.object({
  message: z.string().min(10, 'Message must be at least 10 characters explaining your intended reuse').max(1000),
});

export const updateInterestStatusSchema = z.object({
  status: z.enum(['accepted', 'declined']),
});

export const interestIdParamSchema = z.object({
  id: z.string().uuid({ message: 'Invalid interest ID format, must be a UUID' }),
});
