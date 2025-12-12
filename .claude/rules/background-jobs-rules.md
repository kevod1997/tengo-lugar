---
paths: src/inngest/**/*.ts
---

# Background Jobs Rules

## 🎯 Applies To

All files in `src/inngest/` - Inngest background jobs, cron jobs, and workflows.

## 🔴 CRITICAL - Never Violate

1. **NEVER use user notifications in Inngest** - Use `sendSystemNotification()` instead
   ```typescript
   ❌ // In Inngest function
   await sendNotification({
     userId,
     title: 'Payment processed'
   }); // Requires session - won't work in background!

   ✅ await sendSystemNotification({
        userId,
        title: 'Payment processed',
        message: 'Your payment has been processed successfully'
      });
   ```

2. **NEVER send emails without delays** - Wait 45s between emails (anti-spam)
   ```typescript
   ❌ await sendEmail(user1);
      await sendEmail(user2); // Too fast, might be flagged as spam!

   ✅ await sendEmail(user1);
      await step.sleep('45s'); // Wait 45 seconds
      await sendEmail(user2);
   ```

3. **NEVER skip error handling in Inngest functions** - Always use try-catch
   ```typescript
   ❌ inngest.createFunction(
        { id: 'process-payment' },
        { event: 'payment/created' },
        async ({ event }) => {
          await processPayment(event.data); // Uncaught errors!
        }
      );

   ✅ inngest.createFunction(
        { id: 'process-payment' },
        { event: 'payment/created' },
        async ({ event, step }) => {
          try {
            await step.run('process-payment', async () => {
              return await processPayment(event.data);
            });
          } catch (error) {
            // Log error and handle gracefully
            console.error('Payment processing failed:', error);
            throw error; // Inngest will retry
          }
        }
      );
   ```

4. **NEVER trigger workflows without proper event data** - Validate event payload
   ```typescript
   ❌ await inngest.send({
        name: 'trip/created',
        data: { id } // Missing required fields!
      });

   ✅ await inngest.send({
        name: 'trip/created',
        data: {
          tripId: trip.id,
          driverId: trip.driverId,
          passengerId: trip.passengerId,
          departureTime: trip.departureTime.toISOString()
        }
      });
   ```

5. **NEVER access session in Inngest functions** - Background jobs have no session
   ```typescript
   ❌ const session = await requireAuthentication(); // Won't work in background!

   ✅ // Pass userId in event data
   inngest.createFunction(
     { id: 'notify-user' },
     { event: 'user/action' },
     async ({ event }) => {
       const userId = event.data.userId; // From event data
     }
   );
   ```

## 🟡 MANDATORY - Always Follow

1. **ALWAYS use steps for retryable operations**
   ```typescript
   await step.run('database-update', async () => {
     return await prisma.trip.update({ ... });
   });

   await step.run('send-notification', async () => {
     return await sendSystemNotification({ ... });
   });
   ```

2. **ALWAYS implement 45s delays between emails**
   ```typescript
   const users = [user1, user2, user3];

   for (let i = 0; i < users.length; i++) {
     await step.run(`send-email-${i}`, async () => {
       return await sendEmail(users[i]);
     });

     // Wait 45s before next email (except after last one)
     if (i < users.length - 1) {
       await step.sleep('email-delay', '45s');
     }
   }
   ```

3. **ALWAYS use sendSystemNotification in Inngest** (not sendNotification)
   ```typescript
   await step.run('notify-user', async () => {
     return await sendSystemNotification({
       userId: event.data.userId,
       title: 'Trip confirmed',
       message: `Your trip to ${event.data.destination} has been confirmed`,
       type: 'TRIP_CONFIRMED',
       data: {
         tripId: event.data.tripId
       }
     });
   });
   ```

4. **ALWAYS trigger workflows from Server Actions** after database operations
   ```typescript
   'use server';

   export async function confirmTrip(tripId: string) {
     const session = await requireAuthentication();

     // Database operation
     const trip = await prisma.trip.update({
       where: { id: tripId },
       data: { status: 'CONFIRMED' }
     });

     // Trigger background job
     await inngest.send({
       name: 'trip/confirmed',
       data: {
         tripId: trip.id,
         driverId: trip.driverId,
         passengerId: trip.passengerId
       }
     });

     return ApiHandler.success(trip);
   }
   ```

5. **ALWAYS use descriptive step names** for debugging
   ```typescript
   ✅ await step.run('update-trip-status', async () => { ... });
   ✅ await step.run('notify-driver-via-email', async () => { ... });
   ✅ await step.run('create-payment-record', async () => { ... });

   ❌ await step.run('step1', async () => { ... }); // Not descriptive
   ```

## ✅ Quick Pattern: Inngest Function

```typescript
import { inngest } from '@/lib/inngest/client';
import { sendSystemNotification } from '@/actions/notification-actions';
import { sendEmail } from '@/lib/email';

export const tripConfirmedWorkflow = inngest.createFunction(
  {
    id: 'trip-confirmed',
    name: 'Trip Confirmed Workflow'
  },
  { event: 'trip/confirmed' },
  async ({ event, step }) => {
    const { tripId, driverId, passengerId } = event.data;

    // Step 1: Send notification to driver
    await step.run('notify-driver', async () => {
      return await sendSystemNotification({
        userId: driverId,
        title: 'Trip Confirmed',
        message: 'Your trip has been confirmed',
        type: 'TRIP_CONFIRMED',
        data: { tripId }
      });
    });

    // Step 2: Wait 45s (email anti-spam)
    await step.sleep('email-delay', '45s');

    // Step 3: Send email to passenger
    await step.run('email-passenger', async () => {
      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
        include: {
          passenger: { select: { email: true, name: true } },
          driver: { select: { name: true } }
        }
      });

      return await sendEmail({
        to: trip.passenger.email,
        subject: 'Trip Confirmed',
        template: 'trip-confirmed',
        data: {
          passengerName: trip.passenger.name,
          driverName: trip.driver.name,
          tripDetails: trip
        }
      });
    });

    return { success: true, tripId };
  }
);
```

## ✅ Quick Pattern: Cron Job

```typescript
export const dailyTripCleanup = inngest.createFunction(
  {
    id: 'daily-trip-cleanup',
    name: 'Clean up old trips daily'
  },
  { cron: '0 2 * * *' }, // Every day at 2 AM
  async ({ step }) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await step.run('delete-old-trips', async () => {
      return await prisma.trip.deleteMany({
        where: {
          status: 'COMPLETED',
          completedAt: {
            lt: thirtyDaysAgo
          }
        }
      });
    });

    return { success: true };
  }
);
```

## 🔗 Detailed Documentation

For complete background jobs patterns, see:
- [background-jobs.md](../../docs/agent/patterns/background-jobs.md) - Inngest comprehensive guide
- [notifications.md](../../docs/agent/patterns/notifications.md) - Notification patterns

## ❌ Common Background Job Mistakes

- **Mistake**: Using `sendNotification` instead of `sendSystemNotification`
  - **Why**: Requires session which doesn't exist in background jobs
  - **Fix**: Use `sendSystemNotification` (no session required)

- **Mistake**: Sending multiple emails without delays
  - **Why**: Gets flagged as spam, emails blocked
  - **Fix**: Add 45s `step.sleep()` between emails

- **Mistake**: Not using steps for operations
  - **Why**: Operations aren't retried on failure
  - **Fix**: Wrap in `step.run()` for automatic retries

- **Mistake**: Trying to access session/auth in Inngest
  - **Why**: Background jobs have no request context
  - **Fix**: Pass userId/user data in event payload

- **Mistake**: Not handling errors in Inngest functions
  - **Why**: Silent failures, hard to debug
  - **Fix**: Use try-catch and log errors properly

## 📊 Event Triggering Pattern

```
User Action (Client)
    ↓
Server Action (src/actions/)
    ↓
Database Operation (Prisma)
    ↓
inngest.send({ event }) ← Trigger workflow
    ↓
Inngest Function (src/inngest/)
    ↓
Background Processing
    ├─ Notifications
    ├─ Emails (45s delays)
    ├─ External APIs
    └─ Data cleanup
```

## 📋 Background Jobs Checklist

Before marking Inngest work complete:

- [ ] Function uses `step.run()` for retryable operations
- [ ] Email delays implemented (45s between sends)
- [ ] Uses `sendSystemNotification` (not `sendNotification`)
- [ ] Event data validated and complete
- [ ] No session/auth access attempted
- [ ] Errors handled with try-catch
- [ ] Step names are descriptive
- [ ] Triggered from Server Actions after DB operations
- [ ] Event payload includes all necessary data
- [ ] Tested in Inngest dashboard (http://localhost:8288)
