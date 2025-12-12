---
# Global error handling rules - apply to all files
---

# Error Handling Rules

## 🎯 Applies To

All code in the Tengo Lugar project - consistent error handling is critical for debugging and user experience.

## 🔴 CRITICAL - Never Violate

1. **NEVER throw raw errors without context** - Always use typed error classes
   ```typescript
   ❌ throw new Error('Something went wrong')
   ✅ throw new ServerActionError('Failed to create trip', {
        fileName: 'trip-actions.ts',
        functionName: 'createTrip',
        context: { userId, tripData }
      })
   ```

2. **NEVER skip ApiHandler.handleError()** - This ensures consistent error responses and logging
   ```typescript
   ❌ catch (error) {
        console.error(error);
        return { success: false, error: error.message };
      }
   ✅ catch (error) {
        return ApiHandler.handleError(error);
      }
   ```

3. **NEVER log errors manually** - LoggingService is automatically called by ApiHandler
   ```typescript
   ❌ catch (error) {
        console.error(error);
        await logToFile(error);
      }
   ✅ catch (error) {
        return ApiHandler.handleError(error); // Logs automatically
      }
   ```

4. **NEVER expose internal errors to users** - ApiHandler sanitizes error messages
   ```typescript
   ❌ return { error: error.stack } // Exposes internal details
   ✅ return ApiHandler.handleError(error) // Sanitized user-facing message
   ```

5. **NEVER ignore promise rejections** - Always handle errors in async functions
   ```typescript
   ❌ prisma.user.create({ ... }) // No await, no catch
   ❌ fetch(url) // Uncaught promise rejection
   ✅ try {
        await prisma.user.create({ ... });
      } catch (error) {
        return ApiHandler.handleError(error);
      }
   ```

## 🟡 MANDATORY - Always Follow

1. **ALWAYS use ApiHandler.handleError() in Server Actions**
   - Provides consistent response format
   - Automatically logs with LoggingService
   - Sanitizes errors for user display

2. **ALWAYS provide context with errors** (fileName, functionName, relevant data)
   ```typescript
   throw new ServerActionError('Operation failed', {
     fileName: 'payment-actions.ts',
     functionName: 'processPayment',
     context: { paymentId, amount, userId }
   });
   ```

3. **ALWAYS use error hierarchy**: `ServerActionError` > `ServiceError`
   - Server Actions throw `ServerActionError`
   - Services throw `ServiceError`
   - Libraries throw base `Error` (wrapped by ApiHandler)

4. **ALWAYS handle errors with toast notifications on client**
   ```typescript
   const result = await createTrip(formData);
   if (!result.success) {
     toast.error(result.error); // Show user-friendly message
     return;
   }
   ```

5. **ALWAYS use try-catch in Server Actions**
   - Wrap entire function body
   - Catch all errors and use ApiHandler
   - Return consistent response structure

## ✅ Quick Pattern: Error Handling in Server Actions

```typescript
'use server';

import { requireAuthentication } from '@/utils/helpers/auth-helper';
import { ApiHandler } from '@/lib/exceptions/api-handler';
import { ServerActionError } from '@/lib/exceptions/exceptions';
import { tripSchema } from '@/schemas/trip-schema';

export async function createTrip(formData: FormData) {
  try {
    // 1. Authentication
    const session = await requireAuthentication();

    // 2. Validation (can throw ZodError)
    const validated = tripSchema.parse({
      origin: formData.get('origin'),
      destination: formData.get('destination')
    });

    // 3. Business logic (can throw various errors)
    const trip = await prisma.trip.create({
      data: {
        ...validated,
        driverId: session.user.id
      }
    });

    // 4. Success response
    return ApiHandler.success(trip);

  } catch (error) {
    // ApiHandler automatically:
    // - Determines error type (Zod, Prisma, custom, unknown)
    // - Logs with LoggingService
    // - Returns sanitized user-facing message
    return ApiHandler.handleError(error, {
      fileName: 'trip-actions.ts',
      functionName: 'createTrip'
    });
  }
}
```

## ✅ Quick Pattern: Error Handling in Services

```typescript
import { ServiceError } from '@/lib/exceptions/exceptions';

export class TripService {
  static async validateTripAvailability(tripId: string) {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId }
    });

    if (!trip) {
      throw new ServiceError('Trip not found', {
        fileName: 'trip-service.ts',
        functionName: 'validateTripAvailability',
        context: { tripId }
      });
    }

    if (trip.status !== 'PENDING') {
      throw new ServiceError('Trip is not available', {
        fileName: 'trip-service.ts',
        functionName: 'validateTripAvailability',
        context: { tripId, status: trip.status }
      });
    }

    return trip;
  }
}
```

## 🔗 Detailed Documentation

For complete error handling implementation guides, see:
- [server-actions.md](../../docs/agent/patterns/server-actions.md#error-handling) - Server Action error patterns
- [code-quality.md](../../docs/agent/standards/code-quality.md) - Error handling best practices

## ❌ Common Error Handling Mistakes

- **Mistake**: Not using ApiHandler.handleError()
  - **Impact**: Inconsistent error responses, missing logs, exposed internals
  - **Fix**: Always return `ApiHandler.handleError(error)` in catch blocks

- **Mistake**: Throwing generic Error without context
  - **Impact**: Hard to debug, no context in logs
  - **Fix**: Use `ServerActionError` or `ServiceError` with fileName/functionName

- **Mistake**: Console.log errors instead of using LoggingService
  - **Impact**: Logs not persisted, hard to track in production
  - **Fix**: Let ApiHandler.handleError() handle logging automatically

- **Mistake**: Catching errors but not returning error response
  - **Impact**: Client thinks operation succeeded when it failed
  - **Fix**: Always return ApiHandler result to client

- **Mistake**: Mixing error types (using ServiceError in Server Actions)
  - **Impact**: Confusing error hierarchy, unclear responsibility
  - **Fix**: ServerActionError in actions/, ServiceError in services/

## 📊 Error Hierarchy

```
Error (base class)
  │
  ├─ ZodError (validation errors)
  │   └─ Handled by ApiHandler → returns validation error response
  │
  ├─ PrismaClientKnownRequestError (database errors)
  │   └─ Handled by ApiHandler → returns database error response
  │
  ├─ AppError (our custom base)
  │   ├─ ServerActionError (use in src/actions/)
  │   │   └─ Context: { fileName, functionName, userId?, context? }
  │   │
  │   ├─ ServiceError (use in src/services/)
  │   │   └─ Context: { fileName, functionName, context? }
  │   │
  │   ├─ UnauthorizedError (401)
  │   ├─ ForbiddenError (403)
  │   ├─ NotFoundError (404)
  │   └─ ValidationError (400)
  │
  └─ Unknown errors
      └─ Handled by ApiHandler → generic error response
```

## 📋 Error Handling Checklist

Before marking error-prone work complete:

- [ ] All Server Actions use try-catch with ApiHandler.handleError()
- [ ] Errors include context (fileName, functionName)
- [ ] Correct error class used (ServerActionError vs ServiceError)
- [ ] Client displays errors with toast notifications
- [ ] No raw console.error() or console.log() for errors
- [ ] Validation errors use Zod (not manual checks)
- [ ] Database errors caught and handled appropriately
- [ ] No sensitive data in error messages sent to client
- [ ] Error responses follow ApiHandler.error() format
