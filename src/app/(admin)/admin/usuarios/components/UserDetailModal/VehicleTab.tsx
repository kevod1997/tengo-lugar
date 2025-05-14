import type { DocumentResponse } from "@/services/registration/admin/user-service"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDatetoLocaleDateString } from "@/utils/format/formatDate"
import { ValidationControls } from "./ValidationControls"
import { ExpandableImage } from "../ExpandableImage"
import { FileText } from "lucide-react"
import { StatusIndicator } from "@/components/status-indicator/StatusIndicator"
import { VehicleFuelForm } from "./VehicleFuelForm"
import { updateFuelInfo } from "@/actions/car/update-fuel-info"
import { useApiResponse } from "@/hooks/ui/useApiResponse"
import { useState } from "react"
import { FuelType } from "@prisma/client"
//todo aca cuando actualizamos el detalle del vehiculo, hace el comportamiento deseado, el cual es que no se cierre el modal abierto, y te muestra de todas formas el toast de exito. es el comportamiento a buscar
interface VehicleTabProps {
  cars: DocumentResponse["cars"]
  onValidate: (validationRequest: any) => Promise<void>
}

export function VehicleTab({ cars: initialCars, onValidate }: VehicleTabProps) {

  const [cars, setCars] = useState(initialCars)
  const { handleResponse } = useApiResponse()

  if (!cars || cars.length === 0) {
    return <p>No hay información de vehículos disponible.</p>
  }
  const handleFuelInfoUpdate = async (carId: string, data: { fuelType: FuelType; averageFuelConsume: number }) => {
    try {
      const result = await updateFuelInfo({
        carModel: cars.find(car => car.id === carId)?.model || '',
        fuelType: data.fuelType,
        averageFuelConsume: data.averageFuelConsume
      })

      handleResponse(result)

      if (result.success) {
        // Actualizar el estado local con la nueva información
        setCars(prevCars => prevCars.map(car => {
          if (car.id === carId) {
            return {
              ...car,
              fuelType: data.fuelType,
              averageFuelConsume: data.averageFuelConsume
            }
          }
          return car
        }))
      }
    } catch (error) {
      console.error('Error updating fuel info:', error)
      handleResponse({
        success: false,
        message: error instanceof Error ? error.message : 'Error al actualizar la información'
      })
    }
  }


  return (
    <div className="space-y-6">
      {cars.map((car, index) => (
        <div key={car.id} className="border p-4 rounded-lg">
          <h3 className="font-semibold text-lg mb-4">Vehículo {index + 1}</h3>
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-10 sm:mb-4 sm:grid-cols-3">
              <TabsTrigger value="details">Detalles del Vehículo
                <StatusIndicator status={
                  car.averageFuelConsume === null || car.fuelType === null ? 'PENDING' : 'VERIFIED'
                } />
              </TabsTrigger>
              <TabsTrigger value="insurance">Información del Seguro
                <StatusIndicator status={car.insurance.status} />
              </TabsTrigger>
              <TabsTrigger value="cards">
                Tarjetas
                <StatusIndicator status={car.vehicleCard?.status} />
              </TabsTrigger>
            </TabsList>
            <TabsContent value="details">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Placa</h4>
                  <p>{car.plate}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Marca</h4>
                  <p>{car.brand}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Modelo</h4>
                  <p>{car.model}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Año</h4>
                  <p>{car.year}</p>
                </div>
              </div>
              <VehicleFuelForm
                fuelType={car.fuelType}
                averageFuelConsume={car.averageFuelConsume}
                onSubmit={(data) => handleFuelInfoUpdate(car.id, data)}
              />
            </TabsContent>
            <TabsContent value="insurance">
              <div className="space-y-4">
                {car.insurance.status ? (
                  <>
                    <div>
                      <h4 className="font-semibold">Estado del Seguro</h4>
                      <p>{car.insurance.status}</p>
                    </div>

                    {car.insurance.failureReason && (
                      <div>
                        <h4 className="font-semibold">Razón de Fallo</h4>
                        <p>{car.insurance.failureReason}</p>
                      </div>
                    )}

                    {car.insurance.policy && (
                      <>
                        <div>
                          <h4 className="font-semibold">Número de Póliza</h4>
                          <p>{car.insurance.policy.policyNumber}</p>
                        </div>

                        <div>
                          <h4 className="font-semibold">Compañía de Seguros</h4>
                          <p>{car.insurance.policy.insurance.name}</p>
                        </div>

                        <div>
                          <h4 className="font-semibold">Fecha de Inicio</h4>
                          <p>{formatDatetoLocaleDateString(car.insurance.policy.startDate)}</p>
                        </div>

                        <div>
                          <h4 className="font-semibold">Fecha de Vencimiento</h4>
                          <p>{formatDatetoLocaleDateString(car.insurance.policy.expireDate)}</p>
                        </div>

                        <div>
                          <h4 className="font-semibold">Estado de la Póliza</h4>
                          <p>{car.insurance.policy.status}</p>
                        </div>

                        {car.insurance.policy.verifiedAt && (
                          <div>
                            <h4 className="font-semibold">Verificado en</h4>
                            <p>{formatDatetoLocaleDateString(car.insurance.policy.verifiedAt)}</p>
                          </div>
                        )}
                      </>
                    )}

                    {car.insurance.hasFileKey && car.insurance.url && (
                      <div className="mt-2">
                        {car.insurance.policy?.fileType === "IMAGE" ? (
                          <div>
                            <h4 className="font-semibold mb-2">Documento de Seguro</h4>
                            <ExpandableImage src={car.insurance.url} alt="Documento de seguro" />
                          </div>
                        ) : (
                          <a
                            href={car.insurance.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-2"
                          >
                            <FileText className="h-4 w-4" />
                            Ver documento de seguro
                          </a>
                        )}
                      </div>
                    )}

                    <ValidationControls
                      documentType="INSURANCE"
                      documentId={car.insurance.policy?.id ?? car.id}
                      currentStatus={car.insurance.status}
                      onValidate={onValidate}
                    />
                  </>
                ) : (
                  <p>No hay información de seguro disponible para este vehículo.</p>
                )}
              </div>
            </TabsContent>
            <TabsContent value="cards">
              <div className="space-y-4">
                {car.vehicleCard ? (
                  <>
                    <div>
                      <h4 className="font-semibold">Tipo de Tarjeta</h4>
                      <p>{car.vehicleCard.cardType === 'GREEN' ? 'Verde' : 'Azul'}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">Estado</h4>
                      <p>{car.vehicleCard.status}</p>
                    </div>
                    {car.vehicleCard.failureReason && (
                      <div>
                        <h4 className="font-semibold">Razón de Fallo</h4>
                        <p>{car.vehicleCard.failureReason}</p>
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold">Fecha de Vencimiento</h4>
                      <p>{formatDatetoLocaleDateString(car.vehicleCard.expirationDate)}</p>
                    </div>
                    {car.vehicleCard.hasFileKey && car.vehicleCard.url && (
                      car.vehicleCard.fileType === 'IMAGE' ? (
                        <div className="mt-2">
                          <h4 className="font-semibold mb-2">Documento</h4>
                          <ExpandableImage src={car.vehicleCard.url} alt={`Tarjeta ${car.vehicleCard.cardType}`} />
                        </div>
                      ) : (
                        <a
                          href={car.vehicleCard.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-2"
                        >
                          <FileText className="h-4 w-4" />
                          Ver documento de seguro
                        </a>
                      )
                    )}
                    <ValidationControls
                      documentType="CARD"
                      documentId={car.vehicleCard.id}
                      currentStatus={car.vehicleCard.status}
                      onValidate={onValidate}
                    />
                  </>
                ) : (
                  <p>No hay tarjetas vehiculares registradas</p>
                )}

                {(car?.vehicleCard?.status === 'VERIFIED' || car?.vehicleCard?.status === 'PENDING') ? <div className="mt-4">
                  <h4 className="font-semibold mb-2">Estado de Tarjetas</h4>
                  <div className="space-y-2">
                    {
                      car?.vehicleCard?.cardType === 'GREEN' ? (
                        <p>Tarjeta Verde: {car.hasGreenCard ? 'Registrada' : 'No registrada'}</p>
                      ) : (
                        <p>Tarjeta Azul: {car.hasBlueCard ? 'Registrada' : 'No registrada'}</p>
                      )
                    }
                    {car.hasPendingCards && (
                      <p className="text-yellow-600">
                        Hay tarjetas pendientes de verificación
                      </p>
                    )}
                  </div>
                </div> : null}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      ))
      }
    </div >
  )
}

