# Database Patterns

## Overview
Tengo Lugar uses **PostgreSQL** with **Prisma ORM** for type-safe database operations.

**Prisma Client Location**: [src/lib/prisma.ts](../../../src/lib/prisma.ts)

---

## Performance Rules

1. ✅ **USE** specific `select` for performance
2. ✅ **USE** transactions for complex operations
3. ❌ **AVOID** N+1 queries - use efficient includes
4. ❌ **AVOID** fetching all fields when you only need a few
5. ✅ **USE** indexes for frequently queried fields

---

## Efficient Query Patterns

### Specific Select (RECOMMENDED)

Always use `select` to fetch only needed fields:

```typescript
// ✅ GOOD: Only fetch needed fields
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: {
    id: true,
    name: true,
    email: true,
    driver: { select: { id: true } },
    passenger: { select: { id: true } }
  }
});
```

```typescript
// ❌ BAD: Fetches all fields
const user = await prisma.user.findUnique({
  where: { id: userId }
});
```

### Efficient Includes for Relations

Use nested includes to avoid N+1 queries:

```typescript
// ✅ GOOD: Single query with nested relations
const trips = await prisma.trip.findMany({
  where: { driverId },
  include: {
    driverCar: {
      include: {
        car: {
          include: {
            carModel: { include: { brand: true } }
          }
        }
      }
    },
    passengers: {
      include: {
        passenger: {
          select: { user: { select: { name: true, email: true } } }
        }
      }
    }
  }
});
```

```typescript
// ❌ BAD: Multiple queries (N+1 problem)
const trips = await prisma.trip.findMany({ where: { driverId } });
for (const trip of trips) {
  const car = await prisma.driverCar.findUnique({ where: { id: trip.driverCarId } });
  // N+1 query problem!
}
```

### Combining Select and Include

```typescript
// You can use both for fine-grained control
const trip = await prisma.trip.findUnique({
  where: { id: tripId },
  select: {
    id: true,
    origin: true,
    destination: true,
    departureDate: true,
    driverCar: {
      select: {
        car: {
          select: {
            patent: true,
            carModel: {
              select: {
                name: true,
                brand: { select: { name: true } }
              }
            }
          }
        }
      }
    }
  }
});
```

---

## Transaction Patterns

### Basic Transaction

Use transactions for operations that must succeed or fail together:

```typescript
const result = await prisma.$transaction(async (tx) => {
  // Create car
  const car = await tx.car.create({
    data: {
      patent: carData.patent,
      year: carData.year,
      carModelId: carData.carModelId
    }
  });

  // Link to driver
  const driverCar = await tx.driverCar.create({
    data: {
      driverId: session.user.driver.id,
      carId: car.id,
      isActive: true
    }
  });

  return { car, driverCar };
});
```

### Transaction with Error Handling

```typescript
const result = await prisma.$transaction(async (tx) => {
  // Check existence
  const existingTrip = await tx.trip.findUnique({
    where: { id: tripId }
  });

  if (!existingTrip) {
    throw ServerActionError.NotFound('filename.ts', 'functionName', 'Trip not found');
  }

  // Update trip
  const updatedTrip = await tx.trip.update({
    where: { id: tripId },
    data: { status: 'CANCELLED' }
  });

  // Notify passengers
  await tx.notification.createMany({
    data: existingTrip.passengers.map(p => ({
      userId: p.passengerId,
      title: 'Trip Cancelled',
      message: 'Your trip has been cancelled',
      type: 'trip_update'
    }))
  });

  return updatedTrip;
});
```

### Interactive Transactions with Timeout

For long-running transactions:

```typescript
const result = await prisma.$transaction(
  async (tx) => {
    // Complex operations
  },
  {
    maxWait: 5000, // 5 seconds
    timeout: 10000, // 10 seconds
  }
);
```

---

## Common Query Patterns

### Find User with Roles

```typescript
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: {
    id: true,
    name: true,
    email: true,
    role: true,
    driver: {
      select: {
        id: true,
        verificationStatus: true,
        rating: true
      }
    },
    passenger: {
      select: {
        id: true,
        rating: true
      }
    }
  }
});

const isDriver = !!user?.driver;
const isPassenger = !!user?.passenger;
```

### Find Trips with Full Details

```typescript
const trips = await prisma.trip.findMany({
  where: {
    driverCar: {
      driver: { userId: session.user.id }
    }
  },
  include: {
    driverCar: {
      include: {
        driver: {
          select: {
            user: {
              select: { name: true, image: true }
            }
          }
        },
        car: {
          include: {
            carModel: {
              include: { brand: true }
            }
          }
        }
      }
    },
    passengers: {
      include: {
        passenger: {
          include: {
            user: {
              select: { name: true, image: true }
            }
          }
        },
        payment: {
          select: {
            status: true,
            amount: true
          }
        }
      }
    },
    reviews: {
      include: {
        reviewer: {
          select: { name: true, image: true }
        }
      }
    }
  },
  orderBy: { departureDate: 'desc' }
});
```

### Pagination Pattern

```typescript
const page = 1;
const pageSize = 10;
const skip = (page - 1) * pageSize;

const [trips, totalCount] = await Promise.all([
  prisma.trip.findMany({
    where: { status: 'ACTIVE' },
    skip,
    take: pageSize,
    orderBy: { departureDate: 'asc' },
    select: {
      id: true,
      origin: true,
      destination: true,
      departureDate: true,
      availableSeats: true,
      pricePerSeat: true
    }
  }),
  prisma.trip.count({
    where: { status: 'ACTIVE' }
  })
]);

const totalPages = Math.ceil(totalCount / pageSize);
```

### Search with Filters

```typescript
const trips = await prisma.trip.findMany({
  where: {
    AND: [
      { status: 'ACTIVE' },
      { departureDate: { gte: new Date() } },
      { availableSeats: { gt: 0 } },
      {
        OR: [
          { origin: { contains: searchTerm, mode: 'insensitive' } },
          { destination: { contains: searchTerm, mode: 'insensitive' } }
        ]
      }
    ]
  },
  orderBy: { departureDate: 'asc' }
});
```

---

## Update Patterns

### Simple Update

```typescript
const updatedTrip = await prisma.trip.update({
  where: { id: tripId },
  data: {
    status: 'COMPLETED',
    completedAt: new Date()
  }
});
```

### Update with Relations

```typescript
const updatedDriver = await prisma.driver.update({
  where: { id: driverId },
  data: {
    verificationStatus: 'VERIFIED',
    user: {
      update: {
        emailVerified: true
      }
    }
  }
});
```

### Upsert Pattern

```typescript
const pushSubscription = await prisma.pushSubscription.upsert({
  where: {
    userId_endpoint: {
      userId: session.user.id,
      endpoint: subscription.endpoint
    }
  },
  update: {
    keys: subscription.keys
  },
  create: {
    userId: session.user.id,
    endpoint: subscription.endpoint,
    keys: subscription.keys
  }
});
```

### Atomic Increment/Decrement

```typescript
// Decrement available seats atomically
const trip = await prisma.trip.update({
  where: { id: tripId },
  data: {
    availableSeats: { decrement: 1 }
  }
});

// Increment rating count
await prisma.driver.update({
  where: { id: driverId },
  data: {
    totalRatings: { increment: 1 }
  }
});
```

---

## Deletion Patterns

### Soft Delete

```typescript
// Mark as deleted instead of removing
const deletedTrip = await prisma.trip.update({
  where: { id: tripId },
  data: {
    isDeleted: true,
    deletedAt: new Date()
  }
});
```

### Hard Delete with Cascade

```typescript
// Transaction ensures all related records are deleted
await prisma.$transaction(async (tx) => {
  // Delete related records first
  await tx.tripPassenger.deleteMany({
    where: { tripId }
  });

  await tx.review.deleteMany({
    where: { tripId }
  });

  // Then delete the trip
  await tx.trip.delete({
    where: { id: tripId }
  });
});
```

---

## Aggregation Patterns

### Count and Group By

```typescript
const tripStats = await prisma.trip.groupBy({
  by: ['status'],
  _count: {
    id: true
  },
  where: {
    driverCar: {
      driver: { userId: session.user.id }
    }
  }
});

// Result: [{ status: 'ACTIVE', _count: { id: 5 } }, ...]
```

### Aggregate Functions

```typescript
const paymentStats = await prisma.payment.aggregate({
  where: {
    tripPassenger: {
      trip: {
        driverCar: {
          driver: { userId: session.user.id }
        }
      }
    },
    status: 'APPROVED'
  },
  _sum: { amount: true },
  _avg: { amount: true },
  _count: { id: true }
});
```

---

## Performance Optimization Tips

### 1. Use Indexes

Ensure frequently queried fields have indexes in your Prisma schema:

```prisma
model Trip {
  id            String   @id @default(uuid())
  status        String   @index
  departureDate DateTime @index
  driverCarId   String   @index
  // ...
}
```

### 2. Limit Result Size

Always use `take` for large datasets:

```typescript
const recentTrips = await prisma.trip.findMany({
  take: 20,
  orderBy: { createdAt: 'desc' }
});
```

### 3. Use Connection Pooling

Prisma automatically handles connection pooling. In serverless environments, adjust:

```typescript
// In prisma.ts
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + '?connection_limit=5'
    }
  }
});
```

### 4. Avoid Circular Includes

```typescript
// ❌ BAD: Can cause performance issues
const trip = await prisma.trip.findUnique({
  where: { id: tripId },
  include: {
    driverCar: {
      include: {
        driver: {
          include: {
            driverCars: { // Circular!
              include: { trips: true }
            }
          }
        }
      }
    }
  }
});
```

---

## Error Handling

### Handle Unique Constraint Violations

```typescript
try {
  const car = await prisma.car.create({
    data: { patent: 'ABC123', /* ... */ }
  });
} catch (error) {
  if (error.code === 'P2002') {
    throw ServerActionError.ValidationFailed(
      'filename.ts',
      'functionName',
      'A car with this patent already exists'
    );
  }
  throw error;
}
```

### Handle Not Found

```typescript
const trip = await prisma.trip.findUnique({
  where: { id: tripId }
});

if (!trip) {
  throw ServerActionError.NotFound('filename.ts', 'functionName', 'Trip not found');
}
```

---

## Related Documentation

- [Server Actions](server-actions.md) - Server Action patterns
- [Database Schema](../reference/database-schema.md) - Schema overview
- [Caching Patterns](caching-patterns.md) - Redis integration with Prisma
