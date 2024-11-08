'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useUserStore } from '@/store/user-store'
import { getUserByClerkId } from '@/actions/user'
import Loading from '../loading'

export default function AuthRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user: clerkUser, isLoaded, isSignedIn } = useUser()
  const { setUser } = useUserStore()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function checkUserAndRedirect() {
      if (isLoaded && isSignedIn && clerkUser) {
        try {
          const dbUser = await getUserByClerkId(clerkUser.id)
          console.log('dbUser', dbUser)
          if (dbUser) {
            // Usuario existe en la base de datos
            const redirectUrl = searchParams.get('redirect_url') || '/'
            console.log('redirectUrl', redirectUrl)
            setUser(dbUser)
            if (dbUser.identityStatus === 'VERIFIED') {
              return router.push(redirectUrl)
            }
            router.push('/dashboard')
          } else {
            // Usuario no existe en la base de datos
            router.push('/dashboard')
          }
        } catch (error) {
          console.error('Error al verificar el usuario:', error)
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