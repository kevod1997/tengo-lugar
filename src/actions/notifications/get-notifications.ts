'use server'

import { auth, Session } from "@/lib/auth"
import { headers } from "next/headers"
import prisma from "@/lib/prisma"
import { ApiHandler } from "@/lib/api-handler"
import { ServerActionError } from "@/lib/exceptions/server-action-error"
import { logActionWithErrorHandling } from "@/services/logging/logging-service"
import { TipoAccionUsuario } from "@/types/actions-logs"

export async function getNotifications() {
  try {
    // Authentication check
    const session: Session | null = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      throw ServerActionError.AuthenticationFailed('get-notifications.ts', 'getNotifications')
    }

    // Get user notifications from database
    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 6 // Limit to latest 6 notifications for UI performance
    })

    // Success logging
    await logActionWithErrorHandling({
      userId: session.user.id,
      action: TipoAccionUsuario.GET_NOTIFICATIONS,
      status: 'SUCCESS',
    }, { fileName: 'get-notifications.ts', functionName: 'getNotifications' })

    return ApiHandler.handleSuccess(notifications, 'Notificaciones obtenidas exitosamente')

  } catch (error) {
    return ApiHandler.handleError(error)
  }
}