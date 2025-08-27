'use server'

import { requireAuthentication } from "@/utils/helpers/auth-helper"
import prisma from "@/lib/prisma"
import { ApiHandler } from "@/lib/api-handler"
import { logActionWithErrorHandling } from "@/services/logging/logging-service"
import { TipoAccionUsuario } from "@/types/actions-logs"

export async function markAllNotificationsRead() {
  try {
    // Authentication check
    const session = await requireAuthentication('mark-all-notifications-read.ts', 'markAllNotificationsRead')

    // Mark all user notifications as read in database transaction
    const result = await prisma.$transaction(async (tx) => {
      const updatedNotifications = await tx.notification.updateMany({
        where: {
          userId: session.user.id,
          read: false
        },
        data: {
          read: true
        }
      })

      return updatedNotifications
    })

    // Success logging
    await logActionWithErrorHandling({
      userId: session.user.id,
      action: TipoAccionUsuario.MARK_ALL_NOTIFICATIONS_READ,
      status: 'SUCCESS',
    }, { fileName: 'mark-all-notifications-read.ts', functionName: 'markAllNotificationsRead' })

    return ApiHandler.handleSuccess(result, 'Todas las notificaciones marcadas como leídas')

  } catch (error) {
    return ApiHandler.handleError(error)
  }
}