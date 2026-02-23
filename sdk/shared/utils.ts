import type { TenantContext } from '@/types'

// ============================================
// TENANT CONTEXT
// ============================================

/**
 * Create a tenant context object
 */
export function createTenantContext(params: {
  tenantId: string;
  tenantSlug: string;
  tenantPlan: 'free' | 'pro' | 'enterprise';
  userId: string;
  userRole: 'admin' | 'member';
}): TenantContext {
  return {
    tenantId: params.tenantId,
    tenantSlug: params.tenantSlug,
    tenantPlan: params.tenantPlan,
    userId: params.userId,
    userRole: params.userRole,
  };
}

/**
 * Get tenant ID from context (for database queries)
 */
export function getTenantId(context: TenantContext | null): string {
  if (!context) {
    throw new Error('Tenant context is required');
  }
  return context.tenantId;
}

// ============================================
// HASHING UTILITIES
// ============================================

/**
 * Hash a string using SHA-256 (browser-compatible)
 */
export async function hashString(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate a random string
 */
export function generateRandomString(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate an API key with prefix
 */
export async function generateApiKey(prefix: string = 'sk'): Promise<{
  fullKey: string;
  keyHash: string;
  displayPrefix: string;
}> {
  const randomPart = generateRandomString(32);
  const fullKey = `${prefix}_${randomPart}`;
  const keyHash = await hashString(fullKey);
  const displayPrefix = `${prefix}_${randomPart.substring(0, 8)}...`;
  
  return { fullKey, keyHash, displayPrefix };
}

// ============================================
// DATE UTILITIES
// ============================================

/**
 * Add time to a date
 */
export function addTime(date: Date, value: number, unit: 'seconds' | 'minutes' | 'hours' | 'days'): Date {
  const result = new Date(date);
  switch (unit) {
    case 'seconds':
      result.setSeconds(result.getSeconds() + value);
      break;
    case 'minutes':
      result.setMinutes(result.getMinutes() + value);
      break;
    case 'hours':
      result.setHours(result.getHours() + value);
      break;
    case 'days':
      result.setDate(result.getDate() + value);
      break;
  }
  return result;
}

/**
 * Get start of hour/day/month
 */
export function getPeriodStart(period: 'hourly' | 'daily' | 'monthly', date: Date = new Date()): Date {
  const result = new Date(date);
  switch (period) {
    case 'hourly':
      result.setMinutes(0, 0, 0);
      break;
    case 'daily':
      result.setHours(0, 0, 0, 0);
      break;
    case 'monthly':
      result.setDate(1);
      result.setHours(0, 0, 0, 0);
      break;
  }
  return result;
}

/**
 * Check if a date is expired
 */
export function isExpired(date: Date): boolean {
  return date < new Date();
}

// ============================================
// PAGINATION
// ============================================

/**
 * Calculate pagination
 */
export function calculatePagination(total: number, page: number, pageSize: number) {
  const totalPages = Math.ceil(total / pageSize);
  const hasMore = page < totalPages;
  const offset = (page - 1) * pageSize;
  
  return {
    total,
    page,
    pageSize,
    totalPages,
    hasMore,
    offset,
  };
}

// ============================================
// SLUG UTILITIES
// ============================================

/**
 * Create a URL-friendly slug from a string
 */
export function createSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ============================================
// TEXT UTILITIES
// ============================================

/**
 * Truncate text to a maximum length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Count words in text
 */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// ============================================
// ERROR HANDLING
// ============================================

/**
 * Create a standardized error
 */
export function createError(code: string, message: string, statusCode: number = 400): Error & { code: string; statusCode: number } {
  const error = new Error(message) as Error & { code: string; statusCode: number };
  error.code = code;
  error.statusCode = statusCode;
  return error;
}

/**
 * Handle async errors
 */
export function asyncHandler<T>(
  fn: (...args: any[]) => Promise<T>
): (...args: any[]) => Promise<T> {
  return async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error occurred');
    }
  };
}

// ============================================
// OBJECT UTILITIES
// ============================================

/**
 * Pick specific keys from an object
 */
export function pick<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}

/**
 * Omit specific keys from an object
 */
export function omit<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

