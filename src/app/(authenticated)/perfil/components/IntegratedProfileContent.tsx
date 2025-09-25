'use client'

import { useEffect, useState, useCallback } from 'react'
import { useUserStore } from '@/store/user-store'
import { Button } from "@/components/ui/button"
import { StepId } from '@/types/registration-types'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoadingOverlay } from '@/components/loader/loading-overlay'
import RegistrationFlow from './ui/registration/registration-flow'
import { VerificationTab } from './ui/dashboard/VerificationTab'
import { DriverTab } from './ui/dashboard/DriverTab'
import { ProfileCard } from './ui/dashboard/ProfileCard'
import { AlertTriangle, Users, Car, TrendingUp, Settings } from 'lucide-react'
import { VerificationAlert } from './ui/dashboard/VerificationAlert'
import { useApiResponse } from '@/hooks/ui/useApiResponse'
import { handleProfileImageUpload } from '@/utils/helpers/profile/profile-image-handler'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth-client'
import { splitFullName } from '@/utils/format/user-formatter'
import ProfileForm from "./ProfileForm"
import AccountManagement from "./AccountManagement"
import { useHydration } from "@/hooks/ui/useHydration"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangleIcon } from "lucide-react"
import { useRouter } from 'next/navigation'

type RegistrationMode = null | 'initial' | 'identity' | 'driver';

interface IntegratedProfileContentProps {
  birthDate: Date | null | undefined;
  phoneNumber: string | null | undefined;
  gender: string | null | undefined;
  userId: string;
  setupMode?: string;
}

export default function IntegratedProfileContent({
  birthDate,
  phoneNumber,
  gender,
  userId,
  setupMode
}: IntegratedProfileContentProps) {
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const { data } = authClient.useSession()
  const { firstName, lastName } = splitFullName(data?.user.name || '')
  const email = data?.user.email;
  const { user, setUser } = useUserStore()
  const { handleResponse } = useApiResponse()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [registrationStep, setRegistrationStep] = useState<StepId>('role')
  const [initialRole, setInitialRole] = useState<'traveler' | 'driver' | undefined>(undefined)
  const [registrationMode, setRegistrationMode] = useState<RegistrationMode>(null)
  const [activeTab, setActiveTab] = useState("general")
  const hasCompletedProfile = user?.hasBirthDate !== false;

  const { isHydrated } = useHydration({
    isHydratedFn: () => useUserStore.getState().user !== null
  })


  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (user?.hasBirthDate === false) {
      setRegistrationMode('initial')
    }
  }, [user?.hasBirthDate])

  const startDriverRegistration = useCallback(() => {
    if (!user) return;

    if (!user.identityStatus || user.identityStatus === 'FAILED') {
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
  }, [user, setRegistrationStep]);

  useEffect(() => {
    if (setupMode === 'driver' && hasCompletedProfile) {
      startDriverRegistration();
    }
  }, [setupMode, hasCompletedProfile, startDriverRegistration]);

  const handleRegistrationComplete = async () => {
    setRegistrationMode(null)
    setIsLoading(false)

    // Si el birthDate del servidor sigue siendo null pero el usuario completó el perfil
    if (birthDate === null && user?.hasBirthDate !== false) {
      await authClient.getSession({
        query: { disableCookieCache: true }
      })
      // Luego refrescar la página para obtener los nuevos props
      router.refresh()
    }
  }

  const handleClose = async () => {
    setRegistrationMode(null)

    // Si el birthDate del servidor sigue siendo null pero el usuario completó el perfil  
    if (birthDate === null && user?.hasBirthDate !== false) {
      await authClient.getSession({
        query: { disableCookieCache: true }
      })
      // Luego refrescar la página para obtener los nuevos props
      router.refresh()
    }
  }

  const getInitialStepForMode = (): StepId => {
    if (registrationMode === 'identity') return 'identityCard';
    if (registrationMode === 'driver') return registrationStep;
    return 'role';
  };

  const onProfileImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) {
      toast.error("Error", { description: "Debes completar tu registro primero" })
      return
    }
    if (user.hasBirthDate === false) {
      toast.error("Registro requerido", { description: "Debes completar tu registro primero" })
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
    if (!user) return 0;
    if (user.termsAccepted && user.identityStatus === null) return 33;
    if (user.identityStatus === 'PENDING') return 66;
    if (user.identityStatus === 'VERIFIED') {
      return user.profileImageKey ? 100 : 90;
    }
    return 0;
  }

  if (isLoading || !isHydrated) {
    return <LoadingOverlay forceShow customMessage='Cargando perfil...' />
  }

  if (!user) {
    return (
      <div className="mt-6 w-full flex justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold">Información no disponible</h2>
            <p className="text-muted-foreground">No se encontró información del usuario</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!hasCompletedProfile) {
    return (
      <div className="container mx-auto p-4 max-w-3xl">
        <Alert className="my-6 bg-card border">
          <AlertTriangleIcon className="h-4 w-4" />
          <AlertTitle>Registro incompleto</AlertTitle>
          <AlertDescription>
            <p className="mb-4">Necesitas completar tu información personal para poder usar todas las funcionalidades.</p>
            <Button variant="default" onClick={() => setRegistrationMode('initial')}>
              Completar registro
            </Button>
          </AlertDescription>
        </Alert>
        <Card className="mt-6">
          <CardContent className="pt-6 text-center text-muted-foreground">
            <p>No podrás acceder a todas las funciones hasta que completes tu registro.</p>
          </CardContent>
        </Card>
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

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 items-center w-full">
      {user && (
        <VerificationAlert
          user={user}
          startDriverRegistration={startDriverRegistration}
          setShowIdVerification={() => setRegistrationMode('identity')}
        />
      )}

      <div className="w-full max-w-6xl">
        <ProfileCard
          firstName={firstName}
          lastName={lastName}
          email={email!}
          user={user}
          completion={calculateProfileCompletion()}
          isUploadingImage={isUploadingImage}
          onImageUpload={onProfileImageUpload}
          userId={userId}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 max-sm:pb-16">
            <TabsTrigger value="general">
              Información
            </TabsTrigger>
            <TabsTrigger value="verification" className="flex items-center justify-center gap-1 sm:gap-2">
              {(user?.identityStatus === 'FAILED' || user?.identityStatus === 'PENDING' || user?.identityStatus === null) && (
                <AlertTriangle className={`h-4 w-4 ${user.identityStatus === 'FAILED' ? 'text-destructive' : 'text-yellow-500'}`} />
              )}
              Verificación
            </TabsTrigger>
            <TabsTrigger
              disabled={user?.hasBirthDate === false}
              value="driver"
              className="flex items-center justify-center gap-1 sm:gap-2"
            >
              Conductor
              {user?.licenseStatus === 'FAILED' && (
                <AlertTriangle className="h-4 w-4 text-destructive" />
              )}
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center justify-center gap-1 sm:gap-2">
              <Settings className="h-4 w-4" />
              Configuración
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6 mt-6">
            {/* ProfileForm and Mi Actividad will stack vertically */}
            <ProfileForm
              isIdentityVerified={user.identityStatus === 'VERIFIED'}
              birthDate={birthDate}
              phoneNumber={phoneNumber}
              // phoneNumberVerified={user.phoneNumberVerified} // Assuming user object has this
              gender={gender}
            />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Mi Actividad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-sm text-muted-foreground">Viajes como pasajero</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <Car className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-sm text-muted-foreground">Viajes como conductor</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verification" className="mt-6">
            <VerificationTab
              user={user}
              setShowIdVerification={() => setRegistrationMode('initial')}
            />
          </TabsContent>

          <TabsContent value="driver" className="mt-6">
            <DriverTab user={user} startDriverRegistration={startDriverRegistration} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6 mt-6">
            <AccountManagement />
          </TabsContent>
        </Tabs>
      </div>

      {registrationMode && (
        <RegistrationFlow
          onComplete={handleRegistrationComplete}
          initialStep={getInitialStepForMode()}
          onClose={handleClose}
          initialRole={registrationMode === 'driver' ? 'driver' : initialRole}
        />
      )}
    </div>
  )
}