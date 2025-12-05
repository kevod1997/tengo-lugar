'use client'

import { useState, useEffect, useCallback } from 'react'

import Image from 'next/image'

import { Download, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

import { getPaymentProof } from '@/actions/payment/get-payment-proof'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'




interface PaymentProofModalProps {
  paymentId: string
  open: boolean
  onClose: () => void
}

export function PaymentProofModal({ paymentId, open, onClose }: PaymentProofModalProps) {
  const [loading, setLoading] = useState(true)
  const [proofUrl, setProofUrl] = useState<string | null>(null)
  const [passengerInfo, setPassengerInfo] = useState<{ name: string; email: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadProof = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await getPaymentProof(paymentId)

      if (!response.success) {
        throw new Error(response.message)
      }

      // Type guard to ensure response.data exists
      if (!response.data) {
        throw new Error('No se recibieron datos del servidor')
      }

      setProofUrl(response.data.signedUrl)
      setPassengerInfo({
        name: response.data.passengerName,
        email: response.data.passengerEmail,
      })
    } catch (err: any) {
      setError(err.message || 'Error al cargar el comprobante')
      toast.error(err.message || 'Error al cargar el comprobante')
    } finally {
      setLoading(false)
    }
  }, [paymentId])

  useEffect(() => {
    if (open && paymentId) {
      loadProof()
    }
  }, [open, paymentId, loadProof])

  const handleDownload = () => {
    if (proofUrl) {
      window.open(proofUrl, '_blank')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Comprobante de Pago</DialogTitle>
          {passengerInfo && (
            <DialogDescription>
              Pasajero: {passengerInfo.name} ({passengerInfo.email})
            </DialogDescription>
          )}
        </DialogHeader>

        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">Cargando comprobante...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <p className="mt-4 text-sm font-semibold">{error}</p>
            <Button
              variant="outline"
              onClick={loadProof}
              className="mt-4"
            >
              Reintentar
            </Button>
          </div>
        )}

        {!loading && !error && proofUrl && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar
              </Button>
            </div>

            <div className="border rounded-lg overflow-hidden bg-gray-50">
              {proofUrl.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={proofUrl}
                  className="w-full h-[600px]"
                  title="Comprobante de pago"
                />
              ) : (
                <Image
                  src={proofUrl}
                  alt="Comprobante de pago"
                  width={20}
                  height={20}
                  className="w-full h-auto"
                />
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
