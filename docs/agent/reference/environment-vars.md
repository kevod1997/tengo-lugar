# Environment Variables Reference

## Quick Start - Minimum Required Variables

**For local development, you MUST set these variables:**

```bash
# Database (Required)
DATABASE_URL=postgresql://postgres:password@localhost:5432/tengo_lugar

# Authentication (Required)
BETTER_AUTH_SECRET=<generate with: openssl rand -base64 32>
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000

# AWS S3 (Required for file uploads)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_BUCKET_NAME=your-bucket-name
AWS_REGION=us-east-1
```

**Optional but recommended for full functionality:**
- Redis/Upstash (caching)
- MercadoPago (payments)
- Inngest (background jobs)
- Resend (emails)

**Full configuration details below** ↓

---

## Overview
Environment variables configure the application for different environments (development, staging, production).

**Files:**
- `.env.example` - Template with all required variables
- `.env.local` - Local development (not committed to git)
- `.env.production` - Production environment

---

## Database

### DATABASE_URL
```bash
DATABASE_URL=postgresql://user:password@host:port/database
```
- PostgreSQL connection string
- Used by Prisma
- **Required**: Yes
- **Example**: `postgresql://postgres:password@localhost:5432/tengo_lugar`

---

## Authentication

### BETTER_AUTH_SECRET
```bash
BETTER_AUTH_SECRET=your-secret-key
```
- Secret key for session encryption
- Generate: `openssl rand -base64 32`
- **Required**: Yes
- **Security**: Keep secret, never commit

### NEXT_PUBLIC_BETTER_AUTH_URL
```bash
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
```
- Base URL for authentication
- **Development**: `http://localhost:3000`
- **Production**: Your domain (e.g., `https://app.example.com`)
- **Required**: Yes
- **Public**: Yes (accessible in browser)

---

## Redis / Upstash

### UPSTASH_REDIS_REST_URL
```bash
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
```
- Upstash Redis REST endpoint
- Used for caching and pub/sub
- **Required**: Yes
- **Get from**: Upstash dashboard

### UPSTASH_REDIS_REST_TOKEN
```bash
UPSTASH_REDIS_REST_TOKEN=your-token
```
- Authentication token for Upstash Redis
- **Required**: Yes
- **Security**: Keep secret
- **Get from**: Upstash dashboard

### UPSTASH_REDIS_URL
```bash
UPSTASH_REDIS_URL=rediss://default:token@host:port
```
- TCP connection string for ioredis
- Used for pub/sub operations
- **Required**: Yes (if using ioredis)
- **Get from**: Upstash dashboard

---

## AWS S3

### AWS_ACCESS_KEY_ID
```bash
AWS_ACCESS_KEY_ID=your-access-key
```
- AWS IAM access key
- **Required**: Yes
- **Security**: Keep secret
- **Permissions**: S3 read/write access

### AWS_SECRET_ACCESS_KEY
```bash
AWS_SECRET_ACCESS_KEY=your-secret-key
```
- AWS IAM secret key
- **Required**: Yes
- **Security**: Keep secret, never commit

### AWS_REGION
```bash
AWS_REGION=us-east-1
```
- AWS region for S3 bucket
- **Required**: Yes
- **Example**: `us-east-1`, `eu-west-1`, `sa-east-1`

### AWS_S3_BUCKET_NAME
```bash
AWS_S3_BUCKET_NAME=your-bucket-name
```
- S3 bucket name for file storage
- **Required**: Yes
- **Must**: Create bucket first in AWS console

---

## External APIs

### GOOGLE_MAPS_API_KEY
```bash
GOOGLE_MAPS_API_KEY=your-api-key
```
- Google Maps API key
- Used for geocoding, directions
- **Required**: Yes (for trip features)
- **Get from**: Google Cloud Console
- **Enable**: Geocoding API, Directions API, Places API

### CAR_API_URL
```bash
CAR_API_URL=https://car-api.example.com
```
- External car information API
- Used for car models and brands
- **Required**: Yes (for car features)

### CAR_API_USERNAME
```bash
CAR_API_USERNAME=your-username
```
- Car API authentication username
- **Required**: Yes (if API requires auth)

### CAR_API_PASSWORD
```bash
CAR_API_PASSWORD=your-password
```
- Car API authentication password
- **Required**: Yes (if API requires auth)
- **Security**: Keep secret

---

## Email Services

### RESEND_API_KEY
```bash
RESEND_API_KEY=re_your_api_key
```
- Resend email service API key
- Used for transactional emails
- **Required**: Yes
- **Get from**: Resend dashboard
- **Security**: Keep secret

---

## Background Jobs

### INNGEST_EVENT_KEY
```bash
INNGEST_EVENT_KEY=your-event-key
```
- Inngest event key for sending events
- **Required**: Yes (for background jobs)
- **Get from**: Inngest dashboard

### INNGEST_SIGNING_KEY
```bash
INNGEST_SIGNING_KEY=your-signing-key
```
- Inngest signing key for webhook verification
- **Required**: Yes (for background jobs)
- **Security**: Keep secret
- **Get from**: Inngest dashboard

---

## Real-time Communication

### NEXT_PUBLIC_CHAT_API_URL
```bash
NEXT_PUBLIC_CHAT_API_URL=https://chat-api.example.com
```
- External chat service API URL
- **Required**: Yes (if using chat)
- **Public**: Yes (accessible in browser)

### NEXT_PUBLIC_CHAT_WEBSOCKET_URL
```bash
NEXT_PUBLIC_CHAT_WEBSOCKET_URL=wss://chat-ws.example.com
```
- Chat WebSocket server URL
- **Required**: Yes (if using chat)
- **Public**: Yes (accessible in browser)

### NEXT_PUBLIC_CLIENT_URL
```bash
NEXT_PUBLIC_CLIENT_URL=http://localhost:3000
```
- Client application URL
- Used for redirects and links
- **Required**: Yes
- **Public**: Yes

---

## WebSocket Notification Service

### WEBSOCKET_SERVER_URL
```bash
WEBSOCKET_SERVER_URL=wss://ws.example.com
```
- WebSocket notification server URL (backend)
- Used by server actions for authentication
- **Required**: Yes (if using WebSocket notifications)

### WEBSOCKET_USERNAME
```bash
WEBSOCKET_USERNAME=your-username
```
- WebSocket server authentication username
- **Required**: Yes (if WebSocket requires auth)
- **Security**: Keep secret

### WEBSOCKET_PASSWORD
```bash
WEBSOCKET_PASSWORD=your-password
```
- WebSocket server authentication password
- **Required**: Yes (if WebSocket requires auth)
- **Security**: Keep secret

### NEXT_PUBLIC_WEBSOCKET_SERVER_URL
```bash
NEXT_PUBLIC_WEBSOCKET_SERVER_URL=wss://ws.example.com
```
- WebSocket notification server URL (frontend)
- Used by client to connect
- **Required**: Yes (if using WebSocket notifications)
- **Public**: Yes (accessible in browser)

---

## Social Authentication

### GOOGLE_CLIENT_ID
```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```
- Google OAuth client ID
- **Required**: Optional (if using Google login)
- **Get from**: Google Cloud Console
- **Public**: Yes (used in browser)

### GOOGLE_CLIENT_SECRET
```bash
GOOGLE_CLIENT_SECRET=your-client-secret
```
- Google OAuth client secret
- **Required**: Optional (if using Google login)
- **Security**: Keep secret
- **Get from**: Google Cloud Console

### FACEBOOK_CLIENT_ID
```bash
FACEBOOK_CLIENT_ID=your-app-id
```
- Facebook App ID
- **Required**: Optional (if using Facebook login)
- **Get from**: Facebook Developers
- **Public**: Yes (used in browser)

### FACEBOOK_CLIENT_SECRET
```bash
FACEBOOK_CLIENT_SECRET=your-app-secret
```
- Facebook App secret
- **Required**: Optional (if using Facebook login)
- **Security**: Keep secret
- **Get from**: Facebook Developers

---

## Email Verification

### EMAIL_VERIFICATION_CALLBACK_URL
```bash
EMAIL_VERIFICATION_CALLBACK_URL=http://localhost:3000/auth/verify-email
```
- Callback URL after email verification
- **Required**: Yes (if using email verification)
- **Development**: `http://localhost:3000/auth/verify-email`
- **Production**: Your domain + path

---

## Optional / Development

### NODE_ENV
```bash
NODE_ENV=development
```
- Application environment
- **Values**: `development`, `production`, `test`
- **Default**: `development`
- **Set by**: Deployment platform usually

### PORT
```bash
PORT=3000
```
- Port for development server
- **Default**: 3000
- **Optional**: Yes

### NEXT_TELEMETRY_DISABLED
```bash
NEXT_TELEMETRY_DISABLED=1
```
- Disable Next.js telemetry
- **Optional**: Yes
- **Values**: `1` to disable

---

## Environment File Setup

### Create .env.local
```bash
# Copy example file
cp .env.example .env.local

# Edit with your values
nano .env.local
```

### Minimum Required Variables

For local development, you need at minimum:

```bash
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/tengo_lugar

# Authentication
BETTER_AUTH_SECRET=your-generated-secret
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000

# Redis
UPSTASH_REDIS_REST_URL=your-redis-url
UPSTASH_REDIS_REST_TOKEN=your-redis-token
UPSTASH_REDIS_URL=your-redis-tcp-url

# AWS S3
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-bucket

# Email
RESEND_API_KEY=your-resend-key
```

---

## Security Best Practices

### 1. Never Commit Secrets
```bash
# .gitignore should include:
.env.local
.env.*.local
.env.production
```

### 2. Use Strong Secrets
```bash
# Generate secure secrets
openssl rand -base64 32
```

### 3. Rotate Keys Regularly
- Change secrets periodically
- Especially after team member changes
- Use key management services in production

### 4. Limit Permissions
- AWS IAM: Only necessary S3 permissions
- API keys: Restrict to specific domains/IPs
- Database: Use separate users for different environments

### 5. Use Environment-Specific Values
- Development: Local services, test accounts
- Staging: Staging databases, limited quotas
- Production: Production databases, full quotas

---

## Validation

### Check Required Variables

```typescript
// Validate at startup
const requiredEnvVars = [
  'DATABASE_URL',
  'BETTER_AUTH_SECRET',
  'NEXT_PUBLIC_BETTER_AUTH_URL',
  // ... more
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}
```

---

## Related Documentation

- [Commands Reference](commands.md) - Development commands
- [Tech Stack](tech-stack.md) - Technologies
- [Troubleshooting](../operations/troubleshooting.md) - Environment issues
