'use server'

import { ApiHandler } from "@/lib/api-handler"
import { ServerActionError } from "@/lib/exceptions/server-action-error"
import { basicNotificationSchema } from "@/schemas/validation/notification-schema"
import { notificationService } from "@/services/notifications/notification-service"
import { eventType } from "@/types/websocket-events"
import prisma from "@/lib/prisma"

/**
 * Send a notification to a specific user from a system context (Inngest, webhooks, etc.)
 * This Server Action does NOT require user authentication as it's called from system processes.
 *
 * SECURITY NOTE: This is a Server Action ('use server') and can only be called from server-side code.
 * It is NOT exposed as a public API endpoint.
 *
 * @param userId - Target user ID to send notification to
 * @param title - Notification title
 * @param message - Notification message
 * @param eventType - Optional event type for client-side handling
 * @param link - Optional link for the notification
 * @param additionalData - Optional additional data
 */
export async function sendSystemNotification(
  userId: string,
  title: string,
  message: string,
  eventType?: eventType,
  link?: string,
  additionalData?: Record<string, unknown>
) {
  try {
    // 1. Validate input with Zod
    const validatedData = basicNotificationSchema.parse({
      title,
      message,
      eventType,
      link,
      additionalData
    })

    // 2. Verify that the target user exists in the database
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    })

    if (!userExists) {
      throw ServerActionError.ValidationFailed(
        'send-system-notification.ts',
        'sendSystemNotification',
        `Invalid userId - user does not exist: ${userId}`
      )
    }

    // 3. Use the notification service to process the notification
    // Note: We pass 'system' as the senderId to indicate this is a system-generated notification
    const result = await notificationService.processTargetedNotification(
      {
        title: validatedData.title,
        message: validatedData.message,
        eventType: validatedData.eventType,
        link: validatedData.link,
        additionalData: validatedData.additionalData,
        targetUserId: userId
      },
      'system' // System context - no specific user sender
    )

    return ApiHandler.handleSuccess({
      notificationsCreated: result.notificationsCreated,
      targetUsers: result.targetUsers
    }, `Notificación enviada exitosamente a usuario ${userId}`)

  } catch (error) {
    return ApiHandler.handleError(error)
  }
}
