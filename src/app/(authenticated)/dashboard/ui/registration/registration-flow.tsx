'use client'

import React, { useState, useCallback } from 'react'
import { useRegistrationFlow } from '@/hooks/registration/UseRegistrationFlow'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import ProgressBar from '@/components/progress-bar/progress-bar'
import { StepId, UserRole } from '@/types/registration-types'
import { ConfirmationDialog } from '@/components/dialog/ConfirmationDialog'
import { useScrollToTop } from '@/hooks/ui/useScrollToTop'

type RegistrationFlowProps = {
  onComplete: () => void
  initialStep?: StepId
  onClose?: () => void
  initialRole?: UserRole
}

export default function RegistrationFlow({ onComplete, initialStep = 'role', initialRole, onClose }: RegistrationFlowProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [showExitConfirmation, setShowExitConfirmation] = useState(false)
  const { scrollAreaRef, contentRef } = useScrollToTop()

  const {
    currentStep,
    currentStepIndex,
    totalSteps,
    formData,
    isLoading,
    handleNext,
  } = useRegistrationFlow(initialStep, onComplete, onClose, initialRole)

  const handleCloseAttempt = useCallback(() => {
    if (currentStepIndex > 0) {
      setShowExitConfirmation(true)
    } else {
      setIsOpen(false)
      if (onClose) {
        onClose()
      }
    }
  }, [currentStepIndex, onClose])

  const handleConfirmExit = () => {
    setShowExitConfirmation(false)
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
            <DialogTitle className="text-xl font-semibold">{currentStep.title}</DialogTitle>
            <div className="text-sm text-muted-foreground">
              {
                currentStep.id === 'role' ? 'Paso 1' : `Paso ${currentStepIndex + 1} de ${totalSteps}`
              }
            </div>
          </DialogHeader>
          <ProgressBar progress={progress} />
          <ScrollArea ref={scrollAreaRef} className="flex-1 min-h-0">
            <div ref={contentRef} className="p-6">
              <CurrentStepComponent
                data={formData}
                onNext={handleNext}
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
      <ConfirmationDialog
        open={showExitConfirmation}
        onOpenChange={setShowExitConfirmation}
        title="¿Estás seguro que deseas salir?"
        description="Podes retomar el registro en este punto más tarde."
        cancelText="Cancelar"
        confirmText="Salir"
        onConfirm={handleConfirmExit}
      />
    </>
  )
}