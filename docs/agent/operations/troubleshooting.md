# Troubleshooting Guide

## Database Issues

### Prisma Error: Cannot find module '.prisma/client'

**Symptoms:**
```
Error: Cannot find module '@prisma/client'
Error: Cannot find module '.prisma/client'
```

**Solutions:**
```bash
# Generate Prisma Client
npm run prisma:generate

# If that doesn't work, clean and regenerate
rm -rf node_modules/.prisma
npm run prisma:generate

# If still failing, reinstall
rm -rf node_modules
npm install
npm run prisma:generate
```

### Migration Error: Database schema out of sync

**Symptoms:**
```
Error: The database schema is not in sync with your migration files
```

**Solutions:**

**Development:**
```bash
# Reset database (⚠️ destroys all data)
npx prisma migrate reset

# Or create new migration
npm run prisma:migrate
```

**Production:**
```bash
# Deploy pending migrations
npm run prisma:deploy
```

### Connection Error: Can't reach database

**Symptoms:**
```
Error: Can't reach database server at `localhost:5432`
```

**Solutions:**
1. Check PostgreSQL is running
2. Verify DATABASE_URL in `.env.local`
3. Test connection:
```bash
psql $DATABASE_URL
```

4. Check firewall/network settings
5. Verify PostgreSQL accepts connections

---

## Cache Issues

### Redis Error: Connection refused

**Symptoms:**
```
Error: connect ECONNREFUSED 127.0.0.1:6379
Redis connection error
```

**Solutions:**
1. Check Redis is running (if local)
2. Verify Upstash credentials:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
   - `UPSTASH_REDIS_URL`

3. Test connection:
```bash
curl $UPSTASH_REDIS_REST_URL \
  -H "Authorization: Bearer $UPSTASH_REDIS_REST_TOKEN" \
  -d '{"_":[["PING"]]}'
```

### Cache Miss: Data not found

**Symptoms:**
- Expected cached data not found
- Frequent cache misses

**Solutions:**
1. Check cache keys match exactly
2. Verify TTL hasn't expired
3. Check Redis memory limits
4. Monitor Redis in Upstash console

---

## File Upload Issues

### S3 Error: Access Denied

**Symptoms:**
```
Error: AccessDenied: Access Denied
S3 upload failed
```

**Solutions:**
1. Verify AWS credentials:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
2. Check IAM permissions (need S3 read/write)
3. Verify bucket name: `AWS_S3_BUCKET_NAME`
4. Check bucket policy and CORS settings
5. Verify region: `AWS_REGION`

### S3 Error: No Such Bucket

**Symptoms:**
```
Error: NoSuchBucket: The specified bucket does not exist
```

**Solutions:**
1. Create bucket in AWS console
2. Verify bucket name matches `AWS_S3_BUCKET_NAME`
3. Check region matches `AWS_REGION`

### Image Processing Error

**Symptoms:**
```
Error: Input file is missing or is not an image
Sharp error processing image
```

**Solutions:**
1. Verify file is valid image format
2. Check file size limits
3. Install Sharp dependencies:
```bash
npm install sharp --force
```
4. Check memory limits for large images

---

## Authentication Issues

### Auth Error: Invalid session

**Symptoms:**
```
Error: User not authenticated
Session invalid or expired
```

**Solutions:**
1. Check `BETTER_AUTH_SECRET` is set
2. Verify `NEXT_PUBLIC_BETTER_AUTH_URL` matches your domain
3. Clear browser cookies and re-login
4. Check session expiration settings
5. Verify database connection (sessions stored in DB)

### Auth Error: Unauthorized

**Symptoms:**
- 401 Unauthorized responses
- Can't access protected routes

**Solutions:**
1. Verify user is logged in
2. Check user role matches required role
3. Review middleware configuration
4. Check auth helpers are called correctly:
```typescript
const session = await requireAuthentication('file.ts', 'func');
```

### Session Error: Cookie not set

**Symptoms:**
- Session cookie not appearing
- Can't maintain login

**Solutions:**
1. Check `NEXT_PUBLIC_BETTER_AUTH_URL` is correct
2. Verify HTTPS in production
3. Check cookie settings (secure, httpOnly, sameSite)
4. Clear browser cache
5. Check domain matches (no subdomain issues)

---

## JWT Token Issues

### JWT Error: Token expired

**Symptoms:**
```
Error: jwt expired
Token validation failed
```

**Solutions:**
1. Refresh token using refresh token endpoint
2. Re-authenticate user
3. Check token expiration settings
4. Verify system clocks are synchronized

### JWT Error: Invalid signature

**Symptoms:**
```
Error: invalid signature
JWT verification failed
```

**Solutions:**
1. Verify JWT_SECRET matches on all services
2. Check JWKS endpoint is accessible
3. Ensure token wasn't tampered with
4. Verify issuer and audience claims

---

## Chat Integration Issues

### Chat Room Creation Failed

**Symptoms:**
```
Error: Failed to create chat room
Chat API returned 500
```

**Solutions:**
1. Check `NEXT_PUBLIC_CHAT_API_URL`
2. Verify external chat service is running
3. Check authentication with chat service
4. Review chat service logs

### WebSocket Connection Failed

**Symptoms:**
```
WebSocket connection failed
Error: Connection refused
```

**Solutions:**
1. Verify `NEXT_PUBLIC_CHAT_WEBSOCKET_URL`
2. Check JWT token is valid
3. Ensure WebSocket port is open
4. Review CORS settings
5. Check firewall rules

---

## WebSocket Notification Issues

### Connection Failed

**Symptoms:**
```
WebSocket connection failed
Authentication error
```

**Solutions:**
1. Verify environment variables:
   - `WEBSOCKET_SERVER_URL`
   - `NEXT_PUBLIC_WEBSOCKET_SERVER_URL`
2. Check credentials:
   - `WEBSOCKET_USERNAME`
   - `WEBSOCKET_PASSWORD`
3. Ensure Redis is running (token cache)
4. Clear Redis cache:
```bash
redis-cli DEL "ws:access_token"
redis-cli DEL "ws:refresh_token"
```

### Token Refresh Failed

**Symptoms:**
```
Error refreshing WebSocket token
Token cache expired
```

**Solutions:**
1. Review Redis cache TTL settings
2. Check token expiry times match safety margins
3. Verify WebSocket server token endpoint
4. Clear cache and re-authenticate

### Reconnection Loop

**Symptoms:**
- Constantly reconnecting
- High CPU usage
- Console flooded with connection attempts

**Solutions:**
1. Check exponential backoff settings
2. Verify max retry attempts
3. Review server-side connection limits
4. Check for network issues
5. Monitor WebSocket server health

### Messages Not Received

**Symptoms:**
- Notifications sent but not displayed
- WebSocket connected but silent

**Solutions:**
1. Verify event listeners are attached
2. Check message parsing logic
3. Ensure WebSocket is connected:
```typescript
websocketNotificationService.isConnected()
```
4. Review server-side message format
5. Check browser console for errors

---

## Build Issues

### TypeScript Error: Type 'X' is not assignable

**Symptoms:**
```
Type errors during build
npm run build fails
```

**Solutions:**
1. Run type check:
```bash
npx tsc --noEmit
```
2. Update Prisma types:
```bash
npm run prisma:generate
```
3. Check for `any` types
4. Verify imports are correct
5. Clear Next.js cache:
```bash
rm -rf .next
npm run build
```

### Build Error: Module not found

**Symptoms:**
```
Error: Cannot find module 'X'
Module resolution failed
```

**Solutions:**
1. Install missing dependency:
```bash
npm install <package>
```
2. Clear cache and reinstall:
```bash
rm -rf node_modules .next
npm install
```
3. Check import paths are correct
4. Verify tsconfig.json paths

### N+1 Queries Warning

**Symptoms:**
- Slow page loads
- Many database queries
- Performance issues

**Solutions:**
1. Review Prisma includes
2. Use specific `select` statements
3. Check for loops with queries:
```typescript
// ❌ BAD: N+1
for (const trip of trips) {
  const car = await prisma.car.findUnique({ where: { id: trip.carId } });
}

// ✅ GOOD: Single query
const trips = await prisma.trip.findMany({
  include: { car: true }
});
```

---

## Email Delivery Issues

### Email Not Sent

**Symptoms:**
- No email received
- sendEmail returns success but no email

**Solutions:**
1. Verify `RESEND_API_KEY`
2. Check sender email is verified in Resend
3. Review Resend dashboard logs
4. Check spam folder
5. Verify recipient email is valid

### Email Marked as Spam

**Symptoms:**
- Emails going to spam
- Low deliverability

**Solutions:**
1. Add delays between emails (45s):
```typescript
await step.sleep("delay", "45s");
```
2. Verify sender domain SPF/DKIM/DMARC
3. Use professional email content
4. Avoid spam trigger words
5. Maintain good sender reputation

---

## Background Job Issues

### Inngest Job Not Triggered

**Symptoms:**
- Job doesn't run
- No logs in Inngest dashboard

**Solutions:**
1. Verify `INNGEST_EVENT_KEY`
2. Check event name matches exactly
3. Review Inngest dashboard for errors
4. Ensure function is registered:
```bash
# Check functions are exported in app/api/inngest/route.ts
```
5. Test locally:
```bash
npx inngest-cli dev
```

### Job Fails Silently

**Symptoms:**
- Job runs but fails
- No error logged

**Solutions:**
1. Add error handling in steps
2. Check Inngest dashboard for failures
3. Review step-by-step execution
4. Add logging:
```typescript
console.log('Step completed:', result);
```
5. Use `onFailure` handler

---

## Performance Issues

### Slow Page Load

**Symptoms:**
- Pages take > 3 seconds to load
- Poor Lighthouse scores

**Solutions:**
1. Check database queries (N+1 problem)
2. Add Redis caching for expensive operations
3. Use React Query staleTime
4. Optimize images with Sharp
5. Use Next.js Image component
6. Enable ISR for static content

### High Memory Usage

**Symptoms:**
- Server crashes
- Out of memory errors

**Solutions:**
1. Check for memory leaks
2. Limit query result sizes
3. Use pagination
4. Close database connections
5. Monitor with:
```bash
node --inspect
```

---

## Development Environment

### Hot Reload Not Working

**Symptoms:**
- Changes not reflecting
- Must restart server

**Solutions:**
1. Check file is saved
2. Clear Next.js cache:
```bash
rm -rf .next
```
3. Restart dev server
4. Check file is in watched directory
5. Disable browser cache

### Port Already in Use

**Symptoms:**
```
Error: Port 3000 is already in use
```

**Solutions:**
```bash
# Find process using port 3000
lsof -ti:3000

# Kill process
kill -9 $(lsof -ti:3000)

# Or use different port
PORT=3001 npm run dev
```

---

## Production Issues

### 500 Internal Server Error

**Symptoms:**
- 500 errors in production
- No error details

**Solutions:**
1. Check application logs
2. Verify environment variables set
3. Check database connection
4. Review error tracking (Sentry if configured)
5. Check Redis connection
6. Verify external API keys

### Static Generation Failed

**Symptoms:**
```
Error occurred prerendering page
Static generation failed
```

**Solutions:**
1. Check for client-side code in server components
2. Verify data fetching works
3. Use dynamic rendering for auth-required pages
4. Check for runtime-only APIs

---

## Related Documentation

- [Monitoring](monitoring.md) - Debugging tools
- [Environment Variables](../reference/environment-vars.md) - Configuration
- [Commands Reference](../reference/commands.md) - Useful commands
