import { FormattedUser } from '@/types/user-types'
import { UserVerificationStateUpdate } from '@/types/real-time-types'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'


interface UserState {
  user: FormattedUser | null
  setUser: (user: FormattedUser | null) => void
  updateUser: (userData: Partial<FormattedUser>) => void
  clearUser: () => void
  
  // Real-time update handlers
  handleVerificationUpdate: (update: UserVerificationStateUpdate, currentUserId?: string) => void
  
  // Real-time state tracking
  lastRealtimeUpdate: Date | null
  realtimeUpdatesEnabled: boolean
  setRealtimeUpdatesEnabled: (enabled: boolean) => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      lastRealtimeUpdate: null,
      realtimeUpdatesEnabled: true,
      
      setUser: (user) => set({ user }),
      
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null
        })),
      
      clearUser: () => {
        set({ user: null, lastRealtimeUpdate: null })
        localStorage.removeItem('user-storage')
      },
      
      setRealtimeUpdatesEnabled: (enabled: boolean) => {
        set({ realtimeUpdatesEnabled: enabled });
      },
      
      // Real-time verification update handler
      handleVerificationUpdate: (update: UserVerificationStateUpdate, currentUserId?: string) => {
        const currentState = get();
        
        // Only update if it's for the current user and real-time updates are enabled
        if (!currentState.realtimeUpdatesEnabled || 
            !currentState.user || 
            !currentUserId ||
            currentUserId !== update.userId) {
          return;
        }
        
        console.log('UserStore: Handling real-time verification update:', update);
        
        // Apply the partial user update from the real-time event
        set((state) => ({
          user: state.user ? { 
            ...state.user, 
            ...update.partialUserUpdate 
          } : null,
          lastRealtimeUpdate: new Date(),
        }));
        
        // Log the update for debugging
        console.log('UserStore: User updated via real-time event', {
          field: update.verificationField,
          status: update.status,
          userId: update.userId,
        });
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
      // Don't persist real-time state
      partialize: (state) => ({
        user: state.user
      }),
    }
  )
)

export const clearUser = useUserStore.getState().clearUser