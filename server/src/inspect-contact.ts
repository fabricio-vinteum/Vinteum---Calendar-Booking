
import 'dotenv/config';
import { getHubSpotClient } from './config/hubspot';

async function inspectContact() {
    const client = getHubSpotClient();
    if (!client) {
        console.error('No client available');
        return;
    }

    const email = 'fabricio@cafeinacolorida.com.br'; // Using the email from logs

    try {
        console.log(`Searching for contact: ${email}...`);

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
            // We want to see ALL properties to find the right one
            // HubSpot doesn't return everything by default, but we can try to guess or just list common ones
            // Or better: search and then get by ID requesting all properties
            properties: ['company', 'company_name', 'companyname', 'associatedcompanyid', 'name', 'firstname', 'lastname', 'email']
        };

        const response = await client.crm.contacts.searchApi.doSearch(searchRequest as any);

        if (response.results.length > 0) {
            const contact = response.results[0];
            console.log('Contact Found:', JSON.stringify(contact, null, 2));

            // Also try to list all properties if possible, or we just rely on what we requested.
            // To really see "all" we might need to know them, but let's see what this returns first.

        } else {
            console.log('Contact not found');
        }

    } catch (err: any) {
        console.error('Error:', err.message);
        if (err.response) {
            console.error('Response body:', JSON.stringify(err.response.body, null, 2));
        }
    }
}

inspectContact();
