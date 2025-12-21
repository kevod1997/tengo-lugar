# Claude Code Prompt Guide - Tengo Lugar

**How to effectively guide Claude Code using our Progressive Disclosure documentation system.**

---

## Table of Contents

1. [Introduction](#introduction)
2. [Understanding the Documentation Layers](#understanding-the-documentation-layers)
3. [Effective Prompting Patterns](#effective-prompting-patterns)
4. [Workflow Examples](#workflow-examples)
5. [Best Practices](#best-practices)
6. [Anti-Patterns](#anti-patterns)
7. [Forcing Context with `#` Shortcut](#forcing-context-with--shortcut)
8. [Quick Reference Table](#quick-reference-table)

---

## Introduction

This guide teaches you how to write effective prompts for Claude Code to maximize productivity and code quality when working with the Tengo Lugar codebase.

**Why this matters**: Claude Code has access to a sophisticated 4-layer documentation system. The more specific your prompts, the better Claude can leverage this documentation to follow project patterns and produce high-quality code.

---

## Understanding the Documentation Layers

Claude Code loads documentation in layers based on Progressive Disclosure principles:

### Layer 1: Always Loaded (Auto-loaded at startup)
- **`.claude/CLAUDE.md`** - Project overview, tech stack, structure
- **`.claude/rules/*.md`** - 10 rule files with mandatory patterns
  - Global rules (security, performance, error-handling)
  - Path-specific rules (loaded when editing matching files)

### Layer 2: Problem-Based Navigation (Load on-demand)
- **`docs/agent/INDEX.md`** - Start here for specific problems
  - Maps problems → solution paths
  - 11 common problems with quick fixes
  - Decision trees for common choices

### Layer 3: Implementation Patterns (Load when referenced)
- **`docs/agent/patterns/*.md`** - Detailed how-to guides (200-600 lines each)
  - Step-by-step implementation templates
  - Code examples (✅ good, ❌ bad)
  - Common mistakes sections

### Layer 4: Reference & Debugging (Load when needed)
- **`docs/agent/reference/*.md`** - Complete reference materials
- **`docs/agent/operations/*.md`** - Troubleshooting & monitoring
- **`docs/agent/standards/*.md`** - Code quality & style

**Key Insight**: Claude Code automatically loads Layer 1. You guide Claude to the right documentation in Layers 2-4 through your prompts.

---

## Effective Prompting Patterns

### Pattern 1: Feature Implementation

**Template**:
```
Implement [FEATURE] following the patterns in docs/agent/patterns/[PATTERN].md.
Requirements:
- [Requirement 1]
- [Requirement 2]
- [Requirement 3]
```

**Bad Example** ❌:
```
Create a server action to create trips
```

**Good Example** ✅:
```
Implement a server action to create new trips following the pattern in
docs/agent/patterns/server-actions.md. Requirements:
- Authenticate with requireAuthentication()
- Validate input with Zod schema
- Use Prisma transaction
- Handle errors with ApiHandler
- Invalidate cache after creation
```

**Why it works**: Specific file reference, clear requirements list, follows established patterns.

---

### Pattern 2: Debugging Issues

**Template**:
```
I'm experiencing [PROBLEM]. Use docs/agent/INDEX.md to find the troubleshooting
path and diagnose before suggesting solutions.
```

**Bad Example** ❌:
```
My authentication isn't working, fix it
```

**Good Example** ✅:
```
I'm experiencing authentication failures when calling Server Actions. Use
docs/agent/INDEX.md under "My authentication is failing" to diagnose the problem
systematically before suggesting fixes.
```

**Why it works**: References INDEX.md for systematic approach, describes symptoms clearly.

---

### Pattern 3: Code Refactoring

**Template**:
```
Refactor [CODE/FILE] to comply with standards in docs/agent/standards/[STANDARD].md
and patterns in docs/agent/patterns/[PATTERN].md.
```

**Bad Example** ❌:
```
Clean up this code
```

**Good Example** ✅:
```
Refactor src/actions/trip-actions.ts to comply with:
- docs/agent/standards/code-quality.md
- docs/agent/patterns/server-actions.md
Focus on: proper error handling, specific Prisma selects, and consistent response format.
```

**Why it works**: Specific files, specific standards, focused scope.

---

### Pattern 4: Performance Optimization

**Template**:
```
Optimize [COMPONENT/QUERY] following performance rules in .claude/rules/performance-rules.md
and patterns in docs/agent/patterns/[PATTERN].md.
```

**Bad Example** ❌:
```
Make this faster
```

**Good Example** ✅:
```
Optimize the trip listing query in src/actions/trip-actions.ts following:
- .claude/rules/performance-rules.md (specific select requirement)
- docs/agent/patterns/database-patterns.md (N+1 prevention)
Target: Reduce query time from 500ms to <100ms.
```

**Why it works**: Specific target, references both rules and patterns, measurable goal.

---

### Pattern 5: Adding Tests

**Template**:
```
Create tests for [COMPONENT/FUNCTION] following testing patterns (if they exist)
and ensuring coverage of [SCENARIOS].
```

**Bad Example** ❌:
```
Write tests
```

**Good Example** ✅:
```
Create tests for src/actions/trip-actions.ts > createTrip function.
Scenarios to cover:
- Successful trip creation
- Validation errors (Zod schema)
- Authentication failures
- Authorization failures (non-driver trying to create)
- Database errors
```

**Why it works**: Specific function, comprehensive scenario list.

---

## Workflow Examples

### Workflow 1: Creating a New Server Action

**Context**: Need to implement a new feature with Server Action

**Step 1: Initial Prompt**
```
I need to implement a server action to allow users to cancel their trips.
Before implementing, review:
1. docs/agent/patterns/server-actions.md for the mandatory template
2. .claude/rules/server-actions-rules.md for critical requirements

Then implement following the template exactly.
```

**Claude's Action**:
- Reads server-actions.md pattern file
- Reads server-actions-rules.md (auto-loaded for src/actions/ files)
- Implements using mandatory template: Auth → Validation → Transaction → Response

**Step 2: Follow-up** (if needed)
```
Add authorization check: only the driver who created the trip can cancel it.
Follow the "Owner-Only Access" pattern in .claude/rules/server-actions-rules.md.
```

**Expected Outcome**:
- Server action in `src/actions/trip-actions.ts`
- Follows mandatory template
- Includes authentication, validation, authorization, error handling
- Proper cache invalidation

**Verification**:
```
Run: npm run lint
Check: Authentication is first line
Check: Zod validation present
Check: revalidatePath() called after mutation
```

---

### Workflow 2: Fixing Authentication Bug

**Context**: Authentication errors in Server Actions

**Step 1: Initial Prompt**
```
I'm getting "Unauthorized" errors when calling Server Actions from my client components.
Use docs/agent/INDEX.md under "My authentication is failing" to diagnose the root cause.
```

**Claude's Action**:
- Reads INDEX.md → finds "My authentication is failing" section
- Follows solution path:
  1. Checks patterns in authentication.md
  2. Reviews troubleshooting.md for auth errors
  3. Verifies environment-vars.md for config
- Diagnoses likely causes

**Step 2: Claude's Diagnosis**
```
Checking:
- ✅ requireAuthentication() is present
- ❌ BETTER_AUTH_SECRET might not be set
- ❌ Cookies might not be configured correctly

Diagnosis: [...specifics based on code analysis...]
```

**Expected Outcome**: Systematic diagnosis following documented troubleshooting path

**Verification**: Check that auth errors are resolved

---

### Workflow 3: Optimizing Slow Database Queries

**Context**: Dashboard loads slowly (N+1 query problem)

**Step 1: Initial Prompt**
```
The trip dashboard at src/app/(authenticated)/trips/page.tsx is loading slowly (2-3 seconds).
Diagnose using:
1. docs/agent/INDEX.md under "Database queries are slow"
2. .claude/rules/performance-rules.md for critical violations
3. docs/agent/patterns/database-patterns.md for optimization patterns

Then fix the performance issues.
```

**Claude's Action**:
- Reviews INDEX.md for systematic approach
- Checks performance-rules.md for violations
- Analyzes code for N+1 queries, missing selects
- Implements optimizations from database-patterns.md

**Step 2: Implementation**
```
Implement the fixes you identified. Ensure:
- Specific Prisma select (not fetching all fields)
- Includes for relations (no N+1)
- Pagination with take/skip
```

**Expected Outcome**:
- Optimized Prisma query with specific select
- Relations loaded with include
- Pagination implemented
- Query time reduced to <200ms

**Verification**:
```
Check: Query returns only needed fields
Check: No N+1 in Prisma logs
Measure: Query execution time
```

---

### Workflow 4: Implementing Real-time Chat Feature

**Context**: Need to add real-time chat between driver and passenger

**Step 1: Initial Prompt**
```
I need to implement real-time chat between drivers and passengers for active trips.
Review docs/agent/features/realtime-chat.md for the complete implementation pattern.

Implementation checklist:
- WebSocket connection setup
- Message persistence in database
- JWT authentication for WebSocket
- Redis pub/sub for multi-server
```

**Claude's Action**:
- Reads realtime-chat.md comprehensive guide
- Reviews websocket-notifications.md for WebSocket patterns
- Implements full chat system following documented patterns

**Expected Outcome**:
- WebSocket server setup
- Chat message Server Actions
- Real-time message delivery
- Message persistence
- Authentication via JWT

**Verification**: Test chat between driver and passenger in active trip

---

## Best Practices

### 1. Be Specific with File Paths
✅ `docs/agent/patterns/server-actions.md`
❌ `"the server actions doc"`

### 2. Reference Specific Sections
✅ `Follow the "Owner-Only Access" pattern in .claude/rules/server-actions-rules.md`
❌ `Use the authorization pattern`

### 3. Use INDEX.md for Problem Navigation
✅ `Use docs/agent/INDEX.md to find the troubleshooting path for this issue`
❌ `Figure out what's wrong`

### 4. Trust the Auto-Loaded Rules
✅ `Follow the mandatory template (Claude knows it's in rules/)`
❌ `Make sure to authenticate, validate, handle errors, etc.` (redundant)

### 5. Request Adherence to Patterns
✅ `Follow the exact template in server-actions.md`
❌ `Create a server action however you think is best`

### 6. Include Non-Functional Requirements
✅ `Must handle errors with ApiHandler and include proper logging context`
❌ `Create the endpoint` (missing quality requirements)

### 7. Request Tests When Appropriate
✅ `Include tests covering success, validation errors, and auth failures`
❌ `Just implement the feature` (no quality checks)

---

## Anti-Patterns

### ❌ Anti-Pattern 1: Vague Feature Request
```
Create a server action
```
**Problem**: No context on what it does, what patterns to follow
**Fix**: Specify purpose, requirements, and pattern references

---

### ❌ Anti-Pattern 2: No Documentation Reference
```
Add authentication to this route
```
**Problem**: Claude doesn't know which auth pattern to use
**Fix**: `Follow authentication.md patterns and use requireAuthentication()`

---

### ❌ Anti-Pattern 3: Assuming Claude Remembers
```
Fix it like we did last time
```
**Problem**: Claude has no memory across sessions
**Fix**: Reference specific files or patterns explicitly

---

### ❌ Anti-Pattern 4: Generic Optimization Request
```
Optimize the code
```
**Problem**: No specific target, might violate established patterns
**Fix**: Specify what to optimize and reference performance-rules.md

---

### ❌ Anti-Pattern 5: Debugging Without Guidance
```
This is broken, fix it
```
**Problem**: No systematic approach, might miss root cause
**Fix**: `Use INDEX.md to diagnose systematically`

---

## Forcing Context with `#` Shortcut

Sometimes Claude Code doesn't automatically load the right path-specific rules (e.g., when planning a feature before creating files). Use the `#` shortcut to force load specific rule files.

### Syntax

```
# @.claude/rules/[filename].md
[Your prompt here]
```

### Example 1: Force Server Actions Rules

```
# @.claude/rules/server-actions-rules.md
Plan a server action to handle trip cancellations
```

**Effect**: Loads server-actions-rules.md even though you're not editing a file in `src/actions/` yet.

**When to use**: During planning phase, before files are created.

---

### Example 2: Force Database Rules

```
# @.claude/rules/database-rules.md
Review this Prisma query and suggest optimizations
```

**Effect**: Loads database-rules.md with performance patterns and N+1 prevention rules.

**When to use**: When analyzing queries outside of database files.

---

### Example 3: Multiple Context Loading

```
# @.claude/rules/server-actions-rules.md
# @.claude/rules/authentication-rules.md
Implement a protected server action that requires admin role
```

**Effect**: Loads both server-actions AND authentication rules for complete context.

**When to use**: When task spans multiple domains.

---

### When to Use the `#` Shortcut

- ✅ Planning features (before files exist)
- ✅ Need rules from multiple domains simultaneously
- ✅ Claude seems to not follow path-specific rules
- ✅ At start of session to "pre-load" important context
- ✅ Code review of files outside their normal directories

### When NOT to Use

- ❌ Editing existing files (path-specific rules auto-load)
- ❌ Global rules (always loaded automatically)
- ❌ When the documentation link is sufficient

---

## Quick Reference Table

| Task | Prompt Template | Docs to Reference | Auto-Loaded Rules |
|------|----------------|-------------------|-------------------|
| **New Server Action** | `Implement server action for [X] following docs/agent/patterns/server-actions.md` | server-actions.md, authentication.md | server-actions-rules.md, security-rules.md |
| **Fix Auth Bug** | `Diagnose auth problem in [X] using docs/agent/INDEX.md under "authentication failing"` | authentication.md, troubleshooting.md | authentication-rules.md, security-rules.md |
| **Optimize Query** | `Optimize query in [X] following docs/agent/patterns/database-patterns.md` | database-patterns.md | database-rules.md, performance-rules.md |
| **Add File Upload** | `Implement file upload for [X] per docs/agent/patterns/file-uploads.md` | file-uploads.md, server-actions.md | server-actions-rules.md |
| **Create Background Job** | `Create Inngest function for [X] following docs/agent/patterns/background-jobs.md` | background-jobs.md, notifications.md | background-jobs-rules.md |
| **Add Caching** | `Implement Redis cache for [X] per docs/agent/patterns/caching-patterns.md` | caching-patterns.md | performance-rules.md |
| **Fix TypeScript Error** | `Resolve type error in [X] per docs/agent/standards/code-quality.md` | code-quality.md | (none - global TypeScript rules) |
| **Refactor for Quality** | `Refactor [X] to meet standards in docs/agent/standards/code-quality.md` | code-quality.md, code-style.md | (depends on file type) |
| **Add State Management** | `Implement state for [X] following docs/agent/patterns/state-management.md` | state-management.md, data-fetching.md | state-management-rules.md |
| **Debug Performance** | `Performance issue in [X]. Diagnose via docs/agent/INDEX.md "Database queries are slow"` | database-patterns.md, monitoring.md | performance-rules.md |

---

## Summary

**Keys to effective prompting**:

1. **Reference specific documentation files** - Don't make Claude guess
2. **Use INDEX.md for problem diagnosis** - Systematic approach
3. **Trust auto-loaded rules** - Layer 1 is always in context
4. **Be specific about requirements** - List expectations clearly
5. **Use the `#` shortcut when needed** - Force context during planning
6. **Include non-functional requirements** - Security, performance, testing
7. **Request pattern adherence** - "Follow the exact template in X"

**The more specific your prompt, the better Claude Code can leverage the 4-layer documentation system to produce high-quality, pattern-compliant code.**

---

For more information on the documentation system, see:
- [claude-memory-guide.md](claude-memory-guide.md) - How memory works
- [.claude/rules/README.md](../.claude/rules/README.md) - Rule system explanation
- [INDEX.md](agent/INDEX.md) - Problem-based navigation
