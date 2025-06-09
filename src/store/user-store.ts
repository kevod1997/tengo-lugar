import { FormattedUser } from '@/types/user-types'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'


interface UserState {
  user: FormattedUser | null
  setUser: (user: FormattedUser | null) => void
  updateUser: (userData: Partial<FormattedUser>) => void
  clearUser: () => void
  lastFetch: number | null
  updateLastFetch: () => void
  shouldRefetch: (cacheTime?: number) => boolean
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user) => set({ user }),
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null
        })),
      clearUser: () => set({ user: null, lastFetch: null }),
      lastFetch: null,
      updateLastFetch: () => set({ lastFetch: Date.now() }),
      shouldRefetch: (cacheTime = 30000) => {
        const { lastFetch } = get()
        if (!lastFetch) return true
        return Date.now() - lastFetch > cacheTime
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),

    }
  )
)

export const clearUser = useUserStore.getState().clearUser