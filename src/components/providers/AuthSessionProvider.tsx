'use client'

import React from 'react'
import { useAuthSession } from '@/hooks/ui/useAuthSession'

interface AuthSessionProviderProps {
  children: React.ReactNode
  initialSession?: any
}

export function AuthSessionProvider({ children, initialSession }: AuthSessionProviderProps) {
  // This hook needs to be called inside the QueryProvider context
  useAuthSession(initialSession)

  return <>{children}</>
}