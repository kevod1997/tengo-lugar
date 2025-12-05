'use client'

import { useEffect, useState } from 'react'

import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useApiResponse } from '@/hooks/ui/useApiResponse'
import { authClient } from '@/lib/auth-client'
import { useUserStore } from '@/store/user-store'
import type { StepId } from '@/types/registration-types'
import { splitFullName } from '@/utils/format/user-formatter'
import { handleProfileImageUpload } from '@/utils/helpers/profile/profile-image-handler'

import { DriverTab } from './DriverTab'
import { ProfileCard } from './ProfileCard'
import { VerificationAlert } from './VerificationAlert'
import { VerificationTab } from './VerificationTab'
import RegistrationFlow from '../registration/registration-flow'

type RegistrationMode = null | 'initial' | 'identity' | 'driver';

export default function DashboardContent() {
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const { data } = authClient.useSession()
  const { firstName, lastName } = splitFullName(data?.user.name || '')
  const email = data?.user.email;
  const { user, setUser } = useUserStore()
  const { handleResponse } = useApiResponse()

  const [registrationStep, setRegistrationStep] = useState<StepId>('role')
  const [initialRole, setInitialRole] = useState<'traveler' | 'driver' | undefined>(undefined)
  const [registrationMode, setRegistrationMode] = useState<RegistrationMode>(null)

  useEffect(() => {
    if (user?.hasBirthDate === false) {
      setRegistrationMode('initial')
    }
  }, [user])

  const handleRegistrationComplete = () => {
    setRegistrationMode(null)
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