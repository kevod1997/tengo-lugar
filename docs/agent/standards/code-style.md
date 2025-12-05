# Code Style Standards

## Automated Enforcement

All code style rules are **automatically enforced by ESLint v9** with flat config.

- **Configuration**: [eslint.config.mjs](../../../eslint.config.mjs) - Single source of truth
- **Auto-fix**: `npm run lint --fix` - Automatically corrects violations
- **CI/CD**: Enforced in build pipeline

**What ESLint enforces**:
- Import organization and grouping
- Naming conventions (camelCase, PascalCase, UPPER_CASE)
- Type import separation (`import type`)

---

## Import Organization

### Why We Organize Imports

**Readability**: Grouped imports are easier to scan and understand
**Maintainability**: Consistent structure makes changes predictable
**Discoverability**: Clear grouping helps locate dependencies quickly

### Enforcement

**ESLint rule**: `import-x/order`

Imports are automatically organized into groups with blank lines between:
1. **Builtin** - Node.js modules (`fs`, `path`)
2. **External** - npm packages (`react`, `next`, `zod`)
3. **Internal** - Project code (`@/lib`, `@/utils`, `@/actions`)
4. **Type** - Type-only imports (`import type { User }`)

Within each group, imports are alphabetized case-insensitively.

### Before/After Example

**Before** (manual organization):
```typescript
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { requireAuthentication } from '@/utils/helpers/auth-helper';
import type { Trip } from '@prisma/client';
import { revalidatePath } from 'next/cache';
```

**After** (auto-fixed by ESLint):
```typescript
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import prisma from '@/lib/prisma';
import { requireAuthentication } from '@/utils/helpers/auth-helper';

import type { Trip } from '@prisma/client';
```

**Benefits**:
- ✅ Blank lines between groups for visual separation
- ✅ Alphabetically sorted within each group
- ✅ Type imports clearly separated
- ✅ Consistent across entire codebase

---

## Naming Conventions

### Why Consistent Naming Matters

**Consistency**: Reduces cognitive load when reading code
**Readability**: Clear patterns make intent obvious
**Intent**: Names should reveal purpose without comments

### Enforcement

**ESLint rule**: `@typescript-eslint/naming-convention`

**Variables**:
- `camelCase` - Regular variables (`userId`, `tripData`)
- `UPPER_CASE` - Constants (`MAX_FILE_SIZE`, `API_TIMEOUT`)
- `PascalCase` - React components (`UserProfile`, `TripCard`)
- Leading underscores allowed (`_unused`, `_setOpen`)

**Functions**:
- `camelCase` - Regular functions (`getUserById`, `validateEmail`)
- `PascalCase` - React components (`function TripCard() {}`)

**Types/Interfaces**:
- `PascalCase` - All type definitions (`User`, `TripStatus`, `ApiResponse`)

### File Naming (NOT enforced by ESLint)

**Components** - PascalCase:
```
TripCard.tsx
UserProfile.tsx
PaymentForm.tsx
```

**Utilities/Helpers** - kebab-case:
```
auth-helper.ts
date-utils.ts
string-formatter.ts
```

**Server Actions** - kebab-case:
```
create-trip.ts
update-user.ts
delete-vehicle.ts
```

---

## Type Imports

### Why Separate Type Imports

**Build Performance**: Types are removed during compilation, separate imports enable better tree-shaking
**Clarity**: Clear distinction between runtime code and type definitions
**Bundle Size**: Prevents accidental type-to-value transpilation

### Enforcement

**ESLint rule**: `@typescript-eslint/consistent-type-imports`

Type-only imports are automatically separated using `import type` syntax:

**Before**:
```typescript
import { User, createUser } from '@/services/user';
```

**After** (auto-fixed):
```typescript
import { createUser } from '@/services/user';

import type { User } from '@/services/user';
```

---

## Edge Cases

### Dynamic Imports

Dynamic imports should be at the component level, not with other imports:

```typescript
'use client'

import { useState } from 'react';
import dynamic from 'next/dynamic';

// ✅ CORRECT: Dynamic import as variable
const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), {
  loading: () => <p>Loading...</p>
});

export function MyComponent() {
  return <HeavyComponent />;
}
```

### Side-Effect Imports

Side-effect imports (CSS, globals) should be first after directives:

```typescript
'use client'

// Side-effect imports first
import './styles.css';
import '@/styles/global.css';

// Then regular imports
import { useState } from 'react';
import { Button } from '@/components/ui/button';
```

### When to Disable ESLint

Use `eslint-disable` comments sparingly for legitimate edge cases:

```typescript
// ✅ CORRECT: Legitimate edge case (CSS must be last in Next.js layouts)
/* eslint-disable import-x/order */
import type { Metadata } from "next";
import "./globals.css";
/* eslint-enable import-x/order */
```

**Valid reasons**:
- CSS imports in Next.js layouts (must be after other imports)
- Complex conditional imports
- Specific framework requirements

**Invalid reasons**:
- ❌ "Linter is annoying" - Fix the code instead
- ❌ "I prefer my style" - Follow project conventions
- ❌ "Too hard to fix" - Use `npm run lint --fix`

### Conditional Imports

When imports depend on runtime conditions, structure carefully:

```typescript
// ✅ CORRECT: Import at top, use conditionally
import { AdminPanel } from '@/components/admin/AdminPanel';

export function Dashboard({ isAdmin }: Props) {
  if (!isAdmin) return null;
  return <AdminPanel />;
}

// ❌ AVOID: Conditional import (breaks static analysis)
export function Dashboard({ isAdmin }: Props) {
  if (isAdmin) {
    const { AdminPanel } = await import('@/components/admin/AdminPanel');
    return <AdminPanel />;
  }
}
```

---

## Related Documentation

- [code-quality.md](code-quality.md) - Best practices ESLint can't enforce
- [eslint.config.mjs](../../../eslint.config.mjs) - Complete ESLint configuration
- [authentication.md](../patterns/authentication.md) - Auth patterns
- [server-actions.md](../patterns/server-actions.md) - Server action patterns
