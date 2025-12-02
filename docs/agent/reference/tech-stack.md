# Technology Stack

## Core Framework & Languages

### Next.js 15
- App Router architecture
- Server Actions for backend logic
- React Server Components
- Incremental Static Regeneration (ISR)
- Image Optimization

### TypeScript
- Strict mode enabled
- No implicit any
- Type-safe database operations with Prisma
- Full type coverage across codebase

### React 19
- Server Components by default
- Async components support
- Enhanced hooks (useOptimistic, useFormStatus)
- Automatic batching
- Transitions

---

## Authentication & Security

### better-auth 1.2.5
- Session management
- Cookie-based authentication
- Social authentication (Google, Facebook)
- Email verification
- CSRF protection
- Secure password hashing

### Security Features
- JWT tokens with JWKS for external integrations
- Role-based authorization (admin/user)
- Secure session cookies
- HTTPS-only cookies in production
- XSS protection
- SQL injection prevention (Prisma)

---

## Database & Caching

### PostgreSQL
- Primary database
- ACID compliance
- Complex queries with joins
- Full-text search capabilities
- JSON column support

### Prisma ORM
- Type-safe database client
- Schema migrations
- Relationship management
- Query optimization
- Connection pooling

### @upstash/redis
- REST-based Redis client
- Edge-compatible
- Serverless-friendly
- HTTP-based communication

### ioredis
- TCP-based Redis client
- Pub/Sub support
- Pipeline operations
- Cluster support
- Better performance for server-side operations

---

## State Management & Data Fetching

### @tanstack/react-query 5.64.1
- Server state management
- Automatic caching
- Background refetching
- Optimistic updates
- Infinite queries
- Pagination support
- Query invalidation
- Devtools integration

### Zustand 5.0.3
- Client-side global state
- Minimal boilerplate
- No providers needed
- Persist middleware
- Devtools middleware
- TypeScript support

### React Hook Form 7.53.2
- Form state management
- Validation
- Error handling
- Field arrays
- Performance optimization

### @hookform/resolvers
- Zod resolver integration
- Yup resolver support
- Schema validation
- Type-safe forms

---

## UI & Styling

### shadcn/ui
- Accessible components
- Customizable
- Built on Radix UI
- Tailwind CSS based
- Copy-paste components
- No npm package dependency

### Tailwind CSS
- Utility-first CSS
- JIT compiler
- Custom design system
- Responsive design
- Dark mode support

### Radix UI
- Unstyled accessible components
- WAI-ARIA compliant
- Keyboard navigation
- Focus management
- Screen reader support

### Motion 12 (Framer Motion)
- Animation library
- Declarative animations
- Gestures support
- Layout animations
- SVG animations

### Sonner
- Toast notifications
- Promise handling
- Custom styles
- Action buttons
- Duration control

---

## File Handling & External Services

### AWS S3
- File storage
- Public/private buckets
- Presigned URLs
- Multipart uploads
- Lifecycle policies

### @aws-sdk/client-s3
- S3 client for Node.js
- Upload/download operations
- Object management
- Bucket operations

### @aws-sdk/s3-request-presigner
- Generate presigned URLs
- Temporary access to objects
- Upload/download URLs
- Security without exposing credentials

### Sharp
- Image processing
- Resize, crop, rotate
- Format conversion
- Quality optimization
- WebP/AVIF support
- Metadata extraction

### pdf-lib
- PDF manipulation
- Create PDFs
- Modify existing PDFs
- Extract pages
- Merge PDFs
- Add metadata

### React Dropzone
- Drag & drop file upload
- File type validation
- Size validation
- Multiple files
- Custom UI

### react-easy-crop
- Image cropping
- Zoom support
- Rotation
- Aspect ratio control
- Touch gestures

### Google Maps API (@googlemaps/google-maps-services-js)
- Geocoding
- Distance matrix
- Directions
- Places API
- Autocomplete

### Resend
- Email delivery service
- Transactional emails
- Email templates
- Analytics
- Webhooks
- API-first approach

---

## Background Jobs & Validation

### Inngest 3.32.7
- Background job orchestration
- Step functions
- Cron jobs
- Event-driven workflows
- Retries and error handling
- Function composition
- Visual debugging
- Local development support

### Zod 3.24.2
- Runtime validation
- TypeScript type inference
- Schema composition
- Error messages
- Transformations
- Async validation
- Refinements

### libphonenumber-js
- Phone number validation
- International format parsing
- Country code detection
- Number formatting
- Number type detection

---

## Development Tools

### ESLint
- Code linting
- Next.js specific rules
- TypeScript support
- Custom rules
- Auto-fix capabilities

### Prettier (Recommended)
- Code formatting
- Consistent style
- Integrates with ESLint

### TypeScript ESLint
- TypeScript-specific linting
- Type-aware rules
- Import organization

---

## Build & Deployment

### Turbopack
- Next.js bundler
- Fast refresh
- Incremental compilation
- Better performance than Webpack

### Node.js
- Runtime environment
- Version: 18.x or higher recommended
- ES Modules support

---

## Testing (Recommended to Add)

Currently not configured, but recommended:

### Unit Testing
- **Jest** - Test runner
- **React Testing Library** - Component testing

### E2E Testing
- **Playwright** - End-to-end testing
- **Cypress** - Alternative E2E framework

---

## Monitoring & Observability (Recommended to Add)

Currently not configured, but recommended:

### Error Tracking
- **Sentry** - Error monitoring
- **LogRocket** - Session replay

### Analytics
- **Vercel Analytics** - Web analytics
- **Google Analytics** - User tracking

### Performance
- **Vercel Speed Insights** - Core Web Vitals
- **Lighthouse CI** - Performance monitoring

---

## Package Manager

### npm
- Default package manager
- Lock file: package-lock.json
- Scripts defined in package.json

---

## Version Overview

| Package | Version | Purpose |
|---------|---------|---------|
| Next.js | 15 | Framework |
| React | 19 | UI Library |
| TypeScript | Latest | Type Safety |
| Prisma | Latest | Database ORM |
| better-auth | 1.2.5 | Authentication |
| @tanstack/react-query | 5.64.1 | Server State |
| Zustand | 5.0.3 | Client State |
| React Hook Form | 7.53.2 | Forms |
| Inngest | 3.32.7 | Background Jobs |
| Zod | 3.24.2 | Validation |
| Motion | 12 | Animations |

---

## Related Documentation

- [Commands Reference](commands.md) - Development commands
- [Environment Variables](environment-vars.md) - Configuration
- [Database Schema](database-schema.md) - Database structure
