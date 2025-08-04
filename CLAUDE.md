# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Tengo Lugar - Ride Sharing Platform

## Project Overview
**Tengo Lugar** is a comprehensive ride-sharing platform built with modern technologies and best practices for scalability, security, and performance.

---

## Technology Stack

### Core Framework & Languages
- **Next.js 15** with App Router and Server Actions
- **TypeScript** strict mode with Prisma + PostgreSQL
- **React 19** with Server Components

### Authentication & Security
- **better-auth 1.2.5** for authentication and session management
- JWT tokens with JWKS for external integrations
- Role-based authorization system (admin/user)

### Database & Caching
- **PostgreSQL** with Prisma ORM
- **@upstash/redis + ioredis** for caching and pub/sub
- **Prisma** for type-safe database operations

### State Management & Data Fetching
- **@tanstack/react-query 5.64.1** for server state management
- **Zustand 5.0.3** for client-side global state
- **React Hook Form 7.53.2** + **@hookform/resolvers** for form handling

### UI & Styling
- **shadcn/ui** component library
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **Motion 12** for animations
- **Sonner** for toast notifications

### File Handling & External Services
- **AWS S3** for file storage (@aws-sdk/client-s3 + s3-request-presigner)
- **Sharp + pdf-lib** for file processing
- **React Dropzone + react-easy-crop** for file uploads
- **Google Maps API** (@googlemaps/google-maps-services-js)
- **Resend** for email services

### Background Jobs & Validation
- **Inngest 3.32.7** for background jobs and workflows
- **Zod 3.24.2** for runtime validation
- **libphonenumber-js** for phone number validation

---

## Development Commands

```bash
# Development
npm run dev              # Development server with Turbo
npm run dev:https        # Development server with HTTPS
npm run build            # Production build
npm run start            # Production server
npm run lint             # ESLint with Next.js rules

# Database Operations
npm run seed             # Run database seeds
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Create and apply migrations
npm run prisma:deploy    # Deploy migrations to production
npm run prisma:studio    # Open Prisma Studio GUI
```

---

## Architecture Patterns

### 1. Authentication with better-auth

#### Authentication Helpers (CRITICAL)
```typescript
import { requireAuthentication, requireAuthorization } from '@/utils/helpers/auth-helper';

// Basic authentication check
const session = await requireAuthentication('filename.ts', 'functionName');

// Role-specific authorization
const session = await requireAuthorization('admin', 'filename.ts', 'functionName');

// Multi-role authorization
const session = await requireAuthorizationMultiRole(['admin', 'user'], 'filename.ts', 'functionName');
```

#### Middleware Pattern
```typescript
// In middleware - use betterFetch for real validation
const { data: session } = await betterFetch<Session>("/api/auth/get-session", {
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  headers: { cookie: request.headers.get("cookie") || "" },
});
```

### 2. Server Actions Pattern (MANDATORY)

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

### 3. Optimized Prisma Patterns

#### Efficient Queries
```typescript
// USE specific selects for performance
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: {
    id: true,
    name: true,
    email: true,
    driver: { select: { id: true } },
    passenger: { select: { id: true } }
  }
});

// USE transactions for complex operations
await prisma.$transaction(async (tx) => {
  const car = await tx.car.create({ data: carData });
  const driverCar = await tx.driverCar.create({ 
    data: { driverId, carId: car.id } 
  });
  return { car, driverCar };
});

// AVOID N+1 queries - use efficient includes
const trips = await prisma.trip.findMany({
  include: {
    driverCar: {
      include: {
        car: {
          include: {
            carModel: { include: { brand: true } }
          }
        }
      }
    }
  }
});
```

### 4. Redis Cache Patterns

```typescript
import { Redis } from '@upstash/redis';
import { redisService } from '@/lib/redis/redis-service';

// Pattern for external APIs
const cacheKey = `car_api_brands`;
const cached = await redis.get<BrandsResponse>(cacheKey);
if (cached) return cached;

const fresh = await fetchFromCarApi('/brands');
await redis.set(cacheKey, fresh, { ex: 86400 }); // 24 hours
return fresh;

// Pattern with TTL renovation
const ttl = await redis.ttl(cacheKey);
if (ttl < CACHE_TIME / 2) {
  // Renew in background
  fetchAndCache(cacheKey, fetchFn, CACHE_TIME).catch(console.error);
}
```

### 5. Error Handling Hierarchy

```typescript
// Error Hierarchy: ServerActionError > ServiceError > AuxiliaryError > S3ServiceError

// In Server Actions
throw ServerActionError.AuthenticationFailed('filename.ts', 'functionName');
throw ServerActionError.ValidationFailed('filename.ts', 'functionName', 'details');
throw ServerActionError.DatabaseError('filename.ts', 'functionName', 'details');

// In Services
throw ServiceError.ExternalApiError('API error details', 'filename.ts', 'functionName');
throw ServiceError.ConfigError('Config missing', 'filename.ts', 'functionName');

// Error handling with ApiHandler
return ApiHandler.handleError(error); // Auto-logs and consistent response
```

---

## Project Structure

```
/src/
├── actions/              # Server Actions by domain
│   ├── car/             # Vehicle management
│   ├── trip/            # Trip management
│   ├── user/            # User management
│   ├── register/        # Registration flow
│   ├── driver/          # Driver-specific actions
│   ├── chat/            # Chat functionality
│   ├── logs/            # Logging actions
│   └── admin/           # Administrative functions
├── app/                 # Next.js 15 App Router
│   ├── (authenticated)/ # Protected routes
│   ├── (public)/        # Public routes
│   ├── (unauthenticated)/ # Auth routes
│   ├── (admin)/         # Admin-only routes
│   └── api/             # API Routes
├── components/          # Reusable components
│   ├── ui/              # shadcn/ui components
│   └── forms/           # Form components
├── hooks/               # Custom hooks
├── lib/                 # Configurations and utilities
│   ├── auth.ts          # better-auth config
│   ├── prisma.ts        # Prisma client
│   ├── redis/           # Redis service
│   └── exceptions/      # Error classes
├── schemas/             # Zod validation schemas
├── services/            # Business logic
├── store/               # Zustand stores
├── types/               # TypeScript types
└── utils/               # Helper functions
```

---

## Development Patterns

### Form Validation Pattern
```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { mySchema } from "@/schemas/validation/my-schema";

const form = useForm({
  resolver: zodResolver(mySchema),
  defaultValues: { /* defaults */ }
});

// In Server Actions - ALWAYS validate
const validatedData = mySchema.parse(data);
```

### Data Fetching Pattern
```typescript
import { useQuery, useMutation } from "@tanstack/react-query";

// Client-side data fetching
const { data, isLoading, error } = useQuery({
  queryKey: ['trips', userId],
  queryFn: () => getUserTrips(),
  staleTime: 5 * 60 * 1000, // 5 minutes
});

// Mutations with optimistic updates
const mutation = useMutation({
  mutationFn: createTrip,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['trips'] });
    toast.success('Viaje creado exitosamente');
  }
});
```

### Global State Pattern
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      updateUser: (userData) => set((state) => ({ 
        user: state.user ? { ...state.user, ...userData } : null 
      })),
      clearUser: () => set({ user: null })
    }),
    { name: 'user-storage' }
  )
);

// DO NOT mix server state in Zustand - use React Query instead
```

### File Upload Pattern
```typescript
import { useDropzone } from "react-dropzone";
import { uploadToS3 } from "@/lib/file/s3-upload";
import sharp from "sharp";

// Image processing with Sharp
const processed = await sharp(buffer)
  .resize(800, 600)
  .jpeg({ quality: 80 })
  .toBuffer();
```

### Background Jobs Pattern
```typescript
import { inngest } from "@/lib/inngest";

// Trigger background job
await inngest.send({
  name: "document-verification-email",
  data: { userId, email, type: "verification" }
});

// In functions/inngest/
export const sendVerificationEmail = inngest.createFunction(
  { id: "send-verification-email" },
  { event: "document-verification-email" },
  async ({ event, step }) => {
    // Email sending logic
  }
);
```

---

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql://...

# Authentication
BETTER_AUTH_SECRET=
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000

# Redis/Upstash
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
UPSTASH_REDIS_URL=

# AWS S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_S3_BUCKET_NAME=

# External APIs
GOOGLE_MAPS_API_KEY=
CAR_API_URL=
CAR_API_USERNAME=
CAR_API_PASSWORD=

# Email Services
RESEND_API_KEY=

# Background Jobs
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=

# Real-time Communication
NEXT_PUBLIC_CHAT_API_URL=
NEXT_PUBLIC_CHAT_WEBSOCKET_URL=
NEXT_PUBLIC_CLIENT_URL=

# Social Auth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=

# Email Verification
EMAIL_VERIFICATION_CALLBACK_URL=
```

---

## Database Schema Overview

### Core Models Relationship
- **User** → **Driver/Passenger** (user roles)
- **Driver** → **DriverCar** → **Car** → **CarModel** → **Brand**
- **Trip** → **TripPassenger** → **Payment**
- **User** → **IdentityCard/Licence** (verification documents)
- **Car** → **VehicleCard/InsurancePolicy** (vehicle documents)
- **Trip** → **Review** (rating system)
- **UserActionLog/ErrorLog** (comprehensive logging)
- **PushSubscription** (notification system)

---

## Development Rules & Best Practices

### 🔒 Security Rules
1. **NEVER** manually parse cookies - use `betterFetch`
2. **ALWAYS** validate session in Server Actions using auth helpers
3. **ALWAYS** use centralized authorization helpers
4. **ALWAYS** sanitize and validate inputs with Zod
5. **NEVER** expose sensitive data in JWT payload beyond necessary

### ⚡ Performance Rules
1. Use specific `select` in Prisma queries
2. Implement Redis cache for external APIs
3. Use React Query for client-side data fetching
4. Optimize images with Sharp before S3 upload
5. Use Prisma transactions for complex operations

### 🚨 Error Handling Rules
1. **ALWAYS** use `ApiHandler.handleError()` for consistency
2. **ALWAYS** log errors with LoggingService automatically
3. Use error hierarchy: `ServerActionError` > `ServiceError`
4. Handle errors with toast notifications on client
5. Provide context (fileName, functionName) for all errors

### 🧪 Testing & Debug
1. Use `npm run prisma:studio` to explore database
2. Structured logs in `ErrorLog`/`UserActionLog` tables
3. Redis keys with TTL for debugging cache
4. Chat integration with JWT tokens for external services

---

## Chat Integration Architecture

The platform integrates with an external chat service:

1. **JWT Token Generation**: `/api/auth/token` endpoint provides JWT tokens for external services
2. **Chat Room Creation**: Each trip automatically creates a chat room
3. **Real-time Updates**: WebSocket connection for live chat functionality
4. **Authentication**: JWT tokens include user role and trip context

---

## Common Troubleshooting

### Database Issues
- **Prisma Error**: Run `npm run prisma:generate` + verify schema
- **Migration Error**: Check DATABASE_URL and run `npm run prisma:migrate`

### Cache Issues
- **Redis Error**: Verify UPSTASH environment variables and connection
- **Cache Miss**: Check Redis keys and TTL configuration

### File Upload Issues
- **S3 Error**: Verify AWS permissions and bucket configuration
- **Image Processing**: Check Sharp configuration and file formats

### Authentication Issues
- **Auth Error**: Verify better-auth cookies and session validation
- **Session Error**: Check BETTER_AUTH_SECRET and URL configuration
- **JWT Error**: Verify token generation endpoint and external service integration

### Chat Integration Issues
- **Chat Room Creation**: Check NEXT_PUBLIC_CHAT_API_URL configuration
- **Token Generation**: Verify JWT endpoint and cookie forwarding
- **WebSocket Connection**: Check NEXT_PUBLIC_CHAT_WEBSOCKET_URL

### Build Issues
- **TypeScript Error**: Verify types and imports
- **N+1 Queries**: Review Prisma includes and use specific selects

---

## Useful Development Commands

```bash
# Database Management
npm run prisma:studio          # Explore database with GUI
npm run prisma:migrate dev     # Create new migration

# Monitoring & Debugging
# - View real-time logs in Inngest dashboard
# - Monitor Redis cache in Upstash console
# - Review S3 uploads in AWS console
# - Check email delivery in Resend dashboard
```

---

## Code Quality Standards

### TypeScript Configuration
- Strict mode enabled
- No implicit any
- Consistent naming conventions
- Interface over type when possible

### Import Organization
```typescript
// 1. External libraries
import React from 'react';
import { z } from 'zod';

// 2. Internal utilities
import { prisma } from '@/lib/prisma';
import { ApiHandler } from '@/lib/api-handler';

// 3. Types
import type { User } from '@/types/user';

// 4. Components (if applicable)
import { Button } from '@/components/ui/button';
```

### Function Naming Conventions
- Server Actions: `verb + Noun` (e.g., `createTrip`, `updateUser`)
- React Components: `PascalCase` (e.g., `TripCard`, `UserProfile`)
- Utility functions: `camelCase` (e.g., `formatDate`, `validatePhone`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_FILE_SIZE`, `DEFAULT_CACHE_TTL`)

---

## Important Notes for Claude Code

1. **Always use the authentication helpers** before any data operation
2. **Follow the Server Action pattern** for all server-side operations
3. **Use Prisma transactions** for complex database operations
4. **Implement proper error handling** with the established hierarchy
5. **Cache external API calls** using Redis patterns
6. **Validate all inputs** with Zod schemas
7. **Use React Query** for client-side data fetching, not Zustand
8. **Follow the project structure** when creating new files
9. **Use TypeScript strictly** - no `any` types
10. **Test database operations** with Prisma Studio before deployment
11. **Email service uses Resend** - use ResendAPI class
12. **Chat integration requires JWT tokens** - use proper token generation patterns
13. **✅ Real-time notifications** - Use `RealtimePublisher` for WebSocket events

---

## Real-Time Notifications Integration ✅ IMPLEMENTADO

### Phase 2 - Server Actions Integration: COMPLETADO

The platform now supports real-time notifications through WebSocket integration:

**✅ Implemented Components:**
- **`src/lib/real-time/real-time-publisher.ts`** - Non-blocking async publisher for Redis queues
- **`src/types/real-time-types.ts`** - Type definitions compatible with WebSocket server
- **Document Verification Integration** - `validateDocument()` publishes real-time events
- **Queue-based System** - Compatible with WebSocket server polling (lpush/rpop)
- **Error Isolation** - Redis failures don't affect server actions

**✅ Usage Pattern:**
```typescript
// In server actions - automatic for document verification
import { RealtimeEventHelpers } from "@/lib/real-time/real-time-publisher";

// Document verification (already integrated)
await RealtimeEventHelpers.publishDocumentVerification(
  userId,
  documentType, // 'IDENTITY' | 'LICENCE' | 'INSURANCE' | 'CARD'
  status,       // VerificationStatus
  failureReason?
);

// For future implementations
await RealtimePublisher.publishRealtimeEvent(
  notificationType,
  stateUpdate,
  options
);
```

**✅ Integration Flow:**
```
Server Action → RealtimePublisher → Redis Queue → WebSocket Server (port 8080) → Frontend
     ✅               ✅               ✅              ✅                    (Phase 3)
```

**✅ Supported Document Types:**
- IDENTITY → `VERIFICATION_APPROVED` / `VERIFICATION_FAILED`
- LICENCE → `LICENSE_VERIFIED` / `LICENSE_FAILED`
- INSURANCE → `INSURANCE_VERIFIED` / `INSURANCE_FAILED`
- CARD → `VEHICLE_CARD_VERIFIED` / `VEHICLE_CARD_FAILED`

**🔄 Next Phase (Phase 3):**
- Frontend WebSocket client implementation
- React hooks for real-time connection
- Zustand/React Query integration
- UI components for notifications

**⚠️ Requirements:**
- WebSocket server must be running on port 8080
- Redis environment variables configured (UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN)
- Compatible with existing email/Inngest functionality