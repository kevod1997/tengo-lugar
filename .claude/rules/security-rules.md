---
# Global security rules - apply to all files
---

# Security Rules

## 🎯 Applies To

All code in the Tengo Lugar project - these are universal security requirements.

## 🔴 CRITICAL - Never Violate

1. **NEVER manually parse cookies** - Always use `betterFetch` from better-auth
   ```typescript
   ❌ const token = req.cookies.get('session')
   ✅ const { data } = await betterFetch('/api/auth/get-session', { ... })
   ```

2. **NEVER expose sensitive data in JWT payloads** - JWTs are base64-encoded, not encrypted
   - Don't include: passwords, payment info, SSN, full credit cards
   - Only include: user ID, roles, non-sensitive identifiers

3. **NEVER skip input validation** - All user inputs MUST be validated with Zod
   ```typescript
   ❌ const name = formData.get('name') // No validation
   ✅ const validated = schema.parse({ name: formData.get('name') })
   ```

4. **NEVER trust client-side data** - Always re-validate on the server
   - Client can modify ANY data sent from frontend
   - Validation must happen in Server Actions, not just React components

5. **NEVER use string concatenation for queries** - Prisma prevents SQL injection, but avoid raw queries
   ```typescript
   ❌ prisma.$queryRaw(`SELECT * FROM users WHERE id = ${userId}`)
   ✅ prisma.user.findUnique({ where: { id: userId } })
   ```

## 🟡 MANDATORY - Always Follow

1. **ALWAYS validate sessions in Server Actions** using `requireAuthentication()`
   ```typescript
   export async function myAction() {
     const session = await requireAuthentication();
     // session.user is now guaranteed to exist
   }
   ```

2. **ALWAYS use centralized authorization helpers** from `auth-helper.ts`
   ```typescript
   import { requireAuthorization } from '@/utils/helpers/auth-helper';

   const session = await requireAuthorization({ allowedRoles: ['admin'] });
   ```

3. **ALWAYS sanitize user-generated content** before displaying
   - Use React's built-in XSS protection (JSX escaping)
   - For HTML content: use a library like DOMPurify
   - For URLs: validate against whitelist

4. **ALWAYS use HTTPS in production** - better-auth requires secure cookies
   - `BETTER_AUTH_URL` must start with `https://` in production
   - Development can use `http://localhost`

5. **ALWAYS check authorization** before data operations
   ```typescript
   // Check user owns the resource
   const trip = await prisma.trip.findUnique({ where: { id } });
   if (trip.userId !== session.user.id) {
     throw new ForbiddenError('Not authorized');
   }
   ```

## ✅ Quick Pattern: Secure Server Action

```typescript
'use server';

import { requireAuthentication } from '@/utils/helpers/auth-helper';
import { mySchema } from '@/schemas/my-schema';
import { ApiHandler } from '@/lib/exceptions/api-handler';

export async function secureAction(formData: FormData) {
  try {
    // 1. ALWAYS authenticate first
    const session = await requireAuthentication();

    // 2. ALWAYS validate input
    const validated = mySchema.parse({
      field: formData.get('field')
    });

    // 3. Check authorization if needed
    const resource = await prisma.resource.findUnique({
      where: { id: validated.resourceId }
    });

    if (resource.ownerId !== session.user.id) {
      return ApiHandler.forbidden('Not authorized');
    }

    // 4. Perform operation
    const result = await prisma.resource.update({
      where: { id: validated.resourceId },
      data: validated
    });

    return ApiHandler.success(result);
  } catch (error) {
    return ApiHandler.handleError(error);
  }
}
```

## 🔗 Detailed Documentation

For complete security implementation guides, see:
- [authentication.md](../../docs/agent/patterns/authentication.md) - Auth patterns and session management
- [server-actions.md](../../docs/agent/patterns/server-actions.md) - Secure Server Action implementation
- [database-patterns.md](../../docs/agent/patterns/database-patterns.md) - Safe database operations

## ❌ Common Security Mistakes

- **Mistake**: Skipping authentication checks in Server Actions
  - **Why it's bad**: Anyone can call the action directly
  - **Fix**: Add `await requireAuthentication()` as first line

- **Mistake**: Validating only on the client side
  - **Why it's bad**: Users can bypass client validation
  - **Fix**: Always validate with Zod in Server Actions

- **Mistake**: Exposing internal IDs without authorization checks
  - **Why it's bad**: Users can access other users' data
  - **Fix**: Always verify ownership before returning data

- **Mistake**: Using cookies directly in Server Components
  - **Why it's bad**: Can cause security and hydration issues
  - **Fix**: Use `betterFetch` or `auth.api.getSession()` helpers

## 📋 Security Checklist

Before marking security-sensitive work complete:

- [ ] All Server Actions call `requireAuthentication()` first
- [ ] All user inputs validated with Zod schemas
- [ ] Authorization checks verify resource ownership
- [ ] No sensitive data in JWT payloads or client state
- [ ] Cookies handled via betterFetch, never manually parsed
- [ ] SQL injection prevented (using Prisma, no raw queries)
- [ ] XSS prevented (React JSX escaping, DOMPurify for HTML)
- [ ] HTTPS enforced in production (`BETTER_AUTH_URL`)
