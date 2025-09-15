import { eventType } from "./websocket-events"

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

export interface NotificationTargeting {
  targetUserId?: string
  targetUserIds?: string[]
  broadcast?: boolean
  targetRole?: 'driver' | 'passenger' | 'admin'
}

export interface NotificationPayload {
  title: string
  message: string
  link?: string
  eventType?: eventType
  targeting: NotificationTargeting
}

export interface WebSocketNotificationPayload {
  type: 'notification_created'
  eventType?: eventType
  data: {
    senderId: string
    timestamp: string
    notification: {
      title: string
      message: string
      link?: string
    }
    targeting: NotificationTargeting
  }
}

export interface NotificationResult {
  notificationsCreated: number
  targetUsers: number
}

export type NotificationRole = 'driver' | 'passenger' | 'admin'