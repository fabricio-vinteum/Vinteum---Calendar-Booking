# cPanel Deployment Guide

## 📋 Overview

This guide will help you deploy the Booking Widget to a cPanel hosting environment.

---

## 🎯 Prerequisites

- cPanel hosting with **Node.js support** (v18+)
- SSH access (recommended)
- File Manager or FTP access
- Domain or subdomain configured

---

## 📦 Step 1: Build the Project Locally

### 1.1 Build Frontend

```bash
cd client
npm run build
```

This creates a `client/dist` folder with optimized static files.

### 1.2 Prepare Backend

The backend will run as a Node.js application on cPanel.

---

## 🚀 Step 2: Upload Files to cPanel

### Option A: Using File Manager

1. **Login to cPanel**
2. **Open File Manager**
3. **Create directories:**
   ```
   public_html/booking-widget/     (for frontend)
   booking-api/                     (for backend)
   ```

4. **Upload Frontend:**
   - Navigate to `public_html/booking-widget/`
   - Upload all files from `client/dist/`
   - Your structure should be:
     ```
     public_html/booking-widget/
     ├── index.html
     ├── assets/
     │   ├── index-[hash].js
     │   └── index-[hash].css
     └── vite.svg
     ```

5. **Upload Backend:**
   - Navigate to `booking-api/`
   - Upload entire `server/` folder contents
   - Your structure should be:
     ```
     booking-api/
     ├── src/
     ├── package.json
     ├── tsconfig.json
     └── .env
     ```

### Option B: Using FTP/SFTP

Use FileZilla or similar:
- Upload `client/dist/*` → `public_html/booking-widget/`
- Upload `server/*` → `booking-api/`

---

## ⚙️ Step 3: Configure Backend (Node.js App)

### 3.1 Setup Node.js Application in cPanel

1. **Navigate to "Setup Node.js App"** in cPanel
2. **Click "Create Application"**
3. **Configure:**
   - **Node.js version:** 18.x or higher
   - **Application mode:** Production
   - **Application root:** `booking-api`
   - **Application URL:** `api.yourdomain.com` (or subdomain)
   - **Application startup file:** `src/server.ts`
   - **Passenger log file:** Leave default

4. **Click "Create"**

### 3.2 Install Dependencies

After creating the app, cPanel will show a command to run. Use **Terminal** in cPanel:

```bash
cd ~/booking-api
source /home/username/nodevenv/booking-api/18/bin/activate
npm install
npm install -g ts-node typescript
```

### 3.3 Configure Environment Variables

1. **In cPanel Node.js App interface**, click "Edit" on your app
2. **Add Environment Variables:**
   ```
   HUBSPOT_ACCESS_TOKEN=your_token_here
   HUBSPOT_MOCK_MODE=false
   ZOOM_ACCOUNT_ID=your_zoom_account_id
   ZOOM_CLIENT_ID=your_zoom_client_id
   ZOOM_CLIENT_SECRET=your_zoom_client_secret
   ZOOM_MOCK_MODE=false
   PORT=3000
   NODE_ENV=production
   ALLOWED_ORIGINS=https://yourdomain.com
   ```

3. **Or create `.env` file** in `booking-api/`:
   ```bash
   cd ~/booking-api
   nano .env
   ```
   
   Paste your production environment variables and save.

### 3.4 Update Application Startup

cPanel uses Passenger to run Node.js apps. Update your startup:

1. **Edit `server/package.json`** and ensure:
   ```json
   {
     "scripts": {
       "start": "ts-node src/server.ts"
     }
   }
   ```

2. **Restart the application** in cPanel Node.js App interface

---

## 🌐 Step 4: Configure Frontend

### 4.1 Update API URL

The frontend needs to know where the backend API is:

1. **Before building**, update `client/.env.production`:
   ```env
   VITE_API_URL=https://api.yourdomain.com
   VITE_ENV=production
   ```

2. **Rebuild frontend:**
   ```bash
   cd client
   npm run build
   ```

3. **Re-upload** `client/dist/*` to `public_html/booking-widget/`

### 4.2 Configure Domain/Subdomain

#### For Main Domain (yourdomain.com/booking-widget)

Files are already in `public_html/booking-widget/`

Access at: `https://yourdomain.com/booking-widget/`

#### For Subdomain (booking.yourdomain.com)

1. **Create subdomain** in cPanel:
   - Go to "Subdomains"
   - Create: `booking.yourdomain.com`
   - Document root: `public_html/booking-widget`

2. **Access at:** `https://booking.yourdomain.com/`

#### For API Subdomain (api.yourdomain.com)

1. **Create subdomain:**
   - Subdomain: `api.yourdomain.com`
   - Document root: `booking-api/public` (create this folder)

2. **Create `.htaccess`** in `booking-api/public/`:
   ```apache
   RewriteEngine On
   RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
   ```

---

## 🔒 Step 5: SSL Certificate (HTTPS)

### Enable SSL in cPanel

1. **Go to "SSL/TLS Status"**
2. **Select your domains:**
   - `yourdomain.com`
   - `booking.yourdomain.com`
   - `api.yourdomain.com`
3. **Click "Run AutoSSL"**

Wait for certificates to be issued (usually 5-10 minutes).

---

## ✅ Step 6: Test the Deployment

### 6.1 Test Backend API

```bash
curl https://api.yourdomain.com/api/health
```

Expected response:
```json
{"success":true,"message":"Orchestrator Online"}
```

### 6.2 Test Frontend

Open browser:
```
https://booking.yourdomain.com/?name=John&email=john@example.com
```

You should see the booking widget!

---

## 🐛 Troubleshooting

### Issue 1: "Application Error" or 500 Error

**Solution:**
```bash
# Check Node.js app logs in cPanel
# Or via terminal:
cd ~/booking-api
tail -f ~/logs/booking-api.log
```

Common fixes:
- Ensure `ts-node` is installed globally
- Check `.env` file exists and has correct values
- Restart Node.js app in cPanel

### Issue 2: CORS Errors

**Solution:**
Update `ALLOWED_ORIGINS` in backend `.env`:
```env
ALLOWED_ORIGINS=https://booking.yourdomain.com,https://yourdomain.com
```

Restart Node.js app.

### Issue 3: Frontend Shows "Unable to Load Times"

**Causes:**
- Backend not running
- Wrong API URL in frontend

**Solution:**
1. Check backend is running: `curl https://api.yourdomain.com/api/health`
2. Verify `VITE_API_URL` in frontend build
3. Check browser console for errors

### Issue 4: Port Already in Use

**Solution:**
Change `PORT` in `.env` to different port (e.g., 3001, 3002)

---

## 📁 Final Directory Structure

```
cPanel Home Directory
├── public_html/
│   └── booking-widget/          # Frontend (static files)
│       ├── index.html
│       └── assets/
│
└── booking-api/                 # Backend (Node.js app)
    ├── src/
    ├── node_modules/
    ├── package.json
    ├── tsconfig.json
    └── .env
```

---

## 🔄 Updating the Application

### Update Frontend

1. Make changes locally
2. Build: `npm run build`
3. Upload `client/dist/*` to `public_html/booking-widget/`

### Update Backend

1. Upload changed files to `booking-api/`
2. If `package.json` changed:
   ```bash
   cd ~/booking-api
   source /home/username/nodevenv/booking-api/18/bin/activate
   npm install
   ```
3. Restart Node.js app in cPanel

---

## 📊 Monitoring

### Check Application Status

1. **cPanel → Setup Node.js App**
2. View status: Running/Stopped
3. View logs: Click "View Logs"

### Check Resource Usage

1. **cPanel → Resource Usage**
2. Monitor CPU, Memory, I/O

---

## 🎯 Quick Checklist

- [ ] Build frontend (`npm run build`)
- [ ] Upload frontend to `public_html/booking-widget/`
- [ ] Upload backend to `booking-api/`
- [ ] Create Node.js app in cPanel
- [ ] Install dependencies (`npm install`)
- [ ] Configure environment variables
- [ ] Setup subdomains (booking, api)
- [ ] Enable SSL certificates
- [ ] Test backend API endpoint
- [ ] Test frontend widget
- [ ] Configure HubSpot & Zoom credentials

---

## 📞 Support

If you encounter issues:
1. Check cPanel error logs
2. Review Node.js app logs
3. Verify all environment variables
4. Ensure Node.js version is 18+

---

**Your booking widget is now live on cPanel! 🎉**
