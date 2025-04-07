'use client'

import { ReactNode } from 'react'
import { AuthProvider } from './AuthProvider'

export function ClientAuthWrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}