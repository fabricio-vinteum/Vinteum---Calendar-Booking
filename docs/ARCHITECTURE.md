# Architecture Guide

## System Overview

Vinteum Calendar is built as a **stateless, event-driven booking system** with a React frontend and Node.js backend, integrating with HubSpot CRM and Zoom APIs.

```
┌─────────────────┐
│   User Browser  │
│  (React + Vite) │
└────────┬────────┘
         │ HTTP/REST
         ▼
┌─────────────────┐
│  Express Server │
│   (Orchestrator)│
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌────────┐
│HubSpot │ │  Zoom  │
│  API   │ │  API   │
└────────┘ └────────┘
```

---

## Architecture Principles

### 1. Stateless Design
- No session storage
- No database required
- All state managed by HubSpot CRM
- Horizontal scaling ready

### 2. Atomic Transactions
- All-or-nothing booking creation
- Automatic rollback on failure
- No partial data corruption
- Idempotent operations

### 3. Separation of Concerns
- **Frontend:** UI/UX only
- **Backend:** Business logic orchestration
- **Adapters:** External API integration
- **Services:** Domain logic

### 4. Validation Everywhere
- Client-side validation (UX)
- Server-side validation (security)
- Schema validation (Zod)
- Type safety (TypeScript)

---

## Frontend Architecture

### Technology Stack
- **React 18** - Component library
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Tailwind CSS v4** - Styling
- **Axios** - HTTP client
- **Zod** - Runtime validation

### Component Hierarchy

```
BookingWidget (Root)
├── HostProfile
│   └── Profile info & branding
├── CalendarContainer
│   ├── DateStripSelector
│   │   └── Date selection UI
│   └── TimeSlotGrid
│       └── Available time slots
└── BookingConfirmation
    └── Success state with meeting details
```

### State Management

**Local Component State:**
- Selected date
- Selected time slot
- Booking status (idle, loading, confirmed, error)
- Available slots

**No Global State:**
- No Redux/Context needed
- Props drilling is minimal
- Each component owns its state

### Data Flow

```
User Action → Component State → API Call → Backend → External APIs
                                    ↓
                            Response ← Backend ← External APIs
                                    ↓
                            Update State → Re-render
```

---

## Backend Architecture

### Technology Stack
- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **Zod** - Schema validation
- **@hubspot/api-client** - HubSpot SDK
- **Axios** - HTTP client (Zoom)

### Layer Architecture

```
┌─────────────────────────────────┐
│         Routes Layer            │  ← HTTP endpoints
│  (availability.ts, bookings.ts) │
└────────────┬────────────────────┘
             │
┌────────────▼────────────────────┐
│       Services Layer            │  ← Business logic
│     (bookingService.ts)         │
└────────────┬────────────────────┘
             │
┌────────────▼────────────────────┐
│       Adapters Layer            │  ← External APIs
│  (hubspotAdapter, zoomAdapter)  │
└─────────────────────────────────┘
```

### Directory Structure

```
server/
├── src/
│   ├── adapters/           # External API integrations
│   │   ├── hubspotAdapter.ts
│   │   └── zoomAdapter.ts
│   ├── routes/             # HTTP endpoints
│   │   ├── availability.ts
│   │   └── bookings.ts
│   ├── services/           # Business logic
│   │   └── bookingService.ts
│   ├── errors/             # Custom error classes
│   │   └── AppError.ts
│   ├── config/             # Configuration
│   │   └── env.ts
│   └── server.ts           # Entry point
├── package.json
└── tsconfig.json
```

---

## Data Models

### Contact (HubSpot)

```typescript
interface Contact {
  id: string;
  properties: {
    email: string;
    firstname: string;
    lastname?: string;
    phone?: string;
    createdate: string;
  };
}
```

### Deal (HubSpot)

```typescript
interface Deal {
  id: string;
  properties: {
    dealname: string;
    dealstage: string;
    amount: string;
    closedate: string;
    meeting_link: string;
    meeting_time: string;
  };
  associations: {
    contacts: string[];
  };
}
```

### Zoom Meeting

```typescript
interface ZoomMeeting {
  id: string;
  topic: string;
  start_time: string;
  duration: number;
  timezone: string;
  join_url: string;
  password: string;
}
```

---

## Capacity Management

### How It Works

1. **Query HubSpot Deals** for the selected time slot
2. **Count existing bookings** with matching `meeting_time`
3. **Filter out slots** where count >= 2
4. **Return available slots** to frontend

### Implementation

```typescript
async function getBookingCountForSlot(slotTime: string): Promise<number> {
  const deals = await hubspot.crm.deals.searchApi.doSearch({
    filterGroups: [{
      filters: [{
        propertyName: 'meeting_time',
        operator: 'EQ',
        value: slotTime
      }]
    }]
  });
  
  return deals.results.length;
}
```

### Configuration

**Default Capacity:** 2 bookings per slot

**To Change:**
```typescript
// server/src/routes/availability.ts
const MAX_BOOKINGS_PER_SLOT = 3; // Change this value
```

---

## Atomic Transaction Pattern

### Transaction Steps

```typescript
async function createBooking(data: BookingData) {
  let contactId: string | null = null;
  let meetingId: string | null = null;
  let dealId: string | null = null;

  try {
    // Step 1: Find or create contact
    contactId = await findOrCreateContact(data.email, data.firstname);
    
    // Step 2: Create Zoom meeting
    const meeting = await createZoomMeeting(data);
    meetingId = meeting.id;
    
    // Step 3: Create deal
    dealId = await createDeal(contactId, meeting);
    
    // Step 4: Associate deal with contact
    await associateDealWithContact(dealId, contactId);
    
    // Step 5: Log to timeline
    await logMeetingToTimeline(contactId, meeting);
    
    return { success: true, contactId, dealId, meetingId };
    
  } catch (error) {
    // Rollback: Delete created resources
    if (meetingId) await deleteZoomMeeting(meetingId);
    if (dealId) await deleteDeal(dealId);
    
    throw new AppError('Booking failed', 500);
  }
}
```

### Rollback Strategy

- **Zoom meetings** are deleted if deal creation fails
- **Deals** are deleted if association fails
- **Contacts** are never deleted (they may have other data)
- **Timeline entries** are not rolled back (audit trail)

---

## Error Handling

### Error Hierarchy

```
AppError (base)
├── ValidationError (400)
├── NotFoundError (404)
├── ConflictError (409)
└── InternalError (500)
```

### Error Flow

```
Error Thrown → Caught by Service → Wrapped in AppError → 
  → Returned to Route → Sent to Client
```

### Example

```typescript
// Service throws
throw new ValidationError('Invalid email format');

// Route catches
try {
  await bookingService.create(data);
} catch (error) {
  if (error instanceof ValidationError) {
    res.status(400).json({ success: false, error: error.message });
  }
}
```

---

## Security Architecture

### Input Validation

**Layer 1: Client-side (UX)**
```typescript
// Immediate feedback, not security
if (!email.includes('@')) {
  setError('Invalid email');
}
```

**Layer 2: Server-side (Security)**
```typescript
// Zod schema validation
const schema = z.object({
  email: z.string().email(),
  firstname: z.string().min(1)
});

schema.parse(request.body); // Throws if invalid
```

### CORS Protection

```typescript
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS.split(','),
  methods: ['GET', 'POST'],
  credentials: false
}));
```

### Environment Variables

**Never commit:**
- API keys
- Access tokens
- Client secrets

**Always use:**
- `.env` files (gitignored)
- Environment variable injection
- Secrets management in production

---

## Scalability Considerations

### Current Limitations

1. **No caching** - Every request hits HubSpot
2. **No rate limiting** - Vulnerable to abuse
3. **No load balancing** - Single instance only
4. **Synchronous processing** - Blocks on API calls

### Scaling Strategies

**Horizontal Scaling:**
```
Load Balancer
    ├── Server Instance 1
    ├── Server Instance 2
    └── Server Instance 3
```

**Caching Layer:**
```typescript
// Redis cache for availability
const cached = await redis.get(`slots:${date}`);
if (cached) return JSON.parse(cached);

const slots = await fetchFromHubSpot(date);
await redis.setex(`slots:${date}`, 300, JSON.stringify(slots));
```

**Async Processing:**
```typescript
// Queue booking creation
await queue.add('create-booking', bookingData);

// Process in background worker
worker.process('create-booking', async (job) => {
  await createBooking(job.data);
});
```

---

## Monitoring & Observability

### Recommended Tools

1. **Application Monitoring:** New Relic, Datadog
2. **Error Tracking:** Sentry
3. **Logging:** Winston + CloudWatch
4. **Uptime Monitoring:** Pingdom, UptimeRobot

### Key Metrics

- API response times
- Error rates by endpoint
- HubSpot API quota usage
- Zoom API quota usage
- Booking success rate
- Capacity utilization

---

## Testing Strategy

### Unit Tests
```typescript
describe('bookingService', () => {
  it('should create booking with valid data', async () => {
    const result = await bookingService.create(validData);
    expect(result.success).toBe(true);
  });
});
```

### Integration Tests
```typescript
describe('POST /api/bookings', () => {
  it('should return 200 with valid booking', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .send(validBooking);
    expect(res.status).toBe(200);
  });
});
```

### E2E Tests
```typescript
describe('Booking Flow', () => {
  it('should complete full booking flow', async () => {
    await page.goto('http://localhost:5173');
    await page.click('[data-testid="time-slot-9am"]');
    await page.click('[data-testid="confirm-button"]');
    await expect(page).toHaveText('Meeting Scheduled!');
  });
});
```

---

## Deployment Architecture

### Development
```
Local Machine
├── Frontend: localhost:5173 (Vite)
└── Backend: localhost:3000 (Express)
```

### Production
```
CDN (Frontend)
    ↓
Load Balancer (Backend)
    ├── Server 1
    ├── Server 2
    └── Server 3
```

### Recommended Stack

- **Frontend:** Vercel, Netlify, CloudFlare Pages
- **Backend:** Railway, Render, AWS ECS
- **DNS:** CloudFlare
- **SSL:** Let's Encrypt (auto-renewal)

---

## Future Enhancements

1. **Database Layer** - Store booking history
2. **Email Notifications** - Confirmation emails
3. **Calendar Sync** - Google Calendar, Outlook
4. **Multi-timezone Support** - Better timezone handling
5. **Recurring Meetings** - Weekly/monthly bookings
6. **Team Management** - Multiple sales reps
7. **Analytics Dashboard** - Booking metrics
8. **Webhook Support** - Real-time updates

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for architecture guidelines when contributing to this project.
