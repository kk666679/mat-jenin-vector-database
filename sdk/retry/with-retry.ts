import { ExponentialBackoffStrategy } from './strategies';
import type { RetryStrategy } from './strategies';
import { isRetryableError } from '../errors/handlers';

export interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  multiplier?: number;
  strategy?: RetryStrategy;
  retryOn?: (error: Error) => boolean;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    multiplier = 2,
    retryOn = isRetryableError
  } = options;

  const strategy = options.strategy || new ExponentialBackoffStrategy(
    maxAttempts,
    initialDelay,
    maxDelay,
    multiplier
  );

  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (!strategy.shouldRetry(lastError, attempt) || !retryOn(lastError)) {
        throw lastError;
      }

      const delay = strategy.getDelay(attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Retry failed');
}

export function withRetrySync<T>(
  fn: () => T,
  options: RetryOptions = {}
): T {
  const {
    maxAttempts = 3,
    retryOn = isRetryableError
  } = options;

  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return fn();
    } catch (error) {
      lastError = error as Error;
      
      if (!retryOn(lastError)) {
        throw lastError;
      }
    }
  }

  throw lastError || new Error('Retry failed');
}
