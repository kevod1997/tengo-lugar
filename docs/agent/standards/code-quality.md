# Code Quality Standards

## TypeScript Configuration

### Strict Mode
TypeScript strict mode is **enabled** for maximum type safety.

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true
  }
}
```

### Rules
1. **No `any` types** - Always provide proper types
2. **No implicit any** - Explicit types required
3. **Strict null checks** - Handle null/undefined explicitly
4. **No unused variables** - Clean up unused code

---

## Naming Conventions

### Files and Folders

#### Components (PascalCase)
```
TripCard.tsx
UserProfile.tsx
PaymentForm.tsx
```

#### Utilities and Helpers (kebab-case)
```
auth-helper.ts
date-utils.ts
string-formatter.ts
```

#### Server Actions (kebab-case)
```
create-trip.ts
update-user.ts
delete-vehicle.ts
```

### Functions

#### Server Actions (camelCase: verb + Noun)
```typescript
export async function createTrip(data: TripData) { }
export async function updateUser(userId: string, data: UserData) { }
export async function deleteVehicle(vehicleId: string) { }
export async function getTripDetails(tripId: string) { }
```

#### React Components (PascalCase)
```typescript
export function TripCard({ trip }: TripCardProps) { }
export function UserProfile({ user }: UserProfileProps) { }
export function PaymentModal({ isOpen }: PaymentModalProps) { }
```

#### Utility Functions (camelCase)
```typescript
export function formatDate(date: Date): string { }
export function validatePhone(phone: string): boolean { }
export function calculateDistance(from: Coords, to: Coords): number { }
```

#### Event Handlers (handleXxx)
```typescript
const handleSubmit = (e: FormEvent) => { };
const handleClick = () => { };
const handleChange = (value: string) => { };
```

### Variables

#### Constants (UPPER_SNAKE_CASE)
```typescript
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const DEFAULT_CACHE_TTL = 3600;
const API_TIMEOUT = 30000;
```

#### Regular Variables (camelCase)
```typescript
const userId = session.user.id;
const tripData = { origin, destination };
const isValid = validateInput(data);
```

#### Boolean Variables (is/has/can prefix)
```typescript
const isAuthenticated = !!session;
const hasPermission = user.role === 'admin';
const canEdit = isOwner || isAdmin;
```

### Types and Interfaces

#### Interfaces (PascalCase with 'I' prefix optional)
```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

interface TripFormData {
  origin: string;
  destination: string;
  date: Date;
}
```

#### Type Aliases (PascalCase)
```typescript
type UserRole = 'admin' | 'user';
type TripStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
type ApiResponse<T> = { success: boolean; data?: T; error?: Error };
```

#### Props Types (ComponentNameProps)
```typescript
interface TripCardProps {
  trip: Trip;
  onEdit?: (trip: Trip) => void;
}

interface UserProfileProps {
  user: User;
  editable?: boolean;
}
```

---

## Code Organization

### File Structure

```typescript
// 1. 'use client' or 'use server' directive (if needed)
'use client'

// 2. External library imports
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

// 3. Internal utilities and configurations
import { prisma } from '@/lib/prisma';
import { ApiHandler } from '@/lib/api-handler';
import { requireAuthentication } from '@/utils/helpers/auth-helper';

// 4. Types and interfaces
import type { User } from '@/types/user';
import type { Trip } from '@prisma/client';

// 5. Components (if applicable)
import { Button } from '@/components/ui/button';
import { TripCard } from '@/components/trip/TripCard';

// 6. Constants
const MAX_TRIPS = 10;

// 7. Component/Function definition
export function MyComponent() {
  // Component logic
}
```

### Function Organization

```typescript
export async function myServerAction(data: any) {
  // 1. Authentication
  const session = await requireAuthentication('file.ts', 'myServerAction');

  // 2. Validation
  const validatedData = schema.parse(data);

  // 3. Authorization (if needed)
  if (session.user.role !== 'admin') {
    throw ServerActionError.AuthorizationFailed('file.ts', 'myServerAction');
  }

  // 4. Business Logic
  const result = await prisma.$transaction(async (tx) => {
    // Database operations
    return result;
  });

  // 5. Logging
  await logActionWithErrorHandling({
    userId: session.user.id,
    action: TipoAccionUsuario.ACTION_TYPE,
    status: 'SUCCESS',
  }, { fileName: 'file.ts', functionName: 'myServerAction' });

  // 6. Return
  return ApiHandler.handleSuccess(result, 'Success message');
}
```

---

## Best Practices

### 1. Early Returns

```typescript
// ✅ GOOD: Early returns for error cases
export async function processPayment(paymentId: string) {
  const payment = await getPayment(paymentId);

  if (!payment) {
    return ApiHandler.handleError(new Error('Payment not found'));
  }

  if (payment.status !== 'PENDING') {
    return ApiHandler.handleError(new Error('Payment already processed'));
  }

  // Continue with logic
}

// ❌ BAD: Nested conditions
export async function processPayment(paymentId: string) {
  const payment = await getPayment(paymentId);

  if (payment) {
    if (payment.status === 'PENDING') {
      // Deep nesting
    }
  }
}
```

### 2. Descriptive Names

```typescript
// ✅ GOOD: Descriptive names
const isPendingPayment = payment.status === 'PENDING';
const userHasVerifiedEmail = user.emailVerified;
const tripDepartureDate = new Date(trip.departureDate);

// ❌ BAD: Unclear names
const flag = payment.status === 'PENDING';
const x = user.emailVerified;
const d = new Date(trip.departureDate);
```

### 3. Single Responsibility

```typescript
// ✅ GOOD: Single responsibility
function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sendWelcomeEmail(email: string): Promise<void> {
  // Only sends email
}

// ❌ BAD: Multiple responsibilities
function validateAndSendEmail(email: string) {
  // Validates AND sends - should be two functions
}
```

### 4. Avoid Magic Numbers

```typescript
// ✅ GOOD: Named constants
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

if (file.size > MAX_FILE_SIZE_BYTES) {
  throw new Error(`File too large. Max size: ${MAX_FILE_SIZE_MB}MB`);
}

// ❌ BAD: Magic numbers
if (file.size > 5242880) {
  throw new Error('File too large');
}
```

### 5. Error Handling

```typescript
// ✅ GOOD: Proper error handling
try {
  const result = await riskyOperation();
  return ApiHandler.handleSuccess(result);
} catch (error) {
  console.error('Error in riskyOperation:', error);
  return ApiHandler.handleError(error);
}

// ❌ BAD: Swallowing errors
try {
  await riskyOperation();
} catch (error) {
  // Silent failure
}
```

### 6. Async/Await over Promises

```typescript
// ✅ GOOD: Async/await
async function getUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user;
}

// ❌ BAD: Promise chains (when unnecessary)
function getUser(userId: string) {
  return prisma.user.findUnique({ where: { id: userId } })
    .then(user => user);
}
```

### 7. Destructuring

```typescript
// ✅ GOOD: Destructuring
const { id, name, email } = user;
const { origin, destination, departureDate } = trip;

// ❌ BAD: Repetitive access
const id = user.id;
const name = user.name;
const email = user.email;
```

### 8. Optional Chaining

```typescript
// ✅ GOOD: Optional chaining
const driverName = trip.driverCar?.driver?.user?.name ?? 'Unknown';

// ❌ BAD: Nested checks
const driverName = trip.driverCar && trip.driverCar.driver && trip.driverCar.driver.user
  ? trip.driverCar.driver.user.name
  : 'Unknown';
```

---

## Code Comments

### When to Comment

#### 1. Complex Logic
```typescript
// Calculate average rating with weighted recent reviews
// Recent reviews (last 30 days) have 1.5x weight
const weightedAverage = calculateWeightedRating(reviews, recentReviewWeight);
```

#### 2. Non-Obvious Decisions
```typescript
// Using 45s delay between emails to avoid spam classification
await step.sleep("delay-between-emails", "45s");
```

#### 3. TODO/FIXME
```typescript
// TODO: Implement pagination for large result sets
// FIXME: Handle edge case where user has no trips
```

### When NOT to Comment

#### Don't State the Obvious
```typescript
// ❌ BAD: Comment just repeats code
// Get user by ID
const user = await prisma.user.findUnique({ where: { id: userId } });

// ✅ GOOD: No comment needed (code is self-explanatory)
const user = await getUserById(userId);
```

---

## TypeScript Best Practices

### 1. Prefer Interfaces for Objects

```typescript
// ✅ GOOD: Interface for object shape
interface User {
  id: string;
  name: string;
  email: string;
}

// Type alias for unions
type UserRole = 'admin' | 'user';
```

### 2. Use Type Guards

```typescript
function isDriver(user: User): user is User & { driver: Driver } {
  return 'driver' in user && user.driver !== null;
}

if (isDriver(user)) {
  // TypeScript knows user has driver property
  console.log(user.driver.rating);
}
```

### 3. Avoid Type Assertions

```typescript
// ❌ BAD: Type assertion
const user = data as User;

// ✅ GOOD: Runtime validation
const user = userSchema.parse(data);
```

### 4. Use Generics for Reusable Code

```typescript
function getFirstItem<T>(items: T[]): T | undefined {
  return items[0];
}

const firstTrip = getFirstItem(trips); // Type: Trip | undefined
const firstName = getFirstItem(names); // Type: string | undefined
```

---

## Performance Considerations

### 1. Memoization

```typescript
import { useMemo } from 'react';

function TripsList({ trips }: TripsListProps) {
  const sortedTrips = useMemo(() => {
    return trips.sort((a, b) =>
      a.departureDate.getTime() - b.departureDate.getTime()
    );
  }, [trips]);

  return <>{/* Render sorted trips */}</>;
}
```

### 2. Lazy Loading

```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <LoadingSpinner />
});
```

### 3. Debouncing

```typescript
import { debounce } from 'lodash';

const debouncedSearch = debounce((query: string) => {
  searchTrips(query);
}, 300);
```

---

## Related Documentation

- [Import Organization](import-organization.md) - Import ordering
- [Authentication Patterns](../patterns/authentication.md) - Auth code standards
- [Server Actions](../patterns/server-actions.md) - Server action standards
