# Notification Patterns

## Overview
Tengo Lugar has two notification systems:
1. **System Notifications** - For background jobs without user session
2. **User Notifications** - For authenticated user actions
3. **WebSocket Notifications** - Real-time push notifications

---

## System Notification Pattern (Inngest Context)

### When to Use

Use `sendSystemNotification` for:
- **Inngest background jobs** (no user session available)
- **Cron jobs**
- **Webhooks**
- **System-triggered events**

**Location**: [src/actions/notifications/send-system-notification.ts](../../../src/actions/notifications/send-system-notification.ts)

### Basic Usage

```typescript
import { sendSystemNotification } from '@/actions/notifications/send-system-notification';

// In Inngest function
export const notifyPaymentApproved = inngest.createFunction(
  { id: "notify-payment-approved" },
  { event: "payment.approved" },
  async ({ event, step }) => {
    const { userId, paymentId, amount } = event.data;

    const result = await step.run("send-notification", async () => {
      return await sendSystemNotification(
        userId,
        'Payment Approved',
        `Your payment of $${amount} has been approved`,
        'payment_approved',
        `/payments/${paymentId}`,
        { paymentId, amount }
      );
    });

    // Always check result
    if (!result.success) {
      throw new Error(`Failed to send notification: ${result.error?.message}`);
    }

    return { success: true };
  }
);
```

### Function Signature

```typescript
async function sendSystemNotification(
  userId: string,
  title: string,
  message: string,
  eventType: string,
  link?: string,
  additionalData?: Record<string, any>
): Promise<ApiResponse<Notification>>
```

### Key Features

- ✅ No authentication required (system context)
- ✅ Validates userId exists in database
- ✅ Creates database notification record
- ✅ Sends WebSocket push notification
- ✅ Returns ApiResponse for error handling

---

## User Notification Pattern (Session Context)

### When to Use

Use `notifyUser` for:
- **Server Actions** with user session
- **Authenticated API routes**
- **User-triggered events**

**Location**: [src/actions/notifications/notify-user.ts](../../../src/actions/notifications/notify-user.ts)

### Basic Usage

```typescript
'use server'

import { requireAuthentication } from "@/utils/helpers/auth-helper";
import { notifyUser } from "@/actions/notifications/notify-user";

export async function createTrip(tripData: any) {
  const session = await requireAuthentication('create-trip.ts', 'createTrip');

  // Create trip
  const trip = await prisma.trip.create({ data: tripData });

  // Notify user
  await notifyUser(
    'Trip Created',
    'Your trip has been created successfully',
    'trip_created',
    `/trips/${trip.id}`,
    { tripId: trip.id }
  );

  return ApiHandler.handleSuccess(trip, 'Trip created');
}
```

### Function Signature

```typescript
async function notifyUser(
  title: string,
  message: string,
  eventType: string,
  link?: string,
  additionalData?: Record<string, any>
): Promise<ApiResponse<Notification>>
```

### Key Features

- ✅ Uses current user session
- ✅ No userId parameter needed
- ✅ Creates database notification record
- ✅ Sends WebSocket push notification
- ❌ Requires authentication (don't use in Inngest)

---

## WebSocket Notification Service

### Client-Side Setup

**Location**: [src/services/websocket/websocket-notification-service.ts](../../../src/services/websocket/websocket-notification-service.ts)

### Initialize Connection

```typescript
'use client'

import { websocketNotificationService } from '@/services/websocket/websocket-notification-service';
import { useEffect } from 'react';
import { toast } from 'sonner';

export function NotificationProvider({ children }) {
  useEffect(() => {
    // Connect to WebSocket
    websocketNotificationService.connectWithRetry();

    // Listen to events
    websocketNotificationService.on('connected', () => {
      console.log('WebSocket connected');
    });

    websocketNotificationService.on('message', (notification) => {
      // Show toast notification
      toast.info(notification.title, {
        description: notification.message,
        action: notification.link ? {
          label: 'View',
          onClick: () => window.location.href = notification.link
        } : undefined
      });
    });

    websocketNotificationService.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    websocketNotificationService.on('disconnected', () => {
      console.log('WebSocket disconnected');
    });

    // Cleanup
    return () => {
      websocketNotificationService.disconnect();
    };
  }, []);

  return <>{children}</>;
}
```

### Notification Event Structure

```typescript
interface NotificationEvent {
  type: string;
  title: string;
  message: string;
  link?: string;
  data?: Record<string, any>;
  timestamp: string;
}
```

---

## Notification Types

### Common Event Types

```typescript
type EventType =
  | 'trip_created'
  | 'trip_updated'
  | 'trip_cancelled'
  | 'trip_reminder'
  | 'payment_pending'
  | 'payment_approved'
  | 'payment_rejected'
  | 'payment_reminder'
  | 'document_verified'
  | 'document_rejected'
  | 'review_received'
  | 'message_received'
  | 'system_error'
  | 'system_maintenance';
```

### Notification by Type

#### Trip Notifications

```typescript
// Trip created
await sendSystemNotification(
  driverId,
  'Trip Created',
  `New trip from ${origin} to ${destination}`,
  'trip_created',
  `/trips/${tripId}`
);

// Trip cancelled
await sendSystemNotification(
  passengerId,
  'Trip Cancelled',
  'The driver has cancelled your trip',
  'trip_cancelled',
  `/trips/${tripId}`
);

// Trip reminder
await sendSystemNotification(
  userId,
  'Trip Tomorrow',
  `Your trip from ${origin} to ${destination} is tomorrow`,
  'trip_reminder',
  `/trips/${tripId}`
);
```

#### Payment Notifications

```typescript
// Payment approved
await sendSystemNotification(
  userId,
  'Payment Approved',
  `Your payment of $${amount} has been approved`,
  'payment_approved',
  `/payments/${paymentId}`,
  { paymentId, amount }
);

// Payment pending
await sendSystemNotification(
  userId,
  'Payment Pending',
  'Please complete your payment for the trip',
  'payment_pending',
  `/payments/${paymentId}`
);
```

#### Document Notifications

```typescript
// Document verified
await sendSystemNotification(
  userId,
  'Document Verified',
  'Your document has been verified successfully',
  'document_verified',
  `/profile/documents`
);

// Document rejected
await sendSystemNotification(
  userId,
  'Document Rejected',
  'Your document was rejected. Please upload a new one.',
  'document_rejected',
  `/profile/documents`,
  { reason: 'Image quality too low' }
);
```

---

## Database Notification Model

### Notification Schema

```prisma
model Notification {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  title     String
  message   String
  type      String
  link      String?
  data      Json?
  read      Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

### Query User Notifications

```typescript
export async function getUserNotifications() {
  const session = await requireAuthentication('get-notifications.ts', 'getUserNotifications');

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 20
  });

  return ApiHandler.handleSuccess(notifications);
}
```

### Mark Notification as Read

```typescript
export async function markNotificationAsRead(notificationId: string) {
  const session = await requireAuthentication('mark-read.ts', 'markNotificationAsRead');

  const notification = await prisma.notification.update({
    where: {
      id: notificationId,
      userId: session.user.id // Ensure user owns notification
    },
    data: { read: true }
  });

  return ApiHandler.handleSuccess(notification);
}
```

---

## Push Notifications (Web Push)

### Subscribe to Push Notifications

```typescript
'use client'

export async function subscribeToPushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.error('Push notifications not supported');
    return;
  }

  // Request permission
  const permission = await Notification.requestPermission();

  if (permission !== 'granted') {
    console.log('Push notification permission denied');
    return;
  }

  // Get service worker registration
  const registration = await navigator.serviceWorker.ready;

  // Subscribe to push
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  });

  // Save subscription to database
  await savePushSubscription(subscription);
}

async function savePushSubscription(subscription: PushSubscription) {
  const response = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription)
  });

  return response.json();
}
```

### Send Push Notification (Server)

```typescript
import webpush from 'web-push';

export async function sendPushNotification(userId: string, payload: any) {
  // Get user's push subscriptions
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId }
  });

  // Send to all subscriptions
  const promises = subscriptions.map(async (sub) => {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: sub.keys as any
        },
        JSON.stringify(payload)
      );
    } catch (error) {
      // If subscription is expired, delete it
      if (error.statusCode === 410) {
        await prisma.pushSubscription.delete({
          where: { id: sub.id }
        });
      }
    }
  });

  await Promise.all(promises);
}
```

---

## Best Practices

### 1. Choose the Right Notification Function

```typescript
// ✅ In Server Actions (with session)
await notifyUser('Title', 'Message', 'type', '/link');

// ✅ In Inngest jobs (no session)
await sendSystemNotification(userId, 'Title', 'Message', 'type', '/link');

// ❌ WRONG: notifyUser in Inngest
await notifyUser('Title', 'Message', 'type'); // Will fail - no session
```

### 2. Always Check System Notification Results

```typescript
const result = await sendSystemNotification(/* ... */);

if (!result.success) {
  throw new Error(`Notification failed: ${result.error?.message}`);
}
```

### 3. Provide Useful Links

```typescript
// ✅ GOOD: Direct link to relevant resource
await notifyUser('Payment Approved', 'Check details', 'payment', '/payments/123');

// ❌ BAD: Generic or missing link
await notifyUser('Payment Approved', 'Check details', 'payment'); // No link
```

### 4. Include Additional Data for Context

```typescript
await sendSystemNotification(
  userId,
  'Trip Cancelled',
  'Your trip has been cancelled',
  'trip_cancelled',
  `/trips/${tripId}`,
  {
    tripId,
    reason: 'Driver unavailable',
    refundAmount: 1500
  }
);
```

### 5. Batch Notifications in Inngest

```typescript
// Notify multiple users efficiently
for (const passenger of passengers) {
  await step.run(`notify-passenger-${passenger.id}`, async () => {
    return await sendSystemNotification(
      passenger.userId,
      'Trip Update',
      'Your trip status has changed',
      'trip_update',
      `/trips/${tripId}`
    );
  });
}
```

---

## Related Documentation

- [Background Jobs](background-jobs.md) - Using notifications in Inngest
- [WebSocket Service](../features/websocket-notifications.md) - WebSocket details
- [Server Actions](server-actions.md) - Notification in actions
