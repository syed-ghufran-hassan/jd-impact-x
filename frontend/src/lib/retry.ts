/**
 * Utility for retrying async operations with exponential backoff
 */

interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryableErrors?: (error: Error) => boolean;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  retryableErrors: () => true,
};

/**
 * Retry an async function with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | null = null;
  let delay = opts.initialDelay;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry on the last attempt
      if (attempt === opts.maxRetries) {
        break;
      }

      // Check if error is retryable
      if (!opts.retryableErrors(lastError)) {
        throw lastError;
      }

      // Wait before retrying
      console.warn(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`, lastError.message);
      await sleep(delay);

      // Increase delay for next attempt (exponential backoff)
      delay = Math.min(delay * opts.backoffMultiplier, opts.maxDelay);
    }
  }

  throw lastError;
}

/**
 * Simple sleep function
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if an error is a network error (retryable)
 */
export function isNetworkError(error: Error): boolean {
  const networkErrorMessages = [
    'network error',
    'failed to fetch',
    'timeout',
    'aborted',
    'ECONNRESET',
    'ETIMEDOUT',
    'ENOTFOUND',
  ];
  
  const message = error.message.toLowerCase();
  return networkErrorMessages.some(msg => message.includes(msg));
}

/**
 * Check if an error is a rate limit error (should wait and retry)
 */
export function isRateLimitError(error: Error): boolean {
  return error.message.toLowerCase().includes('rate limit') ||
         error.message.toLowerCase().includes('too many requests') ||
         error.message.toLowerCase().includes('429');
}

/**
 * Default retryable error checker for API calls
 */
export function isRetryableApiError(error: Error): boolean {
  // Always retry network errors
  if (isNetworkError(error)) {
    return true;
  }
  
  // Retry rate limit errors
  if (isRateLimitError(error)) {
    return true;
  }
  
  // Retry 5xx server errors
  if (error.message.includes('5') || 
      error.message.includes('server error') ||
      error.message.includes('internal error')) {
    return true;
  }
  
  // Don't retry 4xx client errors (except 429 rate limit which we already checked)
  if (error.message.includes('4') && !error.message.includes('429')) {
    return false;
  }
  
  return true;
}

/**
 * Wrap a fetch call with retry logic
 */
export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  retryOptions?: RetryOptions
): Promise<Response> {
  return withRetry(
    () => fetch(url, options),
    {
      ...retryOptions,
      retryableErrors: isRetryableApiError,
    }
  );
}
