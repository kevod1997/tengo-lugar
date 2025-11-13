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
import { Loader2, Upload } from 'lucide-react'
import { uploadReceiptToCompleted } from '@/actions/payment/upload-receipt-to-completed'
import { toast } from 'sonner'
import { PaymentProofUploader } from './PaymentProofUploader'

interface UploadReceiptDialogProps {
  paymentId: string
  open: boolean
  onSuccess: () => void
  onCancel: () => void
}

export function UploadReceiptDialog({
  paymentId,
  open,
  onSuccess,
  onCancel,
}: UploadReceiptDialogProps) {
  const [loading, setLoading] = useState(false)
  const [proofFileKey, setProofFileKey] = useState<string>('')

  const handleUpload = async () => {
    if (!proofFileKey) {
      toast.error('Debes subir el comprobante de pago')
      return
    }

    try {
      setLoading(true)

      const response = await uploadReceiptToCompleted(paymentId, proofFileKey)

      if (!response.success) {
        throw new Error(response.message)
      }

      toast.success('Comprobante subido exitosamente')
      setProofFileKey('') // Reset state
      onSuccess()
    } catch (err: any) {
      toast.error(err.message || 'Error al subir el comprobante')
      console.error('Error uploading receipt:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setProofFileKey('') // Reset state
    onCancel()
  }

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Subir Comprobante de Pago</DialogTitle>
          <DialogDescription>
            Este pago fue aprobado sin comprobante. Puedes subir el comprobante ahora si está disponible.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
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
              Selecciona el archivo del comprobante de pago (JPG, PNG o PDF)
            </p>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-900 font-medium mb-1">
              Acerca de esta acción:
            </p>
            <ul className="text-xs text-blue-800 space-y-1 ml-4 list-disc">
              <li>El comprobante quedará asociado al pago</li>
              <li>El pago ya está aprobado, esto solo agrega evidencia</li>
              <li>El comprobante estará disponible para consulta futura</li>
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
            onClick={handleUpload}
            disabled={!proofFileKey || loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Subiendo...' : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Subir Comprobante
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
