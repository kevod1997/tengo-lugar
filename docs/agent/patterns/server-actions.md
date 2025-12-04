# Server Actions Pattern

## Overview
Server Actions in Tengo Lugar follow a strict pattern for consistency, security, and error handling.

**Location**: All Server Actions are organized by domain in [src/actions/](../../../src/actions/)

---

## MANDATORY Template

**Every Server Action MUST follow this template:**

```typescript
'use server'

import { requireAuthentication } from "@/utils/helpers/auth-helper";
import { ServerActionError } from "@/lib/exceptions/server-action-error";
import { ApiHandler } from "@/lib/api-handler";
import { logActionWithErrorHandling } from "@/services/logging/logging-service";
import { TipoAccionUsuario } from "@/types/actions-logs";
import prisma from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  // Schema definition here
});

export async function myServerAction(data: any) {
  try {
    // 1. Authentication ALWAYS REQUIRED
    const session = await requireAuthentication('filename.ts', 'myServerAction');

    // 2. Validation with Zod
    const validatedData = schema.parse(data);

    // 3. Business logic with Prisma transactions
    const result = await prisma.$transaction(async (tx) => {
      // Database operations here
      return result;
    });

    // 4. Success logging
    await logActionWithErrorHandling({
      userId: session.user.id,
      action: TipoAccionUsuario.ACCION_ESPECIFICA,
      status: 'SUCCESS',
    }, { fileName: 'filename.ts', functionName: 'myServerAction' });

    // 5. Structured response
    return ApiHandler.handleSuccess(result, 'Success message');

  } catch (error) {
    return ApiHandler.handleError(error);
  }
}
```

---

## Step-by-Step Breakdown

### Step 1: Authentication (MANDATORY)

**ALWAYS** authenticate first. No exceptions.

```typescript
const session = await requireAuthentication('filename.ts', 'myServerAction');
```

For admin-only actions:
```typescript
const session = await requireAuthorization('admin', 'filename.ts', 'myServerAction');
```

### Step 2: Input Validation (MANDATORY)

**ALWAYS** validate with Zod schemas from [src/schemas/](../../../src/schemas/):

```typescript
import { mySchema } from "@/schemas/validation/my-schema";

const validatedData = mySchema.parse(data);
```

Validation errors are automatically caught and formatted by `ApiHandler.handleError()`.

### Step 3: Business Logic

Use Prisma transactions for complex operations:

```typescript
const result = await prisma.$transaction(async (tx) => {
  const entity = await tx.entity.create({ data: validatedData });

  // Update related entities
  await tx.relatedEntity.update({
    where: { id: entity.relatedId },
    data: { status: 'updated' }
  });

  return entity;
});
```

See [database-patterns.md](database-patterns.md) for optimization patterns.

### Step 4: Success Logging

Log successful actions for audit trail:

```typescript
await logActionWithErrorHandling({
  userId: session.user.id,
  action: TipoAccionUsuario.CREATE_TRIP, // Use appropriate enum
  status: 'SUCCESS',
  metadata: { tripId: result.id } // Optional context
}, { fileName: 'create-trip.ts', functionName: 'createTrip' });
```

**Available Action Types**: See [src/types/actions-logs.ts](../../../src/types/actions-logs.ts)

### Step 5: Structured Response

Always use `ApiHandler` for consistent responses:

```typescript
// Success
return ApiHandler.handleSuccess(result, 'Trip created successfully');

// Error (in catch block)
return ApiHandler.handleError(error);
```

---

## Response Format

All Server Actions return `ApiResponse<T>`:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  message?: string;
}
```

**Client-side handling:**

```typescript
const result = await createTrip(tripData);

if (result.success) {
  toast.success(result.message);
  // Use result.data
} else {
  toast.error(result.error?.message || 'Error occurred');
}
```

---

## Organization by Domain

Server Actions are organized in [src/actions/](../../../src/actions/) by domain:

```
src/actions/
├── car/              # Vehicle management
├── trip/             # Trip management
├── user/             # User management
├── register/         # Registration flow
├── driver/           # Driver-specific actions
├── chat/             # Chat functionality
├── websocket/        # WebSocket token management
├── logs/             # Logging actions
├── notifications/    # Notification actions
└── admin/            # Administrative functions
```

**Naming Convention**: `{verb}{Noun}.ts`
- Examples: `createTrip.ts`, `updateUser.ts`, `deleteVehicle.ts`

---

## Error Handling Patterns

### Throwing Custom Errors

```typescript
import { ServerActionError } from "@/lib/exceptions/server-action-error";

// Authentication failure
throw ServerActionError.AuthenticationFailed('filename.ts', 'functionName');

// Authorization failure (lacks role)
throw ServerActionError.AuthorizationFailed('filename.ts', 'functionName');

// Validation failure
throw ServerActionError.ValidationFailed('filename.ts', 'functionName', 'Invalid email format');

// Database error
throw ServerActionError.DatabaseError('filename.ts', 'functionName', 'Unique constraint violation');

// Not found
throw ServerActionError.NotFound('filename.ts', 'functionName', 'Trip not found');
```

### Error Handling with ApiHandler

```typescript
try {
  // Server Action logic
} catch (error) {
  // ApiHandler automatically:
  // 1. Logs error to ErrorLog table
  // 2. Formats error response
  // 3. Handles Zod, Prisma, and custom errors
  return ApiHandler.handleError(error);
}
```

---

## Advanced Patterns

### Background Job Triggering

For long-running operations, trigger Inngest jobs:

```typescript
import { inngest } from "@/lib/inngest";

// In Server Action
const result = await prisma.document.create({ data: documentData });

// Trigger background job
await inngest.send({
  name: "document-verification-email",
  data: {
    userId: session.user.id,
    email: session.user.email,
    documentId: result.id,
    type: "verification"
  }
});

return ApiHandler.handleSuccess(result, 'Document uploaded, verification email will be sent');
```

See [background-jobs.md](background-jobs.md) for details.

### File Upload Integration

```typescript
import { uploadToS3 } from "@/lib/file/s3-upload";

// Validate file
const validatedData = schema.parse(data);

// Upload to S3
const s3Result = await uploadToS3(
  validatedData.file,
  `documents/${session.user.id}`,
  'private'
);

// Save to database
const document = await prisma.document.create({
  data: {
    userId: session.user.id,
    s3Key: s3Result.key,
    s3Url: s3Result.url
  }
});
```

See [file-uploads.md](file-uploads.md) for details.

### Cache Invalidation

When updating data, invalidate relevant caches:

```typescript
import { redis } from "@/lib/redis/redis-service";

// After updating trip
await redis.del(`trip:${tripId}`);
```

**For complete cache invalidation strategies**, see [caching-patterns.md](caching-patterns.md#cache-invalidation):
- Pattern-based invalidation
- Tag-based invalidation
- Time-based expiration
- Conditional invalidation

---

## Authorization Patterns

### Owner-Only Access

```typescript
const session = await requireAuthentication('filename.ts', 'functionName');

const trip = await prisma.trip.findUnique({
  where: { id: tripId },
  select: { driver: { select: { userId: true } } }
});

if (trip.driver.userId !== session.user.id) {
  throw ServerActionError.AuthorizationFailed('filename.ts', 'functionName');
}
```

### Admin or Owner Access

```typescript
const session = await requireAuthentication('filename.ts', 'functionName');

const trip = await prisma.trip.findUnique({
  where: { id: tripId },
  select: { driver: { select: { userId: true } } }
});

const isOwner = trip.driver.userId === session.user.id;
const isAdmin = session.user.role === 'admin';

if (!isOwner && !isAdmin) {
  throw ServerActionError.AuthorizationFailed('filename.ts', 'functionName');
}
```

---

## Testing Server Actions

Use Prisma Studio to verify database changes:

```bash
npm run prisma:studio
```

Check action logs:
```typescript
// Query UserActionLog table
const logs = await prisma.userActionLog.findMany({
  where: { userId: session.user.id },
  orderBy: { timestamp: 'desc' },
  take: 10
});
```

---

## Common Mistakes to Avoid

1. ❌ **Skipping authentication**: Every Server Action needs auth
2. ❌ **Not validating input**: Always use Zod schemas
3. ❌ **Not using transactions**: Complex operations need transactions
4. ❌ **Inconsistent error handling**: Always use `ApiHandler.handleError()`
5. ❌ **Forgetting logging**: Successful actions should be logged
6. ❌ **Returning raw errors**: Never return raw error objects to client

---

## Related Documentation

- [Authentication Patterns](authentication.md) - Auth helpers reference
- [Database Patterns](database-patterns.md) - Prisma optimization
- [Error Handling](../reference/error-hierarchy.md) - Error types
- [Background Jobs](background-jobs.md) - Inngest integration
