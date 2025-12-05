import { useNotificationStore } from '@/store/notification-store'

import { useNotificationQueries } from './useNotificationQueries'

/**
 * Simplified notification hook that manages only DB notifications
 * UI state is handled by Zustand store
 */
export function useNotifications() {
  // Server state (database notifications)
  const {
    notifications,
    unreadCount,
    isLoadingNotifications,
    markAsRead,
    markAllAsRead,
    refetchNotifications,
    isMarkingAsRead,
    isMarkingAllAsRead,
  } = useNotificationQueries()

  // Client state (UI state only)
  const {
    isPanelOpen,
    setPanelOpen
  } = useNotificationStore()

  return {
    // Data from database
    notifications,
    unreadCount,
    
    // UI state
    isPanelOpen,
    setPanelOpen,
    
    // Loading states
    isLoading: isLoadingNotifications,
    isMarkingAsRead,
    isMarkingAllAsRead,
    
    // Actions
    markAsRead,
    markAllAsRead,
    refetchNotifications
  }
}