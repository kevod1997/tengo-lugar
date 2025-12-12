---
paths: src/actions/**/*.ts
---

# Server Actions Rules

## 🎯 Applies To

All files in `src/actions/` - TypeScript Server Actions using Next.js 15 App Router.

## 🔴 CRITICAL - Never Violate

1. **NEVER skip authentication** - First line must be `await requireAuthentication()`
   ```typescript
   ❌ export async function updateProfile(formData: FormData) {
        const data = formData.get('name'); // No auth check!
      }
   ✅ export async function updateProfile(formData: FormData) {
        const session = await requireAuthentication();
        // Now guaranteed session.user exists
      }
   ```

2. **NEVER skip input validation** - All inputs must be validated with Zod
   ```typescript
   ❌ const name = formData.get('name') as string;
   ✅ const validated = profileSchema.parse({
        name: formData.get('name')
      });
   ```

3. **NEVER forget 'use server'** directive - Required for Server Actions
   ```typescript
   ✅ 'use server'; // MUST be first line of file

   export async function myAction() { ... }
   ```

4. **NEVER return different response formats** - Always use ApiHandler
   ```typescript
   ❌ return { ok: true, data: result }
   ❌ return { success: true, payload: result }
   ✅ return ApiHandler.success(result)
   ```

5. **NEVER forget cache invalidation** after mutations
   ```typescript
   await prisma.trip.update({ ... });
   revalidatePath('/trips'); // ✅ Invalidate cache
   ```

## 🟡 MANDATORY - Always Follow Template

**All Server Actions MUST follow this exact pattern**:

```typescript
'use server';

import { requireAuthentication } from '@/utils/helpers/auth-helper';
import { ApiHandler } from '@/lib/exceptions/api-handler';
import { mySchema } from '@/schemas/my-schema';
import { revalidatePath } from 'next/cache';

export async function myAction(formData: FormData) {
  try {
    // Step 1: AUTHENTICATION (MANDATORY)
    const session = await requireAuthentication();

    // Step 2: VALIDATION (MANDATORY)
    const validated = mySchema.parse({
      field: formData.get('field')
    });

    // Step 3: AUTHORIZATION (if needed)
    const resource = await prisma.resource.findUnique({
      where: { id: validated.resourceId }
    });

    if (resource.ownerId !== session.user.id) {
      return ApiHandler.forbidden('Not authorized');
    }

    // Step 4: DATABASE OPERATION (use transaction if multiple ops)
    const result = await prisma.resource.update({
      where: { id: validated.resourceId },
      data: validated,
      select: {
        id: true,
        name: true,
        updatedAt: true
      }
    });

    // Step 5: CACHE INVALIDATION (after mutations)
    revalidatePath('/resources');

    // Step 6: SUCCESS RESPONSE
    return ApiHandler.success(result);

  } catch (error) {
    // Step 7: ERROR HANDLING (MANDATORY)
    return ApiHandler.handleError(error, {
      fileName: 'resource-actions.ts',
      functionName: 'myAction'
    });
  }
}
```

## 🎯 Authorization Patterns

### Owner-Only Access
```typescript
const trip = await prisma.trip.findUnique({ where: { id } });

if (trip.driverId !== session.user.id) {
  return ApiHandler.forbidden('You can only modify your own trips');
}
```

### Admin-or-Owner Access
```typescript
const isOwner = resource.ownerId === session.user.id;
const isAdmin = session.user.role === 'ADMIN';

if (!isOwner && !isAdmin) {
  return ApiHandler.forbidden('Not authorized');
}
```

### Role-Based Access
```typescript
const session = await requireAuthorization({
  allowedRoles: ['ADMIN', 'MODERATOR']
});
```

## 🔄 Cache Invalidation Rules

**ALWAYS invalidate after mutations**:

```typescript
// After CREATE
await prisma.trip.create({ ... });
revalidatePath('/trips'); // List page
revalidatePath(`/trips/${trip.id}`); // Detail page

// After UPDATE
await prisma.trip.update({ ... });
revalidatePath('/trips');
revalidatePath(`/trips/${id}`);

// After DELETE
await prisma.trip.delete({ ... });
revalidatePath('/trips');

// After BULK operations
await prisma.trip.updateMany({ ... });
revalidatePath('/trips'); // Invalidate entire list
```

## 🔗 Detailed Documentation

For complete Server Actions implementation, see:
- [server-actions.md](../../docs/agent/patterns/server-actions.md) - Complete templates and patterns
- [authentication.md](../../docs/agent/patterns/authentication.md) - Authentication patterns
- [database-patterns.md](../../docs/agent/patterns/database-patterns.md) - Database operation patterns

## ❌ Common Mistakes

- **Mistake**: Not calling `requireAuthentication()` first
  - **Fix**: ALWAYS first line after 'use server' and imports

- **Mistake**: Using `any` type for formData fields
  - **Fix**: Parse with Zod schema for type safety

- **Mistake**: Forgetting `revalidatePath()` after mutations
  - **Fix**: Always invalidate affected paths

- **Mistake**: Not using transactions for related operations
  - **Fix**: Use `prisma.$transaction()` for operations that must succeed together

- **Mistake**: Returning raw Prisma errors to client
  - **Fix**: Always use `ApiHandler.handleError()`

## 📋 Server Action Checklist

Before marking Server Action complete:

- [ ] File starts with `'use server'` directive
- [ ] First operation is `await requireAuthentication()`
- [ ] All inputs validated with Zod schema
- [ ] Authorization checked if resource-specific
- [ ] Prisma queries use specific `select`
- [ ] Transactions used for multi-step operations
- [ ] Cache invalidated with `revalidatePath()` after mutations
- [ ] Success returns `ApiHandler.success()`
- [ ] Errors caught and return `ApiHandler.handleError()`
- [ ] Context provided (fileName, functionName) in error handling
