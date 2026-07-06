export function calculateBackoff(
  attempt: number,
  initialDelay: number = 1000,
  maxDelay: number = 30000,
  multiplier: number = 2
): number {
  const delay = initialDelay * Math.pow(multiplier, attempt);
  return Math.min(delay, maxDelay);
}

export function withJitter(delay: number, jitter: number = 0.1): number {
  const jitterAmount = delay * jitter;
  const randomJitter = (Math.random() - 0.5) * jitterAmount * 2;
  return Math.max(0, delay + randomJitter);
}
