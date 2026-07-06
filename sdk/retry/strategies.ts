export interface RetryStrategy {
  shouldRetry: (error: Error, attempt: number) => boolean;
  getDelay: (attempt: number) => number;
}

export class ExponentialBackoffStrategy implements RetryStrategy {
  constructor(
    private maxAttempts: number = 3,
    private initialDelay: number = 1000,
    private maxDelay: number = 30000,
    private multiplier: number = 2
  ) {}

  shouldRetry(_error: Error, attempt: number): boolean {
    return attempt < this.maxAttempts;
  }

  getDelay(attempt: number): number {
    const delay = this.initialDelay * Math.pow(this.multiplier, attempt);
    return Math.min(delay, this.maxDelay);
  }
}

export class LinearBackoffStrategy implements RetryStrategy {
  constructor(
    private maxAttempts: number = 3,
    private delay: number = 1000
  ) {}

  shouldRetry(_error: Error, attempt: number): boolean {
    return attempt < this.maxAttempts;
  }

  getDelay(attempt: number): number {
    return this.delay * (attempt + 1);
  }
}

export class NoRetryStrategy implements RetryStrategy {
  shouldRetry(_error: Error, _attempt: number): boolean {
    return false;
  }

  getDelay(_attempt: number): number {
    return 0;
  }
}
