// Export all notification server actions
export { getNotifications } from './get-notifications'
export { markNotificationRead } from './mark-notification-read'
export { markAllNotificationsRead } from './mark-all-notifications-read'
export { sendTargetedNotification } from './send-targeted-notification'

// Export helper functions from utils module
export {
  notifyUser,
  notifyMultipleUsers, 
  notifyAllUsers,
  notifyByRole,
  notifyDrivers,
  notifyPassengers,
  notifyAdmins,
  notifyTripParticipants,
  notifyTripStatusChange,
  notifySystemMaintenance,
  notifyNewFeature
} from '@/utils/notifications/notification-helpers'

// Export types from the new types module
export type { TargetedNotificationData } from '@/types/notification-types'