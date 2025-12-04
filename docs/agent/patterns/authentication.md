# Authentication Patterns

## Overview
Authentication in Tengo Lugar uses **better-auth 1.2.5** with role-based authorization system (admin/user).

---

## Authentication Helpers (CRITICAL)

**Location**: [src/utils/helpers/auth-helper.ts](../../../src/utils/helpers/auth-helper.ts)

### Basic Authentication Check
Use this when you need to verify the user is authenticated, regardless of role:

```typescript
import { requireAuthentication } from '@/utils/helpers/auth-helper';

const session = await requireAuthentication('filename.ts', 'functionName');
// session.user.id, session.user.email, session.user.role available
```

### Role-Specific Authorization
Use this when you need to verify the user has a specific role:

```typescript
import { requireAuthorization } from '@/utils/helpers/auth-helper';

// Single role check
const session = await requireAuthorization('admin', 'filename.ts', 'functionName');
```

### Multi-Role Authorization
Use this when multiple roles should have access:

```typescript
import { requireAuthorizationMultiRole } from '@/utils/helpers/auth-helper';

// Multiple roles check
const session = await requireAuthorizationMultiRole(
  ['admin', 'user'],
  'filename.ts',
  'functionName'
);
```

---

## Middleware Pattern

**Location**: [src/middleware.ts](../../../src/middleware.ts)

In middleware, always use `betterFetch` for real session validation:

```typescript
import { betterFetch } from "@better-auth/fetch";
import type { Session } from "better-auth/types";

// In middleware - NEVER manually parse cookies
const { data: session } = await betterFetch<Session>("/api/auth/get-session", {
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  headers: { cookie: request.headers.get("cookie") || "" },
});

if (!session) {
  return NextResponse.redirect(new URL('/login', request.url));
}
```

---

## Server Actions Authentication

**MANDATORY**: Every Server Action MUST include authentication check as first step.

```typescript
'use server'

import { requireAuthentication } from "@/utils/helpers/auth-helper";

export async function myServerAction(data: any) {
  try {
    // 1. Authentication ALWAYS FIRST
    const session = await requireAuthentication('filename.ts', 'myServerAction');

    // 2. Now you can safely use session.user.id
    const userId = session.user.id;

    // ... rest of logic
  } catch (error) {
    return ApiHandler.handleError(error);
  }
}
```

---

## Route Protection Patterns

### Protected Routes
Files in `src/app/(authenticated)/*` are automatically protected by middleware.

### Admin-Only Routes
Files in `src/app/(admin)/*` require admin role:

```typescript
// In page.tsx or server action
const session = await requireAuthorization('admin', 'filename.ts', 'functionName');
```

### Public Routes
Files in `src/app/(public)/*` and `src/app/(unauthenticated)/*` don't require authentication.

---

## Session Data Structure

```typescript
interface Session {
  user: {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'user';
    image?: string;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  session: {
    id: string;
    expiresAt: Date;
    token: string;
  };
}
```

---

## Common Patterns

### Check if User is Driver/Passenger

```typescript
const session = await requireAuthentication('filename.ts', 'functionName');

const user = await prisma.user.findUnique({
  where: { id: session.user.id },
  select: {
    driver: { select: { id: true } },
    passenger: { select: { id: true } }
  }
});

const isDriver = !!user?.driver;
const isPassenger = !!user?.passenger;
```

### Get Current User with Relations

```typescript
const session = await requireAuthentication('filename.ts', 'functionName');

const currentUser = await prisma.user.findUnique({
  where: { id: session.user.id },
  include: {
    driver: true,
    passenger: true,
    identityCard: true,
    licence: true
  }
});
```

**For more database query patterns**, see [database-patterns.md](../patterns/database-patterns.md):
- Efficient query optimization with `select`
- N+1 query prevention
- Pagination patterns
- Complex aggregations

---

## Security Rules

1. **NEVER** manually parse cookies - use `betterFetch`
2. **ALWAYS** validate session in Server Actions using auth helpers
3. **ALWAYS** use centralized authorization helpers
4. **NEVER** trust client-side data about user identity
5. **NEVER** expose sensitive data in JWT payload beyond necessary

---

## Error Handling

Authentication failures throw `ServerActionError.AuthenticationFailed`:

```typescript
import { ServerActionError } from "@/lib/exceptions/server-action-error";

// If user not authenticated
throw ServerActionError.AuthenticationFailed('filename.ts', 'functionName');

// If user lacks required role
throw ServerActionError.AuthorizationFailed('filename.ts', 'functionName');
```

These are automatically handled by `ApiHandler.handleError()`.

---

## External Service Authentication

For external services (chat, WebSocket), use JWT tokens:

**Token Generation Endpoint**: [src/app/api/auth/token/route.ts](../../../src/app/api/auth/token/route.ts)

```typescript
// Generate JWT for external service
const response = await fetch('/api/auth/token', {
  headers: { cookie: cookies().toString() }
});
const { token } = await response.json();
```

See [features/realtime-chat.md](../features/realtime-chat.md) for details.

---

## Related Documentation

- [Server Actions Pattern](server-actions.md) - Complete Server Action implementation
- [Real-time Chat](../features/realtime-chat.md) - JWT token usage
- [WebSocket Notifications](../features/websocket-notifications.md) - Token caching
