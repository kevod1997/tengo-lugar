# Caching Patterns

## Overview
Tengo Lugar uses **Redis** (@upstash/redis + ioredis) for caching and pub/sub functionality.

**Redis Service Location**: [src/lib/redis/redis-service.ts](../../../src/lib/redis/redis-service.ts)

---

## Redis Clients

Two Redis clients are available:

### Upstash Redis (REST API)
```typescript
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});
```

**Best for**: Edge functions, serverless, quick operations

### IORedis (TCP Connection)
```typescript
import { redisService } from '@/lib/redis/redis-service';

// Use the singleton instance
await redisService.set('key', 'value');
```

**Best for**: Background jobs, pub/sub, complex operations

---

## Basic Cache Operations

### Set with Expiration

```typescript
import { redis } from '@/lib/redis/redis-service';

// Set with TTL (Time To Live)
await redis.set('cache_key', data, { ex: 3600 }); // 1 hour

// Set without expiration
await redis.set('permanent_key', data);
```

**Common TTL Values:**
- 5 minutes: `300`
- 1 hour: `3600`
- 24 hours: `86400`
- 7 days: `604800`

### Get from Cache

```typescript
// Type-safe get
const cached = await redis.get<MyDataType>('cache_key');

if (cached) {
  return cached; // Cache hit
}

// Cache miss - fetch from source
const fresh = await fetchFromDatabase();
await redis.set('cache_key', fresh, { ex: 3600 });
return fresh;
```

### Delete from Cache

```typescript
// Delete single key
await redis.del('cache_key');

// Delete multiple keys
await redis.del('key1', 'key2', 'key3');
```

---

## Cache Patterns for External APIs

### Basic External API Caching

```typescript
import { redis } from '@/lib/redis/redis-service';

async function getCarBrands() {
  const cacheKey = 'car_api_brands';

  // Check cache first
  const cached = await redis.get<BrandsResponse>(cacheKey);
  if (cached) {
    return cached;
  }

  // Cache miss - fetch from external API
  const fresh = await fetchFromCarApi('/brands');

  // Cache for 24 hours
  await redis.set(cacheKey, fresh, { ex: 86400 });

  return fresh;
}
```

### Cache with TTL Renovation

Automatically renew cache before expiration:

```typescript
const CACHE_TIME = 86400; // 24 hours

async function getCarBrandsWithRenovation() {
  const cacheKey = 'car_api_brands';

  const cached = await redis.get<BrandsResponse>(cacheKey);

  if (cached) {
    // Check TTL (Time To Live)
    const ttl = await redis.ttl(cacheKey);

    // If less than half the cache time remains, renew in background
    if (ttl < CACHE_TIME / 2) {
      fetchAndCache(cacheKey, fetchFromCarApi, CACHE_TIME).catch(console.error);
    }

    return cached;
  }

  // Cache miss
  const fresh = await fetchFromCarApi('/brands');
  await redis.set(cacheKey, fresh, { ex: CACHE_TIME });
  return fresh;
}

async function fetchAndCache(key: string, fetchFn: Function, ttl: number) {
  const data = await fetchFn('/brands');
  await redis.set(key, data, { ex: ttl });
}
```

---

## Cache Key Patterns

### Hierarchical Keys

Use colons for namespace hierarchy:

```typescript
// Pattern: entity:id
const userKey = `user:${userId}`;
const tripKey = `trip:${tripId}`;

// Pattern: entity:action:id
const userTripsKey = `user:trips:${userId}`;
const driverStatsKey = `driver:stats:${driverId}`;

// Pattern: entity:id:relation
const tripPassengersKey = `trip:${tripId}:passengers`;
```

### Pattern Deletion

Delete multiple keys matching a pattern:

```typescript
// Get all keys matching pattern
const keys = await redis.keys(`user:trips:${userId}:*`);

// Delete all matching keys
if (keys.length > 0) {
  await redis.del(...keys);
}
```

**Warning**: `keys()` is slow on large datasets. Use with caution.

---

## Cache Invalidation Strategies

### Single Key Invalidation

```typescript
// After updating a trip
await prisma.trip.update({ where: { id: tripId }, data: { status: 'COMPLETED' } });

// Invalidate cache
await redis.del(`trip:${tripId}`);
```

### Related Keys Invalidation

```typescript
// After creating a new trip
const trip = await prisma.trip.create({ data: tripData });

// Invalidate user's trip list
await redis.del(`user:trips:${session.user.id}`);
await redis.del(`driver:trips:${driverId}`);

// Invalidate search results
await redis.del('trips:search:*'); // Be careful with patterns
```

### Time-Based Invalidation

```typescript
// Short TTL for frequently changing data
await redis.set(`active_trips`, trips, { ex: 300 }); // 5 minutes

// Long TTL for rarely changing data
await redis.set(`car_brands`, brands, { ex: 604800 }); // 7 days
```

---

## Advanced Patterns

### Cache-Aside Pattern

```typescript
async function getTrip(tripId: string) {
  const cacheKey = `trip:${tripId}`;

  // 1. Try cache
  const cached = await redis.get<Trip>(cacheKey);
  if (cached) return cached;

  // 2. Cache miss - fetch from DB
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: { /* relations */ }
  });

  if (!trip) {
    throw ServerActionError.NotFound('filename.ts', 'getTrip', 'Trip not found');
  }

  // 3. Store in cache
  await redis.set(cacheKey, trip, { ex: 3600 });

  return trip;
}
```

### Write-Through Pattern

```typescript
async function updateTrip(tripId: string, data: TripUpdateData) {
  const cacheKey = `trip:${tripId}`;

  // 1. Update database
  const updatedTrip = await prisma.trip.update({
    where: { id: tripId },
    data
  });

  // 2. Update cache immediately
  await redis.set(cacheKey, updatedTrip, { ex: 3600 });

  return updatedTrip;
}
```

### Cache with Fallback

```typescript
async function getCriticalData(key: string) {
  try {
    const cached = await redis.get(key);
    if (cached) return cached;
  } catch (redisError) {
    console.error('Redis error:', redisError);
    // Continue to database fallback
  }

  // Fallback to database
  const data = await fetchFromDatabase(key);

  // Try to cache, but don't fail if Redis is down
  try {
    await redis.set(key, data, { ex: 3600 });
  } catch (cacheError) {
    console.error('Cache write failed:', cacheError);
  }

  return data;
}
```

---

## Caching Complex Queries

### User's Active Trips

```typescript
async function getUserActiveTrips(userId: string) {
  const cacheKey = `user:${userId}:active_trips`;

  const cached = await redis.get<Trip[]>(cacheKey);
  if (cached) return cached;

  const trips = await prisma.trip.findMany({
    where: {
      passengers: {
        some: {
          passenger: { userId }
        }
      },
      status: 'ACTIVE'
    },
    include: {
      driverCar: {
        include: {
          car: {
            include: {
              carModel: { include: { brand: true } }
            }
          }
        }
      }
    }
  });

  // Cache for 5 minutes (frequently changing data)
  await redis.set(cacheKey, trips, { ex: 300 });

  return trips;
}
```

### Driver Statistics

```typescript
async function getDriverStats(driverId: string) {
  const cacheKey = `driver:${driverId}:stats`;

  const cached = await redis.get<DriverStats>(cacheKey);
  if (cached) return cached;

  const stats = await prisma.driver.findUnique({
    where: { id: driverId },
    select: {
      rating: true,
      totalTrips: true,
      totalRatings: true,
      verificationStatus: true
    }
  });

  // Cache for 1 hour
  await redis.set(cacheKey, stats, { ex: 3600 });

  return stats;
}
```

---

## Pub/Sub Patterns

### Publishing Events

```typescript
import { redisService } from '@/lib/redis/redis-service';

// Publish trip update
await redisService.publish('trip:updates', JSON.stringify({
  tripId,
  status: 'STARTED',
  timestamp: new Date()
}));
```

### Subscribing to Events

```typescript
import { redisService } from '@/lib/redis/redis-service';

// Subscribe to channel
await redisService.subscribe('trip:updates', (message) => {
  const update = JSON.parse(message);
  console.log('Trip update:', update);
  // Handle update (e.g., notify WebSocket clients)
});
```

---

## Performance Best Practices

### 1. Batch Operations

```typescript
// ❌ BAD: Multiple round trips
await redis.set('key1', value1);
await redis.set('key2', value2);
await redis.set('key3', value3);

// ✅ GOOD: Pipeline for multiple operations
const pipeline = redis.pipeline();
pipeline.set('key1', value1);
pipeline.set('key2', value2);
pipeline.set('key3', value3);
await pipeline.exec();
```

### 2. Appropriate TTL

```typescript
// Frequently changing: Short TTL
await redis.set('active_sessions', data, { ex: 300 }); // 5 min

// Rarely changing: Long TTL
await redis.set('configuration', config, { ex: 86400 }); // 24 hours

// Static data: Very long TTL
await redis.set('car_brands', brands, { ex: 604800 }); // 7 days
```

### 3. Avoid Over-Caching

Don't cache:
- Data that changes frequently (every few seconds)
- Very small datasets (faster to query DB)
- User-specific data that's rarely reused

### 4. Monitor Cache Size

```typescript
// Get cache info
const info = await redis.info('memory');
console.log('Redis memory usage:', info);
```

---

## Error Handling

### Graceful Degradation

```typescript
async function getCachedData(key: string, fetchFn: () => Promise<any>) {
  let cached;

  try {
    cached = await redis.get(key);
    if (cached) return cached;
  } catch (error) {
    console.error('Cache read failed:', error);
    // Continue without cache
  }

  // Fetch from source
  const data = await fetchFn();

  // Try to cache
  try {
    await redis.set(key, data, { ex: 3600 });
  } catch (error) {
    console.error('Cache write failed:', error);
    // Don't fail the request
  }

  return data;
}
```

---

## Testing Cache

### Check if Key Exists

```typescript
const exists = await redis.exists('cache_key');
console.log('Key exists:', exists === 1);
```

### Get TTL

```typescript
const ttl = await redis.ttl('cache_key');
console.log('Time to live (seconds):', ttl);
// -1 = no expiration
// -2 = key doesn't exist
```

### Flush Cache (Development Only)

```typescript
// ⚠️ WARNING: Deletes ALL cache
if (process.env.NODE_ENV === 'development') {
  await redis.flushall();
}
```

---

## Related Documentation

- [Database Patterns](database-patterns.md) - Prisma integration
- [Server Actions](server-actions.md) - Cache invalidation in actions
- [WebSocket Notifications](../features/websocket-notifications.md) - Token caching
