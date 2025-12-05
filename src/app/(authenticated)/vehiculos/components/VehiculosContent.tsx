'use client'

import Link from 'next/link'

import { PlusCircle, AlertCircle, CheckCircle2, Clock } from "lucide-react"
import { toast } from 'sonner'

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { UserCar } from "@/types/user-types"

interface VehiculosContentProps {
  cars: UserCar[];
}

export default function VehiculosContent({ cars }: VehiculosContentProps) {
  // Función auxiliar para mostrar el estado del seguro de manera amigable
  const getInsuranceStatus = (status: string | null) => {
    switch (status) {
      case 'VERIFIED':
        return {
          label: 'Verificado',
          icon: CheckCircle2,
          className: 'bg-green-500',
        }
      case 'PENDING':
        return {
          label: 'Pendiente',
          icon: Clock,
          className: 'bg-yellow-500',
        }
      case 'FAILED':
        return {
          label: 'Rechazado',
          icon: AlertCircle,
          className: 'bg-red-500',
        }
      default:
        return {
          label: 'Sin seguro',
          icon: AlertCircle,
          className: 'bg-gray-500',
        }
    }
  }

  const hasPendingInsurance = cars.some(car => car.insurance.status === 'PENDING');

  return (
    <div className="page-content">
      {cars.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No tienes vehículos registrados</AlertTitle>
          <AlertDescription>
            Para poder ofrecer viajes, necesitas registrar al menos un vehículo con su seguro correspondiente.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        {/* Sección de vehículos registrados */}
        {cars.map((car) => {
          const insuranceStatus = getInsuranceStatus(car.insurance.status)
          const InsuranceIcon = insuranceStatus.icon

          return (
            <Card key={car.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>{car.plate}</CardTitle>
                  <CardDescription>
                    {car.brand} {car.model} {car.year}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge
                    variant="secondary"
                    className={`${insuranceStatus.className} text-white`}
                  >
                    <InsuranceIcon className="mr-1 h-4 w-4" />
                    {insuranceStatus.label}
                  </Badge>
                  {car.isFullyEnabled && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <CheckCircle2 className="mr-1 h-4 w-4" />
                      Habilitado
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {car.insurance.status === 'FAILED' && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Seguro rechazado</AlertTitle>
                    <AlertDescription>
                      {car.insurance.failureReason || 'El seguro de este vehículo fue rechazado. Contacta con soporte para más información.'}
                    </AlertDescription>
                  </Alert>
                )}

                {!car.isFullyEnabled && (
                  <Alert className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Vehículo no habilitado</AlertTitle>
                    <AlertDescription>
                      Este vehículo necesita:
                      {!car.hasGreenCard && !car.hasBlueCard && " tarjeta vehicular verificada,"}
                      {car.insurance.status !== 'VERIFIED' && " seguro verificado,"}
                      {(!car.fuelType || !car.averageFuelConsume) && " especificaciones de combustible"}
                    </AlertDescription>
                  </Alert>
                )}

                {car.insurance.status !== 'VERIFIED' && (
                  <Button
                    variant="secondary"
                    className="mt-4"
                    asChild
                  >
                    <Link href={`/vehiculos/${car.id}/seguro`}>
                      Actualizar seguro
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}

        {/* Botón para agregar nuevo vehículo */}
        <Button
          className="w-full py-8"
          onClick={() => {
            toast.warning('Funcionalidad en desarrollo')
          }}
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Agregar vehículo
        </Button>
      </div>

      {/* Información adicional sobre verificación pendiente */}
      {hasPendingInsurance && (
        <Alert className="mt-6">
          <Clock className="h-4 w-4" />
          <AlertTitle>Verificación en proceso</AlertTitle>
          <AlertDescription>
            Algunos de tus seguros están siendo verificados. Te notificaremos cuando el proceso esté completo.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}