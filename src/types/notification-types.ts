import type { EventType } from "./websocket-events"

export interface TargetedNotificationData {
  title: string
  message: string
  EventType?: EventType           // Optional EventType for user store updates
  link?: string
  additionalData?: any            // Optional additional data to include in the notification
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
  EventType?: EventType
  additionalData?: any
  targeting: NotificationTargeting
}

export interface WebSocketNotificationPayload {
  type: 'notification_created'
  EventType?: EventType
  data: {
    senderId: string
    timestamp: string
    notification: {
      title: string
      message: string
      link?: string
      additionalData?: any

    }
    targeting: NotificationTargeting
  }
}

export interface NotificationResult {
  notificationsCreated: number
  targetUsers: number
}

export type NotificationRole = 'driver' | 'passenger' | 'admin'