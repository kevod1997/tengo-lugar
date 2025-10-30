'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { DriverPayoutWithDetails } from '@/types/driver-payout'
import { DriverPayoutStatusBadge } from './DriverPayoutStatusBadge'
import { ProcessPayoutDialog } from './ProcessPayoutDialog'
import { CompletePayoutDialog } from './CompletePayoutDialog'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/utils/format/formateCurrency'
import { Calendar, MapPin, User, Building, CreditCard, AlertCircle, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface DriverPayoutDetailsModalProps {
  payout: DriverPayoutWithDetails | null
  open: boolean
  onClose: () => void
  onUpdate?: () => void
}

export function DriverPayoutDetailsModal({
  payout,
  open,
  onClose,
  onUpdate,
}: DriverPayoutDetailsModalProps) {
  const [processDialogOpen, setProcessDialogOpen] = useState(false)
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false)

  if (!payout) return null

  const hasLateCancellations = (payout.lateCancellationPenalty ?? 0) > 0
  const bankAccountVerified = payout.driver.user.bankAccount?.isVerified ?? false
  const hasExistingProof = !!payout.proofFileKey

  const handleDialogSuccess = () => {
    setProcessDialogOpen(false)
    setCompleteDialogOpen(false)
    onUpdate?.()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalles del Pago al Conductor</DialogTitle>
          <DialogDescription>
            ID: {payout.id.slice(0, 8)}...
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información del Conductor */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <User className="h-4 w-4" />
              Conductor
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Nombre</p>
                <p className="font-medium">{payout.driver.user.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{payout.driver.user.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground">ID del conductor</p>
                <p className="font-mono text-xs">{payout.driverId}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Info bancaria</p>
                {bankAccountVerified ? (
                  <p className="text-green-600 font-medium flex items-center gap-1">
                    <Building className="h-3 w-3" />
                    Verificada
                  </p>
                ) : (
                  <p className="text-red-600 font-medium flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    No verificada
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Información del Viaje */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Viaje
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="col-span-2">
                <p className="text-muted-foreground">Ruta</p>
                <p className="font-medium">
                  {payout.trip.originCity}, {payout.trip.originProvince} →{' '}
                  {payout.trip.destinationCity}, {payout.trip.destinationProvince}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Fecha de salida</p>
                <p className="font-medium flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(payout.trip.departureTime), "d 'de' MMMM, yyyy 'a las' HH:mm", {
                    locale: es,
                  })}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Precio por asiento</p>
                <p className="font-medium">{formatCurrency(payout.trip.price)}</p>
              </div>
              <div className="col-span-2">
                <Link
                  href={`/admin/viajes/${payout.tripId}`}
                  className="text-sm text-primary hover:underline"
                  target="_blank"
                >
                  Ver detalles completos del viaje →
                </Link>
              </div>
            </div>
          </div>

          <Separator />

          {/* Desglose del Pago */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Desglose del Pago
            </h3>
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Recibido (pagos completados)</span>
                <span className="font-medium">
                  {formatCurrency(payout.totalReceived ?? 0)}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Comisión de la Plataforma</span>
                <span className="font-medium text-red-600">
                  - {formatCurrency(payout.serviceFee ?? 0)}
                </span>
              </div>

              {hasLateCancellations && (
                <>
                  <div className="flex justify-between text-sm items-start">
                    <div className="flex items-center gap-1">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <span className="text-muted-foreground">
                        Penalización por Cancelaciones Tardías
                      </span>
                    </div>
                    <span className="font-medium text-red-600">
                      - {formatCurrency(payout.lateCancellationPenalty ?? 0)}
                    </span>
                  </div>
                  {payout.notes && (
                    <p className="text-xs text-muted-foreground italic pl-5">
                      {payout.notes}
                    </p>
                  )}
                </>
              )}

              <Separator />

              <div className="flex justify-between text-base font-semibold">
                <span>Monto a Pagar al Conductor</span>
                <span className="text-green-600 text-lg">
                  {formatCurrency(payout.payoutAmount)}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Estado y Metadata */}
          <div className="space-y-3">
            <h3 className="font-semibold">Estado del Pago</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Estado actual</p>
                <div className="mt-1">
                  <DriverPayoutStatusBadge status={payout.status} />
                </div>
              </div>
              <div>
                <p className="text-muted-foreground">Método de pago</p>
                <p className="font-medium">
                  {payout.payoutMethod === 'BANK_TRANSFER'
                    ? 'Transferencia Bancaria'
                    : payout.payoutMethod}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Fecha de creación</p>
                <p className="font-medium">
                  {format(new Date(payout.createdAt), "d/MM/yyyy 'a las' HH:mm", { locale: es })}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Última actualización</p>
                <p className="font-medium">
                  {format(new Date(payout.updatedAt), "d/MM/yyyy 'a las' HH:mm", { locale: es })}
                </p>
              </div>
              {payout.processedAt && (
                <div>
                  <p className="text-muted-foreground">Fecha de procesamiento</p>
                  <p className="font-medium">
                    {format(new Date(payout.processedAt), "d/MM/yyyy 'a las' HH:mm", {
                      locale: es,
                    })}
                  </p>
                </div>
              )}
              {payout.completedAt && (
                <div>
                  <p className="text-muted-foreground">Fecha de completado</p>
                  <p className="font-medium">
                    {format(new Date(payout.completedAt), "d/MM/yyyy 'a las' HH:mm", {
                      locale: es,
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Advertencia de cuenta bancaria no verificada */}
          {!bankAccountVerified && payout.status === 'PENDING' && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-800 dark:text-red-200 flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Información bancaria no verificada:</strong> El conductor no ha verificado
                  su información bancaria. No podrás procesar este pago hasta que el conductor
                  complete y verifique sus datos bancarios.
                </span>
              </p>
            </div>
          )}

          {payout.status === 'ON_HOLD' && (
            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <p className="text-sm text-amber-800 dark:text-amber-200 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Pago en espera:</strong> Este payout tiene un monto de $0, posiblemente
                  debido a que no hubo pasajeros válidos o las penalizaciones superaron los
                  ingresos.
                </span>
              </p>
            </div>
          )}

          {/* Información de comprobante para estados PROCESSING/COMPLETED */}
          {payout.status === 'PROCESSING' && !hasExistingProof && (
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>En proceso:</strong> Cuando completes la transferencia, deberás subir el
                comprobante para finalizar el pago.
              </p>
            </div>
          )}

          {payout.transferDate && payout.completedAt && (
            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 space-y-2">
              <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                Transferencia completada
              </p>
              <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
                <p>
                  <strong>Fecha de transferencia:</strong>{' '}
                  {format(new Date(payout.transferDate), "d 'de' MMMM, yyyy", { locale: es })}
                </p>
                {payout.transferNotes && (
                  <p>
                    <strong>Notas:</strong> {payout.transferNotes}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {(payout.status === 'PENDING' || payout.status === 'PROCESSING') && (
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>

            {payout.status === 'PENDING' && (
              <Button
                onClick={() => setProcessDialogOpen(true)}
                className="bg-orange-600 hover:bg-orange-700"
                disabled={!bankAccountVerified}
              >
                Procesar Pago
              </Button>
            )}

            {payout.status === 'PROCESSING' && (
              <Button
                onClick={() => setCompleteDialogOpen(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                Completar Pago
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>

      {/* Nested Dialogs */}
      <ProcessPayoutDialog
        payoutId={payout.id}
        driverName={payout.driver.user.name || ''}
        bankAccountVerified={bankAccountVerified}
        open={processDialogOpen}
        onSuccess={handleDialogSuccess}
        onCancel={() => setProcessDialogOpen(false)}
      />

      <CompletePayoutDialog
        payoutId={payout.id}
        hasExistingProof={hasExistingProof}
        open={completeDialogOpen}
        onSuccess={handleDialogSuccess}
        onCancel={() => setCompleteDialogOpen(false)}
      />
    </Dialog>
  )
}
