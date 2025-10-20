'use client'

import { useState } from 'react'
import { DriverPayoutWithDetails } from '@/types/driver-payout'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Eye, AlertCircle } from 'lucide-react'
import { DriverPayoutStatusBadge } from './DriverPayoutStatusBadge'
import { DriverPayoutDetailsModal } from './DriverPayoutDetailsModal'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { formatCurrency } from '@/utils/format/formateCurrency'

interface DriverPayoutTableProps {
  payouts: DriverPayoutWithDetails[]
}

export function DriverPayoutTable({ payouts }: DriverPayoutTableProps) {
  const [selectedPayout, setSelectedPayout] = useState<DriverPayoutWithDetails | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  const handleViewDetails = (payout: DriverPayoutWithDetails) => {
    setSelectedPayout(payout)
    setShowDetailsModal(true)
  }

  const handleCloseModal = () => {
    setShowDetailsModal(false)
    setSelectedPayout(null)
  }

  if (payouts.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
          No hay pagos pendientes
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          No se encontraron pagos a conductores con los filtros seleccionados.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Conductor</TableHead>
              <TableHead>Viaje</TableHead>
              <TableHead>Total Recibido</TableHead>
              <TableHead>Comisión</TableHead>
              <TableHead>Monto a Pagar</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payouts.map((payout) => (
              <TableRow key={payout.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{payout.driver.user.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {payout.driver.user.email}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">
                      {payout.trip.originCity} → {payout.trip.destinationCity}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(payout.trip.departureTime), 'dd MMM yyyy', { locale: es })}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-medium">
                    {formatCurrency(payout.totalReceived ?? 0)}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-red-600 font-medium">
                    -{formatCurrency(payout.serviceFee ?? 0)}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-semibold text-green-600">
                      {formatCurrency(payout.payoutAmount)}
                    </span>
                    {(payout.lateCancellationPenalty ?? 0) > 0 && (
                      <span className="text-xs text-amber-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Penalización: {formatCurrency(payout.lateCancellationPenalty ?? 0)}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <DriverPayoutStatusBadge status={payout.status} />
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {format(new Date(payout.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewDetails(payout)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver Detalles
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedPayout && (
        <DriverPayoutDetailsModal
          payout={selectedPayout}
          open={showDetailsModal}
          onClose={handleCloseModal}
        />
      )}
    </>
  )
}
