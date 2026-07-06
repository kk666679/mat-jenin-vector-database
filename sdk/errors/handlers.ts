import { OpenClawError } from './types';

export function handleError(error: Error): OpenClawError {
  if (error instanceof OpenClawError) {
    return error;
  }

  // Handle specific error types
  if (error.name === 'PrismaClientKnownRequestError') {
    return new OpenClawError(
      `Database error: ${error.message}`,
      'DATABASE_ERROR',
      500,
      { originalError: error }
    );
  }

  if (error.name === 'RedisError') {
    return new OpenClawError(
      `Redis error: ${error.message}`,
      'REDIS_ERROR',
      500,
      { originalError: error }
    );
  }

  if (error.name === 'ValidationError') {
    return new OpenClawError(
      `Validation error: ${error.message}`,
      'VALIDATION_ERROR',
      400,
      { originalError: error }
    );
  }

  return new OpenClawError(
    `Unexpected error: ${error.message}`,
    'INTERNAL_ERROR',
    500,
    { originalError: error }
  );
}

export function isRetryableError(error: Error): boolean {
  const retryableCodes = [
    'ECONNRESET',
    'ETIMEDOUT',
    'ENOTFOUND',
    'EPIPE',
    'QUEUE_ERROR',
    'ML_ERROR',
    'DATABASE_ERROR'
  ];

  if (error instanceof OpenClawError) {
    return retryableCodes.includes(error.code);
  }

  return false;
}

export function getErrorMessage(error: Error): string {
  if (error instanceof OpenClawError) {
    return `${error.code}: ${error.message}`;
  }
  return error.message;
}
