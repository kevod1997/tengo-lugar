// ✅ components/AuthLoadingDetector.tsx - Nuevo componente
'use client'

import { useSearchParams } from 'next/navigation'
import { useLoadingStore } from '@/store/loadingStore'
import { useEffect } from 'react'

export function AuthLoadingDetector() {
  const searchParams = useSearchParams()
  const { startLoading, stopLoading } = useLoadingStore()

  // ✅ Detectar immediatamente si viene de auth-redirect
  const shouldShowAuthLoading = searchParams.get('_authLoading') === '1'

  useEffect(() => {
    if (shouldShowAuthLoading) {
      // ✅ Activar loading INMEDIATAMENTE
      startLoading('authRedirect')
    }

    return () => {
      // ✅ Cleanup al desmontar
      stopLoading('authRedirect')
    }
  }, [shouldShowAuthLoading, startLoading, stopLoading])

  return null
}