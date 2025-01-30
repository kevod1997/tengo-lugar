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


export default function DashboardContent() {

  const { user } = useUserStore()

  const [showRegistration, setShowRegistration] = useState(false)
  const [showIdVerification, setShowIdVerification] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [registrationStep, setRegistrationStep] = useState<StepId>('role')
  const [initialRole, setInitialRole] = useState<'traveler' | 'driver' | undefined>(undefined)

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
    } else if (user.hasRegisteredCar && !user.allCarsInsured) {
      setRegistrationStep('insurance');
    } else {
      setRegistrationStep('identityCard');
    }
    setInitialRole('driver');
    setShowRegistration(true);
  };

  const handleProfileImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    //todo
  }

  if (isLoading) {
    return <LoadingOverlay isLoading={true} />
  }

  const calculateProfileCompletion = () => {
    console.log(user?.profileImageKey)
    if (user?.termsAccepted && user?.identityStatus === null) return 33
    if (user?.identityStatus === 'PENDING') return 66
    if (user?.identityStatus === 'VERIFIED') {
      return user.profileImageKey ? 100 : 90
    }
    return 0
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 items-center">
      {user ? (
        <>
          <ProfileCard
            user={user}
            calculateProfileCompletion={calculateProfileCompletion}
            handleProfileImageUpload={handleProfileImageUpload}
          />

          <Tabs defaultValue="verification" className="w-full max-w-4xl">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="verification" className="flex items-center justify-center gap-2">
                Verificación
                {user?.identityStatus === 'FAILED' && (
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                )}
              </TabsTrigger>
              <TabsTrigger value="driver" className="flex items-center justify-center gap-2">
                Conductor
                {user?.licenseStatus === 'FAILED' && (
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                )}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="verification">
              <VerificationTab user={user} setShowIdVerification={setShowIdVerification} />
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
            {/* ver este texto a mejorar */}
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
      {/* Flujos de registro */}
      {showRegistration && (
        <RegistrationFlow
          onComplete={handleRegistrationComplete}
          initialStep={registrationStep}
          onClose={() => setShowRegistration(false)}
          initialRole={initialRole}
        />
      )}
      {(user === null && !isLoading) && (
        <RegistrationFlow
          onComplete={handleRegistrationComplete}
          initialStep={registrationStep}
          onClose={() => setShowRegistration(false)}
        />
      )}
      {showIdVerification && user?.identityStatus !== 'VERIFIED' && (
        <RegistrationFlow
          onComplete={handleRegistrationComplete}
          initialStep="identityCard"
          onClose={() => setShowIdVerification(false)}
        />
      )}
    </div>
  )
}

