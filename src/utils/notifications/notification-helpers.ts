import { TargetedNotificationData, NotificationRole } from "@/types/notification-types"
import { eventType } from "@/types/websocket-events"
import { sendTargetedNotification } from "@/actions/notifications/send-targeted-notification"

// Helper functions for common notification patterns
export async function notifyUser(
  userId: string, 
  title: string, 
  message: string, 
  eventType?: eventType, 
  link?: string,
  additionalData?: any
) {
  const data: TargetedNotificationData = {
    title,
    message,
    eventType,
    link,
    additionalData,
    targetUserId: userId
  }
  return sendTargetedNotification(data)
}

export async function notifyMultipleUsers(
  userIds: string[], 
  title: string, 
  message: string, 
  eventType?: eventType,
  link?: string,
  additionalData?: any
) {
  const data: TargetedNotificationData = {
    title,
    message,
    eventType,
    link,
    additionalData,
    targetUserIds: userIds
  }
  return sendTargetedNotification(data)
}

export async function notifyAllUsers(
  title: string, 
  message: string, 
  eventType?: eventType,
  link?: string,
  additionalData?: any
) {
  const data: TargetedNotificationData = {
    title,
    message,
    eventType,
    link,
    additionalData,
    broadcast: true
  }
  return sendTargetedNotification(data)
}

export async function notifyByRole(
  role: NotificationRole, 
  title: string, 
  message: string, 
  eventType?: eventType,
  link?: string,
  additionalData?: any
) {
  const data: TargetedNotificationData = {
    title,
    message,
    eventType,
    link,
    additionalData,
    targetRole: role
  }
  return sendTargetedNotification(data)
}

// Specialized notification helpers for common use cases
export async function notifyDrivers(
  title: string, 
  message: string, 
  eventType?: eventType,
  link?: string,
  additionalData?: any
) {
  return notifyByRole('driver', title, message, eventType, link, additionalData)
}

export async function notifyPassengers(
  title: string, 
  message: string, 
  eventType?: eventType,
  link?: string,
  additionalData?: any
) {
  return notifyByRole('passenger', title, message, eventType, link, additionalData)
}

export async function notifyAdmins(
  title: string, 
  message: string, 
  eventType?: eventType,
  link?: string,
  additionalData?: any
) {
  return notifyByRole('admin', title, message, eventType, link, additionalData)
}

// Trip-related notification helpers
export async function notifyTripParticipants(
  userIds: string[],
  title: string,
  message: string,
  eventType?: eventType,
  additionalData?: any,
  tripId?: string
) {
  const link = tripId ? `/trip/${tripId}` : undefined
  return notifyMultipleUsers(userIds, title, message, eventType, link, additionalData)
}

export async function notifyTripStatusChange(
  userIds: string[],
  status: string,
  tripId?: string
) {
  const title = 'Estado del viaje actualizado'
  const message = `El estado del viaje ha cambiado a: ${status}`
  const link = tripId ? `/trip/${tripId}` : undefined
  return notifyMultipleUsers(userIds, title, message, 'trip_status_changed', link)
}

// System notification helpers
export async function notifySystemMaintenance(
  title: string = 'Mantenimiento del sistema',
  message: string = 'El sistema estará en mantenimiento por un tiempo breve'
) {
  return notifyAllUsers(title, message, 'system_maintenance')
}

export async function notifyNewFeature(
  title: string,
  message: string,
  link?: string
) {
  return notifyAllUsers(title, message, 'new_feature', link)
}