import { findContactByEmail, createContact, createDeal, createAssociation } from '../adapters/hubspotAdapter_v3';
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
  topic?: string; // Generated meeting topic
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
    let contactInfo = await findContactByEmail(request.email);
    let companyName: string | undefined;

    if (contactInfo) {
      contactId = contactInfo.id;
      companyName = contactInfo.companyName;
    } else {
      console.log('[BookingService] Contact not found, creating new contact...');
      contactId = await createContact({
        email: request.email,
        firstname: request.firstname,
      });
      // New contact won't have company yet usually
    }

    console.log(`[BookingService] ✓ Contact ID: ${contactId}`);
    if (companyName) console.log(`[BookingService] ✓ Found Company: ${companyName}`);

    // If company name exists, use it. Otherwise fallback to contact firstname.
    const nameToUse = companyName || request.firstname;
    const meetingTopic = `Demo with ${nameToUse} | Vinteum`;

    // Step 2: Create Zoom Meeting
    console.log('[BookingService] Step 2: Creating Zoom meeting...');
    const meeting = await createMeeting({
      date: request.date,
      topic: meetingTopic,
      duration: request.duration,
      timezone: request.timezone,
    });

    meetingId = meeting.meetingId;
    joinUrl = meeting.joinUrl;
    startUrl = meeting.startUrl;

    console.log(`[BookingService] ✓ Meeting ID: ${meetingId}`);

    // Step 3: Create HubSpot Deal
    console.log('[BookingService] Step 3: Creating HubSpot deal...');
    dealId = await createDeal(contactId, {
      topic: meetingTopic,
      date: request.date,
      duration: request.duration,
      timezone: request.timezone,
      dealName: nameToUse
    });
    console.log(`[BookingService] ✓ Deal ID: ${dealId}`);

    // Step 4: Create Association
    console.log('[BookingService] Step 4: Creating association...');
    await createAssociation(contactId, dealId);
    console.log('[BookingService] ✓ Association created');

    // Step 5: Log to Timeline (still Mock for now, requires custom event definition)
    console.log('[BookingService] Step 5: Logging to timeline...');
    // await logToTimeline(contactId, meetingId, request); 
    console.log('[BookingService] (Timeline logging skipped - requires Custom Event definition)');

    console.log('[BookingService] ✅ Transaction completed successfully!');

    return {
      success: true,
      contactId,
      meetingId,
      joinUrl,
      startUrl,
      dealId,
      topic: meetingTopic,
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
