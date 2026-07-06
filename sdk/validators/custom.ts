import { z } from 'zod';

export const TenantIdSchema = z.string().regex(/^[a-zA-Z0-9-]+$/, 'Invalid tenant ID format');

export const EmailSchema = z.string().email('Invalid email format');

export const UrlSchema = z.string().url('Invalid URL format');

export const PositiveNumberSchema = z.number().positive('Must be a positive number');

export const NonEmptyStringSchema = z.string().min(1, 'Cannot be empty');

export const JsonSchema = z.any().refine(
  (data) => {
    try {
      JSON.stringify(data);
      return true;
    } catch {
      return false;
    }
  },
  { message: 'Invalid JSON data' }
);

export const TimestampSchema = z.number().int().positive();

export const DateRangeSchema = z.object({
  from: z.date(),
  to: z.date().optional()
});

export const PaginationSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});
