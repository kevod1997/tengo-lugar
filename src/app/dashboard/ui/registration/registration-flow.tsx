'use client'

import React, { useState, useCallback } from 'react'
import { User, IdentityCard, UserTermsAcceptance } from '@prisma/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronLeft } from 'lucide-react'
import ProgressBar from '@/components/progress-bar/progress-bar'
import { useRegistrationFlow } from './use-registration-flow'


type RegistrationFlowProps = {
  onComplete: () => void
  initialStep?: 'role' | 'personalInfo' | 'identityCard'
  onClose?: () => void
}

export default function RegistrationFlow({ onComplete, initialStep = 'role', onClose }: RegistrationFlowProps) {
  const [isOpen, setIsOpen] = useState(true)
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
  } = useRegistrationFlow(initialStep, onComplete)

  const handleClose = useCallback(() => {
    setIsOpen(false)
    if (onClose) {
      onClose()
    }
  }, [onClose])


  const progress = ((currentStepIndex + 1) / totalSteps) * 100
  const CurrentStepComponent = currentStep.component

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
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
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-6">
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
  )
}