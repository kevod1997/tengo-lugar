# Phase 2: Move Style Rules to Linters (High Priority)

## Overview

Move code style enforcement rules from documentation to ESLint to enable automatic enforcement and reduce manual review burden.

**Goal**: Automate import organization, naming conventions, and type import patterns through linter configuration.

**Impact**: Reduce documentation size by ~60% (1,062 lines → ~400 lines) and enable auto-fix capabilities.

---

## Change 2.1: Extract ESLint Rules

### Create: `.eslintrc.improvements.json`

Create a new ESLint configuration file for review before merging into main `.eslintrc.json`.

**File**: `.eslintrc.improvements.json`

```json
{
  "extends": ["next/core-web-vitals", "next/typescript"],
  "rules": {
    "import/order": [
      "error",
      {
        "groups": [
          ["builtin", "external"],
          ["internal"],
          ["parent", "sibling", "index"]
        ],
        "pathGroups": [
          {
            "pattern": "react",
            "group": "external",
            "position": "before"
          },
          {
            "pattern": "next/**",
            "group": "external",
            "position": "before"
          },
          {
            "pattern": "@/**",
            "group": "internal"
          }
        ],
        "alphabetize": { "order": "asc" }
      }
    ],
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/consistent-type-imports": "error",
    "no-restricted-syntax": [
      "error",
      {
        "selector": "ImportDeclaration[source.value=/^\\.\\.\\//] ~ ImportDeclaration[source.value=/^@\\//]",
        "message": "Path aliases (@/) must come before relative imports (../)"
      }
    ]
  }
}
```

### Rules Explained

**1. `import/order`** - Enforces consistent import organization:
- **Groups**: External libraries → Internal modules → Relative imports
- **pathGroups**: React and Next.js imports prioritized
- **alphabetize**: Sorts imports alphabetically within each group

**2. `@typescript-eslint/no-explicit-any`** - Prevents `any` type usage:
- Enforces proper type annotations
- Improves type safety across the codebase

**3. `@typescript-eslint/consistent-type-imports`** - Enforces `import type` syntax:
- Separates type imports from value imports
- Improves build performance (types removed during compilation)

**4. `no-restricted-syntax`** - Prevents mixed import styles:
- Ensures path aliases (@/) come before relative imports (../)
- Maintains consistent import patterns

---

## Change 2.2: Update `code-quality.md`

**File**: `docs/agent/standards/code-quality.md`

### Remove Sections (ESLint Now Enforces)

**Lines to Remove**:

1. **Lines 32-148**: "Naming Conventions"
   - File names (PascalCase, kebab-case)
   - Function names (camelCase, PascalCase)
   - Variable names (camelCase, UPPER_SNAKE_CASE)
   - Type names (PascalCase)

   *Reason*: ESLint can't enforce naming, but these are coding conventions best left to code review.

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

### Step 1: Create `.eslintrc.improvements.json`
- Add new ESLint rules
- Test on sample files
- Verify no false positives

### Step 2: Test Auto-Fix
```bash
# Test on single file
npx eslint --fix src/actions/trip/create-trip.ts

# Test on directory
npx eslint --fix src/actions/**/*.ts
```

### Step 3: Review Auto-Fixed Code
- Verify imports are correctly ordered
- Check for any broken imports
- Ensure type imports are separated

### Step 4: Merge Configuration
```bash
# Backup current config
cp .eslintrc.json .eslintrc.json.backup

# Merge improvements
mv .eslintrc.improvements.json .eslintrc.json
```

### Step 5: Update Documentation
- Simplify `code-quality.md`
- Simplify `import-organization.md`
- Update `CLAUDE.md` to reference ESLint enforcement

### Step 6: Run Full Codebase Fix
```bash
npm run lint --fix
```

### Step 7: Commit Changes
```bash
git add .eslintrc.json docs/agent/standards/
git commit -m "feat: move style rules to ESLint for automatic enforcement"
```

---

## Benefits

### For Developers
- ✅ Auto-fix imports on save (IDE integration)
- ✅ Consistent code style automatically
- ✅ Fewer PR comments about formatting
- ✅ Focus on logic, not style

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
- ✅ Better type safety (no `any` types)
- ✅ Improved build performance (`import type`)
- ✅ Easier onboarding (linter teaches style)

---

## Rollback Plan

If issues arise:

```bash
# Restore original ESLint config
cp .eslintrc.json.backup .eslintrc.json

# Restore original documentation
git checkout docs/agent/standards/code-quality.md
git checkout docs/agent/standards/import-organization.md
```

---

## Timeline

**Estimated time**: 2-3 hours

- Step 1: Create config (15 min)
- Step 2-3: Test (30 min)
- Step 4: Merge (5 min)
- Step 5: Update docs (45 min)
- Step 6: Fix codebase (30 min)
- Step 7: Commit (5 min)
- Buffer: 30 min

---

## Success Criteria

- ✅ `.eslintrc.json` contains all import/type rules
- ✅ `code-quality.md` reduced by ~50% (497 → ~250 lines)
- ✅ `import-organization.md` reduced by ~80% (565 → ~115 lines)
- ✅ `npm run lint` passes on entire codebase
- ✅ Auto-fix works correctly on sample files
- ✅ CI/CD enforces new rules

---

## Files to Modify

1. `.eslintrc.improvements.json` (create)
2. `.eslintrc.json` (update)
3. `docs/agent/standards/code-quality.md` (reduce)
4. `docs/agent/standards/import-organization.md` (reduce)
5. `CLAUDE.md` (add ESLint reference)
6. All source files in `src/` (auto-fix with `npm run lint --fix`)
