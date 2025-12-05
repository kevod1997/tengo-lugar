'use server'

import { ApiHandler } from "@/lib/api-handler"
import { sendTargetedNotificationSchema } from "@/schemas/validation/notification-schema"
import { logActionWithErrorHandling } from "@/services/logging/logging-service"
import { notificationService } from "@/services/notifications/notification-service"
import { TipoAccionUsuario } from "@/types/actions-logs"
import type { TargetedNotificationData } from "@/types/notification-types"
import { requireAuthentication } from "@/utils/helpers/auth-helper"


export async function sendTargetedNotification(data: TargetedNotificationData) {
  try {
    // Authentication check
    //todo ver esto bien por temas de seguridad
    const session = await requireAuthentication('send-targeted-notification.ts', 'sendTargetedNotification')

    // Validation with Zod
    const validatedData = sendTargetedNotificationSchema.parse(data)

    // Use the notification service to process the targeted notification
    const result = await notificationService.processTargetedNotification(
      validatedData,
      session.user.id
    )

    // Success logging
    await logActionWithErrorHandling({
      userId: session.user.id,
      action: TipoAccionUsuario.ENVIO_NOTIFICACION,
      status: 'SUCCESS',
      details: {
        title: validatedData.title,
        notificationsCreated: result.notificationsCreated,
        targeting: {
          ...(validatedData.targetUserId && { targetUserId: validatedData.targetUserId }),
          ...(validatedData.targetUserIds && { targetUserIds: validatedData.targetUserIds }),
          ...(validatedData.broadcast && { broadcast: validatedData.broadcast }),
          ...(validatedData.targetRole && { targetRole: validatedData.targetRole })
        }
      }
    }, { fileName: 'send-targeted-notification.ts', functionName: 'sendTargetedNotification' })

    return ApiHandler.handleSuccess({
      notificationsCreated: result.notificationsCreated,
      targetUsers: result.targetUsers
    }, `${result.notificationsCreated} notificaciones creadas exitosamente`)

  } catch (error) {
    return ApiHandler.handleError(error)
  }
}

