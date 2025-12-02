# Background Jobs Patterns

## Overview
Tengo Lugar uses **Inngest 3.32.7** for background jobs and workflows.

**Inngest Client Location**: [src/lib/inngest.ts](../../../src/lib/inngest.ts)
**Functions Location**: [functions/inngest/](../../../functions/inngest/)

---

## Basic Job Pattern

### Trigger Background Job from Server Action

```typescript
'use server'

import { inngest } from "@/lib/inngest";
import { requireAuthentication } from "@/utils/helpers/auth-helper";
import { ApiHandler } from "@/lib/api-handler";

export async function createDocumentVerification(documentData: any) {
  const session = await requireAuthentication('create-document.ts', 'createDocumentVerification');

  // Create document in database
  const document = await prisma.document.create({
    data: {
      userId: session.user.id,
      ...documentData
    }
  });

  // Trigger background job
  await inngest.send({
    name: "document-verification-email",
    data: {
      userId: session.user.id,
      email: session.user.email,
      documentId: document.id,
      type: "verification"
    }
  });

  return ApiHandler.handleSuccess(
    document,
    'Document uploaded. Verification email will be sent shortly.'
  );
}
```

### Define Background Function

**Location**: `functions/inngest/send-verification-email.ts`

```typescript
import { inngest } from "@/lib/inngest";
import { sendEmail } from "@/lib/email/resend-api";

export const sendVerificationEmail = inngest.createFunction(
  { id: "send-verification-email" },
  { event: "document-verification-email" },
  async ({ event, step }) => {
    const { userId, email, documentId, type } = event.data;

    // Step 1: Get document details
    const document = await step.run("get-document", async () => {
      return await prisma.document.findUnique({
        where: { id: documentId },
        include: { user: true }
      });
    });

    if (!document) {
      throw new Error(`Document ${documentId} not found`);
    }

    // Step 2: Send email
    await step.run("send-email", async () => {
      return await sendEmail({
        to: email,
        subject: "Document Verification Required",
        template: "document-verification",
        data: {
          userName: document.user.name,
          documentType: type,
          documentId: documentId
        }
      });
    });

    return { success: true, documentId };
  }
);
```

---

## Multi-Step Workflows

### Workflow with Multiple Steps

```typescript
export const processPayment = inngest.createFunction(
  { id: "process-payment" },
  { event: "payment.submitted" },
  async ({ event, step }) => {
    const { paymentId, userId, amount } = event.data;

    // Step 1: Validate payment
    const payment = await step.run("validate-payment", async () => {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId }
      });

      if (!payment) {
        throw new Error("Payment not found");
      }

      return payment;
    });

    // Step 2: Process with payment gateway
    const gatewayResult = await step.run("process-gateway", async () => {
      return await paymentGateway.process({
        amount: payment.amount,
        currency: "ARS"
      });
    });

    // Step 3: Update payment status
    await step.run("update-status", async () => {
      return await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: gatewayResult.success ? "APPROVED" : "REJECTED",
          gatewayTransactionId: gatewayResult.transactionId
        }
      });
    });

    // Step 4: Send notification
    await step.run("send-notification", async () => {
      return await sendSystemNotification(
        userId,
        gatewayResult.success ? "Payment Approved" : "Payment Rejected",
        gatewayResult.success
          ? "Your payment has been approved"
          : "Your payment was rejected. Please try again.",
        "payment_update",
        `/payments/${paymentId}`
      );
    });

    return { success: true, paymentId, status: gatewayResult.success };
  }
);
```

---

## Scheduled Jobs (Cron)

### Daily Cron Job

```typescript
export const dailyTripReminder = inngest.createFunction(
  {
    id: "daily-trip-reminder",
    retries: 3
  },
  { cron: "0 9 * * *" }, // Every day at 9 AM
  async ({ step }) => {
    // Get trips happening tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const nextDay = new Date(tomorrow);
    nextDay.setDate(nextDay.getDate() + 1);

    const trips = await step.run("get-tomorrow-trips", async () => {
      return await prisma.trip.findMany({
        where: {
          departureDate: {
            gte: tomorrow,
            lt: nextDay
          },
          status: "ACTIVE"
        },
        include: {
          passengers: {
            include: {
              passenger: {
                include: { user: true }
              }
            }
          },
          driverCar: {
            include: {
              driver: {
                include: { user: true }
              }
            }
          }
        }
      });
    });

    // Send reminder to each participant
    for (const trip of trips) {
      await step.run(`send-reminder-trip-${trip.id}`, async () => {
        // Notify driver
        await sendSystemNotification(
          trip.driverCar.driver.userId,
          "Trip Tomorrow",
          `You have a trip from ${trip.origin} to ${trip.destination} tomorrow`,
          "trip_reminder",
          `/trips/${trip.id}`
        );

        // Notify passengers
        for (const passenger of trip.passengers) {
          await sendSystemNotification(
            passenger.passenger.userId,
            "Trip Tomorrow",
            `Your trip from ${trip.origin} to ${trip.destination} is tomorrow`,
            "trip_reminder",
            `/trips/${trip.id}`
          );
        }
      });
    }

    return { processedTrips: trips.length };
  }
);
```

---

## Delayed Jobs

### Schedule Job for Future Execution

```typescript
export async function schedulePaymentReminder(paymentId: string, dueDate: Date) {
  // Schedule job to run at specific time
  await inngest.send({
    name: "payment-reminder",
    data: { paymentId },
    ts: dueDate.getTime() // Execute at this timestamp
  });
}

// Function that will run at scheduled time
export const paymentReminder = inngest.createFunction(
  { id: "payment-reminder" },
  { event: "payment-reminder" },
  async ({ event, step }) => {
    const { paymentId } = event.data;

    const payment = await step.run("get-payment", async () => {
      return await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          tripPassenger: {
            include: {
              passenger: { include: { user: true } }
            }
          }
        }
      });
    });

    if (payment.status !== "PENDING") {
      return { skipped: true, reason: "Payment already processed" };
    }

    await step.run("send-reminder", async () => {
      return await sendSystemNotification(
        payment.tripPassenger.passenger.userId,
        "Payment Reminder",
        "You have a pending payment. Please complete it soon.",
        "payment_reminder",
        `/payments/${paymentId}`
      );
    });

    return { success: true, paymentId };
  }
);
```

---

## Email Deliverability Pattern

### Multiple Emails with Delays

**IMPORTANT**: When sending multiple emails in sequence, add delays to avoid spam classification.

```typescript
export const sendWelcomeSequence = inngest.createFunction(
  { id: "welcome-sequence" },
  { event: "user.registered" },
  async ({ event, step }) => {
    const { userId, email, name } = event.data;

    // Email 1: Welcome email
    await step.run("send-welcome-email", async () => {
      return await sendEmail({
        to: email,
        subject: "Welcome to Tengo Lugar!",
        template: "welcome",
        data: { name }
      });
    });

    // CRITICAL: Add delay between emails to avoid spam classification
    await step.sleep("delay-after-welcome", "45s");

    // Email 2: Getting started guide
    await step.run("send-guide-email", async () => {
      return await sendEmail({
        to: email,
        subject: "Getting Started with Tengo Lugar",
        template: "getting-started",
        data: { name }
      });
    });

    // Another delay
    await step.sleep("delay-after-guide", "45s");

    // Email 3: Feature highlights
    await step.run("send-features-email", async () => {
      return await sendEmail({
        to: email,
        subject: "Discover Tengo Lugar Features",
        template: "features",
        data: { name }
      });
    });

    return { success: true, emailsSent: 3 };
  }
);
```

---

## System Notification Pattern

### Using sendSystemNotification in Inngest

**IMPORTANT**: Use `sendSystemNotification` for Inngest jobs (no user session available).

```typescript
import { sendSystemNotification } from '@/actions/notifications/send-system-notification';

export const notifyTripUpdate = inngest.createFunction(
  { id: "notify-trip-update" },
  { event: "trip.status-changed" },
  async ({ event, step }) => {
    const { tripId, newStatus, userId } = event.data;

    // Use sendSystemNotification instead of notifyUser
    const result = await step.run("send-notification", async () => {
      return await sendSystemNotification(
        userId,
        'Trip Status Updated',
        `Your trip status changed to ${newStatus}`,
        'trip_update',
        `/trips/${tripId}`,
        { tripId, status: newStatus }
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

**Key differences from `notifyUser`**:
- ✅ No authentication required (system context)
- ✅ Validates userId exists in database
- ✅ Designed for Inngest, webhooks, cron jobs
- ✅ Returns ApiResponse for error handling

---

## Error Handling

### Retry Configuration

```typescript
export const processDocument = inngest.createFunction(
  {
    id: "process-document",
    retries: 3, // Retry up to 3 times
  },
  { event: "document.uploaded" },
  async ({ event, step }) => {
    // Function implementation
  }
);
```

### Custom Retry Logic

```typescript
export const unstableOperation = inngest.createFunction(
  {
    id: "unstable-operation",
    onFailure: async ({ error, event }) => {
      // Log failure
      await logError({
        message: error.message,
        context: { eventData: event.data }
      });

      // Notify admin
      await sendSystemNotification(
        adminUserId,
        "Job Failed",
        `Job ${event.name} failed: ${error.message}`,
        "system_error",
        "/admin/jobs"
      );
    }
  },
  { event: "unstable.operation" },
  async ({ event, step }) => {
    // Function that might fail
  }
);
```

---

## Testing Background Jobs

### Test Locally

```typescript
// In development, trigger job directly
if (process.env.NODE_ENV === 'development') {
  await inngest.send({
    name: "test-job",
    data: { testData: true }
  });
}
```

### View Jobs in Inngest Dashboard

Access the Inngest dashboard to:
- View job execution history
- See step-by-step execution
- Debug failed jobs
- Monitor performance

---

## Best Practices

### 1. Use Steps for Long Operations

```typescript
// ✅ GOOD: Each step is retryable independently
await step.run("database-operation", async () => { /* ... */ });
await step.run("api-call", async () => { /* ... */ });
await step.run("send-email", async () => { /* ... */ });

// ❌ BAD: All-or-nothing operation
await prisma.update(/* ... */);
await externalApi.call(/* ... */);
await sendEmail(/* ... */);
```

### 2. Add Delays Between Emails

```typescript
// ✅ GOOD: Delays prevent spam classification
await step.run("email-1", async () => { /* ... */ });
await step.sleep("delay-1", "45s");
await step.run("email-2", async () => { /* ... */ });

// ❌ BAD: Multiple emails without delay
await sendEmail1();
await sendEmail2();
await sendEmail3(); // Likely flagged as spam
```

### 3. Use System Notifications in Jobs

```typescript
// ✅ GOOD: Use sendSystemNotification in Inngest
const result = await sendSystemNotification(userId, title, message, type, link);
if (!result.success) throw new Error(result.error?.message);

// ❌ BAD: notifyUser requires session (not available in Inngest)
await notifyUser(title, message, type, link); // Will fail
```

### 4. Handle Missing Data Gracefully

```typescript
const user = await prisma.user.findUnique({ where: { id: userId } });

if (!user) {
  return { skipped: true, reason: "User not found" };
}
```

### 5. Use Descriptive Step Names

```typescript
// ✅ GOOD: Clear step names
await step.run("fetch-user-from-database", async () => { /* ... */ });
await step.run("send-welcome-email", async () => { /* ... */ });

// ❌ BAD: Generic names
await step.run("step1", async () => { /* ... */ });
await step.run("step2", async () => { /* ... */ });
```

---

## Related Documentation

- [Server Actions](server-actions.md) - Triggering background jobs
- [Notifications](notifications.md) - System notification patterns
- [Email Service](../reference/email-config.md) - Resend configuration
