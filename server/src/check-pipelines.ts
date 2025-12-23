import 'dotenv/config';
import { getHubSpotClient } from './config/hubspot';

async function checkPipelines() {
    const client = getHubSpotClient();
    if (!client) {
        console.error('No client available');
        return;
    }

    try {
        console.log('Fetching pipelines...');
        const match = await client.crm.pipelines.pipelinesApi.getAll('deals');

        console.log(`Found ${match.results.length} pipelines.`);

        match.results.forEach(pipeline => {
            console.log(`\nPipeline: [${pipeline.id}] ${pipeline.label}`);
            pipeline.stages.forEach(stage => {
                console.log(`  - Stage: [${stage.id}] ${stage.label}`);
            });
        });

    } catch (err) {
        console.error('Error:', err);
    }
}

checkPipelines();
