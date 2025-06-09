// components/AuthSessionHandler.tsx
'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useUserStore } from '@/store/user-store'
import { authClient } from '@/lib/auth-client'
import { getUserById } from '@/actions'
import { toast } from 'sonner'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

export function AuthSessionHandler() {
  const { data: session, isPending } = authClient.useSession()
  const { user, setUser, clearUser, shouldRefetch, updateLastFetch } = useUserStore()
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const wasSignedInRef = useRef(false)
  const lastFetchRef = useRef<number>(0)


  const fetchUserData = useCallback(async (userId: string, force = false) => {
    // Evitar múltiples fetches simultáneos
    if (isLoading) return
    
    // Check cache usando el store persistente
    if (!force && !shouldRefetch()) {
      return
    }

    setIsLoading(true)
    
    try {
      const userData = await getUserById(userId)
      if (userData) {
        setUser(userData)
        updateLastFetch() // ← Actualizar timestamp en store
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [setUser, updateLastFetch, shouldRefetch, isLoading])

  useEffect(() => {
    if (!isPending) {
      // Marcar que hubo una sesión activa
      if (user) {
        wasSignedInRef.current = true
      }

      // Detectar señal de refresh desde auth-redirect
      const shouldRefreshUser = searchParams.get('_refreshUser') === '1'

      // Casos donde necesitamos cargar/actualizar datos del usuario
      if (session?.user?.id) {
        const needsUserData = !user || shouldRefreshUser
        
        if (needsUserData) {
          fetchUserData(session.user.id, shouldRefreshUser)
          
          // Limpiar el parámetro de la URL después de procesar
          if (shouldRefreshUser) {
            const newUrl = new URL(window.location.href)
            newUrl.searchParams.delete('_refreshUser')
            
            // Usar replace para no agregar entrada al historial
            router.replace(newUrl.pathname + newUrl.search)
          }
        }
      }

      // Si NO hay sesión pero SÍ hay usuario en store (sesión expiró)
      if (!session && user && wasSignedInRef.current) {
        clearUser()
        localStorage.removeItem('user-storage')
        
        // Reset refs
        lastFetchRef.current = 0
        wasSignedInRef.current = false
        
        // Solo mostrar toast si no estamos en páginas de auth
        if (!pathname.includes('/login') && !pathname.includes('/auth')) {
          toast.error('Su sesión ha expirado', { duration: 2000 })
          router.push('/login')
        }
      }
    }
  }, [
    session, 
    isPending, 
    user, 
    searchParams, 
    fetchUserData, 
    clearUser, 
    router, 
    pathname
  ])

  return null // No renderiza nada
}