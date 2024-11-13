'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronLeft } from 'lucide-react'
import ProgressBar from '@/components/progress-bar/progress-bar'
import { useRegistrationFlow } from './use-registration-flow'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type RegistrationFlowProps = {
  onComplete: () => void
  initialStep?: 'role' | 'personalInfo' | 'identityCard' | 'driverLicense'
  onClose?: () => void
  initialRole?: 'traveler' | 'driver'
}

export default function RegistrationFlow({ onComplete, initialStep = 'role', initialRole, onClose }: RegistrationFlowProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [showExitConfirmation, setShowExitConfirmation] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const {
    currentStep,
    currentStepIndex,
    steps,
    totalSteps,
    formData,
    isLoading,
    handleNext,
    handleBack,
    handleSkip,
    setFormData,
    userProfile,
    setUser,
    user,
  } = useRegistrationFlow(initialStep, onComplete, initialRole)

  // const handleClose = useCallback(() => {
  //   setIsOpen(false)
  //   if (onClose) {
  //     onClose()
  //   }
  // }, [onClose])

  // Función para desplazarse al principio
  const scrollToTop = useCallback(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = 0
    }
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    // Asegurarse de que la ventana también se desplace al principio
    window.scrollTo(0, 0)
  }, [])

  // Efecto para manejar el desplazamiento cuando cambia el paso
  useEffect(() => {
    // Usar setTimeout para asegurarse de que el DOM se ha actualizado
    const timeoutId = setTimeout(() => {
      scrollToTop()
    }, 100) // Pequeño retraso para asegurar que el nuevo contenido está renderizado

    return () => clearTimeout(timeoutId)
  }, [currentStepIndex, scrollToTop])

  const handleCloseAttempt = useCallback(() => {
    if (currentStepIndex > 0) {
      setShowExitConfirmation(true)
    } else {
      setIsOpen(false)
      if (onClose) {
        onClose()
      }
    }
  }, [formData.role, currentStepIndex, onClose])

  const handleConfirmExit = () => {
    setShowExitConfirmation(false)
    if(user === null) {
      setUser(userProfile)
    }
    setIsOpen(false)
    if (onClose) {
      onClose()
    }
  }



  const progress = ((currentStepIndex + 1) / totalSteps) * 100
  const CurrentStepComponent = currentStep.component

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleCloseAttempt}>
        <DialogContent className="flex flex-col max-w-[425px] sm:max-w-[600px] p-0 gap-0 h-[90vh] max-h-[90vh]">
          <DialogHeader className="flex-none p-6 pb-4 flex flex-row items-center justify-between border-b">
            {currentStepIndex > 0 && (
              <Button variant="ghost" size="icon" onClick={handleBack}>
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Volver</span>
              </Button>
            )}
            <DialogTitle className="text-xl font-semibold">{currentStep.title}</DialogTitle>
            <div className="text-sm text-muted-foreground">
              Paso {currentStepIndex + 1} de {totalSteps}
            </div>
          </DialogHeader>
          <ProgressBar progress={progress} />
          <ScrollArea ref={scrollAreaRef} className="flex-1 min-h-0">
            <div ref={contentRef} className="p-6">
              <CurrentStepComponent
                data={formData}
                onNext={handleNext}
                onSkip={handleSkip}
                onSubmit={handleNext}
              />
            </div>
          </ScrollArea>
          {isLoading && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <AlertDialog open={showExitConfirmation} onOpenChange={setShowExitConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro que deseas salir?</AlertDialogTitle>
            <AlertDialogDescription>
              Si sales ahora, perderás todo el progreso en tu registro.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowExitConfirmation(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmExit}>
              Salir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}