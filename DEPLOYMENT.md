# Booking Widget - Installation & Deployment Guide

## 📋 Table of Contents
- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Production Deployment](#production-deployment)
- [Environment Configuration](#environment-configuration)
- [API Integration](#api-integration)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

This is a modern booking widget that integrates with HubSpot CRM and Zoom to create automated meeting bookings. Features include:

- ✨ Beautiful animated UI with Material Design
- 🔄 Capacity management (2 bookings per time slot)
- 🎯 Atomic transactions with rollback
- 📅 Real-time availability checking
- 🎨 Responsive design with animations

**Tech Stack:**
- **Frontend:** React + TypeScript + Vite + Tailwind CSS v4
- **Backend:** Node.js + Express + TypeScript
- **Integrations:** HubSpot API + Zoom API

---

## ✅ Prerequisites

Before you begin, ensure you have:

- **Node.js** v18+ and npm v9+
- **HubSpot Account** with Private App access
- **Zoom Account** with OAuth credentials
- **Git** for version control

---

## 🚀 Local Development Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd bmad-project
```

### 2. Install Dependencies

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 3. Configure Environment Variables

#### Backend (.env)

Create `server/.env`:

```env
# HubSpot Configuration
HUBSPOT_ACCESS_TOKEN=your_hubspot_token
HUBSPOT_MOCK_MODE=true

# Zoom Configuration
ZOOM_ACCOUNT_ID=your_zoom_account_id
ZOOM_CLIENT_ID=your_zoom_client_id
ZOOM_CLIENT_SECRET=your_zoom_client_secret
ZOOM_MOCK_MODE=true

# Server Configuration
PORT=3000
NODE_ENV=development
```

#### Frontend (.env)

Create `client/.env`:

```env
VITE_API_URL=http://localhost:3000
VITE_ENV=development
```

### 4. Start Development Servers

```bash
# Terminal 1: Start backend
cd server
npm run dev

# Terminal 2: Start frontend
cd client
npm run dev
```

The app will be available at:
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3000

### 5. Test the Widget

Open your browser and navigate to:
```
http://localhost:5173/?name=John&email=john@example.com
```

---

## 🌐 Production Deployment

### Option 1: Deploy to Vercel (Frontend) + Railway (Backend)

#### Frontend (Vercel)

1. **Build the frontend:**
   ```bash
   cd client
   npm run build
   ```

2. **Deploy to Vercel:**
   ```bash
   npm install -g vercel
   vercel --prod
   ```

3. **Set environment variables in Vercel dashboard:**
   - `VITE_API_URL`: Your backend API URL
   - `VITE_ENV`: `production`

#### Backend (Railway)

1. **Create `railway.json` in server directory:**
   ```json
   {
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "npm start",
       "restartPolicyType": "ON_FAILURE"
     }
   }
   ```

2. **Add start script to `server/package.json`:**
   ```json
   "scripts": {
     "start": "ts-node src/server.ts",
     "dev": "nodemon --exec ts-node src/server.ts"
   }
   ```

3. **Deploy to Railway:**
   - Connect your GitHub repository
   - Set environment variables in Railway dashboard
   - Deploy automatically on push

### Option 2: Deploy to Single Server (VPS/AWS/DigitalOcean)

1. **Build both applications:**
   ```bash
   # Build frontend
   cd client
   npm run build

   # The backend runs with ts-node in production
   cd ../server
   ```

2. **Set up PM2 for process management:**
   ```bash
   npm install -g pm2

   # Start backend
   cd server
   pm2 start src/server.ts --name booking-api --interpreter ts-node

   # Serve frontend with nginx or serve
   npm install -g serve
   pm2 start "serve -s ../client/dist -p 80" --name booking-widget
   ```

3. **Configure Nginx (recommended):**
   ```nginx
   # Frontend
   server {
       listen 80;
       server_name your-domain.com;
       root /path/to/client/dist;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }
   }

   # Backend API
   server {
       listen 80;
       server_name api.your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

---

## 🔐 Environment Configuration

### HubSpot Setup

1. **Create a Private App:**
   - Go to HubSpot Settings → Integrations → Private Apps
   - Click "Create a private app"
   - Name it "Booking Widget"

2. **Set Scopes:**
   - `crm.objects.contacts.read`
   - `crm.objects.contacts.write`
   - `crm.objects.deals.read`
   - `crm.objects.deals.write`

3. **Copy Access Token:**
   - Copy the access token to `HUBSPOT_ACCESS_TOKEN`

### Zoom Setup

1. **Create a Server-to-Server OAuth App:**
   - Go to Zoom App Marketplace
   - Create a new Server-to-Server OAuth app
   - Copy Account ID, Client ID, and Client Secret

2. **Set Scopes:**
   - `meeting:write`
   - `user:read`

3. **Add Credentials:**
   - Add to `.env.production`

### Production Environment Variables

#### Backend (`server/.env.production`)

```env
HUBSPOT_ACCESS_TOKEN=pat-na1-xxxxx
HUBSPOT_MOCK_MODE=false

ZOOM_ACCOUNT_ID=xxxxx
ZOOM_CLIENT_ID=xxxxx
ZOOM_CLIENT_SECRET=xxxxx
ZOOM_MOCK_MODE=false

PORT=3000
NODE_ENV=production
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

#### Frontend (`client/.env.production`)

```env
VITE_API_URL=https://api.your-domain.com
VITE_ENV=production
```

---

## 🔗 API Integration

### Embedding the Widget

Add this to your website:

```html
<iframe 
  src="https://your-widget-domain.com/?name=John%20Doe&email=john@example.com"
  width="100%"
  height="800px"
  frameborder="0"
  style="border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"
></iframe>
```

### URL Parameters

- `name` (required): Contact's first name
- `email` (required): Contact's email address

Example:
```
https://your-widget-domain.com/?name=Jane&email=jane@example.com
```

### API Endpoints

#### GET `/api/availability`
Get available time slots for a date.

**Query Parameters:**
- `date`: YYYY-MM-DD format
- `timezone`: IANA timezone (e.g., "America/Sao_Paulo")

**Response:**
```json
{
  "slots": [
    "2025-12-23T09:00:00.000Z",
    "2025-12-23T10:00:00.000Z"
  ]
}
```

#### POST `/api/bookings`
Create a new booking.

**Request Body:**
```json
{
  "email": "john@example.com",
  "firstname": "John",
  "date": "2025-12-23T09:00:00.000Z",
  "timezone": "America/Sao_Paulo",
  "topic": "Sales Meeting",
  "duration": 30
}
```

**Response:**
```json
{
  "success": true,
  "contactId": "12345",
  "dealId": "67890",
  "meetingId": "abc123",
  "joinUrl": "https://zoom.us/j/123456789"
}
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "Unable to Load Times" Error

**Cause:** Backend server not running or CORS issue

**Solution:**
```bash
# Check backend is running
curl http://localhost:3000/api/health

# Check CORS settings in server/.env
ALLOWED_ORIGINS=http://localhost:5173
```

#### 2. HubSpot API Errors

**Cause:** Invalid access token or missing scopes

**Solution:**
- Verify token in HubSpot Private Apps
- Check scopes are enabled
- Set `HUBSPOT_MOCK_MODE=true` for testing

#### 3. Zoom Meeting Creation Fails

**Cause:** Invalid OAuth credentials

**Solution:**
- Verify Account ID, Client ID, Client Secret
- Check OAuth app is activated
- Set `ZOOM_MOCK_MODE=true` for testing

#### 4. Build Errors

**Cause:** Missing dependencies or TypeScript errors

**Solution:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Check TypeScript
npx tsc --noEmit
```

---

## 📊 Monitoring & Logs

### Production Logging

The application logs to console. Capture logs with:

```bash
# PM2 logs
pm2 logs booking-api

# Or redirect to file
pm2 start src/server.ts --name booking-api --log /var/log/booking-api.log
```

### Health Check

```bash
curl https://api.your-domain.com/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Orchestrator Online"
}
```

---

## 🔒 Security Best Practices

1. **Never commit `.env` files** - Add to `.gitignore`
2. **Use HTTPS in production** - Configure SSL certificates
3. **Rotate API keys regularly** - Update HubSpot/Zoom credentials
4. **Implement rate limiting** - Prevent API abuse
5. **Validate all inputs** - Already implemented with Zod
6. **Monitor API usage** - Track HubSpot/Zoom API limits

---

## 📞 Support

For issues or questions:
- Check the [Troubleshooting](#troubleshooting) section
- Review API documentation
- Contact your development team

---

## 📝 License

[Your License Here]

---

**Built with ❤️ using React, TypeScript, and modern web technologies**
