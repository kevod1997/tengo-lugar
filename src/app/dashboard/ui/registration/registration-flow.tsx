'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import PersonalInfoForm from './personal-info-form'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Car, User, ArrowRight } from 'lucide-react'
import IdentityCardForm from './identity-card-form'
import { Card, CardContent } from "@/components/ui/card"

type UserRole = 'traveler' | 'driver'

type FormData = {
  role: UserRole;
  personalInfo: any;
  identityCard: any;
}

export default function RegistrationFlow() {
  const [isOpen, setIsOpen] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<FormData>({
    role: 'traveler',
    personalInfo: null,
    identityCard: null
  })
  const [isToastVisible, setIsToastVisible] = useState(false)
  const router = useRouter()

  const steps = [
    { title: 'Seleccionar Rol', component: RoleSelection },
    { title: 'Información Personal', component: PersonalInfoForm },
    { title: 'Documento de Identidad', component: IdentityCardForm },
  ]

  useEffect(() => {
    const handleToastChange = () => {
      setIsToastVisible((document.querySelector('.sonner-toast-container')?.childElementCount ?? 0) > 0)
    }

    const observer = new MutationObserver(handleToastChange)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => observer.disconnect()
  }, [])

  const handleClose = () => {
    if (!isToastVisible) {
      setIsOpen(false)
      router.push('/dashboard')
    }
  }

  const handleNext = (data?: any) => {
    if (currentStep === 0) {
      setFormData(prev => ({ ...prev, role: data }))
    } else if (currentStep === 1) {
      if (!data) return
      setFormData(prev => ({ ...prev, personalInfo: data }))
    } else if (currentStep === 2) {
      setFormData(prev => ({ ...prev, identityCard: data }))
      console.log('Datos completos del registro:', formData)
      handleClose()
      return
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleSkip = () => {
    handleClose()
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const CurrentStepComponent = steps[currentStep].component

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[425px] h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 flex flex-row items-center border-b">
          {currentStep > 0 && (
            <Button variant="ghost" size="icon" onClick={handleBack} className="mr-2">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          <DialogTitle className="text-xl font-semibold">{steps[currentStep].title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 px-8">
          <div className="py-6">
            <CurrentStepComponent
              data={formData}
              onNext={handleNext}
              onSkip={handleSkip}
              onSubmit={handleNext}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

function RoleSelection({ onNext }: { onNext: (role: UserRole) => void }) {
  const [selectedRole, setSelectedRole] = useState<UserRole>('traveler')

  const roles = [
    {
      id: 'traveler',
      title: 'Viajero',
      description: 'Busca y reserva viajes compartidos de manera fácil y segura.',
      icon: User,
      disabled: false
    },
    {
      id: 'driver',
      title: 'Conductor',
      description: 'Próximamente podrás ofrecer viajes y generar ingresos extra.',
      icon: Car,
      disabled: true
    }
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {roles.map((role) => (
          <Card 
            key={role.id}
            className={`relative overflow-hidden transition-all ${
              selectedRole === role.id 
                ? 'border-primary ring-2 ring-primary ring-offset-2' 
                : role.disabled 
                  ? 'opacity-50' 
                  : 'hover:border-primary/50'
            }`}
          >
            <CardContent 
              className="p-6 cursor-pointer"
              onClick={() => !role.disabled && setSelectedRole(role.id)}
            >
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-primary/10 p-2">
                  <role.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium leading-none">{role.title}</h3>
                  <p className="text-sm text-muted-foreground">{role.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Button 
        onClick={() => onNext(selectedRole)} 
        className="w-full"
        size="lg"
      >
        Continuar como {selectedRole === 'traveler' ? 'Viajero' : 'Conductor'}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  )
}