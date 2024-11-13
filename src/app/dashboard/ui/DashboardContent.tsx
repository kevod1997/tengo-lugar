'use client'

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { AlertCircle, UserCheck, UserX, Loader2, Car } from 'lucide-react'
import { useUserStore } from '@/store/user-store'
import RegistrationFlow from './registration/registration-flow'
import { LoadingOverlay } from '@/components/loader/loading-overlay'

export default function DashboardContent() {
  const { user, setUser, updateUser } = useUserStore()
  const [showRegistration, setShowRegistration] = useState(false)
  const [showIdVerification, setShowIdVerification] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [registrationStep, setRegistrationStep] = useState<'role' | 'personalInfo' | 'identityCard' | 'driverLicense'>('role')

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (user === null) {
      setShowIdVerification(false)
      setIsLoading(true)
    }
  }, [user])

  const handleRegistrationComplete = () => {
    setShowRegistration(false)
    setIsLoading(false)
  }

  const handleIdVerificationComplete = () => {
    setShowIdVerification(false)
    updateUser({ ...user, identityStatus: 'PENDING' })
  }

  const startDriverRegistration = () => {
    setRegistrationStep('driverLicense')
    setShowRegistration(true)
  }

  if (isLoading) {
    return <LoadingOverlay isLoading={true} />
  }
  console.log(user)
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 items-center">
      {user ? (
        <>
          <h1 className="text-2xl md:text-3xl font-bold text-center md:text-left">Bienvenido, {user.firstName}!</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {!user.identityStatus && <UserX className="text-yellow-500" />}
                  {user.identityStatus === 'PENDING' && <Loader2 className="animate-spin text-blue-500" />}
                  {user.identityStatus === 'VERIFIED' && <UserCheck className="text-green-600" />}
                  {user.identityStatus === 'FAILED' && <AlertCircle className="text-red-600" />}
                  Verificación de Identidad
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!user.identityStatus && (
                  <>
                    <p className="mb-4">Complete el proceso de verificación de identidad para acceder a todas las funciones.</p>
                    <Button className="w-full" onClick={() => setShowIdVerification(true)}>
                      Completar Verificación
                    </Button>
                  </>
                )}
                {user.identityStatus === 'PENDING' && (
                  <p>Su verificación de identidad está en proceso. Le notificaremos cuando esté completa.</p>
                )}
                {user.identityStatus === 'VERIFIED' && (
                  <p>Su identidad ha sido verificada exitosamente.</p>
                )}
                {user.identityStatus === 'FAILED' && (
                  <>
                    <p>Lo sentimos, la verificación de su identidad ha fallado. Motivo: {user.identityStatus === 'FAILED' || 'No especificado'}.</p>
                    <p className="mt-2">Por favor, vuelva a subir sus documentos de identidad.</p>
                    <Button onClick={() => setShowIdVerification(true)} className="w-full mt-4">
                      Volver a Subir Documentos
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="text-primary" />
                  Registro de Conductor
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user.licenseStatus === 'VERIFIED' ? (
                  <p>Ya estás registrado como conductor. ¡Gracias por ofrecer viajes en Tengo Lugar!</p>
                ) : user.licenseStatus === 'PENDING' ? (
                  <p>Su registro como conductor está en proceso. Le notificaremos cuando esté completo.</p>
                ) : (
                  <>
                    <p className="mb-4">¿Quieres ofrecer viajes? Regístrate como conductor.</p>
                    <Button
                      className="w-full"
                      onClick={startDriverRegistration}
                      disabled={user.termsAccepted === false}
                    >
                      Convertirme en Conductor
                    </Button>
                    {(!user.identityStatus || user.identityStatus !== 'VERIFIED') && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Ten a mano tu licencia, datos del vehiculo y seguro.
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Completa tu registro</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Para acceder a todas las funciones de Tengo Lugar, por favor completa tu registro.</p>
            <Button className="w-full" onClick={() => {
              setShowRegistration(true)
              setRegistrationStep('role')
            }}>
              Completar Registro
            </Button>
          </CardContent>
        </Card>
      )}

      {(showRegistration || (user === null && !isLoading)) && (
        <RegistrationFlow
          onComplete={handleRegistrationComplete}
          initialStep={registrationStep}
          onClose={() => setShowRegistration(false)}
          initialRole={registrationStep === 'driverLicense' ? 'driver' : undefined}
        />
      )}
      {showIdVerification && user?.identityStatus !== 'VERIFIED' && (
        <RegistrationFlow
          onComplete={handleIdVerificationComplete}
          initialStep="identityCard"
          onClose={() => setShowIdVerification(false)}
        />
      )}
    </div>
  )
}