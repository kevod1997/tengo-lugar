import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Car, CheckCircle } from 'lucide-react'
import { DriverRegistrationStatus } from './DriverRegistrationStatus'
import { FormattedUser } from "@/types/user-types"
import { getDriverRegistrationState } from "@/utils"

interface DriverTabProps {
  user: FormattedUser
  startDriverRegistration: () => void
}

interface Step {
  title: string;
  status: 'completed' | 'pending' | 'failed' | 'not-started';
  description: string;
}

export function DriverTab({ user, startDriverRegistration }: DriverTabProps) {

  const getStepStatus = (status: string | null | undefined, hasCompleted: boolean): Step['status'] => {
    if (status === 'VERIFIED' || hasCompleted) return 'completed'
    if (status === 'PENDING') return 'pending'
    if (status === 'FAILED') return 'failed'
    return 'not-started'
  }

  const registrationState = getDriverRegistrationState(user);

  const steps: Step[] = [
    {
      title: 'Documento de Identidad',
      status: getStepStatus(user.identityStatus, false),
      description: user.identityStatus === 'VERIFIED' ? 'Verificado' :
        user.identityStatus === 'PENDING' ? 'En proceso de verificación' :
          user.identityStatus === 'FAILED' ? `Verificación fallida: ${user.identityFailureReason || 'Razón no especificada'}` :
            'Pendiente de verificación'
    },
    {
      title: 'Licencia de Conducir',
      status: getStepStatus(user.licenseStatus, false),
      description: user.licenseStatus === 'VERIFIED' ? 'Verificado' :
        user.licenseStatus === 'PENDING' ? 'En proceso de verificación' :
          user.licenseStatus === 'FAILED' ? `Verificación fallida: ${user.licenseFailureReason || 'Razón no especificada'}` :
            'Pendiente de verificación'
    },
    {
      title: 'Información del Vehículo',
      status: getStepStatus(null, user.hasRegisteredCar),
      description: user.hasRegisteredCar ? 'Información registrada' : 'Pendiente de registro'
    },
    {
      title: 'Seguro del Vehículo',
      status: getStepStatus(user.cars[0]?.insurance.status, user.allCarsInsured),
      description: user.allCarsInsured && user.hasRegisteredCar ? 'Verificado' :
        user.hasPendingInsurance ? 'En proceso de verificación' :
          user.cars[0]?.insurance.status === 'FAILED' ? `Verificación fallida: ${user.cars[0].insurance.failureReason || 'Razón no especificada'}` :
            user.cars[0]?.insurance.status === 'PENDING' ? 'Pendiente de verificación' : 'Pendiente de registro'
    },
    {
      title: 'Tarjetas Vehiculares',
      status: getStepStatus(user.cars[0]?.vehicleCard?.status, user.hasAllRequiredCards),
      description: user.hasAllRequiredCards ? 'Todas las tarjetas verificadas' :
        user.hasPendingCards ? 'Tarjetas en proceso de verificación' :
          user.cars.some(car => car.vehicleCard?.status === 'FAILED') ?
            'Verificación de tarjeta fallida' : 'Pendiente de registro'
    }
  ]

  const isRegistrationComplete = steps.every(step => step.status === 'completed')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="text-primary" />
          Registro de Conductor
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isRegistrationComplete ? (
          <div className="flex items-center space-x-2">
            <CheckCircle className="text-green-500" />
            <p>¡Felicidades! Ya estás completamente registrado como conductor. ¡Gracias por ofrecer viajes en Tengo Lugar!</p>
          </div>
        ) : (
          <>
            <p className="mb-4">Estado actual de tu registro como conductor:</p>
            <DriverRegistrationStatus steps={steps} />

            {user.termsAccepted && (
              <>
                {registrationState.statusMessage && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {registrationState.statusMessage}
                  </p>
                )}
                <Button
                  className="w-full mt-4"
                  onClick={startDriverRegistration}
                  disabled={registrationState.isButtonDisabled}
                >
                  {registrationState.buttonText}
                </Button>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

