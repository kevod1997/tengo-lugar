// // components/AuthSessionHandler.tsx
// 'use client'

// import { useEffect, useRef, useCallback, useState } from 'react'
// import { useUserStore } from '@/store/user-store'
// import { authClient } from '@/lib/auth-client'
// import { getUserById } from '@/actions'
// import { toast } from 'sonner'
// import { useRouter, usePathname, useSearchParams } from 'next/navigation'

// export function AuthSessionHandler() {
//     const { data: session, isPending } = authClient.useSession()
//     const { user, setUser, clearUser, shouldRefetch, updateLastFetch } = useUserStore()
//     const [isLoading, setIsLoading] = useState(false)
//     const router = useRouter()
//     const pathname = usePathname()
//     const searchParams = useSearchParams()
//     const wasSignedInRef = useRef(false)
//     const lastFetchRef = useRef<number>(0)


//     const fetchUserData = useCallback(async (userId: string, force = false) => {
//         // Evitar múltiples fetches simultáneos
//         if (isLoading) return

//         // Check cache usando el store persistente
//         if (!force && !shouldRefetch()) {
//             return
//         }

//         setIsLoading(true)

//         try {
//             const userData = await getUserById(userId)
//             if (userData) {
//                 setUser(userData)
//                 updateLastFetch() // ← Actualizar timestamp en store
//             }
//         } catch (error) {
//             console.error('Failed to fetch user data:', error)
//         } finally {
//             setIsLoading(false)
//         }
//     }, [setUser, updateLastFetch, shouldRefetch, isLoading])

//     useEffect(() => {
//         if (!isPending) {
//             // Si hay sesión, marcar como logueado
//             if (session?.user?.id) {
//                 wasSignedInRef.current = true

//                 // Detectar señal de refresh desde auth-redirect
//                 const shouldRefreshUser = searchParams.get('_refreshUser') === '1'
//                 const needsUserData = !user || shouldRefreshUser

//                 if (needsUserData) {
//                     fetchUserData(session.user.id, shouldRefreshUser)

//                     // Limpiar el parámetro de la URL después de procesar
//                     if (shouldRefreshUser) {
//                         const newUrl = new URL(window.location.href)
//                         newUrl.searchParams.delete('_refreshUser')
//                         router.replace(newUrl.pathname + newUrl.search)
//                     }
//                 }
//             }

//             // ✅ Si NO hay sesión pero había estado logueado (logout)
//             else if (!session && wasSignedInRef.current) {
//                 console.log('Detectado logout - limpiando store')
//                 clearUser()
//                 localStorage.removeItem('user-storage') // ← Asegurar limpieza
//                 wasSignedInRef.current = false

//                 // Solo mostrar toast si no estamos en páginas de auth
//                 if (!pathname.includes('/login') && !pathname.includes('/auth')) {
//                     toast.error('Su sesión ha expirado', { duration: 2000 })
//                     router.push('/')
//                 }
//             }
//         }
//     }, [
//         session,
//         isPending,
//         user,
//         searchParams,
//         fetchUserData,
//         clearUser,
//         router,
//         pathname
//     ])

//     return null // No renderiza nada
// }

// components/AuthSessionHandler.tsx (Con loading state)
'use client'

import { useEffect, useRef } from 'react'
import { useUserStore } from '@/store/user-store'
import { authClient } from '@/lib/auth-client'
import { getUserById } from '@/actions'
import { toast } from 'sonner'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useLoadingStore } from '@/store/loadingStore'


export function AuthSessionHandler() {
  const { data: session, isPending } = authClient.useSession()
  const { user, setUser, clearUser } = useUserStore()
  const { startLoading, stopLoading, isLoading } = useLoadingStore()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const wasSignedInRef = useRef(false)

  // ✅ Detectar si estamos cargando datos del usuario
  const isLoadingUserData = isLoading('fetchingUser')

  useEffect(() => {
    if (isPending) return

    // ✅ Usuario logueado pero no hay data en store
    if (session?.user?.id && !user && !isLoadingUserData) {
      wasSignedInRef.current = true
      
      // ✅ Activar loading state
      startLoading('fetchingUser')
      
      getUserById(session.user.id)
        .then(userData => {
          if (userData) {
            setUser(userData)
          }
        })
        .catch(error => {
          console.error('Failed to fetch user data:', error)
        })
        .finally(() => {
          // ✅ Desactivar loading state
          stopLoading('fetchingUser')
        })
    }
    
    // ✅ Logout detectado
    else if (!session && user && wasSignedInRef.current) {
      clearUser()
      wasSignedInRef.current = false
      
      if (!pathname.includes('/login')) {
        toast.error('Su sesión ha expirado', { duration: 2000 })
        router.push('/')
      }
    }
    
    if (session?.user) {
      wasSignedInRef.current = true
    }

  }, [session, isPending, user, isLoadingUserData, setUser, clearUser, startLoading, stopLoading, router, pathname])

  // ✅ Manejar refresh desde auth-redirect
  useEffect(() => {
    const shouldRefreshUser = searchParams.get('_refreshUser') === '1'
    
    if (shouldRefreshUser && session?.user?.id && !isLoadingUserData) {
      startLoading('fetchingUser')
      
      getUserById(session.user.id)
        .then(userData => {
          if (userData) {
            setUser(userData)
          }
        })
        .catch(error => {
          console.error('Failed to refresh user data:', error)
        })
        .finally(() => {
          stopLoading('fetchingUser')
        })
      
      // Limpiar parámetro URL
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('_refreshUser')
      router.replace(newUrl.pathname + newUrl.search, { scroll: false })
    }
  }, [searchParams, session, setUser, router, isLoadingUserData, startLoading, stopLoading])

  return null
}