# CLAUDE.md - Tengo Lugar

## Project Overview

**Tengo Lugar** is a comprehensive ride-sharing platform connecting drivers and passengers efficiently.

**Purpose**: Provide a secure, scalable, and user-friendly platform for ride sharing
**Focus**: Security, performance, and reliability

## Core Technology Philosophy

- **Framework**: Next.js 15 with App Router & Server Actions
- **Database**: PostgreSQL with Prisma ORM (type-safe operations)
- **Authentication**: better-auth 1.2.5 (session management)
- **Caching**: Redis (external APIs, pub/sub)
- **State**: React Query (server state) + Zustand (client state only)
- **Background Jobs**: Inngest (workflows & cron jobs)
- **Validation**: Zod (runtime type checking)

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

## Implementation Rules

**All implementation rules are in `.claude/rules/`** - auto-loaded by Claude Code.

See [INDEX.md](docs/agent/INDEX.md) for problem-based navigation.

## First Time Setup

See [environment-vars.md](docs/agent/reference/environment-vars.md)
