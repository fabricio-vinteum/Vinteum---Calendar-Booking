import { getHubSpotClient, MOCK_MODE } from '../config/hubspot';
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
export async function findContactByEmail(email: string): Promise<{ id: string; companyName?: string } | null> {
  if (MOCK_MODE) {
    // Mock implementation
    console.log(`[HubSpot Mock] Searching for contact: ${email}`);
    const id = MOCK_CONTACTS[email];
    return id ? { id, companyName: 'Mock Company Inc.' } : null;
  }

  try {
    const client = getHubSpotClient();
    console.log('[DEBUG] findContactByEmail execution:');
    console.log(`[DEBUG] MOCK_MODE: ${MOCK_MODE}`);
    console.log(`[DEBUG] Client available: ${!!client}`);

    if (!client) {
      throw new HubSpotError(
        'HubSpot client IS MISSING (DEBUG PROBE)',
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
      properties: ['company'], // Request simple company name property if available
    };

    const response = await client.crm.contacts.searchApi.doSearch(searchRequest as any);

    if (response.results && response.results.length > 0) {
      const contact = response.results[0];
      let companyName: string | undefined = undefined;

      // Try to get associated company to find the real name
      try {
        // Retrieve associated companies (v4)
        const associations = await client.crm.associations.v4.basicApi.getPage(
          'contacts',
          contact.id,
          'companies',
          undefined,
          undefined,
          1
        );

        if (associations.results.length > 0) {
          const companyId = associations.results[0].toObjectId;
          const company = await client.crm.companies.basicApi.getById(String(companyId), ['name']);
          companyName = company.properties['name'];
        }
      } catch (assocError) {
        console.warn('Failed to fetch associated company:', assocError);
      }

      return { id: contact.id, companyName };
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
    const client = getHubSpotClient();
    if (!client) {
      throw new HubSpotError(
        'HubSpot client IS MISSING (DEBUG PROBE - CREATE)',
        'AUTH_ERROR'
      );
    }

    const contactObj = {
      properties: {
        email: data.email,
        firstname: data.firstname,
      },
    };

    const response = await client.crm.contacts.basicApi.create(contactObj);

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
    const client = getHubSpotClient();
    if (!client) {
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

    const response = await client.crm.deals.searchApi.doSearch(searchRequest as any);

    // Return the count of matching deals
    return response.results?.length || 0;
  } catch (error: any) {
    console.error(`Error querying booking count for ${dateTime}:`, error.message);

    // On error, assume slot is available (fail open)
    return 0;
  }
}

/**
 * Create a new Deal in HubSpot
 */
export async function createDeal(
  contactId: string,
  meetingDetails: {
    topic: string;
    date: string;
    duration: number;
    timezone?: string;
  }
): Promise<string> {
  if (MOCK_MODE) {
    const mockDealId = `mock-deal-${Date.now()}`;
    console.log(`[HubSpot Mock] Created deal: ${mockDealId}`);
    return mockDealId;
  }

  try {
    const client = getHubSpotClient();
    if (!client) {
      throw new HubSpotError(
        'HubSpot client IS MISSING (DEBUG PROBE - DEAL)',
        'AUTH_ERROR'
      );
    }

    const SimplePublicObjectInputForCreate = {
      properties: {
        dealname: meetingDetails.topic,
        pipeline: '160230195', // "US_MQL Pipeline"
        dealstage: '268515744', // "Demo Scheduled"
        amount: '0',
        closedate: meetingDetails.date,
        description: `Meeting scheduled for ${meetingDetails.date} (${meetingDetails.duration} mins)`,
      },
    };

    const response = await client.crm.deals.basicApi.create(SimplePublicObjectInputForCreate);
    return response.id;
  } catch (error: any) {
    console.error('HubSpot Create Deal Error:', error);
    throw new HubSpotError(
      `Failed to create deal: ${error.message}`,
      'NETWORK_ERROR',
      error.statusCode,
      error
    );
  }
}

/**
 * Create Association between Contact and Deal
 */
export async function createAssociation(
  contactId: string,
  dealId: string
): Promise<void> {
  if (MOCK_MODE) {
    console.log(`[HubSpot Mock] Associated contact ${contactId} with deal ${dealId}`);
    return;
  }

  try {
    const client = getHubSpotClient();
    if (!client) {
      throw new HubSpotError(
        'HubSpot client IS MISSING (DEBUG PROBE - ASSOC)',
        'AUTH_ERROR'
      );
    }

    // Use v4 Associations API
    // Association Type 3 is Deal -> Contact (HUBSPOT_DEFINED)
    await client.crm.associations.v4.basicApi.create(
      'deals',
      dealId,
      'contacts',
      contactId,
      [
        {
          associationCategory: 'HUBSPOT_DEFINED' as any,
          associationTypeId: 3,
        },
      ]
    );
  } catch (error: any) {
    console.error('HubSpot Association Error:', error);
    throw new HubSpotError(
      `Failed to associate deal and contact: ${error.message}`,
      'NETWORK_ERROR',
      error.statusCode,
      error
    );
  }
}

