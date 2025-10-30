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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Loader2, CalendarIcon, CheckCircle } from 'lucide-react'
import { completeDriverPayout } from '@/actions/driver-payout/complete-driver-payout'
import { toast } from 'sonner'
import { DriverPayoutProofUploader } from './DriverPayoutProofUploader'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface CompletePayoutDialogProps {
  payoutId: string
  hasExistingProof: boolean
  open: boolean
  onSuccess: () => void
  onCancel: () => void
}

export function CompletePayoutDialog({
  payoutId,
  hasExistingProof,
  open,
  onSuccess,
  onCancel,
}: CompletePayoutDialogProps) {
  const [loading, setLoading] = useState(false)
  const [proofFileKey, setProofFileKey] = useState<string>('')
  const [transferDate, setTransferDate] = useState<Date | undefined>(new Date())
  const [transferNotes, setTransferNotes] = useState('')

  const handleComplete = async () => {
    if (!hasExistingProof && !proofFileKey) {
      toast.error('Debes subir el comprobante de transferencia')
      return
    }

    if (!transferDate) {
      toast.error('Debes seleccionar la fecha de transferencia')
      return
    }

    try {
      setLoading(true)

      // Use existing proof if available, otherwise use newly uploaded one
      const fileKey = hasExistingProof ? 'existing' : proofFileKey

      const response = await completeDriverPayout(
        payoutId,
        fileKey,
        transferDate,
        transferNotes || undefined
      )

      if (!response.success) {
        throw new Error(response.message)
      }

      toast.success('Pago completado exitosamente')
      // Reset state
      setProofFileKey('')
      setTransferDate(new Date())
      setTransferNotes('')
      onSuccess()
    } catch (err: any) {
      toast.error(err.message || 'Error al completar el pago')
      console.error('Error completing driver payout:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    // Reset state
    setProofFileKey('')
    setTransferDate(new Date())
    setTransferNotes('')
    onCancel()
  }

  const canComplete = (hasExistingProof || !!proofFileKey) && !!transferDate

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Completar Pago a Conductor</DialogTitle>
          <DialogDescription>
            {hasExistingProof
              ? 'El comprobante ya fue subido. Completa la información de transferencia.'
              : 'Sube el comprobante y completa la información de transferencia.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Comprobante de Transferencia */}
          <div className="space-y-2">
            <Label>
              Comprobante de Transferencia <span className="text-red-500">*</span>
            </Label>
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
                <DriverPayoutProofUploader
                  payoutId={payoutId}
                  onUploadSuccess={setProofFileKey}
                  disabled={loading}
                />
                {!proofFileKey && (
                  <p className="text-xs text-muted-foreground">
                    El comprobante es obligatorio para completar el pago
                  </p>
                )}
              </>
            )}
          </div>

          {/* Fecha de Transferencia */}
          <div className="space-y-2">
            <Label htmlFor="transferDate">
              Fecha de Transferencia <span className="text-red-500">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="transferDate"
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !transferDate && 'text-muted-foreground'
                  )}
                  disabled={loading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {transferDate ? (
                    format(transferDate, "d 'de' MMMM, yyyy", { locale: es })
                  ) : (
                    <span>Selecciona la fecha</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={transferDate}
                  onSelect={setTransferDate}
                  disabled={(date) => date > new Date() || date < new Date('2020-01-01')}
                  initialFocus
                  locale={es}
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground">
              Fecha en que se realizó la transferencia
            </p>
          </div>

          {/* Notas de Transferencia (Opcional) */}
          <div className="space-y-2">
            <Label htmlFor="transferNotes">
              Notas de Transferencia <span className="text-muted-foreground">(Opcional)</span>
            </Label>
            <Textarea
              id="transferNotes"
              placeholder="Ej: Transferencia realizada vía banco X, número de operación 12345..."
              value={transferNotes}
              onChange={(e) => setTransferNotes(e.target.value)}
              disabled={loading}
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {transferNotes.length}/500 caracteres
            </p>
          </div>

          {/* Información */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-900 font-medium mb-1">
              Al completar este pago:
            </p>
            <ul className="text-xs text-blue-800 space-y-1 ml-4 list-disc">
              <li>El estado del pago cambiará a Completado</li>
              <li>La transferencia quedará registrada con fecha y comprobante</li>
              <li>El conductor recibirá una notificación</li>
              <li>El comprobante estará disponible en el perfil del conductor</li>
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
            onClick={handleComplete}
            disabled={!canComplete || loading}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Completando...' : 'Completar Pago'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
