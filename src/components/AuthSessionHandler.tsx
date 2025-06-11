'use client'

import { getUserById } from "@/actions"
import { useLoadingStore } from "@/store/loadingStore"
import { useUserStore } from "@/store/user-store"
import { useEffect, useRef } from "react"

interface AuthSessionHandlerProps {
  initialSession: any
}

export function AuthSessionHandler({ initialSession }: AuthSessionHandlerProps) {
  const { user, setUser } = useUserStore()
  const { startLoading, stopLoading, isLoading } = useLoadingStore()
  const isLoadingUser = useRef(false)

  useEffect(() => {
    const sessionExists = !!initialSession?.user?.id
    const hasUserInStore = !!user
    const isLoggingOut = isLoading('signingOut') // ✅ Check logout activo

    // ✅ NO hacer nada si está haciendo logout
    if (isLoggingOut) {
      return
    }

    // ✅ Solo cargar usuario si hay session válida y no hay datos
    if (sessionExists && !hasUserInStore && !isLoadingUser.current) {
      isLoadingUser.current = true
      
      startLoading('authRedirect')
      
      getUserById(initialSession.user.id)
        .then(userData => userData && setUser(userData))
        .catch(console.error)
        .finally(() => {
          isLoadingUser.current = false
          stopLoading('authRedirect')
        })
    }

  }, [initialSession?.user?.id, !!user, isLoading('signingOut')]) // ✅ Agregar logout dependency

  return null
}