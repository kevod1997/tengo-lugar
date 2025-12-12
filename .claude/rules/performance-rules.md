---
# Global performance rules - apply to all files
---

# Performance Rules

## 🎯 Applies To

All code in the Tengo Lugar project - these are universal performance requirements.

## 🔴 CRITICAL - Never Violate

1. **NEVER fetch all fields from Prisma** - Always use specific `select`
   ```typescript
   ❌ const user = await prisma.user.findUnique({ where: { id } })
   ✅ const user = await prisma.user.findUnique({
        where: { id },
        select: { id: true, name: true, email: true }
      })
   ```

2. **NEVER make database queries in loops** - This causes N+1 query problems
   ```typescript
   ❌ for (const trip of trips) {
        trip.driver = await prisma.user.findUnique({ where: { id: trip.driverId } })
      }
   ✅ const trips = await prisma.trip.findMany({
        include: { driver: true }
      })
   ```

3. **NEVER skip Redis cache for external APIs** - MercadoPago, geocoding, etc.
   ```typescript
   ❌ const response = await fetch(`https://api.example.com/${id}`)
   ✅ const cached = await redis.get(`api:${id}`);
       if (cached) return JSON.parse(cached);
       const response = await fetch(`https://api.example.com/${id}`);
       await redis.setex(`api:${id}`, 3600, JSON.stringify(response));
   ```

4. **NEVER use Zustand for server state** - React Query is optimized for this
   ```typescript
   ❌ const trips = useTripsStore(state => state.trips) // Zustand
   ✅ const { data: trips } = useQuery({ queryKey: ['trips'], queryFn: fetchTrips })
   ```

5. **NEVER upload images without optimization** - Use Sharp before S3
   ```typescript
   ❌ await s3.upload(rawImageBuffer)
   ✅ const optimized = await sharp(rawImageBuffer)
        .resize(1200, 1200, { fit: 'inside' })
        .jpeg({ quality: 85 })
        .toBuffer();
      await s3.upload(optimized);
   ```

## 🟡 MANDATORY - Always Follow

1. **ALWAYS use specific select in Prisma queries**
   - Only fetch fields you actually use
   - Reduces payload size and database load
   - Example: User has 20 fields, only select 3 needed ones

2. **ALWAYS implement Redis caching for external APIs**
   - MercadoPago webhooks/status checks
   - Geocoding API calls (Google Maps, etc.)
   - Weather data, exchange rates, etc.
   - TTL based on data freshness needs (minutes to hours)

3. **ALWAYS use React Query for server state**
   - Any data from database or APIs
   - Automatic caching, revalidation, deduplication
   - Never store in Zustand or component state

4. **ALWAYS use Prisma transactions for complex operations**
   - Multiple related database operations that must succeed together
   - Prevents partial updates on failure
   ```typescript
   await prisma.$transaction(async (tx) => {
     await tx.payment.create({ ... });
     await tx.trip.update({ ... });
   });
   ```

5. **ALWAYS optimize images before storage**
   - Resize to max dimensions (e.g., 1200x1200)
   - Compress with appropriate quality (80-85% for JPEG)
   - Convert to efficient format (WebP when supported)

## ✅ Quick Pattern: Efficient Data Fetching

```typescript
// Server Action with optimized Prisma query
'use server';

export async function getTrips() {
  const session = await requireAuthentication();

  const trips = await prisma.trip.findMany({
    where: {
      OR: [
        { driverId: session.user.id },
        { passengerId: session.user.id }
      ]
    },
    // CRITICAL: Specific select
    select: {
      id: true,
      origin: true,
      destination: true,
      departureTime: true,
      status: true,
      // Include related data efficiently
      driver: {
        select: { id: true, name: true, avatar: true }
      },
      passenger: {
        select: { id: true, name: true, avatar: true }
      }
    },
    // Pagination for large datasets
    take: 20,
    orderBy: { departureTime: 'desc' }
  });

  return ApiHandler.success(trips);
}
```

## 🔗 Detailed Documentation

For complete performance implementation guides, see:
- [database-patterns.md](../../docs/agent/patterns/database-patterns.md) - Prisma optimization patterns
- [caching-patterns.md](../../docs/agent/patterns/caching-patterns.md) - Redis caching strategies
- [data-fetching.md](../../docs/agent/patterns/data-fetching.md) - React Query patterns

## ❌ Common Performance Mistakes

- **Mistake**: Fetching entire user object when you only need the name
  - **Impact**: 20x larger payload, slower queries
  - **Fix**: Use `select: { name: true }` instead

- **Mistake**: Making API calls without caching
  - **Impact**: Slow responses, hitting rate limits, high costs
  - **Fix**: Implement Redis cache with appropriate TTL

- **Mistake**: N+1 queries in list pages
  - **Impact**: 1 + N database queries instead of 1
  - **Fix**: Use Prisma `include` or `select` with relations

- **Mistake**: Storing server data in Zustand
  - **Impact**: No caching, manual revalidation, stale data
  - **Fix**: Use React Query for all server state

- **Mistake**: Deeply nested Prisma includes
  - **Impact**: Massive payloads, slow queries
  - **Fix**: Only include 1-2 levels deep, use separate queries if needed

## 🎯 Decision Tree: React Query vs Zustand

```
Is this data from server (database/API)?
├─ YES → Use React Query ✅
│   └─ Example: User profile, trips, payments
│
└─ NO → Is this UI state?
    ├─ YES → Use Zustand ✅
    │   └─ Example: Sidebar open, modal visible, form draft
    │
    └─ Is this derived from server data?
        └─ Use React Query with `select` ✅
            └─ Example: Filtered list, sorted data
```

## 📋 Performance Checklist

Before marking data-fetching work complete:

- [ ] Prisma queries use specific `select` (not fetching all fields)
- [ ] No N+1 queries (checked with Prisma query logging)
- [ ] External API calls cached in Redis with appropriate TTL
- [ ] React Query used for all server state (not Zustand)
- [ ] Images optimized with Sharp before S3 upload
- [ ] Complex operations use Prisma `$transaction`
- [ ] List pages implement pagination (`take`/`skip`)
- [ ] Includes limited to 1-2 levels deep
