/**
 * Custom error class for HubSpot API operations
 */
export class HubSpotError extends Error {
  code: 'RATE_LIMIT' | 'AUTH_ERROR' | 'NETWORK_ERROR' | 'NOT_FOUND' | 'UNKNOWN';
  statusCode?: number;
  originalError?: any;

  constructor(
    message: string,
    code: HubSpotError['code'],
    statusCode?: number,
    originalError?: any
  ) {
    super(message);
    this.name = 'HubSpotError';
    this.code = code;
    this.statusCode = statusCode;
    this.originalError = originalError;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HubSpotError);
    }
  }
}
