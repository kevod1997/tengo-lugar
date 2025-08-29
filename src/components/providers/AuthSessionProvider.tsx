'use client'

import React, { createContext, useContext } from 'react'
import { useAuthSession } from '@/hooks/ui/useAuthSession'
import { useUserStore } from '@/store/user-store'

interface AuthSessionProviderProps {
  children: React.ReactNode
  initialSession?: any
}

interface AuthContextValue {
  isAuthenticated: boolean
  user: any | null
  isLoading: boolean
  hasUserData: boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthSessionProvider({ children, initialSession }: AuthSessionProviderProps) {
  // This hook needs to be called inside the QueryProvider context
  const authState = useAuthSession(initialSession)
  const { user } = useUserStore()

  // Create context value combining auth session state and user store
  const contextValue: AuthContextValue = {
    isAuthenticated: authState.isAuthenticated,
    user: user,
    isLoading: authState.isLoadingAuth || authState.isLoadingUser,
    hasUserData: authState.hasUserData
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook to consume auth context
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthSessionProvider')
  }
  return context
}