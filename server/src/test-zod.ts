
import { z } from 'zod';

const schema = z.object({
    date: z.string().datetime({ message: 'Invalid date format' })
});

const testDate = '2025-12-23T10:00:00-05:00';
console.log(`Testing date string: "${testDate}"`);

const result = schema.safeParse({ date: testDate });

if (!result.success) {
    console.log('Validation FAILED:', JSON.stringify(result.error.issues, null, 2));
} else {
    console.log('Validation SUCCESS');
}

// Test with simple ISO
const simple = new Date().toISOString();
console.log(`Testing simple ISO: "${simple}"`);
const result2 = schema.safeParse({ date: simple });
console.log('Validation result 2:', result2.success);
