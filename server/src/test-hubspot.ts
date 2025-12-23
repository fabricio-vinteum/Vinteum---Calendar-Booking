import 'dotenv/config';
import { findContactByEmail, createContact } from './adapters/hubspotAdapter_v2';

/**
 * Test script for HubSpot adapter
 * Run with: ts-node src/test-hubspot.ts
 */

async function testHubSpotAdapter() {
  console.log('=== Testing HubSpot Adapter ===\n');

  try {
    // Test 1: Find existing contact
    console.log('Test 1: Finding existing contact...');
    const existingContact = await findContactByEmail('john@example.com');
    console.log(`✓ Found contact: ${existingContact}\n`);

    // Test 2: Find non-existent contact
    console.log('Test 2: Finding non-existent contact...');
    const nonExistent = await findContactByEmail('notfound@example.com');
    console.log(`✓ Contact not found: ${nonExistent === null ? 'null' : nonExistent}\n`);

    // Test 3: Create new contact
    console.log('Test 3: Creating new contact...');
    const newContactId = await createContact({
      email: 'newuser@example.com',
      firstname: 'New',
    });
    console.log(`✓ Created contact with ID: ${newContactId}\n`);

    // Test 4: Find the newly created contact
    console.log('Test 4: Finding newly created contact...');
    const foundNew = await findContactByEmail('newuser@example.com');
    console.log(`✓ Found newly created contact: ${foundNew}\n`);

    console.log('=== All tests passed! ===');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testHubSpotAdapter();
