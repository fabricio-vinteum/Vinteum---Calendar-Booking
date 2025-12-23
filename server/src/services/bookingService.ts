import { findContactByEmail, createContact } from '../adapters/hubspotAdapter';
import { createMeeting } from '../adapters/zoomAdapter';
import { HubSpotError } from '../errors/HubSpotError';
import { ZoomError } from '../errors/ZoomError';

/**
 * Booking Service - Atomic Transaction Orchestrator
 * Coordinates HubSpot and Zoom operations with rollback capability
 */

export interface BookingRequest {
  email: string;
  firstname: string;
  date: string; // ISO 8601 timestamp
  timezone: string;
  topic: string;
  duration: number; // Duration in minutes
}

export interface BookingResult {
  success: boolean;
  contactId?: string;
  meetingId?: string;
  joinUrl?: string;
  startUrl?: string;
  dealId?: string;
  error?: string;
}

/**
 * Execute atomic booking transaction
 * Steps:
 * 1. Find/Create HubSpot Contact
 * 2. Create Zoom Meeting
 * 3. Create HubSpot Deal (mock)
 * 4. Create Association (mock)
 * 5. Log to Timeline (mock)
 */
export async function executeTransaction(
  request: BookingRequest
): Promise<BookingResult> {
  let contactId: string | undefined;
  let meetingId: string | undefined;
  let joinUrl: string | undefined;
  let startUrl: string | undefined;
  let dealId: string | undefined;

  try {
    console.log('[BookingService] Starting transaction...');
    console.log(`[BookingService] Request: ${request.email} - ${request.topic}`);

    // Step 1: Find or Create HubSpot Contact
    console.log('[BookingService] Step 1: Finding/Creating contact...');
    const existingContact = await findContactByEmail(request.email);
    
    if (existingContact) {
      contactId = existingContact;
    } else {
      console.log('[BookingService] Contact not found, creating new contact...');
      contactId = await createContact({
        email: request.email,
        firstname: request.firstname,
      });
    }
    
    console.log(`[BookingService] ✓ Contact ID: ${contactId}`);

    // Step 2: Create Zoom Meeting
    console.log('[BookingService] Step 2: Creating Zoom meeting...');
    const meeting = await createMeeting({
      date: request.date,
      topic: request.topic,
      duration: request.duration,
    });
    
    meetingId = meeting.meetingId;
    joinUrl = meeting.joinUrl;
    startUrl = meeting.startUrl;
    
    console.log(`[BookingService] ✓ Meeting ID: ${meetingId}`);

    // Step 3: Create HubSpot Deal (Mock for now)
    console.log('[BookingService] Step 3: Creating HubSpot deal...');
    dealId = await createDeal(contactId, meetingId, request);
    console.log(`[BookingService] ✓ Deal ID: ${dealId}`);

    // Step 4: Create Association (Mock for now)
    console.log('[BookingService] Step 4: Creating association...');
    await createAssociation(contactId, dealId);
    console.log('[BookingService] ✓ Association created');

    // Step 5: Log to Timeline (Mock for now)
    console.log('[BookingService] Step 5: Logging to timeline...');
    await logToTimeline(contactId, meetingId, request);
    console.log('[BookingService] ✓ Timeline logged');

    console.log('[BookingService] ✅ Transaction completed successfully!');

    return {
      success: true,
      contactId,
      meetingId,
      joinUrl,
      startUrl,
      dealId,
    };
  } catch (error: any) {
    console.error('[BookingService] ❌ Transaction failed:', error.message);

    // Rollback: Clean up created resources
    await rollback({ meetingId, dealId });

    return {
      success: false,
      error: error.message || 'Booking failed',
    };
  }
}

/**
 * Rollback function - cleanup created resources on failure
 */
async function rollback(resources: {
  meetingId?: string;
  dealId?: string;
}): Promise<void> {
  console.log('[BookingService] 🔄 Starting rollback...');

  // Delete Zoom meeting if created
  if (resources.meetingId) {
    try {
      console.log(`[BookingService] Deleting Zoom meeting: ${resources.meetingId}`);
      // In real implementation, would call Zoom API to delete meeting
      // For now, just log
      console.log('[BookingService] ✓ Zoom meeting deleted (mock)');
    } catch (error) {
      console.error('[BookingService] Failed to delete Zoom meeting:', error);
    }
  }

  // Delete HubSpot deal if created
  if (resources.dealId) {
    try {
      console.log(`[BookingService] Deleting HubSpot deal: ${resources.dealId}`);
      // In real implementation, would call HubSpot API to delete deal
      // For now, just log
      console.log('[BookingService] ✓ HubSpot deal deleted (mock)');
    } catch (error) {
      console.error('[BookingService] Failed to delete HubSpot deal:', error);
    }
  }

  console.log('[BookingService] [ROLLBACK_COMPLETE]');
}

/**
 * Create HubSpot Deal (Mock implementation)
 */
async function createDeal(
  contactId: string,
  meetingId: string,
  request: BookingRequest
): Promise<string> {
  // Mock implementation
  const mockDealId = `mock-deal-${Date.now()}`;
  console.log(`[HubSpot Mock] Created deal: ${mockDealId}`);
  return mockDealId;
}

/**
 * Create Association between Contact and Deal (Mock implementation)
 */
async function createAssociation(
  contactId: string,
  dealId: string
): Promise<void> {
  // Mock implementation
  console.log(`[HubSpot Mock] Associated contact ${contactId} with deal ${dealId}`);
}

/**
 * Log meeting to HubSpot Timeline (Mock implementation)
 */
async function logToTimeline(
  contactId: string,
  meetingId: string,
  request: BookingRequest
): Promise<void> {
  // Mock implementation
  console.log(`[HubSpot Mock] Logged meeting ${meetingId} to timeline for contact ${contactId}`);
}
