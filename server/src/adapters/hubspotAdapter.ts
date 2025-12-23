import { hubspotClient, MOCK_MODE } from '../config/hubspot';
import { HubSpotError } from '../errors/HubSpotError';

/**
 * Mock data for development
 */
const MOCK_CONTACTS: Record<string, string> = {
  'john@example.com': 'mock-contact-001',
  'jane@example.com': 'mock-contact-002',
  'alex@example.com': 'mock-contact-003',
};

let mockContactCounter = 100;

/**
 * Find a contact by email address
 * @param email - Email address to search for
 * @returns Contact ID if found, null otherwise
 */
export async function findContactByEmail(email: string): Promise<string | null> {
  if (MOCK_MODE) {
    // Mock implementation
    console.log(`[HubSpot Mock] Searching for contact: ${email}`);
    return MOCK_CONTACTS[email] || null;
  }

  try {
    if (!hubspotClient) {
      throw new HubSpotError(
        'HubSpot client not initialized',
        'AUTH_ERROR'
      );
    }

    const searchRequest = {
      filterGroups: [
        {
          filters: [
            {
              propertyName: 'email',
              operator: 'EQ',
              value: email,
            },
          ],
        },
      ],
    };

    const response = await hubspotClient.crm.contacts.searchApi.doSearch(searchRequest as any);

    if (response.results && response.results.length > 0) {
      return response.results[0].id;
    }

    return null;
  } catch (error: any) {
    // Handle specific HubSpot API errors
    if (error.statusCode === 429) {
      throw new HubSpotError(
        'Rate limit exceeded',
        'RATE_LIMIT',
        429,
        error
      );
    }

    if (error.statusCode === 401 || error.statusCode === 403) {
      throw new HubSpotError(
        'Authentication failed',
        'AUTH_ERROR',
        error.statusCode,
        error
      );
    }

    throw new HubSpotError(
      `Failed to search contact: ${error.message}`,
      'NETWORK_ERROR',
      error.statusCode,
      error
    );
  }
}

/**
 * Create a new contact in HubSpot
 * @param data - Contact data (email and firstname required)
 * @returns Contact ID of the newly created contact
 */
export async function createContact(data: {
  email: string;
  firstname: string;
}): Promise<string> {
  if (MOCK_MODE) {
    // Mock implementation
    const mockId = `mock-contact-${mockContactCounter++}`;
    MOCK_CONTACTS[data.email] = mockId;
    console.log(`[HubSpot Mock] Created contact: ${data.email} -> ${mockId}`);
    return mockId;
  }

  try {
    if (!hubspotClient) {
      throw new HubSpotError(
        'HubSpot client not initialized',
        'AUTH_ERROR'
      );
    }

    const contactObj = {
      properties: {
        email: data.email,
        firstname: data.firstname,
      },
    };

    const response = await hubspotClient.crm.contacts.basicApi.create(contactObj);

    return response.id;
  } catch (error: any) {
    // Handle specific HubSpot API errors
    if (error.statusCode === 429) {
      throw new HubSpotError(
        'Rate limit exceeded',
        'RATE_LIMIT',
        429,
        error
      );
    }

    if (error.statusCode === 401 || error.statusCode === 403) {
      throw new HubSpotError(
        'Authentication failed',
        'AUTH_ERROR',
        error.statusCode,
        error
      );
    }

    if (error.statusCode === 409) {
      throw new HubSpotError(
        'Contact already exists',
        'UNKNOWN',
        409,
        error
      );
    }

    throw new HubSpotError(
      `Failed to create contact: ${error.message}`,
      'NETWORK_ERROR',
      error.statusCode,
      error
    );
  }
}

/**
 * Get the number of existing bookings for a specific time slot
 * Queries HubSpot deals to count how many meetings are scheduled for this time
 */
export async function getBookingCountForSlot(dateTime: string): Promise<number> {
  // In mock mode, return random booking counts for testing
  if (MOCK_MODE) {
    // Simulate some slots being partially or fully booked
    const random = Math.random();
    if (random < 0.6) return 0; // 60% available
    if (random < 0.9) return 1; // 30% one booking
    return 2; // 10% fully booked
  }

  try {
    if (!hubspotClient) {
      console.error('HubSpot client not initialized');
      return 0;
    }

    // Query HubSpot deals with matching meeting_time property
    const searchRequest = {
      filterGroups: [
        {
          filters: [
            {
              propertyName: 'meeting_time',
              operator: 'EQ',
              value: dateTime,
            },
          ],
        },
      ],
    };

    const response = await hubspotClient.crm.deals.searchApi.doSearch(searchRequest as any);
    
    // Return the count of matching deals
    return response.results?.length || 0;
  } catch (error: any) {
    console.error(`Error querying booking count for ${dateTime}:`, error.message);
    
    // On error, assume slot is available (fail open)
    return 0;
  }
}

