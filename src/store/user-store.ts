import { FormattedUser } from '@/types/user-types'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'


interface UserState {
  user: FormattedUser | null
  setUser: (user: FormattedUser | null) => void
  updateUser: (userData: Partial<FormattedUser>) => void
  clearUser: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      updateUser: (userData) => 
        set((state) => ({ 
          user: state.user ? { ...state.user, ...userData } : null 
        })),
      clearUser: () => set({ user: null }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
      
    }
  )
)

export const clearUser = useUserStore.getState().clearUser