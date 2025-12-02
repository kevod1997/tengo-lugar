# Import Organization Standards

## Import Order

Imports should be organized in the following order, with blank lines between groups:

```typescript
// 1. Directives ('use client' or 'use server')
'use client'

// 2. External libraries
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

// 3. Internal utilities and configurations
import { prisma } from '@/lib/prisma';
import { ApiHandler } from '@/lib/api-handler';
import { requireAuthentication } from '@/utils/helpers/auth-helper';

// 4. Types
import type { User } from '@/types/user';
import type { Trip } from '@prisma/client';

// 5. Components (if applicable)
import { Button } from '@/components/ui/button';
import { TripCard } from '@/components/trip/TripCard';
```

---

## Detailed Examples

### Server Action File

```typescript
'use server'

import { requireAuthentication } from "@/utils/helpers/auth-helper";
import { ServerActionError } from "@/lib/exceptions/server-action-error";
import { ApiHandler } from "@/lib/api-handler";
import { logActionWithErrorHandling } from "@/services/logging/logging-service";
import prisma from "@/lib/prisma";

import { TipoAccionUsuario } from "@/types/actions-logs";
import { z } from "zod";

const schema = z.object({
  // Schema definition
});

export async function myServerAction(data: any) {
  // Implementation
}
```

### Client Component File

```typescript
'use client'

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { createTrip } from '@/actions/trip/create-trip';
import { getTripDetails } from '@/actions/trip/get-trip-details';
import { tripSchema } from '@/schemas/validation/trip-schema';

import type { Trip } from '@prisma/client';
import type { TripFormData } from '@/types/trip';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { TripCard } from '@/components/trip/TripCard';

export function CreateTripForm() {
  // Implementation
}
```

### Utility/Service File

```typescript
import { Redis } from '@upstash/redis';
import sharp from 'sharp';

import { ServiceError } from '@/lib/exceptions/service-error';
import { redis } from '@/lib/redis/redis-service';

import type { ImageProcessingOptions } from '@/types/image';

export async function processImage(buffer: Buffer, options: ImageProcessingOptions) {
  // Implementation
}
```

---

## Import Grouping Rules

### Group 1: Directives

Place `'use client'` or `'use server'` directives **first**, before any imports.

```typescript
'use server'

import { /* ... */ } from 'react';
```

**Note:** Only one directive per file.

### Group 2: External Libraries

Import from `node_modules` packages.

**Order within group:**
1. React and React-related
2. State management
3. Form handling
4. UI libraries
5. Other external packages

```typescript
// React first
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// State management
import { useQuery, useMutation } from '@tanstack/react-query';
import { create } from 'zustand';

// Form handling
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Validation
import { z } from 'zod';

// Other
import { toast } from 'sonner';
```

### Group 3: Internal Utilities and Configurations

Import from `@/lib/`, `@/utils/`, `@/services/`, `@/actions/`, `@/schemas/`.

**Order within group:**
1. Core configurations (lib)
2. Utilities (utils)
3. Services
4. Actions
5. Schemas

```typescript
// Core configurations
import { prisma } from '@/lib/prisma';
import { ApiHandler } from '@/lib/api-handler';
import { inngest } from '@/lib/inngest';

// Utilities
import { requireAuthentication } from '@/utils/helpers/auth-helper';
import { formatDate } from '@/utils/helpers/date-utils';

// Services
import { logActionWithErrorHandling } from '@/services/logging/logging-service';

// Actions
import { createTrip } from '@/actions/trip/create-trip';
import { updateUser } from '@/actions/user/update-user';

// Schemas
import { tripSchema } from '@/schemas/validation/trip-schema';
```

### Group 4: Types

Import type definitions.

**Use `import type` for type-only imports:**

```typescript
import type { User } from '@/types/user';
import type { Trip, Payment } from '@prisma/client';
import type { Session } from 'better-auth/types';
```

**Order within group:**
1. Internal types (`@/types/`)
2. Prisma types
3. External library types

### Group 5: Components

Import React components (only in component files).

**Order within group:**
1. UI components (`@/components/ui/`)
2. Feature components (`@/components/`)

```typescript
// UI components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';

// Feature components
import { TripCard } from '@/components/trip/TripCard';
import { UserProfile } from '@/components/user/UserProfile';
```

---

## Alphabetical Ordering

Within each group, order imports alphabetically by module path.

```typescript
// ✅ GOOD: Alphabetical
import { ApiHandler } from '@/lib/api-handler';
import { inngest } from '@/lib/inngest';
import { prisma } from '@/lib/prisma';

// ❌ BAD: Random order
import { inngest } from '@/lib/inngest';
import { prisma } from '@/lib/prisma';
import { ApiHandler } from '@/lib/api-handler';
```

---

## Named Imports

### Multiple Imports from Same Module

```typescript
// ✅ GOOD: Combine into single import
import { useState, useEffect, useMemo } from 'react';

// ❌ BAD: Separate imports
import { useState } from 'react';
import { useEffect } from 'react';
import { useMemo } from 'react';
```

### Long Import Lists

Break long import lists into multiple lines:

```typescript
// ✅ GOOD: Multiple lines for readability
import {
  Button,
  Input,
  Select,
  Checkbox,
  Radio,
  Textarea
} from '@/components/ui/form-elements';

// ✅ ALSO GOOD: Single line if short
import { Button, Input, Select } from '@/components/ui/form-elements';
```

---

## Default vs Named Imports

### Prefer Named Imports

```typescript
// ✅ GOOD: Named import
import { prisma } from '@/lib/prisma';

// ❌ AVOID: Default import (when named is available)
import prisma from '@/lib/prisma';
```

**Exception:** Next.js components and some libraries require default imports:

```typescript
// Required default imports
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
```

---

## Type-Only Imports

Use `import type` for type-only imports to improve build performance:

```typescript
// ✅ GOOD: Type-only import
import type { User } from '@/types/user';
import type { Trip } from '@prisma/client';

// ❌ AVOID: Regular import for types
import { User } from '@/types/user';
```

**Mix of types and values:**

```typescript
// ✅ GOOD: Separate imports
import { userSchema } from '@/schemas/user-schema'; // Runtime value
import type { User } from '@/types/user'; // Type only

// ❌ AVOID: Mixed import
import { userSchema, type User } from '@/schemas/user-schema';
```

---

## Path Aliases

Always use path aliases (`@/`) instead of relative imports for internal files:

```typescript
// ✅ GOOD: Path alias
import { requireAuthentication } from '@/utils/helpers/auth-helper';
import { Button } from '@/components/ui/button';

// ❌ BAD: Relative path
import { requireAuthentication } from '../../../utils/helpers/auth-helper';
import { Button } from '../../components/ui/button';
```

**Exception:** Relative imports for files in the same directory:

```typescript
// ✅ OK: Same directory
import { helperFunction } from './helper';
import { CONSTANT } from './constants';
```

---

## Dynamic Imports

Dynamic imports should be at the component level, not with other imports:

```typescript
'use client'

import { useState } from 'react';
import dynamic from 'next/dynamic';

// ✅ GOOD: Dynamic import as variable
const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), {
  loading: () => <p>Loading...</p>
});

export function MyComponent() {
  return <HeavyComponent />;
}
```

---

## Side Effect Imports

Side effect imports (e.g., CSS) should be **first** after directives:

```typescript
'use client'

// Side effect imports first
import './styles.css';
import '@/styles/global.css';

// Then regular imports
import { useState } from 'react';
import { Button } from '@/components/ui/button';
```

---

## Complete Example

### Full Server Action

```typescript
'use server'

// External libraries
import { z } from 'zod';

// Core configurations
import { ApiHandler } from '@/lib/api-handler';
import { inngest } from '@/lib/inngest';
import { prisma } from '@/lib/prisma';

// Utilities
import { requireAuthentication } from '@/utils/helpers/auth-helper';

// Services
import { logActionWithErrorHandling } from '@/services/logging/logging-service';

// Exceptions
import { ServerActionError } from '@/lib/exceptions/server-action-error';

// Types
import type { TipoAccionUsuario } from '@/types/actions-logs';

// Schema definition
const createTripSchema = z.object({
  origin: z.string().min(1),
  destination: z.string().min(1),
  departureDate: z.date(),
  availableSeats: z.number().positive(),
  pricePerSeat: z.number().positive()
});

export async function createTrip(data: unknown) {
  try {
    const session = await requireAuthentication('create-trip.ts', 'createTrip');
    const validatedData = createTripSchema.parse(data);

    const trip = await prisma.trip.create({
      data: {
        ...validatedData,
        driverCarId: session.user.driver.defaultCarId
      }
    });

    await inngest.send({
      name: 'trip.created',
      data: { tripId: trip.id }
    });

    await logActionWithErrorHandling({
      userId: session.user.id,
      action: 'CREATE_TRIP' as TipoAccionUsuario,
      status: 'SUCCESS'
    }, { fileName: 'create-trip.ts', functionName: 'createTrip' });

    return ApiHandler.handleSuccess(trip, 'Trip created successfully');
  } catch (error) {
    return ApiHandler.handleError(error);
  }
}
```

### Full Client Component

```typescript
'use client'

// External libraries
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

// Actions
import { createTrip } from '@/actions/trip/create-trip';

// Schemas
import { tripSchema } from '@/schemas/validation/trip-schema';

// Types
import type { z } from 'zod';

// UI Components
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

type TripFormData = z.infer<typeof tripSchema>;

export function CreateTripForm() {
  const queryClient = useQueryClient();

  const form = useForm<TripFormData>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      origin: '',
      destination: '',
      departureDate: new Date(),
      availableSeats: 1,
      pricePerSeat: 0
    }
  });

  const mutation = useMutation({
    mutationFn: createTrip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast.success('Trip created successfully');
      form.reset();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create trip');
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
        {/* Form fields */}
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Creating...' : 'Create Trip'}
        </Button>
      </form>
    </Form>
  );
}
```

---

## Linting and Auto-Formatting

### ESLint Configuration

Configure ESLint to enforce import order:

```json
// .eslintrc.json
{
  "rules": {
    "import/order": ["error", {
      "groups": [
        "builtin",
        "external",
        "internal",
        "parent",
        "sibling",
        "index"
      ],
      "pathGroups": [
        {
          "pattern": "@/lib/**",
          "group": "internal",
          "position": "before"
        },
        {
          "pattern": "@/components/**",
          "group": "internal",
          "position": "after"
        }
      ],
      "newlines-between": "always",
      "alphabetize": {
        "order": "asc"
      }
    }]
  }
}
```

---

## Related Documentation

- [Code Quality Standards](code-quality.md) - Naming conventions and best practices
- [TypeScript Configuration](../reference/tech-stack.md) - TypeScript setup
