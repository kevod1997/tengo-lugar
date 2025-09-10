'use server'

import { requireAuthentication } from "@/utils/helpers/auth-helper"
import { ServerActionError } from "@/lib/exceptions/server-action-error"
import { ApiHandler } from "@/lib/api-handler"
import { logActionWithErrorHandling } from "@/services/logging/logging-service"
import { TipoAccionUsuario } from "@/types/actions-logs"
import prisma from "@/lib/prisma"
import { z } from "zod"
import { eventType } from "@/types/websocket-events"

const sendTargetedNotificationSchema = z.object({
  title: z.string().min(1, 'Título requerido').max(200, 'Título muy largo'),
  message: z.string().min(1, 'Mensaje requerido'),
  eventType: z.string().optional(), // Optional eventType for user store updates
  link: z.string().url().optional().or(z.literal('')),
  // Targeting options (only one should be provided)
  targetUserId: z.string().optional(),
  targetUserIds: z.array(z.string()).optional(),
  broadcast: z.boolean().optional(),
  targetRole: z.enum(['driver', 'passenger', 'admin']).optional(),
}).refine((data) => {
  // Ensure only one targeting option is provided
  const targetingOptions = [data.targetUserId, data.targetUserIds, data.broadcast, data.targetRole]
  const providedOptions = targetingOptions.filter(option => option !== undefined && option !== false)
  return providedOptions.length === 1
}, {
  message: "Debe proporcionar exactamente una opción de targeting: targetUserId, targetUserIds, broadcast, o targetRole"
})

export interface TargetedNotificationData {
  title: string
  message: string
  eventType?: eventType           // Optional eventType for user store updates
  link?: string
  // Targeting options (only one should be used)
  targetUserId?: string           // Send to specific user
  targetUserIds?: string[]        // Send to multiple specific users
  broadcast?: boolean             // Send to all connected users
  targetRole?: 'driver' | 'passenger' | 'admin' // Send to users with specific role
}

export async function sendTargetedNotification(data: TargetedNotificationData) {
  try {
    // Authentication check
    //todo ver esto bien por temas de seguridad
    const session = await requireAuthentication('send-targeted-notification.ts', 'sendTargetedNotification')

    // Validation with Zod
    const validatedData = sendTargetedNotificationSchema.parse(data)

    // Step 1: Determine target users and create notifications in database
    let targetUserIds: string[] = []
    const createdNotifications: any[] = []

    if (validatedData.targetUserId) {
      // Single user targeting
      targetUserIds = [validatedData.targetUserId]
    } else if (validatedData.targetUserIds) {
      // Multiple users targeting
      targetUserIds = validatedData.targetUserIds
    } else if (validatedData.targetRole) {
      // Role-based targeting - get all users with specific role
      let whereCondition: any = {}

      if (validatedData.targetRole === 'driver') {
        whereCondition = { driver: { isNot: null } }
      } else if (validatedData.targetRole === 'passenger') {
        whereCondition = { passenger: { isNot: null } }
      } else if (validatedData.targetRole === 'admin') {
        whereCondition = { role: 'ADMIN' }
      }

      const usersWithRole = await prisma.user.findMany({
        where: whereCondition,
        select: { id: true }
      })
      targetUserIds = usersWithRole.map(user => user.id)
    } else if (validatedData.broadcast) {
      // Broadcast to all users
      const allUsers = await prisma.user.findMany({
        select: { id: true }
      })
      targetUserIds = allUsers.map(user => user.id)
    }

    if (targetUserIds.length === 0) {
      throw ServerActionError.ValidationFailed('send-targeted-notification.ts', 'sendTargetedNotification', 'No target users found')
    }

    // Step 2: Create notifications in database using transaction
    await prisma.$transaction(async (tx) => {
      for (const userId of targetUserIds) {
        const notification = await tx.notification.create({
          data: {
            title: validatedData.title,
            message: validatedData.message,
            link: validatedData.link || null,
            userId: userId,
            read: false
          }
        })
        createdNotifications.push(notification)
      }
    })

    // Step 3: Notify WebSocket server (optional - doesn't fail the operation)
    const webSocketServerUrl = process.env.WEBSOCKET_SERVER_URL
    const webSocketUsername = process.env.WEBSOCKET_USERNAME
    const webSocketPassword = process.env.WEBSOCKET_PASSWORD
    const websocketUserAgent = process.env.WEBSOCKET_USER_AGENT || 'TengoLugar-MainApp'

    if (webSocketServerUrl && webSocketUsername && webSocketPassword) {
      // Prepare metadata payload for WebSocket server
      const wsPayload = {
        type: 'notification_created',
        eventType: validatedData.eventType,
        data: {
          senderId: session.user.id,
          timestamp: new Date().toISOString(),
          notification: {
            title: validatedData.title,        
            message: validatedData.message,    
            ...(validatedData.link && { link: validatedData.link }) 
      },
      // Send targeting metadata (not the actual notifications)
      targeting: {
          ...(validatedData.targetUserId && { targetUserId: validatedData.targetUserId }),
          ...(validatedData.targetUserIds && { targetUserIds: validatedData.targetUserIds }),
          ...(validatedData.broadcast && { broadcast: validatedData.broadcast }),
              ...(validatedData.targetRole && { targetRole: validatedData.targetRole })
            }
          }
        }

      try {
          // Send metadata to WebSocket server
          const response = await fetch(`${webSocketServerUrl}/api/notifications/trigger`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Basic ${Buffer.from(`${webSocketUsername}:${webSocketPassword}`).toString('base64')}`,
              'User-Agent': websocketUserAgent
            },
            body: JSON.stringify(wsPayload)
          })
        console.log(response)
        if(!response.ok) {
          // Log WebSocket error but don't fail the operation
          console.error(`WebSocket notification failed: ${response.status} ${response.statusText}`)
    }
  } catch (wsError) {
    // Log WebSocket error but don't fail the operation
    console.error('WebSocket notification failed:', wsError)
  }
}

// Step 4: Success logging
await logActionWithErrorHandling({
  userId: session.user.id,
  action: TipoAccionUsuario.ENVIO_NOTIFICACION,
  status: 'SUCCESS',
  details: {
    title: validatedData.title,
    notificationsCreated: createdNotifications.length,
    targeting: {
      ...(validatedData.targetUserId && { targetUserId: validatedData.targetUserId }),
      ...(validatedData.targetUserIds && { targetUserIds: validatedData.targetUserIds }),
      ...(validatedData.broadcast && { broadcast: validatedData.broadcast }),
      ...(validatedData.targetRole && { targetRole: validatedData.targetRole })
    }
  }
}, { fileName: 'send-targeted-notification.ts', functionName: 'sendTargetedNotification' })

return ApiHandler.handleSuccess({
  notificationsCreated: createdNotifications.length,
  targetUsers: targetUserIds.length
}, `${createdNotifications.length} notificaciones creadas exitosamente`)


  } catch (error) {
  return ApiHandler.handleError(error)
}
}

// Helper functions for common notification patterns
export async function notifyUser(userId: string, title: string, message: string, eventType?: eventType, link?: string) {
  return sendTargetedNotification({
    title,
    message,
    eventType,
    link,
    targetUserId: userId
  })
}

export async function notifyMultipleUsers(userIds: string[], title: string, message: string, link?: string) {
  return sendTargetedNotification({
    title,
    message,
    link,
    targetUserIds: userIds
  })
}

export async function notifyAllUsers(title: string, message: string, link?: string) {
  return sendTargetedNotification({
    title,
    message,
    link,
    broadcast: true
  })
}

export async function notifyByRole(role: 'driver' | 'passenger' | 'admin', title: string, message: string, link?: string) {
  return sendTargetedNotification({
    title,
    message,
    link,
    targetRole: role
  })
}