---
paths: src/services/**/*.ts
---

# Services Rules

## 🎯 Applies To

All files in `src/services/` - Business logic layer between Server Actions and database.

## 🔴 CRITICAL - Never Violate

1. **NEVER handle authentication in services** - Services are called from authenticated context
   ```typescript
   ❌ // In service
   export class TripService {
     static async getTrips() {
       const session = await auth(); // Wrong layer!
     }
   }

   ✅ // In Server Action (caller)
   const session = await requireAuthentication();
   const trips = await TripService.getTrips(session.user.id);
   ```

2. **NEVER use ServerActionError** - Services throw `ServiceError`
   ```typescript
   ❌ throw new ServerActionError('...') // Wrong error type
   ✅ throw new ServiceError('Trip not available', {
        fileName: 'trip-service.ts',
        functionName: 'validateAvailability',
        context: { tripId }
      })
   ```

3. **NEVER return ApiHandler responses** - Services return raw data or throw errors
   ```typescript
   ❌ return ApiHandler.success(trip) // ApiHandler is for Server Actions
   ✅ return trip // Return raw data
   ✅ throw new ServiceError('...') // Or throw error
   ```

4. **NEVER mix business logic with Server Actions** - Keep them separate
   ```typescript
   ❌ // Complex logic directly in Server Action
   export async function createTrip(formData: FormData) {
     // 50 lines of business logic...
   }

   ✅ // Business logic in service
   export class TripService {
     static async create(data: CreateTripInput, userId: string) {
       // Complex logic here
     }
   }

   // Server Action calls service
   export async function createTrip(formData: FormData) {
     const session = await requireAuthentication();
     const validated = schema.parse(formData);
     const trip = await TripService.create(validated, session.user.id);
     return ApiHandler.success(trip);
   }
   ```

5. **NEVER skip input validation** - Validate service inputs (use Zod or type guards)
   ```typescript
   ❌ static async getTrip(id: any) { ... } // Any type, no validation
   ✅ static async getTrip(id: string) {
        if (!id || typeof id !== 'string') {
          throw new ServiceError('Invalid trip ID');
        }
      }
   ```

## 🟡 MANDATORY - Always Follow

1. **ALWAYS organize services by domain** - One service per entity/domain
   ```
   src/services/
   ├── trip-service.ts      # Trip-related business logic
   ├── payment-service.ts   # Payment processing
   ├── user-service.ts      # User management
   └── notification-service.ts
   ```

2. **ALWAYS use static methods** - Services are stateless utility classes
   ```typescript
   ✅ export class TripService {
        static async create(data: CreateTripInput) { ... }
        static async update(id: string, data: UpdateTripInput) { ... }
      }

   ❌ export class TripService {
        async create(data: CreateTripInput) { ... } // Not static
      }
   ```

3. **ALWAYS throw ServiceError for business rule violations**
   ```typescript
   if (trip.availableSeats === 0) {
     throw new ServiceError('No seats available', {
       fileName: 'trip-service.ts',
       functionName: 'bookSeat',
       context: { tripId: trip.id, requestedSeats: 1 }
     });
   }
   ```

4. **ALWAYS use transactions for complex multi-step operations**
   ```typescript
   static async bookTrip(tripId: string, userId: string) {
     return await prisma.$transaction(async (tx) => {
       // Step 1: Verify availability
       const trip = await tx.trip.findUnique({ where: { id: tripId } });
       if (!trip || trip.availableSeats < 1) {
         throw new ServiceError('Trip not available');
       }

       // Step 2: Create booking
       const booking = await tx.booking.create({
         data: { tripId, userId }
       });

       // Step 3: Update available seats
       await tx.trip.update({
         where: { id: tripId },
         data: { availableSeats: { decrement: 1 } }
       });

       return booking;
     });
   }
   ```

5. **ALWAYS document public service methods** - JSDoc for complex logic
   ```typescript
   /**
    * Validates trip availability and business rules
    * @param tripId - The trip to validate
    * @param requestedSeats - Number of seats requested
    * @throws ServiceError if trip is unavailable or doesn't meet requirements
    * @returns The validated trip with driver and vehicle info
    */
   static async validateTripAvailability(
     tripId: string,
     requestedSeats: number
   ): Promise<TripWithDetails> {
     // Implementation...
   }
   ```

## ✅ Quick Pattern: Service Class

```typescript
import { ServiceError } from '@/lib/exceptions/exceptions';
import { prisma } from '@/lib/prisma';

export class TripService {
  /**
   * Creates a new trip with validation
   */
  static async create(data: CreateTripInput, driverId: string) {
    // Business rule validation
    if (data.availableSeats < 1 || data.availableSeats > 8) {
      throw new ServiceError('Invalid number of seats', {
        fileName: 'trip-service.ts',
        functionName: 'create',
        context: { availableSeats: data.availableSeats }
      });
    }

    // Create trip
    const trip = await prisma.trip.create({
      data: {
        ...data,
        driverId,
        status: 'PENDING'
      },
      select: {
        id: true,
        origin: true,
        destination: true,
        departureTime: true,
        availableSeats: true,
        driver: {
          select: { id: true, name: true }
        }
      }
    });

    return trip;
  }

  /**
   * Validates trip can be booked
   */
  static async validateForBooking(tripId: string) {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      select: {
        id: true,
        status: true,
        availableSeats: true,
        departureTime: true
      }
    });

    if (!trip) {
      throw new ServiceError('Trip not found', {
        fileName: 'trip-service.ts',
        functionName: 'validateForBooking',
        context: { tripId }
      });
    }

    if (trip.status !== 'PENDING') {
      throw new ServiceError('Trip is not available for booking', {
        fileName: 'trip-service.ts',
        functionName: 'validateForBooking',
        context: { tripId, status: trip.status }
      });
    }

    if (trip.availableSeats < 1) {
      throw new ServiceError('No seats available', {
        fileName: 'trip-service.ts',
        functionName: 'validateForBooking',
        context: { tripId, availableSeats: 0 }
      });
    }

    return trip;
  }
}
```

## 🔗 Detailed Documentation

For complete service layer patterns, see:
- [database-patterns.md](../../docs/agent/patterns/database-patterns.md) - Database operations and transactions
- [server-actions.md](../../docs/agent/patterns/server-actions.md) - How Server Actions call services

## ❌ Common Mistakes

- **Mistake**: Checking authentication in services
  - **Why**: Services don't have access to session, auth is Server Action's job
  - **Fix**: Pass userId/user as parameter from Server Action

- **Mistake**: Using ApiHandler in services
  - **Why**: ApiHandler is for Server Actions only
  - **Fix**: Return raw data or throw ServiceError

- **Mistake**: Not using transactions for multi-step operations
  - **Why**: Partial updates on failure leave data inconsistent
  - **Fix**: Wrap in `prisma.$transaction()`

- **Mistake**: Mixing HTTP/API concerns with business logic
  - **Why**: Services should be framework-agnostic
  - **Fix**: Keep HTTP/response formatting in Server Actions

## 📋 Service Development Checklist

Before marking service work complete:

- [ ] Service methods are static
- [ ] No authentication logic (handled by callers)
- [ ] Throws ServiceError (not ServerActionError)
- [ ] Returns raw data (not ApiHandler responses)
- [ ] Complex operations use transactions
- [ ] Input validation present
- [ ] Business rules clearly enforced
- [ ] Public methods documented with JSDoc
- [ ] No HTTP/framework-specific code
- [ ] Specific Prisma selects used
