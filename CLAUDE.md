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
```

**See**: [authentication.md](docs/agent/patterns/authentication.md) - Complete patterns for auth/authorization, multi-role, middleware, and route protection

### 2. Server Actions Pattern (MANDATORY)

**Pattern**: Auth (requireAuthentication) → Zod validation → Prisma transaction → ApiHandler response

**See**: [server-actions.md](docs/agent/patterns/server-actions.md) - Complete templates with logging and error handling

### 3. Error Handling (MANDATORY)

**Always use**: `ApiHandler.handleError(error)` - Auto-logs and returns consistent response
**Hierarchy**: `ServerActionError` (actions) > `ServiceError` (services)
**Details**: [docs/agent/patterns/server-actions.md](docs/agent/patterns/server-actions.md#error-handling)

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

## First Time Setup

See [environment-vars.md](docs/agent/reference/environment-vars.md) for required configuration.

---

## Common Issues & Tools

**Hitting errors?** → [troubleshooting.md](docs/agent/operations/troubleshooting.md) - N+1 queries, hot reload, connection issues
**Debugging queries?** → [monitoring.md](docs/agent/operations/monitoring.md) - Prisma Studio, Redis CLI, query logging
**Need help?** → [INDEX.md](docs/agent/INDEX.md) - Problem-based navigation guide

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

## Documentation Index

**Before implementing features, read relevant docs in** [docs/agent/](docs/agent/):

**Auth/Security:**
- [authentication.md](docs/agent/patterns/authentication.md), [server-actions.md](docs/agent/patterns/server-actions.md)

**Data Layer:**
- [database-patterns.md](docs/agent/patterns/database-patterns.md), [caching-patterns.md](docs/agent/patterns/caching-patterns.md)

**Frontend:**
- [data-fetching.md](docs/agent/patterns/data-fetching.md), [state-management.md](docs/agent/patterns/state-management.md)

**Features:**
- [file-uploads.md](docs/agent/patterns/file-uploads.md), [background-jobs.md](docs/agent/patterns/background-jobs.md), [notifications.md](docs/agent/patterns/notifications.md)
- [realtime-chat.md](docs/agent/features/realtime-chat.md), [websocket-notifications.md](docs/agent/features/websocket-notifications.md)

**Reference:**
- [tech-stack.md](docs/agent/reference/tech-stack.md), [commands.md](docs/agent/reference/commands.md), [environment-vars.md](docs/agent/reference/environment-vars.md), [database-schema.md](docs/agent/reference/database-schema.md)

**Debugging:**
- [troubleshooting.md](docs/agent/operations/troubleshooting.md), [monitoring.md](docs/agent/operations/monitoring.md)

**Standards:**
- [code-style.md](docs/agent/standards/code-style.md) - Automated style enforcement
- [code-quality.md](docs/agent/standards/code-quality.md) - Patterns & best practices

---

## How to Use This Documentation

**This file** contains MANDATORY rules and universal patterns for all tasks.

**Pattern docs** provide detailed implementation guides - read before implementing features.

**Quick lookup**: Use [INDEX.md](docs/agent/INDEX.md) for problem-based navigation.
