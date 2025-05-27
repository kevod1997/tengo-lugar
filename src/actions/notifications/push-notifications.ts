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
export async function subscribeUser(subscription: PushSubscriptionData) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw ServerActionError.AuthenticationFailed('push-notifications.ts', 'subscribeUser');
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
        functionName: 'subscribeUser'
      }
    );

    return ApiHandler.handleSuccess(null, 'Suscripción a notificaciones exitosa');
  } catch (error) {
    console.log('Error subscribing user:', error);
    return ApiHandler.handleError(error);
  }
}

// Unsubscribe a user from push notifications
export async function unsubscribeUser(endpoint: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw ServerActionError.AuthenticationFailed('push-notifications.ts', 'unsubscribeUser');
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
        functionName: 'unsubscribeUser'
      }
    );

    return ApiHandler.handleSuccess(null, 'Cancelación de suscripción exitosa');
  } catch (error) {
    return ApiHandler.handleError(error);
  }
}

// Send a test notification to the current user
export async function sendTestNotification(message: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw ServerActionError.AuthenticationFailed('push-notifications.ts', 'sendTestNotification');
    }

    const userId = session.user.id;
    
    // Get all subscriptions for the current user
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId }
    });

    if (subscriptions.length === 0) {
      return ApiHandler.handleSuccess({ 
        sent: false,
        message: 'No hay suscripciones para este usuario',
        // Add these to match the expected structure
        successCount: 0,
        total: 0
      });
    }

    let successCount = 0;
    const failedEndpoints = [];

    // Send notification to all user's subscriptions
    for (const subscription of subscriptions) {
      try {
        await webpush.sendNotification({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth
          }
        }, JSON.stringify({
          title: 'Notificación de prueba',
          body: message,
          icon: '/icon.png'
        }));
        
        successCount++;
      } catch (error) {
        // If subscription is expired, remove it
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
        status: successCount > 0 ? 'SUCCESS' : 'FAILED',
        details: { 
          message,
          successCount,
          failedCount: failedEndpoints.length
        }
      },
      {
        fileName: 'push-notifications.ts',
        functionName: 'sendTestNotification'
      }
    );

    return ApiHandler.handleSuccess({
      sent: successCount > 0,
      successCount,
      total: subscriptions.length,
      // Add this to match the expected structure
      message: `Notificación enviada a ${successCount} de ${subscriptions.length} dispositivos`
    });
    
  } catch (error) {
    return ApiHandler.handleError(error);
  }
}