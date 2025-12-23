/**
 * Zoom client configuration
 * Supports both real API and mock mode for development
 */

const MOCK_MODE = process.env.ZOOM_MOCK_MODE === 'true';

// For real Zoom integration, you would need:
// - ZOOM_ACCOUNT_ID
// - ZOOM_CLIENT_ID
// - ZOOM_CLIENT_SECRET
// These are used for Server-to-Server OAuth

console.log(`[Zoom] Running in ${MOCK_MODE ? 'MOCK' : 'REAL'} mode`);

export { MOCK_MODE };
