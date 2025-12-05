'use client'

import { useState } from 'react'

import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { toggleFuelPriceStatus } from '@/actions/fuel-price/toggle-fuel-price-status'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { FuelPriceListItem} from '@/types/fuel-price';
import { fuelTypeLabels } from '@/types/fuel-price'

interface ToggleStatusDialogProps {
  fuelPrice: FuelPriceListItem
  open: boolean
  onSuccess: () => void
  onCancel: () => void
}

export function ToggleStatusDialog({ fuelPrice, open, onSuccess, onCancel }: ToggleStatusDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const newStatus = !fuelPrice.isActive

  const handleConfirm = async () => {
    setIsSubmitting(true)

    try {
      const response = await toggleFuelPriceStatus({
        id: fuelPrice.id,
        isActive: newStatus,
      })

      if (response.success) {
        toast.success(response.message)
        onSuccess()
      } else {
        toast.error(response.message)
      }
    } catch (error) {
      toast.error('Error al cambiar el estado del precio')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {newStatus ? 'Activar' : 'Desactivar'} Precio de Combustible
          </AlertDialogTitle>
          <AlertDialogDescription>
            {newStatus ? (
              <>
                ¿Estás seguro de que deseas <strong>activar</strong> el precio de{' '}
                <strong>{fuelTypeLabels[fuelPrice.fuelType]}</strong> llamado{' '}
                <strong>{fuelPrice.name}</strong>?
                <br />
                <br />
                El precio estará disponible en el sistema y visible para los cálculos.
              </>
            ) : (
              <>
                ¿Estás seguro de que deseas <strong>desactivar</strong> el precio de{' '}
                <strong>{fuelTypeLabels[fuelPrice.fuelType]}</strong> llamado{' '}
                <strong>{fuelPrice.name}</strong>?
                <br />
                <br />
                El precio dejará de estar disponible en el sistema pero se mantendrá en el historial.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isSubmitting}
            className={newStatus ? '' : 'bg-destructive hover:bg-destructive/90'}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {newStatus ? 'Activar' : 'Desactivar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
