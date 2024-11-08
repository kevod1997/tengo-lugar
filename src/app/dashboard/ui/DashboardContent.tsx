'use client'

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { AlertCircle, UserCheck, UserX, Loader2 } from 'lucide-react'
import { useUserStore } from '@/store/user-store'
import RegistrationFlow from './registration/registration-flow'
import { LoadingOverlay } from '@/components/loader/loading-overlay'

export default function DashboardContent() {
  const { user, setUser, updateUser } = useUserStore()
  const [showRegistration, setShowRegistration] = useState(false)
  const [showIdVerification, setShowIdVerification] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  console.log('user', user)

  const handleRegistrationComplete = () => {
    setShowRegistration(false)
  }

  const handleIdVerificationComplete = () => {
    setShowIdVerification(false)
  }

  const renderVerificationStatus = () => {
    if (!user?.identityStatus) {
      return (
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserX className="text-yellow-500" />
              Verificación de Identidad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Por favor, complete el proceso de verificación de identidad.</p>
            <Button className="w-full sm:w-auto" onClick={() => setShowIdVerification(true)}>
              Completar Verificación
            </Button>
          </CardContent>
        </Card>
      )
    }

    switch (user.identityStatus) {
      case 'PENDING':
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Loader2 className="animate-spin text-blue-500" />
                Verificación en Proceso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Su verificación de identidad está en proceso. Le notificaremos cuando esté completa.</p>
            </CardContent>
          </Card>
        )
      case 'VERIFIED':
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <UserCheck />
                Identidad Verificada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Su identidad ha sido verificada exitosamente.</p>
            </CardContent>
          </Card>
        )
      case 'FAILED':
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                <AlertCircle size={20} />
                Verificación Fallida
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Lo sentimos, la verificación de su identidad ha fallado. Motivo: {user.identityStatus === 'FAILED' || 'No especificado'}.</p>
              <p className="mt-2">Por favor, vuelva a subir sus documentos de identidad.</p>
              <Button onClick={() => setShowIdVerification(true)} className="w-full sm:w-auto mt-4">
                Volver a Subir Documentos
              </Button>
            </CardContent>
          </Card>
        )
      default:
        return null
    }
  }

  if (isLoading) {
    return <LoadingOverlay isLoading={true} />
  }

  if (!user && !showRegistration) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Completa tu registro</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Para acceder a todas las funciones de Tengo Lugar, por favor completa tu registro.</p>
            <Button className="w-full sm:w-auto" onClick={() => setShowRegistration(true)}>
              Completar Registro
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {user && <h1 className="text-2xl md:text-3xl font-bold text-center md:text-left">Bienvenido, {user.firstName}!</h1>}
      {user && renderVerificationStatus()}
      {showRegistration && (
        <RegistrationFlow
          onComplete={handleRegistrationComplete}
          initialStep="role"
          onClose={() => setShowRegistration(false)}
        />
      )}
      {showIdVerification && (
        <RegistrationFlow
          onComplete={handleIdVerificationComplete}
          initialStep="identityCard"
          onClose={() => setShowIdVerification(false)}
        />
      )}
    </div>
  )
}