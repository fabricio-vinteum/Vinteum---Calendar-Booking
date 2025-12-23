# Troubleshooting Guide

## Common Issues

### 1. "Unable to Load Times" Error

**Symptoms:**
- Frontend shows error message
- No time slots displayed
- Console shows network error

**Causes & Solutions:**

#### Backend Not Running
```bash
# Check if backend is running
curl http://localhost:3000/api/health

# If not running, start it
cd server
npm run dev
```

#### CORS Error
**Error in console:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**
```env
# server/.env
ALLOWED_ORIGINS=http://localhost:5173
```

Restart backend after changing.

#### Wrong API URL
**Check frontend configuration:**
```env
# client/.env
VITE_API_URL=http://localhost:3000
```

Rebuild frontend after changing:
```bash
cd client
npm run dev
```

---

### 2. HubSpot API Errors

#### Invalid Access Token

**Error:** `401 Unauthorized` or `Invalid access token`

**Solutions:**

1. **Verify token in HubSpot:**
   - Go to Settings → Integrations → Private Apps
   - Check if app is still active
   - Regenerate token if needed

2. **Update .env:**
   ```env
   HUBSPOT_ACCESS_TOKEN=xxx-xxx-xxxxx
   ```

3. **Restart server:**
   ```bash
   cd server
   npm run dev
   ```

#### Missing Scopes

**Error:** `403 Forbidden` or `This app hasn't been granted the required scopes`

**Solution:**

1. Go to HubSpot Private App settings
2. Enable required scopes:
   - `crm.objects.contacts.read`
   - `crm.objects.contacts.write`
   - `crm.objects.deals.read`
   - `crm.objects.deals.write`
3. Save changes
4. Restart server

#### Rate Limit Exceeded

**Error:** `429 Too Many Requests`

**Solution:**

1. **Enable mock mode temporarily:**
   ```env
   HUBSPOT_MOCK_MODE=true
   ```

2. **Implement caching:**
   ```typescript
   // Cache availability for 5 minutes
   const cached = cache.get(`slots:${date}`);
   if (cached) return cached;
   ```

3. **Wait and retry:**
   - HubSpot limits: 100 requests per 10 seconds
   - Wait 10 seconds and try again

---

### 3. Zoom API Errors

#### Invalid Credentials

**Error:** `Invalid client_id or client_secret`

**Solutions:**

1. **Verify credentials:**
   - Go to Zoom App Marketplace
   - Check App Credentials tab
   - Copy Account ID, Client ID, Client Secret

2. **Update .env:**
   ```env
   ZOOM_ACCOUNT_ID=your_account_id
   ZOOM_CLIENT_ID=your_client_id
   ZOOM_CLIENT_SECRET=your_client_secret
   ```

3. **Ensure app is activated:**
   - Click "Activate" in Zoom dashboard
   - Confirm activation

#### Missing Scopes

**Error:** `Insufficient privileges`

**Solution:**

1. Go to Zoom App → Scopes tab
2. Add required scopes:
   - `meeting:write:admin`
   - `user:read:admin`
3. Reactivate app
4. Restart server

#### Meeting Creation Failed

**Error:** `Failed to create Zoom meeting`

**Debug steps:**

1. **Enable debug logging:**
   ```typescript
   console.log('Zoom request:', meetingData);
   console.log('Zoom response:', response);
   ```

2. **Check meeting data:**
   - Valid start time (future)
   - Valid timezone
   - Duration > 0

3. **Test with mock mode:**
   ```env
   ZOOM_MOCK_MODE=true
   ```

---

### 4. Build Errors

#### TypeScript Compilation Errors

**Error:** `TS2307: Cannot find module`

**Solution:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Check TypeScript
npx tsc --noEmit
```

#### Missing Dependencies

**Error:** `Cannot find module 'axios'`

**Solution:**
```bash
npm install
```

#### Vite Build Fails

**Error:** `Build failed with errors`

**Solutions:**

1. **Clear Vite cache:**
   ```bash
   rm -rf client/node_modules/.vite
   ```

2. **Check for syntax errors:**
   ```bash
   npx tsc --noEmit
   ```

3. **Update dependencies:**
   ```bash
   npm update
   ```

---

### 5. Booking Creation Fails

#### Slot No Longer Available

**Error:** `409 Conflict - Time slot is no longer available`

**Cause:** Another user booked the slot between loading and confirming

**Solution:** This is expected behavior. User should:
1. Refresh available slots
2. Select a different time

#### Transaction Rollback

**Error:** `500 Internal Server Error - Booking failed`

**Debug steps:**

1. **Check server logs:**
   ```bash
   # Look for error details
   tail -f server/logs/error.log
   ```

2. **Identify failed step:**
   - Contact creation
   - Zoom meeting creation
   - Deal creation
   - Association
   - Timeline logging

3. **Test each step individually:**
   ```typescript
   // Test contact creation
   const contact = await findOrCreateContact(email, firstname);
   console.log('Contact:', contact);
   
   // Test Zoom meeting
   const meeting = await createZoomMeeting(data);
   console.log('Meeting:', meeting);
   ```

4. **Enable mock mode to isolate issue:**
   ```env
   HUBSPOT_MOCK_MODE=true
   ZOOM_MOCK_MODE=true
   ```

---

### 6. Frontend Issues

#### White Screen / Blank Page

**Causes & Solutions:**

1. **JavaScript error:**
   - Open browser console (F12)
   - Check for errors
   - Fix reported issues

2. **Build not updated:**
   ```bash
   cd client
   npm run build
   ```

3. **Wrong environment:**
   ```env
   VITE_API_URL=http://localhost:3000
   ```

#### Slots Not Loading

**Debug steps:**

1. **Check network tab:**
   - Open DevTools → Network
   - Look for `/api/availability` request
   - Check status code and response

2. **Verify API call:**
   ```javascript
   // client/src/api/bookingApi.ts
   console.log('Fetching slots for:', date, timezone);
   ```

3. **Check date format:**
   - Must be YYYY-MM-DD
   - Must be valid date
   - Must be future date

#### Animations Not Working

**Causes:**

1. **CSS not loaded:**
   - Check browser console for 404 errors
   - Verify `index.css` is imported

2. **Tailwind not configured:**
   ```bash
   # Rebuild with Tailwind
   cd client
   npm run build
   ```

---

### 7. Deployment Issues

#### Environment Variables Not Loading

**Solutions:**

1. **Verify .env file location:**
   ```
   server/.env  ← Backend
   client/.env  ← Frontend
   ```

2. **Check file naming:**
   - Must be exactly `.env`
   - No spaces or extra characters

3. **Restart after changes:**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

4. **Production deployment:**
   - Set environment variables in hosting platform
   - Don't rely on .env files

#### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::3000`

**Solutions:**

1. **Kill existing process:**
   ```bash
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   
   # Mac/Linux
   lsof -ti:3000 | xargs kill -9
   ```

2. **Use different port:**
   ```env
   PORT=3001
   ```

#### SSL Certificate Errors

**Error:** `NET::ERR_CERT_AUTHORITY_INVALID`

**Solutions:**

1. **Development:** Use HTTP instead of HTTPS
2. **Production:** Install valid SSL certificate
3. **Self-signed cert:** Add exception in browser

---

### 8. Performance Issues

#### Slow API Responses

**Causes & Solutions:**

1. **HubSpot API slow:**
   - Implement caching
   - Reduce API calls
   - Use batch operations

2. **Network latency:**
   - Use CDN for frontend
   - Deploy backend closer to users
   - Enable compression

3. **Too many bookings:**
   - Optimize database queries
   - Add pagination
   - Implement lazy loading

#### High Memory Usage

**Solutions:**

1. **Check for memory leaks:**
   ```bash
   node --inspect server/src/server.ts
   ```

2. **Limit request size:**
   ```typescript
   app.use(express.json({ limit: '1mb' }));
   ```

3. **Add memory limits:**
   ```bash
   node --max-old-space-size=512 server/src/server.ts
   ```

---

## Debugging Tools

### Backend Debugging

**Enable debug logging:**
```typescript
// server/src/server.ts
const DEBUG = process.env.DEBUG === 'true';

if (DEBUG) {
  console.log('Request:', req.method, req.url, req.body);
  console.log('Response:', res.statusCode, data);
}
```

**Use Node.js debugger:**
```bash
node --inspect-brk server/src/server.ts
```

Then open Chrome DevTools → `chrome://inspect`

### Frontend Debugging

**React DevTools:**
1. Install React DevTools extension
2. Open DevTools → Components tab
3. Inspect component state

**Network debugging:**
1. Open DevTools → Network tab
2. Filter by "XHR"
3. Inspect API requests/responses

### API Testing

**Using cURL:**
```bash
# Test availability
curl "http://localhost:3000/api/availability?date=2025-12-25&timezone=America/Sao_Paulo"

# Test booking
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","firstname":"Test","date":"2025-12-25T09:00:00.000Z","timezone":"America/Sao_Paulo"}'
```

**Using Postman:**
1. Import API collection
2. Set environment variables
3. Test each endpoint

---

## Error Messages Reference

| Error Message | Cause | Solution |
|--------------|-------|----------|
| "Unable to Load Times" | Backend offline or CORS | Check backend, verify CORS |
| "Invalid email format" | Bad input validation | Fix email format |
| "Time slot is no longer available" | Capacity reached | Select different slot |
| "Failed to create booking" | API error | Check logs, verify credentials |
| "Invalid access token" | HubSpot token expired | Regenerate token |
| "Insufficient privileges" | Missing Zoom scopes | Add required scopes |
| "Network Error" | Backend unreachable | Check backend URL |

---

## Getting Help

### Self-Service

1. **Check logs:**
   ```bash
   # Backend logs
   tail -f server/logs/error.log
   
   # Frontend console
   Open DevTools → Console
   ```

2. **Enable mock mode:**
   ```env
   HUBSPOT_MOCK_MODE=true
   ZOOM_MOCK_MODE=true
   ```

3. **Test with minimal setup:**
   - Fresh clone
   - Clean install
   - Default configuration

### Community Support

1. **GitHub Issues:**
   - Search existing issues
   - Create new issue with:
     - Error message
     - Steps to reproduce
     - Environment details
     - Logs

2. **Documentation:**
   - [API Reference](./API.md)
   - [Architecture Guide](./ARCHITECTURE.md)
   - [Configuration Guide](./CONFIGURATION.md)

---

## Preventive Measures

### Before Deployment

- [ ] Test with mock mode
- [ ] Test with real APIs
- [ ] Verify all environment variables
- [ ] Check SSL certificates
- [ ] Test CORS configuration
- [ ] Monitor API quotas
- [ ] Set up error tracking
- [ ] Configure logging
- [ ] Test rollback procedures
- [ ] Document custom configurations

### Monitoring

Set up alerts for:
- API errors (> 5% error rate)
- Slow responses (> 2 seconds)
- High memory usage (> 80%)
- API quota warnings (> 80% used)
- SSL certificate expiration (< 30 days)

---

## Emergency Procedures

### System Down

1. **Check health endpoint:**
   ```bash
   curl https://api.yourdomain.com/api/health
   ```

2. **Enable mock mode:**
   ```env
   HUBSPOT_MOCK_MODE=true
   ZOOM_MOCK_MODE=true
   ```

3. **Restart services:**
   ```bash
   pm2 restart all
   ```

### Data Corruption

1. **Stop accepting new bookings:**
   - Disable frontend
   - Return maintenance message

2. **Identify affected bookings:**
   - Check HubSpot for incomplete deals
   - Check Zoom for orphaned meetings

3. **Manual cleanup:**
   - Delete orphaned Zoom meetings
   - Update incomplete deals
   - Notify affected customers

---

## Still Need Help?

Contact support with:
- Error message
- Server logs
- Environment details
- Steps to reproduce
- Expected vs actual behavior
