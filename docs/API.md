# API Reference

## Overview

The Vinteum Calendar API provides endpoints for checking availability and creating bookings. All endpoints return JSON responses and use standard HTTP status codes.

**Base URL:** `http://localhost:3000/api` (development) or `https://your-api-domain.com/api` (production)

---

## Endpoints

### Health Check

Check if the API is running.

**Endpoint:** `GET /api/health`

**Response:**
```json
{
  "success": true,
  "message": "Orchestrator Online"
}
```

---

### Get Available Time Slots

Retrieve available time slots for a specific date, filtered by capacity.

**Endpoint:** `GET /api/availability`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `date` | string | Yes | Date in YYYY-MM-DD format (e.g., "2025-12-25") |
| `timezone` | string | Yes | IANA timezone identifier (e.g., "America/Sao_Paulo") |

**Example Request:**
```bash
curl "http://localhost:3000/api/availability?date=2025-12-25&timezone=America/Sao_Paulo"
```

**Success Response (200 OK):**
```json
{
  "slots": [
    "2025-12-25T09:00:00.000Z",
    "2025-12-25T10:00:00.000Z",
    "2025-12-25T11:00:00.000Z",
    "2025-12-25T14:00:00.000Z",
    "2025-12-25T15:00:00.000Z"
  ]
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Invalid date format"
}
```

**Notes:**
- Slots are returned in UTC format
- Only slots with available capacity (< 2 bookings) are returned
- Weekends and holidays are automatically excluded
- Business hours: 9 AM - 6 PM (configurable)

---

### Create Booking

Create a new booking with automatic HubSpot contact/deal creation and Zoom meeting generation.

**Endpoint:** `POST /api/bookings`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | Contact's email address |
| `firstname` | string | Yes | Contact's first name |
| `date` | string | Yes | Selected time slot in ISO 8601 format |
| `timezone` | string | Yes | IANA timezone identifier |
| `topic` | string | No | Meeting topic (default: "Sales Meeting") |
| `duration` | number | No | Meeting duration in minutes (default: 30) |

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "firstname": "John",
    "date": "2025-12-25T09:00:00.000Z",
    "timezone": "America/Sao_Paulo",
    "topic": "Product Demo",
    "duration": 30
  }'
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "contactId": "12345678",
  "dealId": "87654321",
  "meetingId": "abc123def456",
  "joinUrl": "https://zoom.us/j/1234567890?pwd=abcdef123456"
}
```

**Error Responses:**

**400 Bad Request** - Invalid input:
```json
{
  "success": false,
  "error": "Validation error",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

**409 Conflict** - Slot already full:
```json
{
  "success": false,
  "error": "Time slot is no longer available"
}
```

**500 Internal Server Error** - Transaction failed:
```json
{
  "success": false,
  "error": "Failed to create booking",
  "details": "HubSpot API error: Invalid access token"
}
```

---

## Atomic Transaction Flow

The booking creation follows a 5-step atomic transaction with automatic rollback:

1. **Find or Create Contact** in HubSpot
   - Searches by email
   - Creates new contact if not found
   - Updates existing contact if found

2. **Create Zoom Meeting**
   - Generates video conference link
   - Sets meeting time and duration
   - Returns join URL and meeting ID

3. **Create Deal** in HubSpot
   - Creates deal with meeting details
   - Sets deal stage to "Appointment Scheduled"
   - Stores Zoom meeting link

4. **Associate Deal with Contact**
   - Links deal to contact in HubSpot
   - Maintains relationship integrity

5. **Log Activity** to HubSpot Timeline
   - Records meeting creation
   - Adds note with Zoom link
   - Timestamps the activity

**Rollback Behavior:**
- If any step fails, all previous steps are automatically rolled back
- Zoom meetings are deleted if deal creation fails
- Partial data is never left in the system
- User receives clear error message

---

## Rate Limiting

Currently, no rate limiting is implemented. Consider adding rate limiting in production:

```javascript
// Recommended: 100 requests per 15 minutes per IP
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));
```

---

## Error Codes

| Status Code | Meaning |
|-------------|---------|
| 200 | Success |
| 400 | Bad Request - Invalid input |
| 404 | Not Found - Endpoint doesn't exist |
| 409 | Conflict - Slot no longer available |
| 500 | Internal Server Error - Transaction failed |

---

## Data Validation

All requests are validated using Zod schemas:

**Availability Request:**
```typescript
{
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timezone: z.string().min(1)
}
```

**Booking Request:**
```typescript
{
  email: z.string().email(),
  firstname: z.string().min(1),
  date: z.string().datetime(),
  timezone: z.string().min(1),
  topic: z.string().optional(),
  duration: z.number().min(15).max(120).optional()
}
```

---

## CORS Configuration

The API supports CORS with configurable origins:

**Development:**
```env
ALLOWED_ORIGINS=http://localhost:5173
```

**Production:**
```env
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

Multiple origins can be separated by commas.

---

## Mock Mode

For testing without real API credentials:

**Enable Mock Mode:**
```env
HUBSPOT_MOCK_MODE=true
ZOOM_MOCK_MODE=true
```

**Mock Responses:**
- HubSpot: Returns fake contact/deal IDs
- Zoom: Returns fake meeting links
- Capacity: Returns random booking counts (0-2)

**Disable for Production:**
```env
HUBSPOT_MOCK_MODE=false
ZOOM_MOCK_MODE=false
```

---

## Testing Examples

### Using cURL

**Get availability:**
```bash
curl "http://localhost:3000/api/availability?date=2025-12-25&timezone=America/Sao_Paulo"
```

**Create booking:**
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "firstname": "Test",
    "date": "2025-12-25T09:00:00.000Z",
    "timezone": "America/Sao_Paulo"
  }'
```

### Using JavaScript (Axios)

```javascript
import axios from 'axios';

// Get availability
const { data } = await axios.get('http://localhost:3000/api/availability', {
  params: {
    date: '2025-12-25',
    timezone: 'America/Sao_Paulo'
  }
});

console.log('Available slots:', data.slots);

// Create booking
const booking = await axios.post('http://localhost:3000/api/bookings', {
  email: 'test@example.com',
  firstname: 'Test',
  date: '2025-12-25T09:00:00.000Z',
  timezone: 'America/Sao_Paulo',
  topic: 'Demo Call',
  duration: 30
});

console.log('Zoom link:', booking.data.joinUrl);
```

---

## Security Considerations

1. **Never expose API keys** in client-side code
2. **Use HTTPS** in production
3. **Validate all inputs** server-side (already implemented)
4. **Implement rate limiting** to prevent abuse
5. **Monitor API usage** for unusual patterns
6. **Rotate credentials** regularly
7. **Use environment variables** for sensitive data

---

## Support

For API issues:
- Check the [Troubleshooting Guide](./TROUBLESHOOTING.md)
- Review server logs
- Verify environment variables
- Test with mock mode enabled
