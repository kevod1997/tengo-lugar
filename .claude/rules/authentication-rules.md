---
paths: "{src/middleware.ts,src/app/**/layout.tsx,src/utils/helpers/auth-helper.ts}"
---

# Authentication Rules

## 🎯 Applies To

- `src/middleware.ts` - Route protection middleware
- `src/app/**/layout.tsx` - Layout-level authentication
- `src/utils/helpers/auth-helper.ts` - Auth helper functions
- Any code handling authentication/authorization

## 🔴 CRITICAL - Never Violate

1. **NEVER manually parse cookies** - Always use `betterFetch` or `auth.api` helpers
   ```typescript
   ❌ const sessionCookie = cookies().get('better-auth.session_token');
   ✅ const session = await auth.api.getSession({ headers: await headers() });
   ```

2. **NEVER skip session validation in Server Actions** - Use `requireAuthentication()`
   ```typescript
   ❌ export async function deleteTrip(id: string) {
        await prisma.trip.delete({ where: { id } }); // No auth!
      }

   ✅ export async function deleteTrip(id: string) {
        const session = await requireAuthentication();
        // Now guaranteed to have session.user
      }
   ```

3. **NEVER trust client-side role checks** - Always validate on server
   ```typescript
   ❌ // Client component
   if (user.role === 'ADMIN') {
     return <AdminPanel />; // Can be bypassed!
   }

   ✅ // Server Action
   const session = await requireAuthorization({
     allowedRoles: ['ADMIN']
   });
   // Now guaranteed user has ADMIN role
   ```

4. **NEVER expose session tokens in client components** - Keep server-side only
   ```typescript
   ❌ 'use client';
   export function Profile() {
     const session = auth.useSession(); // Exposes token!
   }

   ✅ // Get session server-side, pass safe data to client
   export default async function ProfilePage() {
     const session = await auth.api.getSession({ headers: await headers() });
     return <ProfileClient user={session?.user} />;
   }
   ```

5. **NEVER create custom session management** - Use better-auth exclusively
   ```typescript
   ❌ const sessionStore = create((set) => ({
        user: null,
        login: (user) => set({ user })
      }));

   ✅ // Use better-auth server-side session
   const session = await auth.api.getSession({ headers: await headers() });
   ```

## 🟡 MANDATORY - Always Follow

1. **ALWAYS use `requireAuthentication()` as first line in Server Actions**
   ```typescript
   'use server';

   export async function protectedAction() {
     const session = await requireAuthentication();
     // session.user guaranteed to exist
   }
   ```

2. **ALWAYS use `requireAuthorization()` for role-based access**
   ```typescript
   // Single role
   const session = await requireAuthorization({
     allowedRoles: ['ADMIN']
   });

   // Multiple roles
   const session = await requireAuthorization({
     allowedRoles: ['ADMIN', 'MODERATOR']
   });
   ```

3. **ALWAYS check resource ownership** before modifications
   ```typescript
   const session = await requireAuthentication();
   const trip = await prisma.trip.findUnique({ where: { id } });

   if (trip.driverId !== session.user.id) {
     return ApiHandler.forbidden('You can only modify your own trips');
   }
   ```

4. **ALWAYS use betterFetch for API calls** requiring authentication
   ```typescript
   import { betterFetch } from '@better-fetch/fetch';

   const { data, error } = await betterFetch('/api/auth/get-session', {
     baseURL: process.env.BETTER_AUTH_URL,
     headers: await headers()
   });
   ```

5. **ALWAYS protect routes with middleware** for page-level protection
   ```typescript
   // src/middleware.ts
   export default auth.Middleware({
     matcher: ['/dashboard/:path*', '/admin/:path*']
   });
   ```

## ✅ Quick Pattern: requireAuthentication Helper

```typescript
// src/utils/helpers/auth-helper.ts
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { UnauthorizedError } from '@/lib/exceptions/exceptions';

export async function requireAuthentication() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    throw new UnauthorizedError('Authentication required');
  }

  return session;
}
```

## ✅ Quick Pattern: requireAuthorization Helper

```typescript
import { ForbiddenError } from '@/lib/exceptions/exceptions';

interface AuthorizationOptions {
  allowedRoles: string[];
}

export async function requireAuthorization(options: AuthorizationOptions) {
  const session = await requireAuthentication();

  if (!options.allowedRoles.includes(session.user.role)) {
    throw new ForbiddenError(
      `Access denied. Required roles: ${options.allowedRoles.join(', ')}`
    );
  }

  return session;
}
```

## ✅ Quick Pattern: Protected Server Action

```typescript
'use server';

import { requireAuthentication, requireAuthorization } from '@/utils/helpers/auth-helper';

// Basic authentication
export async function updateProfile(formData: FormData) {
  const session = await requireAuthentication();
  // session.user exists and is authenticated
}

// Role-based authorization
export async function deleteUser(userId: string) {
  const session = await requireAuthorization({
    allowedRoles: ['ADMIN']
  });
  // session.user is guaranteed to be ADMIN
}

// Owner-or-admin authorization
export async function updateTrip(tripId: string, data: UpdateTripData) {
  const session = await requireAuthentication();

  const trip = await prisma.trip.findUnique({ where: { id: tripId } });

  const isOwner = trip.driverId === session.user.id;
  const isAdmin = session.user.role === 'ADMIN';

  if (!isOwner && !isAdmin) {
    return ApiHandler.forbidden('Not authorized to modify this trip');
  }

  // Proceed with update
}
```

## ✅ Quick Pattern: Middleware Protection

```typescript
// src/middleware.ts
import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';

export const auth = betterAuth({
  // ... auth config
});

// Protect routes
export default auth.Middleware({
  // Require auth for these routes
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/trips/create',
    '/profile/:path*'
  ]
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
```

## 🔗 Detailed Documentation

For complete authentication patterns, see:
- [authentication.md](../../docs/agent/patterns/authentication.md) - Comprehensive auth guide
- [server-actions.md](../../docs/agent/patterns/server-actions.md) - Server Action auth integration

## ❌ Common Authentication Mistakes

- **Mistake**: Skipping `requireAuthentication()` in Server Actions
  - **Why**: Allows unauthenticated access to protected operations
  - **Fix**: ALWAYS call as first line

- **Mistake**: Using client-side role checks for protection
  - **Why**: Can be easily bypassed by users
  - **Fix**: Validate roles server-side with `requireAuthorization()`

- **Mistake**: Manually parsing cookies
  - **Why**: Prone to errors, security issues, breaks with better-auth updates
  - **Fix**: Use `betterFetch` or `auth.api` helpers

- **Mistake**: Not checking resource ownership
  - **Why**: Users can modify other users' data
  - **Fix**: Always verify `resource.ownerId === session.user.id`

- **Mistake**: Storing auth state in Zustand/client state
  - **Why**: Auth is server-side only, can't be trusted
  - **Fix**: Get session from server on each request

## 📊 Auth Flow Decision Tree

```
Need to protect an operation?

├─ Page-level protection?
│  └─ Use Middleware matcher ✅
│      (Redirects to login if not authenticated)
│
├─ Server Action?
│  ├─ Just need authentication?
│  │  └─ requireAuthentication() ✅
│  │
│  ├─ Need specific role?
│  │  └─ requireAuthorization({ allowedRoles: ['ADMIN'] }) ✅
│  │
│  └─ Need resource ownership check?
│      └─ requireAuthentication() + manual ownership check ✅
│
└─ API Route?
    └─ auth.api.getSession({ headers: await headers() }) ✅
```

## 📋 Authentication Checklist

Before marking auth-related work complete:

- [ ] All Server Actions call `requireAuthentication()` or `requireAuthorization()`
- [ ] No manual cookie parsing (using betterFetch/auth.api)
- [ ] Resource ownership verified before modifications
- [ ] Role checks done server-side (not client-side)
- [ ] Protected routes added to middleware matcher
- [ ] No session tokens exposed to client
- [ ] UnauthorizedError/ForbiddenError used for auth failures
- [ ] Session validation happens on every protected request
- [ ] No custom session management (using better-auth only)
- [ ] Auth errors handled gracefully with user-friendly messages
