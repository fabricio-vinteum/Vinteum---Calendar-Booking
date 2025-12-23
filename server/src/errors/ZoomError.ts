/**
 * Custom error class for Zoom API operations
 */
export class ZoomError extends Error {
  code: 'AUTH_ERROR' | 'RATE_LIMIT' | 'NETWORK_ERROR' | 'UNKNOWN';
  statusCode?: number;
  originalError?: any;

  constructor(
    message: string,
    code: ZoomError['code'],
    statusCode?: number,
    originalError?: any
  ) {
    super(message);
    this.name = 'ZoomError';
    this.code = code;
    this.statusCode = statusCode;
    this.originalError = originalError;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ZoomError);
    }
  }
}
