import { NotificationRepository } from "./notification-repository"
import { 
  TargetedNotificationData, 
  NotificationResult, 
  WebSocketNotificationPayload,
  NotificationTargeting 
} from "@/types/notification-types"
import { ServiceError } from "@/lib/exceptions/service-error"

export class NotificationService {
  private repository: NotificationRepository

  constructor() {
    this.repository = new NotificationRepository()
  }

  async resolveTargetUsers(data: TargetedNotificationData): Promise<string[]> {
    let targetUserIds: string[] = []

    try {
      if (data.targetUserId) {
        // Single user targeting
        targetUserIds = [data.targetUserId]
      } else if (data.targetUserIds) {
        // Multiple users targeting - validate they exist
        targetUserIds = await this.repository.validateUserIds(data.targetUserIds)
      } else if (data.targetRole) {
        // Role-based targeting
        targetUserIds = await this.repository.getUsersByRole(data.targetRole)
      } else if (data.broadcast) {
        // Broadcast to all users
        targetUserIds = await this.repository.getAllUserIds()
      }

      if (targetUserIds.length === 0) {
        throw ServiceError.ValidationError(
          'No target users found for the specified criteria',
          'notification-service.ts',
          'resolveTargetUsers'
        )
      }

      return targetUserIds
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error
      }
      throw ServiceError.InternalError(
        'Failed to resolve target users',
        'notification-service.ts',
        'resolveTargetUsers'
      )
    }
  }

  async createNotifications(
    targetUserIds: string[],
    title: string,
    message: string,
    link?: string
  ): Promise<any[]> {
    try {
      // Use batch creation for better performance when dealing with many users
      if (targetUserIds.length > 50) {
        return await this.repository.createNotificationsBatch(targetUserIds, title, message, link)
      } else {
        return await this.repository.createNotifications(targetUserIds, title, message, link)
      }
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error
      }
      throw ServiceError.DatabaseError(
        'Failed to create notifications',
        'notification-service.ts',
        'createNotifications'
      )
    }
  }

  createWebSocketPayload(
    data: TargetedNotificationData,
    senderId: string
  ): WebSocketNotificationPayload {
    const targeting: NotificationTargeting = {}

    if (data.targetUserId) targeting.targetUserId = data.targetUserId
    if (data.targetUserIds) targeting.targetUserIds = data.targetUserIds
    if (data.broadcast) targeting.broadcast = data.broadcast
    if (data.targetRole) targeting.targetRole = data.targetRole

    return {
      type: 'notification_created',
      eventType: data.eventType,
      data: {
        senderId,
        timestamp: new Date().toISOString(),
        notification: {
          title: data.title,
          message: data.message,
          ...(data.link && { link: data.link }),
          ...(data.additionalData && { additionalData: data.additionalData })
        },
        targeting
      }
    }
  }

  async sendWebSocketNotification(payload: WebSocketNotificationPayload): Promise<boolean> {
    try {
      // Use the server-side WebSocket service
      const { WebSocketServerService } = await import('./websocket-server-service')
      return await WebSocketServerService.sendNotificationPayload(payload)
      
    } catch (error) {
      // Don't throw - WebSocket notification is optional and shouldn't fail the main operation
      console.error('WebSocket notification failed:', error instanceof Error ? error.message : 'Unknown error')
      return false
    }
  }

  async processTargetedNotification(
    data: TargetedNotificationData,
    senderId: string
  ): Promise<NotificationResult> {
    try {
      // Step 1: Resolve target users
      const targetUserIds = await this.resolveTargetUsers(data)

      // Step 2: Create notifications in database
      const createdNotifications = await this.createNotifications(
        targetUserIds,
        data.title,
        data.message,
        data.link
      )

      // Step 3: Send WebSocket notification (optional - doesn't fail the operation)
      const webSocketPayload = this.createWebSocketPayload(data, senderId)
      await this.sendWebSocketNotification(webSocketPayload)

      return {
        notificationsCreated: createdNotifications.length,
        targetUsers: targetUserIds.length
      }
      
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error
      }
      
      throw ServiceError.InternalError(
        'Failed to process targeted notification',
        'notification-service.ts',
        'processTargetedNotification'
      )
    }
  }
}

// Singleton instance
export const notificationService = new NotificationService()