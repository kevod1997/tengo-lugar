# Monitoring & Debugging Tools

## Database Monitoring

### Prisma Studio
Visual database browser and editor.

```bash
npm run prisma:studio
```

**Features:**
- Browse all tables
- View relationships
- Edit records
- Filter and search
- Runs on http://localhost:5555

**Use Cases:**
- Inspect database records
- Debug data issues
- Test queries
- Manual data fixes

---

## Cache Monitoring

### Upstash Console
Monitor Redis cache usage and performance.

**Access:** https://console.upstash.com

**Features:**
- Real-time monitoring
- Memory usage
- Command statistics
- Key inspection
- TTL monitoring

**Metrics to Watch:**
- Memory usage (% of limit)
- Commands per second
- Hit rate
- Evicted keys
- Expiring keys

### Redis CLI (Local Development)

```bash
# Connect to Redis
redis-cli

# Monitor all commands
MONITOR

# Get all keys
KEYS *

# Get specific key
GET "cache_key"

# Check TTL
TTL "cache_key"

# Delete key
DEL "cache_key"

# Flush all cache (⚠️ Danger!)
FLUSHDB
```

---

## Logging & Error Tracking

### Database Logs

#### Error Logs Table
View application errors:

```typescript
// Query recent errors
const errors = await prisma.errorLog.findMany({
  orderBy: { timestamp: 'desc' },
  take: 50
});
```

**Prisma Studio:**
1. Open Prisma Studio
2. Navigate to ErrorLog table
3. Sort by timestamp (descending)
4. Filter by error message or context

#### User Action Logs
Track user actions for audit:

```typescript
// Query user actions
const actions = await prisma.userActionLog.findMany({
  where: { userId: session.user.id },
  orderBy: { timestamp: 'desc' },
  take: 100
});
```

**Use Cases:**
- Audit trail
- Debug user workflows
- Track success/failure rates
- Performance analysis

---

## Background Jobs Monitoring

### Inngest Dashboard

**Access:**
- **Production:** https://app.inngest.com
- **Development:** http://localhost:8288 (when running `npx inngest-cli dev`)

**Features:**
- View all functions
- See execution history
- Step-by-step debugging
- Retry failed jobs
- View logs
- Performance metrics

**Key Metrics:**
- Success rate
- Execution time
- Retry count
- Queue depth
- Error rate

### Common Debugging Tasks

#### View Failed Jobs
1. Open Inngest dashboard
2. Filter by "Failed" status
3. Click on failed job
4. Review error message and stack trace
5. Check each step's execution

#### Retry Failed Job
1. Locate failed job
2. Click "Retry"
3. Monitor execution
4. Check if succeeds

#### View Job Timeline
1. Select job
2. View step-by-step timeline
3. Check duration of each step
4. Identify bottlenecks

---

## Email Monitoring

### Resend Dashboard

**Access:** https://resend.com/dashboard

**Features:**
- Email delivery status
- Open/click tracking
- Bounce handling
- Spam reports
- API usage

**Metrics to Watch:**
- Delivery rate
- Bounce rate
- Spam complaints
- API usage limits

### Check Email Delivery

```typescript
// In your code, log email sends
console.log('Email sent:', {
  to: email,
  subject: subject,
  template: template,
  timestamp: new Date().toISOString()
});
```

---

## AWS S3 Monitoring

### AWS Console
Monitor file storage and usage.

**Access:** https://console.aws.amazon.com/s3/

**Metrics to Watch:**
- Storage size
- Number of objects
- Request count
- Data transfer
- Costs

### Check Uploaded Files

```typescript
// List files in S3 bucket
import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { s3Client } from '@/lib/file/s3-client';

const command = new ListObjectsV2Command({
  Bucket: process.env.AWS_S3_BUCKET_NAME,
  Prefix: 'users/123/', // Filter by prefix
  MaxKeys: 100
});

const response = await s3Client.send(command);
console.log('Files:', response.Contents);
```

---

## WebSocket Monitoring

### Connection Status Logging

```typescript
'use client'

import { websocketNotificationService } from '@/services/websocket/websocket-notification-service';

// Log connection events
websocketNotificationService.on('connected', () => {
  console.log('[WS] Connected at', new Date().toISOString());
});

websocketNotificationService.on('disconnected', () => {
  console.log('[WS] Disconnected at', new Date().toISOString());
});

websocketNotificationService.on('error', (error) => {
  console.error('[WS] Error:', error, new Date().toISOString());
});

websocketNotificationService.on('message', (message) => {
  console.log('[WS] Message received:', message, new Date().toISOString());
});

websocketNotificationService.on('reconnecting', (attempt) => {
  console.log(`[WS] Reconnecting... Attempt ${attempt}`, new Date().toISOString());
});
```

### Check Connection State

```typescript
const isConnected = websocketNotificationService.isConnected();
const state = websocketNotificationService.getConnectionState();

console.log('WebSocket connected:', isConnected);
console.log('WebSocket state:', state);
```

---

## Performance Monitoring

### React Query Devtools

Enable in development:

```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

**Features:**
- View all queries
- See cached data
- Check staleness
- Monitor refetch behavior
- Inspect query state

### Browser DevTools

#### Network Tab
Monitor API requests:
- Request/response times
- Status codes
- Payload sizes
- Failed requests

#### Console Tab
View application logs:
- Server Action results
- Error messages
- Debug logs
- Performance warnings

#### Performance Tab
Analyze page performance:
- Load times
- Render blocking
- Memory usage
- CPU usage

---

## Next.js Built-in Monitoring

### Build Analysis

```bash
# Analyze bundle size
npm run build
```

Output shows:
- Page sizes
- First Load JS
- Route types (static/dynamic)
- Build warnings

### Runtime Logs

Development console shows:
- Compiled pages
- API routes called
- Render times
- Errors and warnings

---

## Database Query Logging

### Enable Prisma Query Logging

**Location:** [src/lib/prisma.ts](../../../src/lib/prisma.ts)

```typescript
const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'stdout' },
    { level: 'warn', emit: 'stdout' },
  ],
});

prisma.$on('query', (e) => {
  console.log('Query: ' + e.query);
  console.log('Duration: ' + e.duration + 'ms');
});
```

**Use in Development Only:**
```typescript
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query'] : ['error'],
});
```

---

## Custom Monitoring

### Performance Timing

```typescript
export async function myServerAction() {
  const startTime = Date.now();

  try {
    // Your logic
    const result = await someOperation();

    const duration = Date.now() - startTime;
    console.log(`[Performance] myServerAction completed in ${duration}ms`);

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[Performance] myServerAction failed after ${duration}ms`, error);
    throw error;
  }
}
```

### Request Logging Middleware

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const start = Date.now();

  const response = NextResponse.next();

  const duration = Date.now() - start;
  console.log(`[${request.method}] ${request.url} - ${duration}ms`);

  return response;
}
```

---

## Health Checks

### Database Health

```typescript
export async function checkDatabaseHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'healthy', service: 'database' };
  } catch (error) {
    return { status: 'unhealthy', service: 'database', error: error.message };
  }
}
```

### Redis Health

```typescript
import { redis } from '@/lib/redis/redis-service';

export async function checkRedisHealth() {
  try {
    await redis.ping();
    return { status: 'healthy', service: 'redis' };
  } catch (error) {
    return { status: 'unhealthy', service: 'redis', error: error.message };
  }
}
```

### Health Check Endpoint

**Location:** [src/app/api/health/route.ts](../../../src/app/api/health/route.ts)

```typescript
import { NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/lib/health/database';
import { checkRedisHealth } from '@/lib/health/redis';

export async function GET() {
  const checks = await Promise.all([
    checkDatabaseHealth(),
    checkRedisHealth(),
  ]);

  const allHealthy = checks.every(check => check.status === 'healthy');

  return NextResponse.json({
    status: allHealthy ? 'healthy' : 'unhealthy',
    checks,
    timestamp: new Date().toISOString()
  }, {
    status: allHealthy ? 200 : 503
  });
}
```

**Usage:**
```bash
curl http://localhost:3000/api/health
```

---

## Recommended Third-Party Tools

### Error Tracking

#### Sentry (Recommended)
- Automatic error capture
- Stack traces
- User context
- Performance monitoring
- Release tracking

Setup:
```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

### Analytics

#### Vercel Analytics (Recommended for Vercel)
- Web Vitals
- Page views
- User behavior
- No configuration needed on Vercel

#### Google Analytics
- User tracking
- Conversion tracking
- Custom events

---

## Monitoring Checklist

### Daily Checks
- [ ] Check ErrorLog table for new errors
- [ ] Review Inngest dashboard for failed jobs
- [ ] Monitor email delivery rate in Resend
- [ ] Check Redis memory usage

### Weekly Checks
- [ ] Review slow queries in Prisma logs
- [ ] Check S3 storage usage and costs
- [ ] Analyze user action patterns
- [ ] Review WebSocket connection stability

### Monthly Checks
- [ ] Database performance review
- [ ] Cache hit rate analysis
- [ ] Email deliverability review
- [ ] Cost optimization (AWS, Upstash, etc.)

---

## Related Documentation

- [Troubleshooting](troubleshooting.md) - Common issues and fixes
- [Commands Reference](../reference/commands.md) - Useful commands
- [Database Patterns](../patterns/database-patterns.md) - Query optimization
