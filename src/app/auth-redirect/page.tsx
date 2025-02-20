'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useUserStore } from '@/store/user-store'
import { getUserByClerkId } from '@/actions'
import Loading from '../loading'
import { VerificationStatus } from '@prisma/client'


export default function AuthRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user: clerkUser, isLoaded, isSignedIn } = useUser()
  const { setUser } = useUserStore()
  const [error, setError] = useState<string | null>(null)


//todo ver bien cuando se registra por primera vez un user, no tenemos que ejecutar el getUserByClerkId, sino hay que hacer el redirect direct a /dashboard
// todo, VER QUE ESTE ERROR NO SE ME ESTA GUARDANDO EN LOS LOGS, ServerActionError: Error en la base de datos: Error inesperado en la base de datos: Usuario no encontrado at ServerActionError.DatabaseError (C:\Users\Kevin\OneDrive\Escritorio\Dev\tengo-lugar\.next\server\chunks\ssr\[root of the server]__0b8565._.js:150:16) at handlePrismaError (C:\Users\Kevin\OneDrive\Escritorio\Dev\tengo-lugar\.next\server\chunks\ssr\[root of the server]__0b8565._.js:200:182) at getUserByClerkId (C:\Users\Kevin\OneDrive\Escritorio\Dev\tengo-lugar\.next\server\chunks\ssr\[root of the server]__0b8565._.js:703:191) digest: "544400510"

  useEffect(() => {
    async function checkUserAndRedirect() {
      if (isLoaded && isSignedIn && clerkUser) {
        try {
          const dbUser = await getUserByClerkId(clerkUser.id)
          if (dbUser) {
            setUser(dbUser)

            const needsVerification =
              dbUser.identityStatus === VerificationStatus.FAILED ||
              dbUser.licenseStatus === VerificationStatus.FAILED ||
              dbUser.cars.some(car => car.insurance.status === VerificationStatus.FAILED)

            if (needsVerification) {
              return router.push('/dashboard')
            }

            // Usuario existe en la base de datos
            const redirectUrl = searchParams.get('redirect_url') || '/'
            if (dbUser.identityStatus === 'VERIFIED') {
              return router.push(redirectUrl)
            }
            router.push('/dashboard')
          } else {
            // Usuario no existe en la base de datos
            router.push('/dashboard')
          }
        } catch (error) {
          setError('Ocurrió un error al verificar tu cuenta. Por favor, intenta de nuevo.')
        }
      } else if (isLoaded && !isSignedIn) {
        // Usuario no está autenticado
        const redirectUrl = searchParams.get('redirect_url')
        const loginUrl = redirectUrl
          ? `/login?redirect_url=${encodeURIComponent(redirectUrl)}`
          : '/login'
        router.push(loginUrl)
      }
    }

    checkUserAndRedirect()
  }, [isLoaded, isSignedIn, clerkUser, router, setUser, searchParams])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => {
            const redirectUrl = searchParams.get('redirect_url')
            const loginUrl = redirectUrl
              ? `/login?redirect_url=${encodeURIComponent(redirectUrl)}`
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