'use client'

import { useState } from 'react'

import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { rejectPayment } from '@/actions/payment/reject-payment'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'




interface RejectPaymentDialogProps {
  paymentId: string
  open: boolean
  onSuccess: () => void
  onCancel: () => void
}

export function RejectPaymentDialog({
  paymentId,
  open,
  onSuccess,
  onCancel,
}: RejectPaymentDialogProps) {
  const [loading, setLoading] = useState(false)
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleReject = async () => {
    try {
      setError(null)

      if (reason.trim().length < 10) {
        setError('La razón debe tener al menos 10 caracteres')
        return
      }

      setLoading(true)

      const response = await rejectPayment({
        paymentId,
        reason: reason.trim(),
      })

      if (!response.success) {
        throw new Error(response.message)
      }

      toast.success('Pago rechazado exitosamente')
      setReason('')
      onSuccess()
    } catch (err: any) {
      toast.error(err.message || 'Error al rechazar el pago')
      console.error('Error rejecting payment:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setReason('')
    setError(null)
    onCancel()
  }

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rechazar pago</DialogTitle>
          <DialogDescription>
            Proporciona una razón clara para el rechazo del pago.
            El pasajero recibirá una notificación con esta información.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">
              Razón del rechazo <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="Ejemplo: El monto transferido no coincide con el total a pagar..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value)
                setError(null)
              }}
              disabled={loading}
              rows={4}
              className={error ? 'border-destructive' : ''}
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Mínimo 10 caracteres ({reason.length}/10)
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={loading || reason.trim().length < 10}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Rechazando...' : 'Rechazar Pago'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
