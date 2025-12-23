import 'dotenv/config';

/**
 * Test script for Booking Service
 * Run with: ts-node src/test-booking.ts
 */

async function testBookingService() {
  console.log('=== Testing Booking Service ===\n');

  const bookingRequest = {
    email: 'test@example.com',
    firstname: 'Test',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    timezone: 'America/New_York',
    topic: 'Test Booking Meeting',
    duration: 30,
  };

  try {
    const response = await fetch('http://localhost:3000/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingRequest),
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ Booking created successfully!');
      console.log(`  Contact ID: ${result.contactId}`);
      console.log(`  Meeting ID: ${result.meetingId}`);
      console.log(`  Join URL: ${result.joinUrl}`);
      console.log(`  Deal ID: ${result.dealId}\n`);
    } else {
      console.log('❌ Booking failed:');
      console.log(`  Error: ${result.error}\n`);
    }

    console.log('=== Test completed ===');
  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testBookingService();
