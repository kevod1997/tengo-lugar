# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

**Tengo Lugar** is a comprehensive ride-sharing platform connecting drivers and passengers efficiently.

**Purpose:** Provide a secure, scalable, and user-friendly platform for ride sharing
**Focus:** Security, performance, and reliability

---

## Core Technology Philosophy

- **Framework**: Next.js 15 with App Router & Server Actions
- **Database**: PostgreSQL with Prisma ORM (type-safe operations)
- **Authentication**: better-auth 1.2.5 (session management)
- **Caching**: Redis (external APIs, pub/sub)
- **State**: React Query (server state) + Zustand (client state only)
- **Background Jobs**: Inngest (workflows & cron jobs)
- **Validation**: Zod (runtime type checking)

---

## MANDATORY Development Rules

### 🔒 Security Rules (CRITICAL)

1. **NEVER** manually parse cookies - use `betterFetch`
2. **ALWAYS** validate session in Server Actions using auth helpers
3. **ALWAYS** use centralized authorization helpers
4. **ALWAYS** sanitize/validate inputs with Zod
5. **NEVER** expose sensitive data in JWT payloads

### ⚡ Performance Rules (CRITICAL)

1. Use specific `select` in Prisma queries
2. Implement Redis cache for external APIs
3. Use React Query for client-side data fetching
4. Optimize images with Sharp before S3 upload
5. Use Prisma transactions for complex operations

### 🚨 Error Handling Rules (CRITICAL)

1. **ALWAYS** use `ApiHandler.handleError()` for consistency
2. **ALWAYS** log errors with LoggingService automatically
3. Use error hierarchy: `ServerActionError` > `ServiceError`
4. Handle errors with toast notifications on client
5. Provide context (fileName, functionName) for all errors

---

## Critical Architecture Patterns

### 1. Authentication Helpers (MANDATORY)

```typescript
import { requireAuthentication, requireAuthorization } from '@/utils/helpers/auth-helper';

// Basic authentication check
const session = await requireAuthentication('filename.ts', 'functionName');

// Role-specific authorization
const session = await requireAuthorization('admin', 'filename.ts', 'functionName');
```

**See**: [docs/agent/patterns/authentication.md](docs/agent/patterns/authentication.md)

### 2. Server Actions Pattern (MANDATORY TEMPLATE)

```typescript
'use server'
import { requireAuthentication } from "@/utils/helpers/auth-helper";
import { ApiHandler } from "@/lib/api-handler";
import { z } from "zod";
import prisma from "@/lib/prisma";

const schema = z.object({ /* ... */ });

export async function myServerAction(data: any) {
  try {
    // 1. Authentication ALWAYS REQUIRED
    const session = await requireAuthentication('filename.ts', 'myServerAction');

    // 2. Validation with Zod
    const validatedData = schema.parse(data);

    // 3. Business logic with Prisma transactions
    const result = await prisma.$transaction(async (tx) => {
      return result;
    });

    // 4. Structured response
    return ApiHandler.handleSuccess(result, 'Success message');
  } catch (error) {
    return ApiHandler.handleError(error);
  }
}
```

**See**: [docs/agent/patterns/server-actions.md](docs/agent/patterns/server-actions.md)

### 3. Error Handling Hierarchy

```typescript
// In Server Actions
throw ServerActionError.AuthenticationFailed('filename.ts', 'functionName');
throw ServerActionError.ValidationFailed('filename.ts', 'functionName', 'details');

// In Services
throw ServiceError.ExternalApiError('details', 'filename.ts', 'functionName');

// Handling
return ApiHandler.handleError(error); // Auto-logs and consistent response
```

---

## Project Structure

```
/src/
├── actions/              # Server Actions by domain (car, trip, user, admin)
├── app/                  # Next.js App Router
│   ├── (authenticated)/  # Protected routes
│   ├── (admin)/          # Admin-only routes
│   └── api/              # API Routes
├── components/ui/        # shadcn/ui components
├── hooks/                # Custom React hooks
├── lib/                  # Core configs (auth, prisma, redis, exceptions)
├── schemas/              # Zod validation schemas
├── services/             # Business logic layer
├── store/                # Zustand stores
├── types/                # TypeScript types
└── utils/                # Helper functions
```

---

## Development Commands

```bash
npm run dev              # Development server
npm run build            # Production build
npm run lint             # ESLint

npm run prisma:generate  # Generate Prisma client
npm run prisma:studio    # Database GUI
```

**See**: [docs/agent/reference/commands.md](docs/agent/reference/commands.md)

---

## Key Implementation Principles

1. **Authentication**: Always use auth helpers before data operations
2. **Validation**: All inputs validated with Zod schemas
3. **Transactions**: Complex DB operations in Prisma transactions
4. **Caching**: External API calls cached in Redis
5. **State**: React Query for server state, NOT Zustand
6. **Types**: TypeScript strict mode - no `any` types
7. **Errors**: Consistent error handling with ApiHandler
8. **Background Jobs**: Inngest for async operations
9. **Notifications**: `sendSystemNotification` for Inngest context (no session required)
10. **Email Deliverability**: 45s delays between emails in Inngest to avoid spam

---

## Additional Documentation

Before implementing specific features, refer to detailed documentation in [docs/agent/](docs/agent/):

### Implementation Patterns (`/docs/agent/patterns/`)

When working on these specific features, read the relevant pattern documentation:

- **[authentication.md](docs/agent/patterns/authentication.md)** - Auth helpers, middleware, session management
- **[server-actions.md](docs/agent/patterns/server-actions.md)** - Complete Server Action pattern with logging
- **[database-patterns.md](docs/agent/patterns/database-patterns.md)** - Prisma optimization, transactions, N+1 prevention
- **[caching-patterns.md](docs/agent/patterns/caching-patterns.md)** - Redis patterns, TTL strategies, cache invalidation
- **[data-fetching.md](docs/agent/patterns/data-fetching.md)** - React Query patterns, mutations, invalidation
- **[state-management.md](docs/agent/patterns/state-management.md)** - Zustand patterns (client state only)
- **[file-uploads.md](docs/agent/patterns/file-uploads.md)** - S3, Sharp image processing, Dropzone
- **[background-jobs.md](docs/agent/patterns/background-jobs.md)** - Inngest patterns, workflows
- **[notifications.md](docs/agent/patterns/notifications.md)** - System notifications, WebSocket integration

### Feature Architecture (`/docs/agent/features/`)

When working on real-time features:

- **[realtime-chat.md](docs/agent/features/realtime-chat.md)** - Chat integration, JWT tokens
- **[websocket-notifications.md](docs/agent/features/websocket-notifications.md)** - WebSocket service, token caching

### Reference Material (`/docs/agent/reference/`)

For configuration and technical reference:

- **[tech-stack.md](docs/agent/reference/tech-stack.md)** - Complete technology stack with versions
- **[commands.md](docs/agent/reference/commands.md)** - All development commands
- **[environment-vars.md](docs/agent/reference/environment-vars.md)** - Environment variable reference
- **[database-schema.md](docs/agent/reference/database-schema.md)** - Database relationships overview

### Operations (`/docs/agent/operations/`)

For debugging and troubleshooting:

- **[troubleshooting.md](docs/agent/operations/troubleshooting.md)** - Common issues and solutions
- **[monitoring.md](docs/agent/operations/monitoring.md)** - Debugging tools and dashboards

### Code Standards (`/docs/agent/standards/`)

For code quality and consistency:

- **[code-quality.md](docs/agent/standards/code-quality.md)** - TypeScript config, naming conventions
- **[import-organization.md](docs/agent/standards/import-organization.md)** - Import ordering rules

---

## How to Use This Documentation

This CLAUDE.md contains MANDATORY rules and universal patterns that apply to all tasks.

For specific implementation details:

1. **Read the relevant docs** before implementing features
2. **Don't memorize** - reference documentation as needed
3. **Follow the patterns** shown in linked files
4. **Ask questions** if patterns are unclear

### Example Workflow

- **Implementing Redis caching?** → Read [docs/agent/patterns/caching-patterns.md](docs/agent/patterns/caching-patterns.md)
- **Troubleshooting WebSocket?** → Read [docs/agent/operations/troubleshooting.md](docs/agent/operations/troubleshooting.md)
- **Need to know tech versions?** → Read [docs/agent/reference/tech-stack.md](docs/agent/reference/tech-stack.md)
- **Creating Server Action?** → Read [docs/agent/patterns/server-actions.md](docs/agent/patterns/server-actions.md)
- **Database queries slow?** → Read [docs/agent/patterns/database-patterns.md](docs/agent/patterns/database-patterns.md)

---

## Important Reminders

- ✅ Authentication helpers BEFORE any data operation
- ✅ Zod validation for ALL inputs
- ✅ ApiHandler for ALL error handling
- ✅ Prisma transactions for complex operations
- ✅ React Query for server state (NOT Zustand)
- ✅ TypeScript strict mode (NO `any`)
- ✅ Reference documentation for implementation details
- ✅ `sendSystemNotification` for Inngest (no session)
- ✅ 45s delays between emails in Inngest
