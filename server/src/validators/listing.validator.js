import { z } from 'zod';

export const queryListingsSchema = z.object({
  search: z.string().optional(),
  category: z.enum(['cardboard', 'plastic', 'glass', 'wood', 'textile', 'metal', 'other']).optional(),
  city: z.string().optional(),
  condition: z.enum(['Brand New', 'Like New', 'Good', 'Fair', 'Salvage']).optional(),
  status: z.enum(['available', 'reserved', 'collected', 'archived']).default('available'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(12),
});

export const listingIdParamSchema = z.object({
  id: z.string().uuid({ message: 'Invalid listing ID format, must be a valid UUID' }),
});

export const createListingSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  material_category: z.enum(['cardboard', 'plastic', 'glass', 'wood', 'textile', 'metal', 'other']),
  material_type: z.string().min(2, 'Material type is required').max(100),
  condition: z.enum(['Brand New', 'Like New', 'Good', 'Fair', 'Salvage']),
  quantity_description: z.string().min(2, 'Quantity description is required').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  city: z.string().min(2, 'City is required').max(100),
  image_url: z.string().url('Must be a valid image URL').optional().or(z.literal('')),
  cloudinary_public_id: z.string().optional(),
});

export const updateListingSchema = createListingSchema.partial().extend({
  status: z.enum(['available', 'reserved', 'collected', 'archived']).optional(),
});
