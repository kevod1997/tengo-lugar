'use server'

import { ApiHandler } from "@/lib/api-handler";
import { ServerActionError } from "@/lib/exceptions/server-action-error";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { logActionWithErrorHandling } from "@/services/logging/logging-service";
import { TipoAccionUsuario } from "@/types/actions-logs";
import webpush from 'web-push';

// Initialize web-push with VAPID details
webpush.setVapidDetails(
  'mailto:kevindefalco@gmail.com', // Change to your email
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

// Type for our subscription object
interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// Subscribe a user to push notifications
export async function subscribeUserToPush(subscription: PushSubscriptionData) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw ServerActionError.AuthenticationFailed('push-notifications.ts', 'subscribeUserToPush');
    }

    const userId = session.user.id;

    // Store subscription in database
    await prisma.pushSubscription.upsert({
      where: { 
        endpoint: subscription.endpoint
      },
      update: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        updatedAt: new Date()
      },
      create: {
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth
      },
    });

    await logActionWithErrorHandling(
      {
        userId,
        action: TipoAccionUsuario.SUSCRIPCION_NOTIFICACIONES,
        status: 'SUCCESS',
        details: { endpoint: subscription.endpoint }
      },
      {
        fileName: 'push-notifications.ts',
        functionName: 'subscribeUserToPush'
      }
    );

    return ApiHandler.handleSuccess(null, 'Suscripción a notificaciones exitosa');
  } catch (error) {
    return ApiHandler.handleError(error);
  }
}

// Unsubscribe a user from push notifications
export async function unsubscribeUserFromPush(endpoint: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw ServerActionError.AuthenticationFailed('push-notifications.ts', 'unsubscribeUserFromPush');
    }

    const userId = session.user.id;

    // Remove subscription from database
    await prisma.pushSubscription.delete({
      where: { 
        endpoint: endpoint
      }
    });

    await logActionWithErrorHandling(
      {
        userId,
        action: TipoAccionUsuario.CANCELACION_SUSCRIPCION_NOTIFICACIONES,
        status: 'SUCCESS',
        details: { endpoint }
      },
      {
        fileName: 'push-notifications.ts',
        functionName: 'unsubscribeUserFromPush'
      }
    );

    return ApiHandler.handleSuccess(null, 'Cancelación de suscripción exitosa');
  } catch (error) {
    return ApiHandler.handleError(error);
  }
}

// Send notification to a specific user
export async function sendNotificationToUser(userId: string, title: string, body: string, data: Record<string, any> = {}) {
  try {
    // Get all subscriptions for the user
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId }
    });

    if (subscriptions.length === 0) {
      return ApiHandler.handleSuccess({ sent: false }, 'Usuario no tiene suscripciones activas');
    }

    const failedEndpoints = [];
    const payload = JSON.stringify({
      title,
      body,
      icon: '/icon.png', // Customize as needed
      ...data
    });

    // Send to all subscriptions (a user might have multiple devices)
    for (const subscription of subscriptions) {
      try {
        await webpush.sendNotification({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth
          }
        }, payload);
      } catch (error) {
        // If subscription is expired or invalid, remove it
        if ((error as any).statusCode === 404 || (error as any).statusCode === 410) {
          await prisma.pushSubscription.delete({
            where: { endpoint: subscription.endpoint }
          });
        }
        failedEndpoints.push(subscription.endpoint);
      }
    }

    await logActionWithErrorHandling(
      {
        userId,
        action: TipoAccionUsuario.ENVIO_NOTIFICACION,
        status: failedEndpoints.length === subscriptions.length ? 'FAILED' : 'SUCCESS',
        details: { 
          title, 
          body,
          failedEndpoints,
          successCount: subscriptions.length - failedEndpoints.length,
          totalCount: subscriptions.length
        }
      },
      {
        fileName: 'push-notifications.ts',
        functionName: 'sendNotificationToUser'
      }
    );

    return ApiHandler.handleSuccess({
      sent: failedEndpoints.length < subscriptions.length,
      successCount: subscriptions.length - failedEndpoints.length,
      totalCount: subscriptions.length
    });
  } catch (error) {
    return ApiHandler.handleError(error);
  }
}

// Send notification to multiple users
export async function sendNotificationToManyUsers(userIds: string[], title: string, body: string, data: Record<string, any> = {}) {
  try {
    const results = await Promise.all(
      userIds.map(userId => sendNotificationToUser(userId, title, body, data))
    );
    
    return ApiHandler.handleSuccess({
      results
    });
  } catch (error) {
    return ApiHandler.handleError(error);
  }
}