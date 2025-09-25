import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { 
  Car, 
  CheckCircle, 
  AlertTriangle, 
  User, 
  Shield, 
  CreditCard, 
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { DriverRegistrationStatus } from './DriverRegistrationStatus'
import { FormattedUser } from "@/types/user-types"
import { getDriverRegistrationState } from "@/utils"
import { useState } from "react"

interface DriverTabProps {
  user: FormattedUser
  startDriverRegistration: () => void
}

interface Step {
  title: string;
  status: 'completed' | 'pending' | 'failed' | 'not-started';
  description: string;
}

interface ExpirationInfo {
  type: 'license' | 'insurance' | 'card';
  label: string;
  date: Date;
  daysUntilExpiry: number;
  isExpired: boolean;
  isExpiringSoon: boolean;
  carPlate?: string;
}

interface VehicleExpirationInfo {
  carPlate: string;
  brand: string;
  model: string;
  year: number | null;
  expirations: ExpirationInfo[];
  hasIssues: boolean;
}

export function DriverTab({ user, startDriverRegistration }: DriverTabProps) {
  const [expandedVehicles, setExpandedVehicles] = useState<Set<string>>(new Set())

  const toggleVehicleExpansion = (carPlate: string) => {
    const newExpanded = new Set(expandedVehicles)
    if (newExpanded.has(carPlate)) {
      newExpanded.delete(carPlate)
    } else {
      newExpanded.add(carPlate)
    }
    setExpandedVehicles(newExpanded)
  }

  const getStepStatus = (status: string | null | undefined, hasCompleted: boolean): Step['status'] => {
    if (status === 'VERIFIED' || hasCompleted) return 'completed'
    if (status === 'PENDING') return 'pending'
    if (status === 'FAILED') return 'failed'
    return 'not-started'
  }

  // Helper function to get insurance status and failure message
  const getInsuranceDisplayMessage = (): string => {
    if (user.allCarsInsured && user.hasRegisteredCar) {
      return 'Todos los vehículos asegurados'
    }

    if (user.hasPendingInsurance) {
      return 'Seguros en proceso de verificación'
    }

    // Check for failed insurance in any car
    const failedCars = user.cars.filter(car => car.insurance.status === 'FAILED')
    if (failedCars.length > 0) {
      // If multiple cars have failed insurance, show generic message
      if (failedCars.length > 1) {
        return 'Verificación de seguros fallida en múltiples vehículos'
      }

      // For single car, show specific failure reason
      const failureReason = failedCars[0].insurance.failureReason
      return failureReason
        ? `Verificación de seguro fallida: ${failureReason}`
        : 'Verificación de seguro fallida'
    }

    return 'Pendiente de verificación'
  }

  // Helper function to get insurance step status for multiple cars
  const getInsuranceStepStatus = (): Step['status'] => {
    if (user.allCarsInsured && user.hasRegisteredCar) {
      return 'completed'
    }

    if (user.hasPendingInsurance) {
      return 'pending'
    }

    // Check if any car has failed insurance
    const hasFailedInsurance = user.cars.some(car => car.insurance.status === 'FAILED')
    if (hasFailedInsurance) {
      return 'failed'
    }

    return 'not-started'
  }

  // Obtener información de expiración organizada por vehículo
  const getVehicleExpirationInfos = (): { personalExpirations: ExpirationInfo[], vehicleInfos: VehicleExpirationInfo[] } => {
    const currentDate = new Date();
    const personalExpirations: ExpirationInfo[] = [];
    const vehicleInfos: VehicleExpirationInfo[] = [];

    // Licencia (personal)
    if (user.licenseExpireDate) {
      const licenseDate = new Date(user.licenseExpireDate);
      const daysUntilExpiry = Math.ceil((licenseDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      
      personalExpirations.push({
        type: 'license',
        label: 'Licencia de Conducir',
        date: licenseDate,
        daysUntilExpiry,
        isExpired: daysUntilExpiry < 0,
        isExpiringSoon: daysUntilExpiry <= 30 && daysUntilExpiry >= 0
      });
    }

    // Información por vehículo
    user.cars.forEach((car) => {
      const carExpirations: ExpirationInfo[] = [];

      // Seguro
      if (car.insurance.expireDate) {
        const insuranceDate = new Date(car.insurance.expireDate);
        const daysUntilExpiry = Math.ceil((insuranceDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
        
        carExpirations.push({
          type: 'insurance',
          label: 'Seguro',
          date: insuranceDate,
          daysUntilExpiry,
          isExpired: daysUntilExpiry < 0,
          isExpiringSoon: daysUntilExpiry <= 30 && daysUntilExpiry >= 0,
          carPlate: car.plate
        });
      }

      // Tarjeta
      if (car.vehicleCard?.expirationDate) {
        const cardDate = new Date(car.vehicleCard.expirationDate);
        const daysUntilExpiry = Math.ceil((cardDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
        
        carExpirations.push({
          type: 'card',
          label: `Tarjeta ${car.vehicleCard.cardType}`,
          date: cardDate,
          daysUntilExpiry,
          isExpired: daysUntilExpiry < 0,
          isExpiringSoon: daysUntilExpiry <= 30 && daysUntilExpiry >= 0,
          carPlate: car.plate
        });
      }

      const hasIssues = carExpirations.some(exp => exp.isExpired || exp.isExpiringSoon);

      vehicleInfos.push({
        carPlate: car.plate,
        brand: car.brand,
        model: car.model,
        year: car.year,
        expirations: carExpirations,
        hasIssues
      });
    });

    return { personalExpirations, vehicleInfos };
  }

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  const getExpirationBadgeColor = (info: ExpirationInfo): string => {
    if (info.isExpired) return 'text-red-600 bg-red-50 border-red-200';
    if (info.isExpiringSoon) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'bg-popover';
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
      description: user.hasRegisteredCar ? `${user.cars.length} vehículo${user.cars.length > 1 ? 's' : ''} registrado${user.cars.length > 1 ? 's' : ''}` : 'Pendiente de registro'
    },
    {
      title: 'Seguro del Vehículo',
      status: getInsuranceStepStatus(),
      description: getInsuranceDisplayMessage()
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
  const { personalExpirations, vehicleInfos } = getVehicleExpirationInfos();
  const hasAnyIssues = personalExpirations.some(exp => exp.isExpired || exp.isExpiringSoon) || 
                     vehicleInfos.some(vehicle => vehicle.hasIssues);

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
          <div className="space-y-6">
            {/* Success Message */}
            <div className="flex items-center space-x-2">
              <CheckCircle className="text-green-500" />
              <p>¡Felicidades! Ya estás completamente registrado como conductor. ¡Gracias por ofrecer viajes en Tengo Lugar!</p>
            </div>
            
            {/* Status Overview */}
            {hasAnyIssues && (
              <div className="p-4 border border-amber-200 bg-amber-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-amber-800">Atención requerida</h4>
                    <p className="text-sm text-amber-700">Algunos documentos están por vencer o ya han expirado.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Personal Documentation */}
            {personalExpirations.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-600" />
                  <h4 className="font-medium text-gray-900">Documentación Personal</h4>
                </div>
                
                <div className="grid gap-2">
                  {personalExpirations.map((info, index) => (
                    <div 
                      key={index} 
                      className={`flex items-center justify-between p-3 rounded-lg border ${getExpirationBadgeColor(info)}`}
                    >
                      <div className="flex items-center gap-2">
                        {(info.isExpired || info.isExpiringSoon) && (
                          <AlertTriangle className="h-4 w-4" />
                        )}
                        <span className="text-sm font-medium">{info.label}</span>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {formatDate(info.date)}
                        </div>
                        <div className="text-xs">
                          {info.isExpired 
                            ? `Expiró hace ${Math.abs(info.daysUntilExpiry)} días`
                            : info.isExpiringSoon 
                              ? `Expira en ${info.daysUntilExpiry} días`
                              : `Expira en ${info.daysUntilExpiry} días`
                          }
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vehicle Information */}
            {vehicleInfos.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-gray-600" />
                  <h4 className="font-medium text-gray-900">
                    Vehículos ({vehicleInfos.length})
                  </h4>
                </div>

                <div className="space-y-3">
                  {vehicleInfos.map((vehicle) => (
                    <Card key={vehicle.carPlate} className={`${vehicle.hasIssues ? 'border-amber-200' : 'border-gray-200'} bg-secondary`}>
                      <Collapsible>
                        <CollapsibleTrigger
                          className="w-full"
                          onClick={() => toggleVehicleExpansion(vehicle.carPlate)}
                        >
                          <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <Car className="h-4 w-4 text-gray-500" />
                                <span className="font-medium">
                                  {vehicle.brand} {vehicle.model} ({vehicle.carPlate})
                                </span>
                                {vehicle.year && (
                                  <span className="text-sm text-gray-500">• {vehicle.year}</span>
                                )}
                              </div>
                              
                              {vehicle.hasIssues && (
                                <Badge variant="outline" className="text-amber-600 border-amber-300">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Requiere atención
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Badge variant={vehicle.hasIssues ? "destructive" : "default"} className="text-xs">
                                {vehicle.expirations.length} documento{vehicle.expirations.length !== 1 ? 's' : ''}
                              </Badge>
                              {expandedVehicles.has(vehicle.carPlate) ?
                                <ChevronUp className="h-4 w-4" /> :
                                <ChevronDown className="h-4 w-4" />
                              }
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        
                        <CollapsibleContent>
                          <div className="px-4 pb-4 border-t">
                            {vehicle.expirations.length > 0 ? (
                              <div className="space-y-2 mt-3">
                                {vehicle.expirations.map((info, index) => (
                                  <div 
                                    key={index} 
                                    className={`flex items-center justify-between p-3 rounded-lg border ${getExpirationBadgeColor(info)}`}
                                  >
                                    <div className="flex items-center gap-2">
                                      {info.type === 'insurance' ? (
                                        <Shield className="h-4 w-4" />
                                      ) : (
                                        <CreditCard className="h-4 w-4" />
                                      )}
                                      {(info.isExpired || info.isExpiringSoon) && (
                                        <AlertTriangle className="h-4 w-4" />
                                      )}
                                      <span className="text-sm font-medium">{info.label}</span>
                                    </div>
                                    
                                    <div className="text-right">
                                      <div className="text-sm font-medium">
                                        {formatDate(info.date)}
                                      </div>
                                      <div className="text-xs">
                                        {info.isExpired 
                                          ? `Expiró hace ${Math.abs(info.daysUntilExpiry)} días`
                                          : info.isExpiringSoon 
                                            ? `Expira en ${info.daysUntilExpiry} días`
                                            : `Expira en ${info.daysUntilExpiry} días`
                                        }
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                                Sin información de expiración disponible
                              </div>
                            )}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </Card>
                  ))}
                </div>
              </div>
            )}
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