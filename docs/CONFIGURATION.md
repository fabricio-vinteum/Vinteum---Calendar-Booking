# Configuration Guide

## Environment Variables

### Backend Configuration

Create a `.env` file in the `server/` directory:

```env
# HubSpot Configuration
HUBSPOT_ACCESS_TOKEN=pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
HUBSPOT_MOCK_MODE=false

# Zoom Configuration
ZOOM_ACCOUNT_ID=your_account_id_here
ZOOM_CLIENT_ID=your_client_id_here
ZOOM_CLIENT_SECRET=your_client_secret_here
ZOOM_MOCK_MODE=false

# Server Configuration
PORT=3000
NODE_ENV=production

# CORS Configuration
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Frontend Configuration

Create a `.env` file in the `client/` directory:

```env
# API Configuration
VITE_API_URL=https://api.yourdomain.com

# Environment
VITE_ENV=production
```

---

## HubSpot Setup

### 1. Create Private App

1. Log in to your HubSpot account
2. Navigate to **Settings** → **Integrations** → **Private Apps**
3. Click **"Create a private app"**
4. Name it **"Vinteum Calendar"**

### 2. Configure Scopes

Select the following scopes:

**CRM Scopes:**
- ✅ `crm.objects.contacts.read` - Read contacts
- ✅ `crm.objects.contacts.write` - Create/update contacts
- ✅ `crm.objects.deals.read` - Read deals
- ✅ `crm.objects.deals.write` - Create/update deals

**Timeline Scopes:**
- ✅ `timeline` - Log activities to timeline

### 3. Get Access Token

1. Click **"Show token"**
2. Copy the access token
3. Add to `.env`:
   ```env
   HUBSPOT_ACCESS_TOKEN=pat-na1-your-token-here
   ```

### 4. Configure Deal Pipeline

**Option A: Use Default Pipeline**
- The app will use your default sales pipeline

**Option B: Create Custom Pipeline**

1. Go to **Settings** → **Objects** → **Deals**
2. Click **"Pipelines"**
3. Create a new pipeline: **"Bookings"**
4. Add stages:
   - Appointment Scheduled
   - Meeting Completed
   - Closed Won
   - Closed Lost

5. Update code to use custom pipeline:
   ```typescript
   // server/src/adapters/hubspotAdapter.ts
   const PIPELINE_ID = 'your_pipeline_id';
   const STAGE_ID = 'your_stage_id';
   ```

---

## Zoom Setup

### 1. Create Server-to-Server OAuth App

1. Go to [Zoom App Marketplace](https://marketplace.zoom.us/)
2. Click **"Develop"** → **"Build App"**
3. Select **"Server-to-Server OAuth"**
4. Fill in app details:
   - **App Name:** Vinteum Calendar
   - **Company Name:** Your Company
   - **Developer Contact:** your@email.com

### 2. Get Credentials

1. Navigate to **"App Credentials"** tab
2. Copy the following:
   - Account ID
   - Client ID
   - Client Secret

3. Add to `.env`:
   ```env
   ZOOM_ACCOUNT_ID=your_account_id
   ZOOM_CLIENT_ID=your_client_id
   ZOOM_CLIENT_SECRET=your_client_secret
   ```

### 3. Configure Scopes

Add the following scopes:

- ✅ `meeting:write:admin` - Create meetings
- ✅ `user:read:admin` - Read user info

### 4. Activate App

1. Click **"Activate"** button
2. Confirm activation
3. App is now ready to use

### 5. Configure Default Settings

Update meeting defaults in code:

```typescript
// server/src/adapters/zoomAdapter.ts
const DEFAULT_SETTINGS = {
  host_video: true,
  participant_video: true,
  join_before_host: false,
  mute_upon_entry: true,
  waiting_room: false,
  auto_recording: 'none'
};
```

---

## Capacity Configuration

### Default Capacity

**Current:** 2 bookings per time slot

### Change Capacity

Edit `server/src/routes/availability.ts`:

```typescript
const MAX_BOOKINGS_PER_SLOT = 3; // Change this number
```

### Per-Slot Capacity

For different capacity per time slot:

```typescript
const CAPACITY_MAP = {
  '09:00': 2,
  '10:00': 3,
  '11:00': 2,
  '14:00': 1,
  '15:00': 2
};
```

---

## Business Hours Configuration

### Default Hours

**Current:** 9 AM - 6 PM, Monday-Friday

### Change Business Hours

Edit `server/src/utils/availability.ts`:

```typescript
const BUSINESS_HOURS = {
  start: 9,  // 9 AM
  end: 18,   // 6 PM
  interval: 60 // 60 minutes between slots
};

const WORKING_DAYS = [1, 2, 3, 4, 5]; // Monday-Friday
```

### Custom Schedule

For different hours per day:

```typescript
const SCHEDULE = {
  monday: { start: 9, end: 17 },
  tuesday: { start: 9, end: 17 },
  wednesday: { start: 10, end: 16 },
  thursday: { start: 9, end: 17 },
  friday: { start: 9, end: 15 }
};
```

---

## Holiday Blocking

### US Holidays (Default)

Holidays are automatically blocked using `date-holidays` package.

### Add Custom Holidays

Edit `server/src/utils/holidays.ts`:

```typescript
const CUSTOM_HOLIDAYS = [
  '2025-12-25', // Christmas
  '2025-01-01', // New Year
  '2025-07-04', // Independence Day
  '2025-11-28'  // Thanksgiving
];
```

### Disable Holiday Blocking

```typescript
// server/src/routes/availability.ts
const BLOCK_HOLIDAYS = false;
```

---

## Timezone Configuration

### Default Timezone

**Current:** America/Sao_Paulo

### Change Default

Edit `client/src/utils/timezoneDetector.ts`:

```typescript
export const DEFAULT_TIMEZONE = 'America/New_York';
```

### Support Multiple Timezones

The widget already supports any IANA timezone:

```javascript
// User can pass timezone in URL
?timezone=America/Los_Angeles
```

---

## CORS Configuration

### Development

```env
ALLOWED_ORIGINS=http://localhost:5173
```

### Production

```env
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Allow All Origins (Not Recommended)

```typescript
// server/src/server.ts
app.use(cors({
  origin: '*' // WARNING: Security risk!
}));
```

---

## Mock Mode Configuration

### Enable Mock Mode (Development)

```env
HUBSPOT_MOCK_MODE=true
ZOOM_MOCK_MODE=true
```

**Benefits:**
- No real API calls
- No API credentials needed
- Faster development
- Predictable responses

### Disable Mock Mode (Production)

```env
HUBSPOT_MOCK_MODE=false
ZOOM_MOCK_MODE=false
```

**Requirements:**
- Valid HubSpot access token
- Valid Zoom credentials
- Internet connection

---

## Logging Configuration

### Log Levels

```typescript
// server/src/config/logger.ts
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// Levels: error, warn, info, debug
```

### Log to File

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  transports: [
    new winston.transports.File({ 
      filename: 'error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'combined.log' 
    })
  ]
});
```

---

## Performance Configuration

### API Timeouts

```typescript
// server/src/adapters/hubspotAdapter.ts
const TIMEOUT = 10000; // 10 seconds

axios.get(url, { timeout: TIMEOUT });
```

### Request Limits

```typescript
// server/src/server.ts
app.use(express.json({ limit: '1mb' }));
```

### Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## Email Configuration (Future)

### SMTP Setup

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your_password
EMAIL_FROM=noreply@yourdomain.com
```

### Email Templates

```typescript
const CONFIRMATION_EMAIL = {
  subject: 'Meeting Confirmed - {{date}}',
  body: `
    Hi {{firstname}},
    
    Your meeting is confirmed for {{date}} at {{time}}.
    
    Join URL: {{joinUrl}}
  `
};
```

---

## Database Configuration (Future)

### PostgreSQL

```env
DATABASE_URL=postgresql://user:password@localhost:5432/vinteum
```

### MongoDB

```env
MONGODB_URI=mongodb://localhost:27017/vinteum
```

---

## SSL/TLS Configuration

### Development (HTTP)

```typescript
// server/src/server.ts
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

### Production (HTTPS)

```typescript
import https from 'https';
import fs from 'fs';

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

https.createServer(options, app).listen(443);
```

---

## Troubleshooting Configuration Issues

### HubSpot Connection Failed

**Check:**
1. Access token is valid
2. Scopes are enabled
3. Token hasn't expired
4. Mock mode is disabled

### Zoom Connection Failed

**Check:**
1. Account ID is correct
2. Client ID and Secret are valid
3. App is activated
4. Scopes are enabled

### CORS Errors

**Check:**
1. `ALLOWED_ORIGINS` includes your frontend URL
2. Protocol matches (http vs https)
3. Port is included if non-standard

### Environment Variables Not Loading

**Check:**
1. `.env` file is in correct directory
2. File is named exactly `.env`
3. No spaces around `=` sign
4. Restart server after changes

---

## Configuration Checklist

Before deploying to production:

- [ ] HubSpot access token configured
- [ ] Zoom credentials configured
- [ ] Mock mode disabled
- [ ] CORS origins set correctly
- [ ] Business hours configured
- [ ] Capacity limits set
- [ ] Holidays configured
- [ ] SSL certificate installed
- [ ] Environment variables secured
- [ ] Logging configured
- [ ] Error tracking enabled
- [ ] Monitoring set up

---

## Support

For configuration help:
- Review [Troubleshooting Guide](./TROUBLESHOOTING.md)
- Check [API Documentation](./API.md)
- Verify environment variables
- Test with mock mode first
