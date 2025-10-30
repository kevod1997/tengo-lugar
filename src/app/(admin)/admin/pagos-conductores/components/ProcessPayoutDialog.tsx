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
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react'
import { processDriverPayout } from '@/actions/driver-payout/process-driver-payout'
import { toast } from 'sonner'

interface ProcessPayoutDialogProps {
  payoutId: string
  driverName: string
  bankAccountVerified: boolean
  open: boolean
  onSuccess: () => void
  onCancel: () => void
}

export function ProcessPayoutDialog({
  payoutId,
  driverName,
  bankAccountVerified,
  open,
  onSuccess,
  onCancel,
}: ProcessPayoutDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleProcess = async () => {
    if (!bankAccountVerified) {
      toast.error('No se puede procesar: el conductor no tiene información bancaria verificada')
      return
    }

    try {
      setLoading(true)

      const response = await processDriverPayout(payoutId)

      if (!response.success) {
        throw new Error(response.message)
      }

      toast.success('Pago marcado como en proceso')
      onSuccess()
    } catch (err: any) {
      toast.error(err.message || 'Error al procesar el pago')
      console.error('Error processing driver payout:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Procesar Pago a Conductor</DialogTitle>
          <DialogDescription>
            {bankAccountVerified
              ? 'Marcar este pago como en proceso de transferencia'
              : 'El conductor debe verificar su información bancaria antes de procesar el pago'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {bankAccountVerified ? (
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-900">
                  Información bancaria verificada
                </p>
                <p className="text-xs text-green-700 mt-1">
                  {driverName} tiene sus datos bancarios verificados
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">
                  Información bancaria no verificada
                </p>
                <p className="text-xs text-red-700 mt-1">
                  No se puede procesar el pago hasta que {driverName} verifique su información bancaria.
                  El conductor debe completar y verificar sus datos bancarios primero.
                </p>
              </div>
            </div>
          )}

          {bankAccountVerified && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-900 font-medium mb-1">
                Al marcar como en proceso:
              </p>
              <ul className="text-xs text-blue-800 space-y-1 ml-4 list-disc">
                <li>El estado cambiará a En Proceso</li>
                <li>Indica que la transferencia está siendo realizada</li>
                <li>Deberás subir el comprobante al completar</li>
                <li>El conductor será notificado del cambio de estado</li>
              </ul>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleProcess}
            disabled={!bankAccountVerified || loading}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Procesando...' : 'Marcar como En Proceso'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
