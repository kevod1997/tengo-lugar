'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PendingPayment } from '@/actions/payment/get-pending-payments'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, CheckCircle, XCircle, Eye } from 'lucide-react'
import { PaymentProofModal } from './PaymentProofModal'
import { ApprovePaymentDialog } from './ApprovePaymentDialog'
import { RejectPaymentDialog } from './RejectPaymentDialog'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface PaymentTableProps {
  payments: PendingPayment[]
}

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
  REFUNDED: 'bg-purple-100 text-purple-800',
}

const statusLabels = {
  PENDING: 'Pendiente',
  PROCESSING: 'Procesando',
  COMPLETED: 'Completado',
  FAILED: 'Fallido',
  CANCELLED: 'Cancelado',
  REFUNDED: 'Reembolsado',
}

export function PaymentTable({ payments }: PaymentTableProps) {
  const router = useRouter()
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null)
  const [selectedPaymentHasProof, setSelectedPaymentHasProof] = useState(false)
  const [showProofModal, setShowProofModal] = useState(false)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)

  const handleViewProof = (paymentId: string) => {
    setSelectedPaymentId(paymentId)
    setShowProofModal(true)
  }

  const handleApprove = (paymentId: string, hasProof: boolean) => {
    setSelectedPaymentId(paymentId)
    setSelectedPaymentHasProof(hasProof)
    setShowApproveDialog(true)
  }

  const handleReject = (paymentId: string) => {
    setSelectedPaymentId(paymentId)
    setShowRejectDialog(true)
  }

  const handleSuccess = () => {
    setSelectedPaymentId(null)
    setSelectedPaymentHasProof(false)
    setShowProofModal(false)
    setShowApproveDialog(false)
    setShowRejectDialog(false)
    router.refresh()
  }

  if (payments.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No hay pagos</h3>
        <p className="mt-1 text-sm text-gray-500">
          No se encontraron pagos con los filtros seleccionados.
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
              <TableHead>Pasajero</TableHead>
              <TableHead>Viaje</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Comprobante</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{payment.passengerName}</span>
                    <span className="text-sm text-muted-foreground">{payment.passengerEmail}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {payment.originCity} → {payment.destinationCity}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(payment.tripDate), 'dd MMM yyyy', { locale: es })}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      ${payment.totalAmount.toFixed(2)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Tarifa: ${payment.serviceFee.toFixed(2)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={statusColors[payment.status]}>
                    {statusLabels[payment.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  {payment.hasProof ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewProof(payment.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                  ) : (
                    <span className="text-sm text-muted-foreground">Sin comprobante</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {format(new Date(payment.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {(payment.status === 'PENDING' || payment.status === 'PROCESSING') && (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleApprove(payment.id, payment.hasProof)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Aprobar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleReject(payment.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Rechazar
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedPaymentId && (
        <>
          <PaymentProofModal
            paymentId={selectedPaymentId}
            open={showProofModal}
            onClose={() => {
              setShowProofModal(false)
              setSelectedPaymentId(null)
            }}
          />
          <ApprovePaymentDialog
            paymentId={selectedPaymentId}
            hasExistingProof={selectedPaymentHasProof}
            open={showApproveDialog}
            onSuccess={handleSuccess}
            onCancel={() => {
              setShowApproveDialog(false)
              setSelectedPaymentId(null)
              setSelectedPaymentHasProof(false)
            }}
          />
          <RejectPaymentDialog
            paymentId={selectedPaymentId}
            open={showRejectDialog}
            onSuccess={handleSuccess}
            onCancel={() => {
              setShowRejectDialog(false)
              setSelectedPaymentId(null)
            }}
          />
        </>
      )}
    </>
  )
}
