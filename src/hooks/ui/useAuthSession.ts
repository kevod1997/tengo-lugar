// // hooks/auth/useAuthSession.ts - SOLO manejo de estado
// import { useEffect, useRef} from 'react'
// import { getUserById } from "@/actions"
// import { useLoadingStore } from "@/store/loadingStore"
// import { useUserStore } from "@/store/user-store"
// import { toast } from 'sonner'

// export function useAuthSession(initialSession: any) {
//     const { user, setUser, clearUser } = useUserStore()
//     const { startLoading, stopLoading, isLoading } = useLoadingStore()
//     const isLoadingUserRef = useRef(false)
//     const sessionExists = !!initialSession?.user?.id
//     const hasUserInStore = !!user
//     const isLoggingOut = isLoading('signingOut')

//     useEffect(() => {
//         if (isLoggingOut) return

//         // ✅ Sesión expirada
//         if (!sessionExists && hasUserInStore) {
//             clearUser()
//             toast.warning('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.')
//             return
//         }

//         // ✅ SOLO cargar si NO hay datos (refresco de página)
//         if (sessionExists && !hasUserInStore && !isLoadingUserRef.current) {
//             isLoadingUserRef.current = true

//             getUserById(initialSession.user.id)
//                 .then(userData => {
//                     if (userData) {
//                         setUser(userData)
//                         // ✅ SIN redirección - auth-redirect ya la hizo
//                     }
//                 })
//                 .catch((error) => {
//                     console.error('Error cargando usuario:', error)
//                     toast.error('Error al cargar los datos del usuario')
//                 })
//                 .finally(() => {
//                     isLoadingUserRef.current = false
//                 })
//         }

//     }, [sessionExists, hasUserInStore, isLoggingOut, initialSession?.user?.id, clearUser, setUser])

//     return {
//         isAuthenticated: sessionExists,
//         hasUserData: hasUserInStore,
//         isLoadingUser: isLoadingUserRef.current
//     }
// }

// hooks/auth/useAuthSession.ts
import { useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { getUserById } from "@/actions"
import { useLoadingStore } from "@/store/loadingStore"
import { useUserStore } from "@/store/user-store"
import { toast } from 'sonner'

export function useAuthSession(initialSession: any) {
    const { user, setUser, clearUser } = useUserStore()
    const { startLoading, stopLoading, isLoading } = useLoadingStore()
    const searchParams = useSearchParams()
    const router = useRouter()
    const isLoadingUserRef = useRef(false)

    // ✅ Estados derivados
    const sessionExists = !!initialSession?.user?.id
    const hasUserInStore = !!user
    const isLoggingOut = isLoading('signingOut')
    const shouldShowAuthLoading = searchParams.get('_authLoading') === '1'

    useEffect(() => {
        // ✅ 1. Activar loading INMEDIATAMENTE si viene de auth-redirect
        if (shouldShowAuthLoading && !isLoggingOut) {
            startLoading('authRedirect')
        }

        // ✅ 2. No hacer nada si está haciendo logout
        if (isLoggingOut) return

        // ✅ 3. Sesión expirada - limpiar store
        if (!sessionExists && hasUserInStore) {
            clearUser()
            toast.warning('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.')
            return
        }

        // ✅ 4. Cargar usuario si hay sesión pero no datos en store
        if (sessionExists && !hasUserInStore && !isLoadingUserRef.current) {
            isLoadingUserRef.current = true

            getUserById(initialSession.user.id)
                .then(userData => {
                    if (userData) {
                        setUser(userData)
                    }
                })
                .catch((error) => {
                    console.log('Error cargando usuario:', error)
                    toast.error('Error al cargar los datos del usuario')
                })
                .finally(() => {
                    isLoadingUserRef.current = false
                    stopLoading('authRedirect')

                    // ✅ 5. Limpiar parámetro de URL automáticamente
                    if (shouldShowAuthLoading) {
                        const currentUrl = new URL(window.location.href)
                        currentUrl.searchParams.delete('_authLoading')
                        router.replace(currentUrl.pathname + currentUrl.search, { scroll: false })
                    }
                })
        }

        // ✅ 6. Si no necesita cargar usuario pero tiene parámetro, limpiar
        if (shouldShowAuthLoading && (hasUserInStore || !sessionExists)) {
            stopLoading('authRedirect')
            const currentUrl = new URL(window.location.href)
            currentUrl.searchParams.delete('_authLoading')
            router.replace(currentUrl.pathname + currentUrl.search, { scroll: false })
        }

    }, [
        sessionExists, 
        hasUserInStore, 
        isLoggingOut, 
        shouldShowAuthLoading,
        initialSession?.user?.id
    ])

    return {
        isAuthenticated: sessionExists,
        hasUserData: hasUserInStore,
        isLoadingAuth: isLoading('authRedirect'),
        isLoadingUser: isLoadingUserRef.current
    }
}