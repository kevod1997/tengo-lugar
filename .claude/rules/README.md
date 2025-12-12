# Claude Code Rules System

This directory contains implementation rules that Claude Code automatically loads into its context.

## What Are Rule Files?

Rule files are markdown documents that provide **mandatory implementation patterns** and **critical constraints** for the Tengo Lugar codebase. Unlike documentation files in `docs/agent/`, these rules are:

- **Always loaded**: Claude Code loads all rule files automatically at startup
- **Prescriptive**: They tell you what you MUST do, not just how to do it
- **Concise**: Brief rules with links to detailed documentation
- **Enforceable**: Path-specific rules activate based on files being edited

## Rules vs. Documentation

| Aspect | `.claude/rules/` | `docs/agent/patterns/` |
|--------|------------------|------------------------|
| Purpose | MUST/NEVER rules | How-to implementation guides |
| Loaded | Automatically | On-demand when referenced |
| Length | Brief (50-150 lines) | Comprehensive (200-600 lines) |
| Content | Rules + quick examples | Detailed patterns + code examples |
| Tone | Prescriptive ("NEVER do X") | Descriptive ("Here's how to do X") |

## File Types

### Global Rules (Always Active)

These files apply to ALL code in the project:

- `security-rules.md` - Security best practices (auth, input validation, cookies)
- `performance-rules.md` - Performance requirements (Prisma, caching, React Query)
- `error-handling-rules.md` - Error handling patterns (ApiHandler, logging)

### Path-Specific Rules (Conditional)

These files activate only when working in specific directories:

- `server-actions-rules.md` - For `src/actions/**`
- `services-rules.md` - For `src/services/**`
- `database-rules.md` - For `prisma/**, src/lib/prisma.ts`
- `state-management-rules.md` - For `src/store/**, src/hooks/**, src/components/**`
- `authentication-rules.md` - For `src/middleware.ts, layouts, auth-helper.ts`
- `background-jobs-rules.md` - For `src/inngest/**`

## How Path-Specific Rules Work

Each rule file has YAML frontmatter specifying when it applies:

```yaml
---
paths: src/actions/**/*.ts
---
```

Claude Code automatically loads these rules when you:
- Read files matching the pattern
- Edit files matching the pattern
- Create new files in those directories

## Contributing New Rules

When adding new rules:

1. **Use valid YAML frontmatter** - REQUIRED for all files
   - Global: `---\n# Global rules\n---`
   - Path-specific: `---\npaths: pattern/**\n---`

2. **Keep it brief** - Rules should be scannable (50-150 lines)

3. **Link to detailed docs** - Reference `docs/agent/patterns/` for how-to guides

4. **Use clear markers**:
   - 🔴 **CRITICAL** - Never violate
   - 🟡 **MANDATORY** - Always follow
   - ✅ **RECOMMENDED** - Best practice

5. **Include examples** - Show minimal working examples inline

6. **Add to this README** - Document what the file covers

## Relationship with CLAUDE.md

```
CLAUDE.md (root)          → High-level project overview
    ↓
.claude/rules/*.md        → Detailed implementation rules (auto-loaded)
    ↓
docs/agent/INDEX.md       → Problem-based navigation
    ↓
docs/agent/patterns/*.md  → Comprehensive how-to guides (loaded on-demand)
```

## Verifying Rules Are Loaded

Run this command in Claude Code to see all loaded memory files:

```
/memory
```

You should see:
- `CLAUDE.md` (project root)
- All files in `.claude/rules/`
- Path-specific rules when working in matching directories

## Questions?

See [docs/claude-memory-guide.md](../../docs/claude-memory-guide.md) for complete documentation on how Claude Code's memory system works.
