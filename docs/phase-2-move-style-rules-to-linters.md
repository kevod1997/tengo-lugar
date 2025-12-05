# Phase 2: Move Style Rules to Linters + Migrate to ESLint v9 (High Priority)

## Overview

Move code style enforcement rules from documentation to ESLint AND migrate to ESLint v9 with flat config format to enable automatic enforcement and reduce manual review burden.

**Goal**:
1. Migrate to ESLint v9 (v8 reached EOL on October 5, 2024)
2. Adopt flat config format (`eslint.config.mjs`)
3. Automate import organization, naming conventions, and type import patterns

**Impact**:
- Reduce documentation size by ~60% (1,062 lines → ~400 lines)
- Enable auto-fix capabilities
- Future-proof ESLint configuration (v10 will drop legacy config support)
- Better performance with ESLint v9

---

## Change 2.1: Migrate to ESLint v9 + Extract ESLint Rules

### Why Migrate to ESLint v9?

- ✅ **ESLint v8 is EOL**: No more updates since October 5, 2024
- ✅ **Better performance**: v9 has significant speed improvements
- ✅ **Flat config format**: Modern, simpler configuration system
- ✅ **Next.js 15 fully supports it**: Official support for ESLint v9
- ✅ **Future-proof**: ESLint v10 will drop legacy config support entirely

### Create: `eslint.config.mjs`

Create a new ESLint flat config file to replace `.eslintrc.json`.

**File**: `eslint.config.mjs`

```javascript
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import importX from 'eslint-plugin-import-x';

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended,
});

const eslintConfig = [
  // Extend Next.js configs using FlatCompat
  ...compat.config({
    extends: ['next/core-web-vitals', 'next/typescript'],
  }),

  // Custom rules for import organization, naming, and type imports
  {
    name: 'tengo-lugar/custom-rules',
    plugins: {
      'import-x': importX,
    },
    rules: {
      'import-x/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling'],
            'index',
            'type',
          ],
          pathGroups: [
            {
              pattern: 'react',
              group: 'external',
              position: 'before',
            },
            {
              pattern: 'next/**',
              group: 'external',
              position: 'before',
            },
            {
              pattern: '@/**',
              group: 'internal',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
          warnOnUnassignedImports: true,
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'separate-type-imports',
        },
      ],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
        },
        {
          selector: 'function',
          format: ['camelCase', 'PascalCase'],
        },
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
      ],
      // Commented out - can be enabled later if needed
      // '@typescript-eslint/no-explicit-any': 'error',
    },
  },
];

export default eslintConfig;
```

### Required Dependencies

Install ESLint v9, required packages, and the improved import plugin:

```bash
# Upgrade to ESLint v9
npm install -D eslint@^9

# Install required packages for flat config
npm install -D @eslint/js @eslint/eslintrc typescript-eslint

# Install improved import plugin
npm install -D eslint-plugin-import-x
```

**Why these packages?**

1. **`eslint@^9`**: Latest ESLint version with better performance and flat config support
2. **`@eslint/js`**: Required for `js.configs.recommended` in flat config
3. **`@eslint/eslintrc`**: Provides `FlatCompat` to use legacy configs (Next.js) in flat config format
4. **`typescript-eslint`**: Modern TypeScript ESLint parser and plugin (replaces `@typescript-eslint/parser` and `@typescript-eslint/eslint-plugin`)
5. **`eslint-plugin-import-x`**: Fork of `eslint-plugin-import` with better performance (Benchmark Score: 90.7), more lightweight and actively maintained

### Rules Explained

**1. `import-x/order`** - Enforces consistent import organization with advanced features:
- **Groups**: Separate builtin → external → internal → parent/sibling → index → type imports
- **pathGroups**: React and Next.js imports prioritized at the top
- **pathGroupsExcludedImportTypes**: Required for pathGroups to work correctly with builtins
- **newlines-between**: `"always"` adds blank lines between import groups for better readability
- **alphabetize**: Case-insensitive alphabetical sorting within each group
- **warnOnUnassignedImports**: Warns about side-effect imports that are out of order (not auto-fixable)

**2. `@typescript-eslint/consistent-type-imports`** - Enforces `import type` syntax:
- Separates type imports from value imports
- Improves build performance (types removed during compilation)
- `fixStyle: "separate-type-imports"` keeps type imports in their own statements

**3. `@typescript-eslint/naming-convention`** - Enforces naming patterns:
- Variables: camelCase, UPPER_CASE (constants), or PascalCase (React components)
- Functions: camelCase or PascalCase (React components)
- Types/Interfaces: PascalCase only
- **Auto-fixable**: ESLint can suggest fixes for violations

**4. `@typescript-eslint/no-explicit-any`** - COMMENTED OUT (can be enabled later):
- Currently disabled to allow gradual migration
- Prevents `any` type usage when enabled
- Uncomment when ready to enforce stricter type safety

### Flat Config vs Legacy Config

**Key Differences**:

| Aspect | Legacy (`.eslintrc.json`) | Flat Config (`eslint.config.mjs`) |
|--------|---------------------------|-------------------------------------|
| Format | JSON/YAML | JavaScript (ESM) |
| Config Array | Single object | Array of config objects |
| Plugins | String references | Direct imports |
| Extends | String references | Spread operator (`...`) |
| Naming | Automatic | Explicit with `name` field |
| TypeScript | `@typescript-eslint/*` | `typescript-eslint` package |

**Benefits of Flat Config**:
- ✅ **Type-safe**: JavaScript allows imports and IntelliSense
- ✅ **Composable**: Array format makes config composition clearer
- ✅ **Explicit**: No magic string resolution
- ✅ **Future-proof**: ESLint v10 will only support flat config

### Next.js ESLint Best Practices Applied

✅ **FlatCompat usage**: Properly bridges legacy Next.js configs to flat config format
✅ **Extends order**: `next/core-web-vitals` and `next/typescript` extended using FlatCompat
✅ **Configuration naming**: Added `name` field for better error messages and config inspector
✅ **Compatible with Next.js defaults**: All rules work alongside Next.js's built-in ESLint rules
✅ **Modern TypeScript ESLint**: Using `typescript-eslint` package (recommended for ESLint v9)
✅ **No conflicts**: Using `import-x` instead of `import` avoids potential plugin conflicts

---

## Change 2.2: Update `code-quality.md`

**File**: `docs/agent/standards/code-quality.md`

### Remove Sections (ESLint Now Enforces)

**Lines to Remove**:

1. **Lines 32-148**: "Naming Conventions" - Partially
   - ~~Function names (camelCase, PascalCase)~~ - Now enforced by ESLint
   - ~~Variable names (camelCase, UPPER_CASE, PascalCase)~~ - Now enforced by ESLint
   - ~~Type names (PascalCase)~~ - Now enforced by ESLint
   - File names (PascalCase, kebab-case) - Keep in docs (ESLint can't enforce file names)

   *Reason*: `@typescript-eslint/naming-convention` rule now enforces most naming patterns automatically.

2. **Lines 150-183**: "Code Organization" - Import ordering section
   - Import grouping rules
   - Alphabetical ordering

   *Reason*: `import/order` rule now enforces this automatically.

3. **Lines 399-449**: "TypeScript Best Practices" - Type imports section
   - `import type` usage
   - Prefer interfaces vs types

   *Reason*: `consistent-type-imports` rule enforces this automatically.

### Keep Sections (Philosophy & Complex Patterns)

**Keep**:

1. **TypeScript Configuration** (lines 1-30)
   - Strict mode philosophy
   - Why we use strict type checking

2. **Code Organization** - Philosophy only (reduce to ~30 lines)
   - Why we organize code this way
   - General structure principles
   - Link to ESLint config for enforcement

3. **Comments & Documentation** (lines 363-397)
   - When to comment (complex logic, non-obvious decisions)
   - When NOT to comment (obvious code)

4. **TypeScript Best Practices** - Complex patterns only
   - Type guards
   - Generics
   - Advanced patterns ESLint can't enforce

5. **Performance Considerations** (lines 451-489)
   - Memoization
   - Lazy loading
   - Debouncing

### Estimated Result

**Before**: 497 lines
**After**: ~250 lines (50% reduction)

**New structure**:
```markdown
# Code Quality Standards

## TypeScript Configuration
[Why strict mode - philosophy]

## Import Organization
**Automatically enforced by ESLint** - See `.eslintrc.json`
Run `npm run lint --fix` to auto-correct import order.

## Code Organization Philosophy
[Why we organize this way - principles only]

## Comments & Documentation
[When/why to comment - not format]

## TypeScript Best Practices
[Complex patterns ESLint can't enforce]

## Performance Considerations
[React-specific optimizations]
```

---

## Change 2.3: Simplify `import-organization.md`

**File**: `docs/agent/standards/import-organization.md`

### Remove Sections (ESLint Now Enforces)

**Lines to Remove**:

1. **Lines 1-100**: Detailed "Import Order" rules
   - 5-group structure examples
   - External libraries examples
   - Internal utilities examples

   *Reason*: `import/order` rule enforces this.

2. **Lines 218-268**: "Alphabetical Ordering" section
   - Examples of correct ordering
   - Bad examples

   *Reason*: `alphabetize: { "order": "asc" }` handles this.

3. **Lines 270-318**: "Type-Only Imports" section
   - `import type` examples
   - Mixed imports examples

   *Reason*: `consistent-type-imports` rule enforces this.

4. **Lines 320-363**: "Path Aliases" section
   - @/ vs ../ examples

   *Reason*: `no-restricted-syntax` rule enforces this.

5. **Lines 519-558**: "ESLint Configuration" example
   - Old ESLint config snippet

   *Reason*: Now in actual `.eslintrc.json`, not docs.

### Keep Sections (Philosophy & Edge Cases)

**Keep**:

1. **WHY we organize imports** (new intro section, ~30 lines)
   - Readability benefits
   - Maintainability benefits
   - Discoverability benefits

2. **Enforcement** (new section, ~15 lines)
   - Link to `.eslintrc.json` as source of truth
   - How to run auto-fix: `npm run lint --fix`
   - CI/CD integration

3. **Edge Cases ESLint Can't Handle** (~40 lines)
   - Dynamic imports
   - Side-effect imports (CSS, polyfills)
   - Conditional imports
   - How to use eslint-disable comments when needed

4. **Complete Examples** (~30 lines)
   - One server action example
   - One client component example
   - Showing correct automatic formatting

### Estimated Result

**Before**: 565 lines
**After**: ~115 lines (80% reduction)

**New structure**:
```markdown
# Import Organization Standards

## Philosophy
Why we organize imports for readability, maintainability, and discoverability.

## Automatic Enforcement
Import organization is **automatically enforced by ESLint**.

Configuration: [`.eslintrc.json`](../../.eslintrc.json)

Auto-fix: `npm run lint --fix`

## Edge Cases
Complex scenarios ESLint doesn't handle:
- Dynamic imports
- Side-effect imports
- Conditional imports

## Examples
[Complete examples showing auto-formatted code]
```

---

## Migration Strategy

### Step 0: Backup Current Configuration
```bash
# Backup current ESLint config
cp .eslintrc.json .eslintrc.json.backup
```

### Step 1: Install ESLint v9 and Dependencies
```bash
# Upgrade ESLint and install required packages
npm install -D eslint@^9 @eslint/js @eslint/eslintrc typescript-eslint eslint-plugin-import-x
```

### Step 2: Create Flat Config File
- Create `eslint.config.mjs` with the configuration shown above
- Keep `.eslintrc.json.backup` for reference

### Step 3: Test on Sample Files
```bash
# Test on single file
npx eslint --fix src/actions/trip/create-trip.ts

# Test on directory
npx eslint --fix src/actions/**/*.ts
```

### Step 4: Review Auto-Fixed Code
- Verify imports are correctly ordered
- Check for any broken imports
- Ensure type imports are separated
- Verify naming conventions are working

### Step 5: Remove Legacy Config
```bash
# Once verified, remove old config
rm .eslintrc.json

# Keep backup just in case
# rm .eslintrc.json.backup (only after full verification)
```

### Step 6: Update Documentation
- Simplify `code-quality.md`
- Simplify `import-organization.md`
- Update `CLAUDE.md` to reference ESLint enforcement and new flat config

### Step 7: Run Full Codebase Fix
```bash
npm run lint --fix
```

### Step 8: Commit Changes
```bash
git add eslint.config.mjs package.json package-lock.json docs/agent/standards/
git commit -m "feat: migrate to ESLint v9 with flat config and move style rules to linter"
```

---

## Benefits

### For ESLint v9 Migration
- ✅ **Future-proof**: ESLint v10 will only support flat config
- ✅ **Better performance**: v9 is faster than v8
- ✅ **Improved DX**: JavaScript config with IntelliSense
- ✅ **Simpler composition**: Array-based config is clearer
- ✅ **Modern tooling**: Unified `typescript-eslint` package
- ✅ **Active support**: v8 is EOL, v9 receives updates

### For Developers
- ✅ Auto-fix imports on save (IDE integration)
- ✅ Consistent code style automatically
- ✅ Fewer PR comments about formatting
- ✅ Focus on logic, not style
- ✅ Better error messages with named configs

### For Code Reviews
- ✅ No manual import ordering reviews
- ✅ No type import syntax discussions
- ✅ Automated consistency checks
- ✅ CI/CD can enforce rules

### For Documentation
- ✅ 60% less documentation to maintain
- ✅ Single source of truth (`.eslintrc.json`)
- ✅ Docs focus on "why", not "how"
- ✅ Less outdated information

### For Codebase
- ✅ Consistent import ordering across ~400 files
- ✅ Better readability with blank lines between import groups
- ✅ Improved build performance (`import type`)
- ✅ Easier onboarding (linter teaches style)
- ✅ Automatic naming convention enforcement

---

## Rollback Plan

If issues arise:

```bash
# Restore original ESLint v8 config
cp .eslintrc.json.backup .eslintrc.json

# Remove flat config
rm eslint.config.mjs

# Downgrade to ESLint v8
npm install -D eslint@^8

# Remove v9-specific packages
npm uninstall @eslint/js @eslint/eslintrc typescript-eslint eslint-plugin-import-x

# Restore original documentation
git checkout docs/agent/standards/code-quality.md
git checkout docs/agent/standards/import-organization.md
```

---

## Timeline

**Estimated time**: 2.5-3 hours

- Step 0: Backup config (2 min)
- Step 1: Install ESLint v9 + dependencies (10 min)
- Step 2: Create flat config (20 min)
- Step 3-4: Test and review (30 min)
- Step 5: Remove legacy config (2 min)
- Step 6: Update docs (45 min)
- Step 7: Fix codebase (30 min)
- Step 8: Commit (5 min)
- Buffer: 30 min

---

## Success Criteria

- ✅ ESLint upgraded to v9.x
- ✅ Flat config (`eslint.config.mjs`) created and working
- ✅ Legacy config (`.eslintrc.json`) removed
- ✅ All required dependencies installed (`@eslint/js`, `@eslint/eslintrc`, `typescript-eslint`, `eslint-plugin-import-x`)
- ✅ `eslint.config.mjs` contains all import/type/naming rules
- ✅ `code-quality.md` reduced by ~50% (497 → ~250 lines)
- ✅ `import-organization.md` reduced by ~80% (565 → ~115 lines)
- ✅ `npm run lint` passes on entire codebase
- ✅ Auto-fix works correctly on sample files
- ✅ Imports have blank lines between groups for better readability
- ✅ Naming conventions are enforced automatically
- ✅ CI/CD enforces new rules
- ✅ No breaking changes in linting behavior

---

## Files to Modify

1. `eslint.config.mjs` (create - replaces `.eslintrc.json`)
2. `.eslintrc.json` (remove after migration)
3. `package.json` (upgrade ESLint to v9, add new dependencies)
4. `package-lock.json` (auto-updated)
5. `docs/agent/standards/code-quality.md` (reduce by ~50%)
6. `docs/agent/standards/import-organization.md` (reduce by ~80%)
7. `CLAUDE.md` (add ESLint v9 and flat config reference)
8. All source files in `src/` (auto-fix with `npm run lint --fix`)

---

## Common Migration Issues & Solutions

### Issue 1: `import.meta.dirname` not available

**Problem**: `import.meta.dirname` requires Node.js v20.11.0+

**Solution**: Use this fallback for older Node.js versions:

```javascript
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,  // Use this instead of import.meta.dirname
  recommendedConfig: js.configs.recommended,
});
```

### Issue 2: TypeScript ESLint errors

**Problem**: `typescript-eslint` package not recognized

**Solution**: Ensure you're using the unified `typescript-eslint` package, not the old separate packages:

```bash
# Remove old packages if installed
npm uninstall @typescript-eslint/parser @typescript-eslint/eslint-plugin

# Use the new unified package
npm install -D typescript-eslint
```

### Issue 3: VSCode ESLint extension not working

**Problem**: VSCode ESLint extension doesn't recognize flat config

**Solution**: Update VSCode ESLint extension to v3.0.10+ and add to `.vscode/settings.json`:

```json
{
  "eslint.experimental.useFlatConfig": true
}
```

### Issue 4: `next lint` not finding config

**Problem**: Next.js can't find the new flat config

**Solution**: Ensure `eslint.config.mjs` is in the project root and restart your dev server:

```bash
npm run dev
```

---

## Before & After Examples

### Import Organization

**Before** (manual organization):
```typescript
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { requireAuthentication } from '@/utils/helpers/auth-helper';
import { ApiHandler } from '@/lib/api-handler';
import type { Trip } from '@prisma/client';
import { revalidatePath } from 'next/cache';
```

**After** (auto-fixed by ESLint):
```typescript
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { ApiHandler } from '@/lib/api-handler';
import prisma from '@/lib/prisma';
import { requireAuthentication } from '@/utils/helpers/auth-helper';

import type { Trip } from '@prisma/client';
```

**Changes**:
- ✅ Blank lines between import groups (builtin, external, internal, type)
- ✅ Alphabetically sorted within each group
- ✅ Type imports separated at the end
- ✅ Consistent formatting across the entire codebase

### Naming Conventions

**Before** (violations):
```typescript
const My_Variable = "test";           // ❌ snake_case not allowed
function Do_Something() {}            // ❌ snake_case not allowed
type user_type = { name: string };   // ❌ lowercase with underscore
```

**After** (ESLint enforces):
```typescript
const myVariable = "test";            // ✅ camelCase
const MY_CONSTANT = "test";           // ✅ UPPER_CASE for constants
const MyComponent = () => {};         // ✅ PascalCase for React components
function doSomething() {}             // ✅ camelCase
type UserType = { name: string };     // ✅ PascalCase
```

### Type Imports

**Before** (mixed):
```typescript
import { User, createUser } from '@/services/user';
```

**After** (auto-fixed):
```typescript
import { createUser } from '@/services/user';

import type { User } from '@/services/user';
```

**Benefits**:
- ✅ Clear separation between runtime code and types
- ✅ Better tree-shaking and build performance
- ✅ Easier to identify type-only dependencies
