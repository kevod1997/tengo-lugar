import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

// Notification interface
export interface Notification {
  id: string
  title: string
  message: string
  link?: string | null
  read: boolean
  createdAt: string | Date
}

interface NotificationState {
  // UI state
  isPanelOpen: boolean
  
  // Actions
  setPanelOpen: (open: boolean) => void
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      // Initial state
      isPanelOpen: false,
      
      // Actions
      setPanelOpen: (open) => set({ isPanelOpen: open }),
    }),
    {
      name: 'notification-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist UI state
      partialize: (state) => ({
        isPanelOpen: state.isPanelOpen
      }),
    }
  )
)

// Export actions for external use
export const notificationActions = {
  setPanelOpen: useNotificationStore.getState().setPanelOpen,
}