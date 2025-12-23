import 'dotenv/config';
import { createMeeting } from './adapters/zoomAdapter';

/**
 * Test script for Zoom adapter
 * Run with: ts-node src/test-zoom.ts
 */

async function testZoomAdapter() {
  console.log('=== Testing Zoom Adapter ===\n');

  try {
    // Test: Create meeting
    console.log('Test: Creating Zoom meeting...');
    const meeting = await createMeeting({
      date: new Date().toISOString(),
      topic: 'Test Booking Meeting',
      duration: 30,
    });

    console.log(`✓ Meeting created successfully!`);
    console.log(`  Meeting ID: ${meeting.meetingId}`);
    console.log(`  Join URL: ${meeting.joinUrl}`);
    console.log(`  Start URL: ${meeting.startUrl}\n`);

    console.log('=== All tests passed! ===');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testZoomAdapter();
