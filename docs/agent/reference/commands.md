# Development Commands Reference

## Development Server

### Start Development Server
```bash
npm run dev
```
- Starts Next.js development server with Turbo
- Hot reload enabled
- Runs on http://localhost:3000
- Environment: development

### Start Development Server with HTTPS
```bash
npm run dev:https
```
- Development server with HTTPS enabled
- Required for testing some features (PWA, service workers, camera access)
- Self-signed certificate

---

## Build & Production

### Production Build
```bash
npm run build
```
- Creates optimized production build
- Type checking
- Linting
- Asset optimization
- Static page generation

### Start Production Server
```bash
npm run start
```
- Starts Next.js in production mode
- Requires `npm run build` first
- Runs on http://localhost:3000
- Environment: production

---

## Code Quality

### Run ESLint
```bash
npm run lint
```
- Lints all files
- Uses Next.js ESLint configuration
- TypeScript-aware rules
- Reports errors and warnings

### Run ESLint with Auto-fix
```bash
npm run lint -- --fix
```
- Lints and automatically fixes issues
- Some issues may require manual fixing

---

## Database Operations

### Generate Prisma Client
```bash
npm run prisma:generate
```
- Generates Prisma Client based on schema
- Required after schema changes
- Updates TypeScript types
- Must run before building

### Create Migration
```bash
npm run prisma:migrate
```
- Creates a new migration from schema changes
- Prompts for migration name
- Applies migration to database
- Updates Prisma Client

Full command:
```bash
npx prisma migrate dev --name <migration_name>
```

### Deploy Migrations (Production)
```bash
npm run prisma:deploy
```
- Applies pending migrations to production database
- Does not create new migrations
- Safe for production use
- No prompts

### Open Prisma Studio
```bash
npm run prisma:studio
```
- Opens Prisma Studio GUI
- Browse and edit database records
- Runs on http://localhost:5555
- Visual database management

### Reset Database (Development Only)
```bash
npx prisma migrate reset
```
- ⚠️ **WARNING**: Deletes all data
- Drops database
- Recreates database
- Applies all migrations
- Runs seed if configured

### View Prisma Schema
```bash
npx prisma format
```
- Formats Prisma schema file
- Auto-organizes models
- Adds proper indentation

---

## Database Seeding

### Run Seed Script
```bash
npm run seed
```
- Populates database with initial data
- Useful for development/testing
- Script location: `prisma/seed.ts` (if configured)

---

## TypeScript

### Type Check
```bash
npx tsc --noEmit
```
- Runs TypeScript compiler without emitting files
- Checks for type errors
- Faster than full build

---

## Dependency Management

### Install Dependencies
```bash
npm install
```
- Installs all dependencies from package.json
- Creates/updates package-lock.json

### Install Specific Package
```bash
npm install <package_name>
```
- Installs package as dependency
- Updates package.json

### Install Dev Dependency
```bash
npm install --save-dev <package_name>
```
- Installs package as dev dependency
- Only used in development

### Update Dependencies
```bash
npm update
```
- Updates all packages to latest allowed versions
- Respects semver ranges in package.json

### Check Outdated Packages
```bash
npm outdated
```
- Shows packages that have newer versions available

---

## Environment & Configuration

### Copy Environment Template
```bash
cp .env.example .env.local
```
- Creates local environment file
- Customize with your values
- Never commit .env.local

---

## Inngest (Background Jobs)

### Inngest Dev Server
```bash
npx inngest-cli dev
```
- Starts local Inngest development server
- View and test background jobs
- Runs on http://localhost:8288

---

## Git Operations

### Initialize Git Repository
```bash
git init
```

### Check Status
```bash
git status
```

### Stage Changes
```bash
git add .
```

### Commit Changes
```bash
git commit -m "commit message"
```

### Push Changes
```bash
git push origin <branch_name>
```

---

## Docker (If Configured)

### Build Docker Image
```bash
docker build -t tengo-lugar .
```

### Run Docker Container
```bash
docker run -p 3000:3000 tengo-lugar
```

### Docker Compose Up
```bash
docker-compose up -d
```

### Docker Compose Down
```bash
docker-compose down
```

---

## Testing (When Configured)

### Run Unit Tests
```bash
npm run test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run E2E Tests
```bash
npm run test:e2e
```

---

## Cleanup & Maintenance

### Clean Build Artifacts
```bash
rm -rf .next
rm -rf node_modules/.cache
```

### Reinstall Dependencies
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

### Clear Next.js Cache
```bash
rm -rf .next/cache
```

---

## Useful Command Combinations

### Full Clean Install
```bash
rm -rf node_modules package-lock.json .next
npm install
npm run prisma:generate
npm run build
```

### Database Reset and Seed
```bash
npx prisma migrate reset --force
npm run seed
```

### Pre-deployment Check
```bash
npm run lint
npx tsc --noEmit
npm run build
```

### After Pulling Changes
```bash
npm install
npm run prisma:generate
npm run prisma:migrate
```

---

## Environment-Specific Commands

### Development
```bash
# Recommended development workflow
npm run dev                  # Start dev server
npm run prisma:studio        # Open database GUI (separate terminal)
npx inngest-cli dev          # Start Inngest dev server (if using background jobs)
```

### Before Committing
```bash
npm run lint                 # Check for linting errors
npx tsc --noEmit            # Check for type errors
npm run build               # Ensure build succeeds
```

### Production Deployment
```bash
npm install --production     # Install only production dependencies
npm run build               # Build for production
npm run prisma:deploy       # Apply database migrations
npm run start               # Start production server
```

---

## Troubleshooting Commands

### Fix Prisma Client Issues
```bash
npm run prisma:generate
rm -rf node_modules/.prisma
npm run prisma:generate
```

### Fix Type Errors
```bash
rm -rf node_modules
rm package-lock.json
npm install
npm run prisma:generate
```

### Fix Build Issues
```bash
rm -rf .next
npm run build
```

### Check Node Version
```bash
node --version
# Should be 18.x or higher
```

### Check npm Version
```bash
npm --version
```

---

## Related Documentation

- [Tech Stack](tech-stack.md) - Technologies used
- [Environment Variables](environment-vars.md) - Configuration
- [Troubleshooting](../operations/troubleshooting.md) - Common issues
