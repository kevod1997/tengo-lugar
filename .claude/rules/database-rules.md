---
paths: "{prisma/**,src/lib/prisma.ts}"
---

# Database Rules

## 🎯 Applies To

- `prisma/` directory (schema, migrations)
- `src/lib/prisma.ts` (Prisma client configuration)
- Any file performing database operations

## 🔴 CRITICAL - Never Violate

1. **NEVER fetch all fields** - Always use specific `select`
   ```typescript
   ❌ const user = await prisma.user.findUnique({ where: { id } })
   ✅ const user = await prisma.user.findUnique({
        where: { id },
        select: { id: true, name: true, email: true }
      })
   ```

2. **NEVER use raw SQL queries** unless absolutely necessary
   ```typescript
   ❌ await prisma.$queryRaw`SELECT * FROM users WHERE id = ${id}`
   ✅ await prisma.user.findUnique({ where: { id } })
   ```

3. **NEVER create N+1 queries** - Use `include` or batch queries
   ```typescript
   ❌ const trips = await prisma.trip.findMany();
      for (const trip of trips) {
        trip.driver = await prisma.user.findUnique({ where: { id: trip.driverId } });
      }

   ✅ const trips = await prisma.trip.findMany({
        include: {
          driver: { select: { id: true, name: true } }
        }
      })
   ```

4. **NEVER modify schema without migration** - Always use `prisma migrate`
   ```bash
   ❌ Edit schema.prisma → prisma generate → deploy
   ✅ Edit schema.prisma → npx prisma migrate dev --name description
   ```

5. **NEVER skip transactions for multi-step operations**
   ```typescript
   ❌ await prisma.payment.create({ ... });
      await prisma.trip.update({ ... }); // If this fails, payment still exists!

   ✅ await prisma.$transaction([
        prisma.payment.create({ ... }),
        prisma.trip.update({ ... })
      ])
   ```

## 🟡 MANDATORY - Always Follow

1. **ALWAYS use specific `select`** - Never fetch unnecessary data
   ```typescript
   // User table has 20+ fields, only select what you need
   select: {
     id: true,
     name: true,
     email: true
   }
   ```

2. **ALWAYS use transactions for related operations**
   ```typescript
   await prisma.$transaction(async (tx) => {
     const booking = await tx.booking.create({ ... });
     await tx.trip.update({
       where: { id: tripId },
       data: { availableSeats: { decrement: 1 } }
     });
     await tx.notification.create({ ... });
     return booking;
   });
   ```

3. **ALWAYS add indexes for frequently queried fields**
   ```prisma
   model Trip {
     id String @id
     driverId String
     status String
     departureTime DateTime

     @@index([driverId]) // Queried often
     @@index([status, departureTime]) // Compound index for list queries
   }
   ```

4. **ALWAYS use Prisma enums** for status fields
   ```prisma
   enum TripStatus {
     PENDING
     CONFIRMED
     IN_PROGRESS
     COMPLETED
     CANCELLED
   }

   model Trip {
     status TripStatus @default(PENDING)
   }
   ```

5. **ALWAYS handle unique constraint violations**
   ```typescript
   try {
     await prisma.user.create({ ... });
   } catch (error) {
     if (error instanceof Prisma.PrismaClientKnownRequestError) {
       if (error.code === 'P2002') {
         throw new ServiceError('Email already exists');
       }
     }
     throw error;
   }
   ```

## ✅ Quick Pattern: Optimized Query

```typescript
// BAD: Fetches all fields, no pagination, N+1 queries
const trips = await prisma.trip.findMany({
  where: { driverId: userId }
});
for (const trip of trips) {
  trip.passenger = await prisma.user.findUnique({
    where: { id: trip.passengerId }
  });
}

// GOOD: Specific select, pagination, efficient includes
const trips = await prisma.trip.findMany({
  where: {
    driverId: userId,
    status: 'PENDING'
  },
  select: {
    id: true,
    origin: true,
    destination: true,
    departureTime: true,
    availableSeats: true,
    status: true,
    passenger: {
      select: {
        id: true,
        name: true,
        avatar: true
      }
    }
  },
  orderBy: { departureTime: 'asc' },
  take: 20, // Pagination
  skip: 0
});
```

## ✅ Quick Pattern: Transaction

```typescript
// Complex operation that must succeed or fail atomically
async function bookTripWithPayment(
  tripId: string,
  userId: string,
  paymentData: PaymentData
) {
  return await prisma.$transaction(async (tx) => {
    // 1. Verify trip availability
    const trip = await tx.trip.findUnique({
      where: { id: tripId },
      select: { id: true, availableSeats: true, price: true }
    });

    if (!trip || trip.availableSeats < 1) {
      throw new ServiceError('Trip not available');
    }

    // 2. Create payment record
    const payment = await tx.payment.create({
      data: {
        userId,
        amount: trip.price,
        status: 'PENDING',
        ...paymentData
      }
    });

    // 3. Create booking
    const booking = await tx.booking.create({
      data: {
        tripId,
        userId,
        paymentId: payment.id
      }
    });

    // 4. Update available seats
    await tx.trip.update({
      where: { id: tripId },
      data: { availableSeats: { decrement: 1 } }
    });

    return { booking, payment };
  });
}
```

## 🔗 Detailed Documentation

For complete database patterns, see:
- [database-patterns.md](../../docs/agent/patterns/database-patterns.md) - Comprehensive Prisma patterns
- [database-schema.md](../../docs/agent/reference/database-schema.md) - Complete schema reference

## ❌ Common Database Mistakes

- **Mistake**: Fetching entire user object when only need name
  - **Impact**: 20x larger payload, slower queries
  - **Fix**: `select: { name: true }`

- **Mistake**: N+1 queries in list views
  - **Impact**: 100 trips = 1 + 100 queries instead of 1
  - **Fix**: Use `include` or `select` with nested relations

- **Mistake**: No indexes on frequently filtered fields
  - **Impact**: Slow queries, full table scans
  - **Fix**: Add `@@index([field])` in schema

- **Mistake**: Not using transactions for related operations
  - **Impact**: Partial updates on errors, inconsistent data
  - **Fix**: Wrap in `prisma.$transaction()`

- **Mistake**: Deeply nested includes (3+ levels)
  - **Impact**: Massive payloads, very slow queries
  - **Fix**: Limit to 1-2 levels, use separate queries if needed

## 📊 Prisma Error Codes

Common error codes to handle:

| Code | Meaning | How to Handle |
|------|---------|---------------|
| P2002 | Unique constraint violation | "Email/username already exists" |
| P2025 | Record not found | "Resource not found" |
| P2003 | Foreign key constraint | "Related record doesn't exist" |
| P2014 | Relation violation | "Cannot delete, has dependencies" |

```typescript
catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        throw new ServiceError('Email already exists');
      case 'P2025':
        throw new ServiceError('Trip not found');
      case 'P2003':
        throw new ServiceError('Invalid reference');
      default:
        throw new ServiceError('Database error');
    }
  }
  throw error;
}
```

## 📋 Database Development Checklist

Before marking database work complete:

- [ ] All queries use specific `select` (not fetching all fields)
- [ ] No N+1 queries (use `include` for relations)
- [ ] Transactions used for multi-step operations
- [ ] Indexes added for frequently queried fields
- [ ] Enums used for status/type fields
- [ ] Unique constraints violations handled
- [ ] Foreign key constraints defined
- [ ] Migrations created (never direct schema edits)
- [ ] No raw SQL queries (unless absolutely necessary)
- [ ] Pagination implemented for large lists (`take`/`skip`)
