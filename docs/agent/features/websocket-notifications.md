# WebSocket Notification Service

## Overview
Comprehensive real-time notification system with advanced token management and connection resilience.

**Client Service**: [src/services/websocket/websocket-notification-service.ts](../../../src/services/websocket/websocket-notification-service.ts)
**Server Actions**: [src/actions/websocket/](../../../src/actions/websocket/)

---

## Architecture Components

### 1. Client Service
`WebSocketNotificationService` class for connection management

### 2. Server Actions
Redis-cached token authentication and refresh

### 3. Token Management
Automatic token refresh with safety margins

### 4. Connection Resilience
Exponential backoff reconnection strategy

---

## Redis Token Caching

### Access Tokens
- **Cache Duration**: 12 minutes
- **Server Expiry**: 15 minutes
- **Safety Margin**: 3 minutes

### Refresh Tokens
- **Cache Duration**: 6.5 days
- **Server Expiry**: 7 days
- **Safety Margin**: 0.5 days

### Automatic Cache Invalidation
Tokens are automatically invalidated on authentication failures.

---

## Server Actions

### Authentication with WebSocket Server

**Location**: [src/actions/websocket/authenticate-websocket.ts](../../../src/actions/websocket/authenticate-websocket.ts)

```typescript
import { authenticateWebSocket } from '@/actions/websocket/authenticate-websocket';

// Server Action that authenticates with external WebSocket server
const result = await authenticateWebSocket();

if (result.success) {
  const { accessToken, refreshToken } = result.data;
  // Tokens are automatically cached in Redis
}
```

### Get Cached Access Token

**Location**: [src/actions/websocket/websocket-token-cache.ts](../../../src/actions/websocket/websocket-token-cache.ts)

```typescript
import { getCachedAccessToken } from '@/actions/websocket/websocket-token-cache';

// Returns cached token or refreshes if needed
const result = await getCachedAccessToken();

if (result.success) {
  const accessToken = result.data;
  // Use token for WebSocket connection
}
```

### Get User ID from Session

**Location**: [src/actions/websocket/get-user-id.ts](../../../src/actions/websocket/get-user-id.ts)

```typescript
import { getUserId } from '@/actions/websocket/get-user-id';

// Extracts userId from authenticated session
const result = await getUserId();

if (result.success) {
  const userId = result.data;
}
```

---

## WebSocket Notification Service

### Singleton Service Usage

```typescript
import { websocketNotificationService } from '@/services/websocket/websocket-notification-service';

// The service is a singleton - use the exported instance
```

### Connect with Automatic Retry

```typescript
'use client'

import { websocketNotificationService } from '@/services/websocket/websocket-notification-service';
import { useEffect } from 'react';

export function NotificationProvider({ children }) {
  useEffect(() => {
    // Connect with automatic reconnection
    websocketNotificationService.connectWithRetry();

    // Cleanup on unmount
    return () => {
      websocketNotificationService.disconnect();
    };
  }, []);

  return <>{children}</>;
}
```

---

## Event Handling

### Available Events

```typescript
type WebSocketEvent =
  | 'connected'      // Connection established
  | 'disconnected'   // Connection closed
  | 'error'          // Error occurred
  | 'message'        // Notification received
  | 'reconnecting';  // Attempting reconnection
```

### Event Listeners

```typescript
'use client'

import { websocketNotificationService } from '@/services/websocket/websocket-notification-service';
import { toast } from 'sonner';

// Connection established
websocketNotificationService.on('connected', () => {
  console.log('WebSocket connected');
  toast.success('Connected to notifications');
});

// Connection closed
websocketNotificationService.on('disconnected', () => {
  console.log('WebSocket disconnected');
  toast.info('Disconnected from notifications');
});

// Error occurred
websocketNotificationService.on('error', (error) => {
  console.error('WebSocket error:', error);
  toast.error('Notification service error');
});

// Message received
websocketNotificationService.on('message', (notification) => {
  console.log('Notification received:', notification);

  // Show toast with action
  toast.info(notification.title, {
    description: notification.message,
    action: notification.link ? {
      label: 'View',
      onClick: () => window.location.href = notification.link
    } : undefined
  });
});

// Attempting reconnection
websocketNotificationService.on('reconnecting', (attempt) => {
  console.log(`Reconnecting... Attempt ${attempt}`);
});
```

---

## Connection Management

### Manual Connection

```typescript
// Connect to WebSocket server
await websocketNotificationService.connect();
```

### Automatic Reconnection

```typescript
// Connect with automatic reconnection on failure
await websocketNotificationService.connectWithRetry();
```

### Disconnect

```typescript
// Gracefully disconnect
websocketNotificationService.disconnect();
```

### Connection Status

```typescript
// Check if connected
const isConnected = websocketNotificationService.isConnected();

// Get connection state
const state = websocketNotificationService.getConnectionState();
// Returns: 'connected' | 'disconnected' | 'connecting' | 'reconnecting'
```

---

## Sending Messages

### Send Notification Message

```typescript
// Send message through WebSocket
websocketNotificationService.send({
  type: 'notification',
  payload: {
    title: 'Trip Update',
    message: 'Your trip starts in 30 minutes',
    link: '/trips/123'
  }
});
```

### Send Custom Event

```typescript
websocketNotificationService.send({
  type: 'custom_event',
  payload: {
    eventType: 'trip_started',
    tripId: '123',
    timestamp: new Date().toISOString()
  }
});
```

---

## Notification Message Structure

### Incoming Notification Format

```typescript
interface NotificationMessage {
  type: string;
  title: string;
  message: string;
  link?: string;
  data?: Record<string, any>;
  timestamp: string;
}
```

### Example Notification

```json
{
  "type": "trip_update",
  "title": "Trip Started",
  "message": "Your driver has started the trip",
  "link": "/trips/123",
  "data": {
    "tripId": "123",
    "driverId": "456",
    "status": "STARTED"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## Complete Integration Example

### App-Level Integration

```typescript
'use client'

import { websocketNotificationService } from '@/services/websocket/websocket-notification-service';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function WebSocketProvider({ children }) {
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  useEffect(() => {
    // Setup event listeners
    websocketNotificationService.on('connected', () => {
      setConnectionStatus('connected');
      toast.success('Connected to real-time notifications');
    });

    websocketNotificationService.on('disconnected', () => {
      setConnectionStatus('disconnected');
      toast.info('Disconnected from real-time notifications');
    });

    websocketNotificationService.on('error', (error) => {
      console.error('WebSocket error:', error);
      toast.error('Notification service error');
    });

    websocketNotificationService.on('message', (notification) => {
      // Handle different notification types
      switch (notification.type) {
        case 'trip_update':
          toast.info(notification.title, {
            description: notification.message,
            action: {
              label: 'View Trip',
              onClick: () => window.location.href = notification.link || '/trips'
            }
          });
          break;

        case 'payment_approved':
          toast.success(notification.title, {
            description: notification.message,
            action: {
              label: 'View Payment',
              onClick: () => window.location.href = notification.link || '/payments'
            }
          });
          break;

        case 'message_received':
          toast.info(notification.title, {
            description: notification.message,
            action: {
              label: 'View Message',
              onClick: () => window.location.href = notification.link || '/chat'
            }
          });
          break;

        default:
          toast.info(notification.title, {
            description: notification.message
          });
      }
    });

    websocketNotificationService.on('reconnecting', (attempt) => {
      setConnectionStatus('connecting');
      console.log(`Reconnecting... Attempt ${attempt}`);
    });

    // Connect with retry
    websocketNotificationService.connectWithRetry();

    // Cleanup
    return () => {
      websocketNotificationService.disconnect();
    };
  }, []);

  return (
    <>
      {/* Connection Status Indicator */}
      <div className="fixed top-4 right-4 z-50">
        {connectionStatus === 'connected' && (
          <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">
            🟢 Connected
          </div>
        )}
        {connectionStatus === 'connecting' && (
          <div className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm">
            🟡 Connecting...
          </div>
        )}
        {connectionStatus === 'disconnected' && (
          <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm">
            🔴 Disconnected
          </div>
        )}
      </div>

      {children}
    </>
  );
}
```

---

## Exponential Backoff Reconnection

### Reconnection Strategy

The service implements exponential backoff for reconnection attempts:

```typescript
// Reconnection delays (in milliseconds)
Attempt 1: 1000ms   (1 second)
Attempt 2: 2000ms   (2 seconds)
Attempt 3: 4000ms   (4 seconds)
Attempt 4: 8000ms   (8 seconds)
Attempt 5: 16000ms  (16 seconds)
Max:       30000ms  (30 seconds)
```

### Maximum Retry Attempts

By default, the service will retry indefinitely with exponential backoff.

To limit retries, configure max attempts:

```typescript
// This would need to be configured in the service implementation
// Current implementation retries indefinitely
```

---

## Token Refresh Flow

### Automatic Token Refresh

1. Client requests cached access token via `getCachedAccessToken()`
2. Server checks Redis cache
3. If cache miss or expired, refreshes token from WebSocket server
4. New token cached with TTL
5. Token returned to client

### Token Invalidation

Tokens are invalidated on:
- Authentication failure (401)
- Token expiration
- Manual cache clear
- User logout

---

## Error Handling

### Connection Errors

```typescript
websocketNotificationService.on('error', (error) => {
  if (error.type === 'authentication_failed') {
    // Token invalid - will auto-refresh and retry
    console.error('Authentication failed, refreshing token...');
  } else if (error.type === 'network_error') {
    // Network issue - will retry with backoff
    console.error('Network error, will retry...');
  } else {
    // Other error
    console.error('WebSocket error:', error);
  }
});
```

### Handling Message Errors

```typescript
websocketNotificationService.on('message', (notification) => {
  try {
    // Process notification
    handleNotification(notification);
  } catch (error) {
    console.error('Error processing notification:', error);
    // Don't break the connection
  }
});
```

---

## Environment Variables

```bash
# WebSocket Server URL (backend)
WEBSOCKET_SERVER_URL=wss://ws.example.com

# WebSocket Credentials (backend)
WEBSOCKET_USERNAME=your-username
WEBSOCKET_PASSWORD=your-password

# WebSocket Server URL (frontend)
NEXT_PUBLIC_WEBSOCKET_SERVER_URL=wss://ws.example.com
```

---

## Troubleshooting

### Connection Failed

**Issue**: WebSocket connection fails immediately

**Solution**:
1. Verify `WEBSOCKET_SERVER_URL` and `NEXT_PUBLIC_WEBSOCKET_SERVER_URL`
2. Check `WEBSOCKET_USERNAME` and `WEBSOCKET_PASSWORD`
3. Ensure Redis is running for token cache

### Authentication Error

**Issue**: Connection fails with 401 error

**Solution**:
1. Check credentials in environment variables
2. Verify token cache in Redis
3. Try clearing Redis cache: `redis-cli FLUSHDB`

### Token Refresh Failed

**Issue**: Tokens not refreshing automatically

**Solution**:
1. Review Redis cache TTL settings
2. Check WebSocket server token expiry times
3. Verify safety margins (12min vs 15min, 6.5d vs 7d)

### Reconnection Loop

**Issue**: Constantly reconnecting

**Solution**:
1. Check exponential backoff settings
2. Verify max retry attempts
3. Review server-side connection limits

### Messages Not Received

**Issue**: Messages sent but not received

**Solution**:
1. Verify event listeners are attached
2. Check message parsing logic
3. Ensure WebSocket is connected: `isConnected()`

---

## Best Practices

### 1. Initialize Once at App Level

```typescript
// ✅ GOOD: Initialize in root layout/provider
export function RootLayout({ children }) {
  return (
    <WebSocketProvider>
      {children}
    </WebSocketProvider>
  );
}

// ❌ BAD: Initialize in multiple components
function Component1() {
  useEffect(() => {
    websocketNotificationService.connect(); // Don't do this
  }, []);
}
```

### 2. Handle All Event Types

```typescript
// ✅ GOOD: Handle all relevant events
websocketNotificationService.on('connected', handleConnected);
websocketNotificationService.on('disconnected', handleDisconnected);
websocketNotificationService.on('error', handleError);
websocketNotificationService.on('message', handleMessage);
```

### 3. Cleanup on Unmount

```typescript
// ✅ GOOD: Cleanup in useEffect return
useEffect(() => {
  websocketNotificationService.connectWithRetry();

  return () => {
    websocketNotificationService.disconnect();
  };
}, []);
```

### 4. Use Server Actions for Tokens

```typescript
// ✅ GOOD: Use server actions for token management
const result = await getCachedAccessToken();

// ❌ BAD: Don't manage tokens client-side
const token = localStorage.getItem('ws_token'); // Don't do this
```

---

## Related Documentation

- [Notifications](../patterns/notifications.md) - Notification patterns
- [Real-time Chat](realtime-chat.md) - Chat integration
- [Caching Patterns](../patterns/caching-patterns.md) - Redis token cache
