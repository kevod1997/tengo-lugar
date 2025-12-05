'use server'

import { z } from "zod"

import { ApiHandler } from "@/lib/api-handler"
import { ServerActionError } from "@/lib/exceptions/server-action-error"
import prisma from "@/lib/prisma"
import { logActionWithErrorHandling } from "@/services/logging/logging-service"
import { TipoAccionUsuario } from "@/types/actions-logs"
import { requireAuthentication } from "@/utils/helpers/auth-helper"


const markNotificationReadSchema = z.object({
  notificationId: z.string().min(1, 'ID de notificación requerido')
})

export async function markNotificationRead(data: { notificationId: string }) {
  try {
    // Authentication check
    const session = await requireAuthentication('mark-notification-read.ts', 'markNotificationRead')

    // Validation with Zod
    const validatedData = markNotificationReadSchema.parse(data)

    // Update notification as read in database transaction
    const result = await prisma.$transaction(async (tx) => {
      // Verify notification belongs to user
      const notification = await tx.notification.findFirst({
        where: {
          id: validatedData.notificationId,
          userId: session.user.id
        }
      })

      if (!notification) {
        throw ServerActionError.ValidationFailed(
          'mark-notification-read.ts',
          'markNotificationRead',
          'Notificación no encontrada o no pertenece al usuario'
        )
      }

      // Mark as read
      const updatedNotification = await tx.notification.update({
        where: {
          id: validatedData.notificationId
        },
        data: {
          read: true
        }
      })

      return updatedNotification
    })

    // Success logging
    await logActionWithErrorHandling({
      userId: session.user.id,
      action: TipoAccionUsuario.MARK_NOTIFICATION_READ,
      status: 'SUCCESS',
    }, { fileName: 'mark-notification-read.ts', functionName: 'markNotificationRead' })

    return ApiHandler.handleSuccess(result, 'Notificación marcada como leída')

  } catch (error) {
    return ApiHandler.handleError(error)
  }
}