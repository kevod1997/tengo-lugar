'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle } from 'lucide-react'
import { approvePayment } from '@/actions/payment/approve-payment'
import { toast } from 'sonner'
import { PaymentProofUploader } from './PaymentProofUploader'

interface ApprovePaymentDialogProps {
  paymentId: string
  hasExistingProof: boolean
  open: boolean
  onSuccess: () => void
  onCancel: () => void
}

export function ApprovePaymentDialog({
  paymentId,
  hasExistingProof,
  open,
  onSuccess,
  onCancel,
}: ApprovePaymentDialogProps) {
  const [loading, setLoading] = useState(false)
  const [proofFileKey, setProofFileKey] = useState<string>('')

  const handleApprove = async () => {
    if (!hasExistingProof && !proofFileKey) {
      toast.error('Debes subir el comprobante de pago')
      return
    }

    try {
      setLoading(true)

      // Use existing proof if available, otherwise use newly uploaded one
      const fileKey = hasExistingProof ? 'existing' : proofFileKey

      const response = await approvePayment(paymentId, fileKey)

      if (!response.success) {
        throw new Error(response.message)
      }

      toast.success('Pago aprobado exitosamente')
      setProofFileKey('') // Reset state
      onSuccess()
    } catch (err: any) {
      toast.error(err.message || 'Error al aprobar el pago')
      console.error('Error approving payment:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setProofFileKey('') // Reset state
    onCancel()
  }

  const canApprove = hasExistingProof || !!proofFileKey

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Aprobar Pago</DialogTitle>
          <DialogDescription>
            {hasExistingProof
              ? 'El comprobante ya fue subido. Puedes aprobar el pago directamente.'
              : 'Debes subir el comprobante de pago para aprobar la transacción.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {hasExistingProof ? (
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-900">
                  Comprobante disponible
                </p>
                <p className="text-xs text-green-700 mt-1">
                  El comprobante ya fue subido anteriormente
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Comprobante de Pago <span className="text-red-500">*</span>
                </label>
                <PaymentProofUploader
                  paymentId={paymentId}
                  onUploadSuccess={setProofFileKey}
                  disabled={loading}
                />
              </div>

              {!proofFileKey && (
                <p className="text-xs text-muted-foreground">
                  El comprobante es obligatorio para aprobar el pago
                </p>
              )}
            </>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-900 font-medium mb-1">
              Al aprobar este pago:
            </p>
            <ul className="text-xs text-blue-800 space-y-1 ml-4 list-disc">
              <li>El estado del pago cambiará a Completado</li>
              <li>La reserva será confirmada</li>
              <li>El pasajero recibirá una notificación</li>
              <li>El pasajero estará listo para viajar</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleApprove}
            disabled={!canApprove || loading}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Aprobando...' : 'Aprobar Pago'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
