import { Client } from '@hubspot/api-client';

/**
 * HubSpot client configuration
 * Supports both real API and mock mode for development
 */

const MOCK_MODE = process.env.HUBSPOT_MOCK_MODE === 'true';
const ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

console.log(`[DEBUG] Loading hubspot config from: ${__filename}`);

let hubspotClient: Client | null = null;

if (!MOCK_MODE) {
  if (!ACCESS_TOKEN) {
    console.warn('[HubSpot] No access token found. Running in MOCK mode.');
  } else {
    hubspotClient = new Client({ accessToken: ACCESS_TOKEN });
    console.log('[HubSpot] Client initialized with real API credentials');
  }
} else {
  console.log('[HubSpot] Running in MOCK mode (no real API calls)');
}

export const getHubSpotClient = () => {
  console.log('[DEBUG] getHubSpotClient called. Returning client:', !!hubspotClient);
  return hubspotClient;
};

export { hubspotClient, MOCK_MODE };
