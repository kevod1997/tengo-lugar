import type { DocumentResponse } from "@/services/registration/admin/user-service"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDatetoLocaleDateString } from "@/utils/format/formatDate"
import { ValidationControls } from "./ValidationControls"
import { ExpandableImage } from "../ExpandableImage"
import { FileText } from "lucide-react"

interface VehicleTabProps {
  cars: DocumentResponse["cars"]
  onValidate: (validationRequest: any) => Promise<void>
}

export function VehicleTab({ cars, onValidate }: VehicleTabProps) {
  if (!cars || cars.length === 0) {
    return <p>No hay información de vehículos disponible.</p>
  }
  console.log('cars', cars)
  return (
    <div className="space-y-6">
      {cars.map((car, index) => (
        <div key={car.id} className="border p-4 rounded-lg">
          <h3 className="font-semibold text-lg mb-4">Vehículo {index + 1}</h3>
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="details">Detalles del Vehículo</TabsTrigger>
              <TabsTrigger value="insurance">Información del Seguro</TabsTrigger>
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
            </TabsContent>
            <TabsContent value="insurance">
              <div className="space-y-4">
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
                {/* {car.insurance.hasFileKey && car.insurance.url && (
                  <div className="mt-2">
                    <a
                      href={car.insurance.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Ver documento de seguro
                    </a>
                  </div>
                )}
                 */}
                       {car.insurance.hasFileKey && car.insurance.url && (
        <div className="mt-2">
          {car.insurance.policy.fileType === "IMAGE" ? (
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
                  documentId={car.insurance.policy.id}
                  currentStatus={car.insurance.status ?? ""}
                  onValidate={onValidate}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      ))}
    </div>
  )
}

