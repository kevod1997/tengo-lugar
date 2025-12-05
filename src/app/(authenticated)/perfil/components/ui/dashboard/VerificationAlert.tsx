'use client'

import { useEffect, useState } from 'react'

import { AlertCircle } from 'lucide-react'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { FormattedUser } from '@/types/user-types'

interface VerificationAlertProps {
  user: FormattedUser
  startDriverRegistration: () => void
  setShowIdVerification: (show: boolean) => void
}

export function VerificationAlert({ user, startDriverRegistration, setShowIdVerification }: VerificationAlertProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // Verificar estados fallidos cuando el componente se monta
    if (user.identityStatus === 'FAILED' ||
      user.licenseStatus === 'FAILED' ||
      user.cars.some(car => car.insurance.status === 'FAILED') || user.cars.some(car => car.vehicleCard?.status === 'FAILED')) {
      setOpen(true)
    }
  }, [user])

  // Determinar el contenido del modal según el estado
  const getModalContent = () => {
    if (user.identityStatus === 'FAILED') {
      return {
        title: 'Verificación de Identidad Pendiente',
        description: `Tu documento de identidad fue rechazado: ${user.identityFailureReason}`,
        action: () => {
          setShowIdVerification(true)
          setOpen(false)
        },
        buttonText: 'Volver a cargar documento'
      }
    }

    if (user.licenseStatus === 'FAILED') {
      return {
        title: 'Verificación de Licencia Pendiente',
        description: `Tu licencia de conducir fue rechazada: ${user.licenseFailureReason}`,
        action: () => {
          startDriverRegistration()
          setOpen(false)
        },
        buttonText: 'Volver a cargar licencia'
      }
    }

    const failedInsurance = user.cars.find(car => car.insurance.status === 'FAILED')
    if (failedInsurance) {
      return {
        title: 'Verificación de Seguro Pendiente',
        description: `El seguro del vehículo ${failedInsurance.plate} fue rechazado: ${failedInsurance.insurance.failureReason}`,
        action: () => {
          startDriverRegistration()
          setOpen(false)
        },
        buttonText: 'Volver a cargar seguro'
      }
    }

    const failedCarCard = user.cars.find((car) => car.vehicleCard?.status === 'FAILED')
    if (failedCarCard) {
      return {
        title: 'Verificación de Tarjeta Vehicular Pendiente',
        description: `La tarjeta vehicular del vehículo ${failedCarCard.plate} fue rechazada: ${failedCarCard.vehicleCard?.failureReason}`,
        action: () => {
          startDriverRegistration()
          setOpen(false)
        },
        buttonText: 'Volver a cargar tarjeta vehicular'
      }
    }

    return null
  }

  const modalContent = getModalContent()

  if (!modalContent) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex gap-2 items-center">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <DialogTitle>{modalContent.title}</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            {modalContent.description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-between">
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
          >
            Cerrar
          </Button>
          <Button
            variant="default"
            onClick={modalContent.action}
          >
            {modalContent.buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}