'use client'

import { useEffect, useState } from 'react'
import { useUserStore } from '@/store/user-store'
import { Button } from "@/components/ui/button"
import { StepId } from '@/types/registration-types'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoadingOverlay } from '@/components/loader/loading-overlay'
import RegistrationFlow from '../registration/registration-flow'
import { VerificationTab } from './VerificationTab'
import { DriverTab } from './DriverTab'
import { ProfileCard } from './ProfileCard'
import { AlertTriangle } from 'lucide-react'
import { VerificationAlert } from './VerificationAlert'
import { useApiResponse } from '@/hooks/ui/useApiResponse'
import { handleProfileImageUpload } from '@/utils/helpers/profile/profile-image-handler'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth-client'
import { splitFullName } from '@/utils/format/user-formatter'

// Definimos un tipo para los modos de registro
type RegistrationMode = null | 'initial' | 'identity' | 'driver';

export default function DashboardContent() {
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const { data } = authClient.useSession()
  const { firstName, lastName } = splitFullName(data?.user.name || '')
  const email = data?.user.email;
  const { user, setUser } = useUserStore()
  const { handleResponse } = useApiResponse()

  const [isLoading, setIsLoading] = useState(true)
  const [registrationStep, setRegistrationStep] = useState<StepId>('role')
  const [initialRole, setInitialRole] = useState<'traveler' | 'driver' | undefined>(undefined)
  
  // Un único estado para controlar el modo de registro
  const [registrationMode, setRegistrationMode] = useState<RegistrationMode>(null)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Si el usuario no tiene fecha de nacimiento, iniciamos el flujo de registro inicial
    if (user?.hasBirthDate === false) {
      setRegistrationMode('initial')
    }
  }, [user])

  const handleRegistrationComplete = () => {
    setRegistrationMode(null)
    setIsLoading(false)
  }

  const startDriverRegistration = () => {
    if (!user) return;

    if (user.identityStatus === 'FAILED') {
      setRegistrationStep('identityCard');
    } else if (!user.licenseStatus) {
      setRegistrationStep('driverLicense');
    } else if (user.licenseStatus === 'FAILED') {
      setRegistrationStep('driverLicense');
    } else if ((user.identityStatus === 'PENDING' || user.identityStatus === 'VERIFIED') &&
      (user.licenseStatus === 'PENDING' || user.licenseStatus === 'VERIFIED') &&
      !user.hasRegisteredCar) {
      setRegistrationStep('carInfo');
    } else if (user.hasRegisteredCar && !user.allCarsInsured && !user.hasPendingInsurance) {
      setRegistrationStep('insurance');
    } else if (user.hasRegisteredCar && !user.hasAllRequiredCards && !user.hasPendingCards) {
      setRegistrationStep('carCard');
    } else {
      setRegistrationStep('identityCard');
    }
    setInitialRole('driver');
    setRegistrationMode('driver');
  };

  // Función para obtener el paso inicial basado en el modo
  const getInitialStepForMode = (): StepId => {
    if (registrationMode === 'identity') return 'identityCard';
    if (registrationMode === 'driver') return registrationStep;
    return 'role'; // Para el modo 'initial' u otros
  };

  const onProfileImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) {
      toast.error("Error", {
        description: "Debes completar tu registro primero"
      })
      return
    }

    if (user.hasBirthDate === false) {
      toast.error("Registro requerido", {
        description: "Debes completar tu registro primero"
      })
      return
    }

    await handleProfileImageUpload({
      event,
      userId: data!.user.id,
      user,
      setIsUploadingImage,
      setUser,
      handleResponse
    })
  }

  if (isLoading) {
    return <LoadingOverlay customMessage='Cargando...' />
  }

  const calculateProfileCompletion = () => {
    if (user?.termsAccepted && user?.identityStatus === null) return 33
    if (user?.identityStatus === 'PENDING') return 66
    if (user?.identityStatus === 'VERIFIED') {
      return user.profileImageKey ? 100 : 90
    }
    return 0
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 items-center">
      {user && (
        <VerificationAlert
          user={user}
          startDriverRegistration={startDriverRegistration}
          setShowIdVerification={() => setRegistrationMode('identity')}
        />
      )}
      {user ? (
        <>
          <ProfileCard
            userId={data!.user.id}
            firstName={firstName}
            lastName={lastName}
            email={email!}
            user={user}
            completion={calculateProfileCompletion()}
            isUploadingImage={isUploadingImage}
            onImageUpload={onProfileImageUpload}
          />

          <Tabs defaultValue="verification" className="w-full max-w-4xl">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="verification" className="flex items-center justify-center gap-2">
                Verificate
                {user?.identityStatus === 'FAILED' && (
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                )}
              </TabsTrigger>
              <TabsTrigger disabled={user?.hasBirthDate === false} value="driver" className="flex items-center justify-center gap-2">
                Conductor
                {user?.licenseStatus === 'FAILED' && (
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                )}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="verification">
              <VerificationTab 
                user={user} 
                setShowIdVerification={() => setRegistrationMode('identity')} 
              />
            </TabsContent>
            <TabsContent value="driver">
              <DriverTab user={user} startDriverRegistration={startDriverRegistration} />
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Completa tu registro</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Para acceder a todas las funciones de Tengo Lugar, por favor completa tu registro.</p>
            <Button className="w-full" onClick={() => {
              setRegistrationMode('initial')
              setRegistrationStep('role')
            }}>
              Completar Registro
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Un único renderizado del componente RegistrationFlow */}
      {registrationMode && (
        <RegistrationFlow
          onComplete={handleRegistrationComplete}
          initialStep={getInitialStepForMode()}
          onClose={() => setRegistrationMode(null)}
          initialRole={registrationMode === 'driver' ? 'driver' : initialRole}
        />
      )}
    </div>
  )
}