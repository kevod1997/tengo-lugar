'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUserStore } from '@/store/user-store'
import { getUserById } from '@/actions'
import Loading from '../loading'
import { VerificationStatus } from '@prisma/client'
import { authClient } from '@/lib/auth-client'
import { LoggingService } from '@/services/logging/logging-service'
import { TipoAccionUsuario } from '@/types/actions-logs'

//todo tengo que ver como hacemos para actualizar la info del usuario si voy a manejarla desde el localstorage usando el store de zustand, porque tal vez la verificamos en el mismo momento que hay navegacion y genera problemas de navegacion en el usuario, recorda la siotuacion de cuando sos admin y usuario al mismo tiempo y te verificas info, esta no se actualiza en el store en vivo.ñ

// Internal component
function AuthRedirectContent() {
  const router = useRouter()
  const { data, isPending } = authClient.useSession()
  const searchParams = useSearchParams()
  const { setUser } = useUserStore()
  const [error, setError] = useState<string | null>(null)
  const [loggedAction, setLoggedAction] = useState(false)

  // Función para validar URLs de redirección
  const isValidRedirectUrl = (url: string) => {
    // Verificar si la URL es relativa (comienza con /)
    if (url.startsWith('/')) return true

    try {
      // Si es una URL absoluta, verificar que sea del mismo dominio
      const urlObj = new URL(url)
      return urlObj.hostname === window.location.hostname
    } catch {
      return false
    }
  }

  useEffect(() => {
    async function checkUserAndRedirect() {
      if (!isPending && data) {
        try {
          // Registrar la acción de autenticación (solo una vez)
          if (!loggedAction && data.user && data.user.id) {
            // Obtenemos información sobre el usuario
            const dbUser = await getUserById(data.user.id)

            // Detectamos si es un usuario nuevo por su fecha de creación
            const isNewUser = dbUser &&
              new Date().getTime() - new Date(dbUser.createdAt).getTime() < 60000; // Usuario creado hace menos de 1 minuto

            // Registramos la acción correspondiente
            await LoggingService.logActionWithErrorHandling(
              {
                userId: data.user.id,
                action: isNewUser ? TipoAccionUsuario.REGISTRO_USUARIO : TipoAccionUsuario.INICIO_SESION,
                status: 'SUCCESS',
              },
              {
                fileName: 'auth-redirect/page.tsx',
                functionName: 'checkUserAndRedirect'
              }
            );

            setLoggedAction(true);

            // Configuramos el usuario en el store
            if (dbUser) {
              setUser(dbUser)

              const needsVerification =
                dbUser.identityStatus === VerificationStatus.FAILED ||
                dbUser.licenseStatus === VerificationStatus.FAILED ||
                dbUser.cars.some(car => car.insurance.status === VerificationStatus.FAILED)

              if (needsVerification) {
                return router.push('/dashboard')
              }

              if (dbUser.hasBirthDate === false) {
                return router.push('/dashboard')
              }

              // Redirigir a la URL solicitada (con validación)
              const redirectUrl = searchParams.get('redirect_url') || '/'
              const safeRedirectUrl = redirectUrl && isValidRedirectUrl(redirectUrl)
                ? redirectUrl
                : '/' // URL por defecto segura

              router.push(safeRedirectUrl)
            }
          } else {
            // Si ya hemos registrado la acción pero aún necesitamos manejar la redirección
            const dbUser = !loggedAction ? await getUserById(data.user.id) : null

            if (dbUser) {
              setUser(dbUser)

              const needsVerification =
                dbUser.identityStatus === VerificationStatus.FAILED ||
                dbUser.licenseStatus === VerificationStatus.FAILED ||
                dbUser.cars.some(car => car.insurance.status === VerificationStatus.FAILED)

              if (needsVerification) {
                return router.push('/dashboard')
              }

              if (dbUser.hasBirthDate === null) {
                return router.push('/dashboard')
              }

              // Redirigir a la URL solicitada (con validación)
              const redirectUrl = searchParams.get('redirect_url') || '/'
              const safeRedirectUrl = redirectUrl && isValidRedirectUrl(redirectUrl)
                ? redirectUrl
                : '/' // URL por defecto segura

              router.push(safeRedirectUrl)
            }
          }
        } catch (error) {
          console.error('Error en la redirección de autenticación:', error)
          setError('Ocurrió un error al verificar tu cuenta. Por favor, intenta de nuevo.')
        }
      } else if (!isPending && !data) {
        // Usuario no está autenticado
        const redirectUrl = searchParams.get('redirect_url')
        const safeRedirectUrl = redirectUrl && isValidRedirectUrl(redirectUrl)
          ? redirectUrl
          : '/login' // URL por defecto segura

        const loginUrl = redirectUrl
          ? `/login?redirect_url=${encodeURIComponent(safeRedirectUrl)}`
          : '/login'

        router.push(loginUrl)
      }
    }

    checkUserAndRedirect()
  }, [isPending, data, router, setUser, searchParams, loggedAction])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => {
            const redirectUrl = searchParams.get('redirect_url')
            const safeRedirectUrl = redirectUrl && isValidRedirectUrl(redirectUrl)
              ? redirectUrl
              : '/login' // URL por defecto segura

            const loginUrl = redirectUrl
              ? `/login?redirect_url=${encodeURIComponent(safeRedirectUrl)}`
              : '/login'

            router.push(loginUrl)
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Volver al inicio de sesión
        </button>
      </div>
    )
  }

  return <Loading />
}

// Exported component with Suspense
export default function AuthRedirect() {
  return (
    <Suspense fallback={<Loading />}>
      <AuthRedirectContent />
    </Suspense>
  )
}

// 'use client'

// import { Suspense } from 'react'
// import Loading from '../loading'
// import { useAuth } from '@/components/providers/AuthProvider'

// function AuthRedirectContent() {
//   const { isLoading } = useAuth()
  
//   // The actual redirection is now handled by the AuthProvider
//   // This component just needs to exist as a destination for auth redirects
  
//   if (isLoading) {
//     return <Loading />
//   }
  
//   // The provider will handle actual redirection, but we can show a message while transitioning
//   return <Loading />
// }

// export default function AuthRedirect() {
//   return (
//     <Suspense fallback={<Loading />}>
//       <AuthRedirectContent />
//     </Suspense>
//   )
// }