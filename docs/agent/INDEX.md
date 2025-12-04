# Documentation Quick Reference

Problem-based navigation guide for Tengo Lugar documentation.

---

## Common Problems & Solutions

### "My authentication is failing"

**Symptoms**: Session errors, unauthorized access, cookie issues

**Solution path**:
1. **Check patterns**: [authentication.md](patterns/authentication.md) - Helper usage, session management
2. **Debug**: [troubleshooting.md](operations/troubleshooting.md#authentication-errors) - Common auth issues
3. **Verify config**: [environment-vars.md](reference/environment-vars.md#better-auth) - Required auth variables

**Quick fixes**:
- Using `requireAuthentication()` before data operations?
- `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` set correctly?
- Cookies enabled in browser?

---

### "Database queries are slow"

**Symptoms**: Page load times > 1s, N+1 query warnings, timeouts

**Solution path**:
1. **Optimize queries**: [database-patterns.md](patterns/database-patterns.md#performance-rules) - Efficient Prisma patterns
2. **Monitor**: [monitoring.md](operations/monitoring.md#prisma-studio) - Prisma Studio, query logging
3. **Cache**: [caching-patterns.md](patterns/caching-patterns.md) - Redis caching strategies
4. **Debug**: [troubleshooting.md](operations/troubleshooting.md#n1-queries) - N+1 detection and fixes

**Quick fixes**:
- Using specific `select` instead of fetching all fields?
- Using `include` efficiently (avoid nested includes)?
- Queries inside loops? (N+1 problem)

---

### "Chat messages not delivering"

**Symptoms**: Messages sent but not received, connection issues, token errors

**Solution path**:
1. **WebSocket setup**: [websocket-notifications.md](features/websocket-notifications.md) - Connection management
2. **Chat implementation**: [realtime-chat.md](features/realtime-chat.md) - Message flow, JWT tokens
3. **Debug**: [troubleshooting.md](operations/troubleshooting.md#websocket-issues) - Connection debugging

**Quick fixes**:
- WebSocket service running? (separate service)
- Valid JWT token in connection?
- Redis pub/sub configured correctly?

---

### "Server Actions not working"

**Symptoms**: Form submissions failing, validation errors, unexpected responses

**Solution path**:
1. **Template**: [server-actions.md](patterns/server-actions.md) - Complete implementation pattern
2. **Auth**: [authentication.md](patterns/authentication.md) - Session validation
3. **Errors**: [troubleshooting.md](operations/troubleshooting.md#server-actions) - Common SA issues

**Quick fixes**:
- Following Auth → Validation → Transaction → Response pattern?
- Using `ApiHandler.handleError()` for errors?
- Zod schema matches input data?

---

### "File uploads failing"

**Symptoms**: S3 errors, large files rejected, image quality issues

**Solution path**:
1. **Implementation**: [file-uploads.md](patterns/file-uploads.md) - S3 upload patterns, Sharp optimization
2. **Config**: [environment-vars.md](reference/environment-vars.md#aws) - AWS credentials
3. **Debug**: [troubleshooting.md](operations/troubleshooting.md#file-uploads) - Upload issues

**Quick fixes**:
- AWS credentials configured correctly?
- File size within limits? (check Sharp compression)
- S3 bucket permissions set?

---

### "Background jobs not executing"

**Symptoms**: Inngest functions not triggering, cron jobs skipped, workflow errors

**Solution path**:
1. **Patterns**: [background-jobs.md](patterns/background-jobs.md) - Inngest implementation
2. **Notifications**: [notifications.md](patterns/notifications.md) - `sendSystemNotification` usage
3. **Debug**: [troubleshooting.md](operations/troubleshooting.md#inngest) - Job debugging

**Quick fixes**:
- Using `sendSystemNotification()` (not user notifications in Inngest)?
- Email delays (45s) between sends?
- Inngest dashboard shows job execution?

---

### "Caching not working"

**Symptoms**: Slow external API calls, cache misses, stale data

**Solution path**:
1. **Patterns**: [caching-patterns.md](patterns/caching-patterns.md) - Redis implementation
2. **Server Actions**: [server-actions.md](patterns/server-actions.md#cache-invalidation) - Cache invalidation
3. **Monitor**: [monitoring.md](operations/monitoring.md#redis-cli) - Redis CLI debugging

**Quick fixes**:
- Redis connection configured? (`REDIS_URL`)
- TTL set appropriately for data type?
- Cache keys consistent?

---

### "React Query not updating"

**Symptoms**: Stale UI data, mutations not reflecting, infinite loading

**Solution path**:
1. **Patterns**: [data-fetching.md](patterns/data-fetching.md) - React Query setup
2. **Mutations**: [data-fetching.md](patterns/data-fetching.md#mutations) - Optimistic updates
3. **State**: [state-management.md](patterns/state-management.md) - Don't use Zustand for server state

**Quick fixes**:
- Invalidating queries after mutations?
- Query keys consistent?
- Using React Query for server state (not Zustand)?

---

### "TypeScript errors everywhere"

**Symptoms**: Type errors, `any` complaints, Prisma type issues

**Solution path**:
1. **Standards**: [code-quality.md](standards/code-quality.md) - TypeScript best practices
2. **Database**: [database-patterns.md](patterns/database-patterns.md#type-safety) - Prisma type safety
3. **Schema**: [database-schema.md](reference/database-schema.md) - Data model reference

**Quick fixes**:
- Prisma client generated? (`npm run prisma:generate`)
- Using proper type guards?
- Avoiding `any` types?

---

### "Environment variables not loading"

**Symptoms**: `undefined` values, connection failures, missing config

**Solution path**:
1. **Reference**: [environment-vars.md](reference/environment-vars.md) - All environment variables
2. **Setup**: See CLAUDE.md "First Time Setup" - Minimum required vars
3. **Debug**: Check `.env` file exists in project root

**Quick fixes**:
- `.env` file in project root?
- Server restarted after `.env` changes?
- Variables prefixed with `NEXT_PUBLIC_` for client-side access?

---

## Feature Implementation Guides

### Implementing Authentication
→ [authentication.md](patterns/authentication.md), [server-actions.md](patterns/server-actions.md)

### Working with Database
→ [database-patterns.md](patterns/database-patterns.md), [database-schema.md](reference/database-schema.md)

### Adding Caching
→ [caching-patterns.md](patterns/caching-patterns.md)

### Building Real-time Features
→ [realtime-chat.md](features/realtime-chat.md), [websocket-notifications.md](features/websocket-notifications.md)

### File Upload Features
→ [file-uploads.md](patterns/file-uploads.md)

### Background Processing
→ [background-jobs.md](patterns/background-jobs.md), [notifications.md](patterns/notifications.md)

### Frontend Data Management
→ [data-fetching.md](patterns/data-fetching.md), [state-management.md](patterns/state-management.md)

---

## Reference Materials

### Tech Stack & Versions
→ [tech-stack.md](reference/tech-stack.md)

### All Commands
→ [commands.md](reference/commands.md)

### Database Schema
→ [database-schema.md](reference/database-schema.md)

### Environment Variables
→ [environment-vars.md](reference/environment-vars.md)

---

## Debugging Tools

### Prisma Studio (Database GUI)
```bash
npm run prisma:studio
```
Open http://localhost:5555 to browse data

### Redis CLI (Cache Inspection)
```bash
redis-cli
> KEYS *
> GET key_name
```

### Inngest Dashboard
Check http://localhost:8288 (local dev) for job execution

### React Query Devtools
Automatically available in dev mode (bottom-left icon)

---

## Quick Decision Trees

### "Should I use React Query or Zustand?"
- **Server state** (from database/API)? → React Query
- **Client state** (UI toggles, forms)? → Zustand

### "Should I use `sendNotification` or `sendSystemNotification`?"
- **Inside Inngest** (background job)? → `sendSystemNotification`
- **Inside Server Action** (with session)? → `sendNotification`

### "Should I use transactions?"
- **Multiple related DB operations** that must succeed/fail together? → Yes, use `$transaction`
- **Single operation**? → No, regular Prisma query

### "Should I cache this?"
- **External API call** (MercadoPago, etc.)? → Yes, cache in Redis
- **Database query**? → Usually no, Prisma is fast enough
- **Expensive computation**? → Yes, cache result

---

## Getting Help

1. **Search this INDEX** for your problem type
2. **Check troubleshooting.md** for common issues
3. **Read relevant pattern docs** for implementation details
4. **Use monitoring tools** to debug (Prisma Studio, Redis CLI)
5. **Ask questions** if patterns are unclear
