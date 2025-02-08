// components/AuthCheck.tsx
'use client'

import { useEffect, useRef } from 'react'
import { useUser } from '@clerk/nextjs'
import { useUserStore } from '@/store/user-store'
import { toast } from 'sonner'
import { FormattedUser } from '@/types/user-types'

export function AuthCheck() {
  const { isSignedIn, isLoaded } = useUser()
  const user = useUserStore((state: { user: FormattedUser | null }) => state.user)
  const clearUser = useUserStore((state) => state.clearUser)
  const hasCleanedRef = useRef(false)
  const wasSignedInRef = useRef(false)

  useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn && user && !hasCleanedRef.current) {
        clearUser()
        localStorage.removeItem('user-storage')
        hasCleanedRef.current = true
        
        if (wasSignedInRef.current) {
          toast.error('Se ha cerrado tu sesión', {
            duration: 2000,
          })
        }
      } else if (isSignedIn) {
        hasCleanedRef.current = false
        wasSignedInRef.current = true
      }
    }
  }, [isLoaded, isSignedIn, user, clearUser])

  return null
}