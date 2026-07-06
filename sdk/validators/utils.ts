import { z } from 'zod';
import { ValidationError } from '../errors/types';

export function validate<T>(schema: z.ZodSchema<T>, data: any): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        `Validation failed: ${error.issues.map((issue) => issue.message).join(', ')}`,
        'VALIDATION_ERROR',
        400,
        { errors: error.issues }
      );
    }
    throw error;
  }
}

export function validateAsync<T>(schema: z.ZodSchema<T>, data: any): Promise<T> {
  return new Promise((resolve, reject) => {
    try {
      const result = validate(schema, data);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}

export function isValid<T>(schema: z.ZodSchema<T>, data: any): boolean {
  try {
    schema.parse(data);
    return true;
  } catch {
    return false;
  }
}
