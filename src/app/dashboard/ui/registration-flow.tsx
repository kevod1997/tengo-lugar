'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Camera, ArrowLeft, ArrowRight, CarIcon } from 'lucide-react'
import { useCamera } from '@/hooks/use-camera'
import { useRouter } from 'next/navigation'

type DocumentType = 'dni' | 'license'

interface Documents {
  dni: File | null
  license: File | null
}

export default function RegistrationFlow() {
  const [step, setStep] = useState<'selectRole' | 'verifyIdentity' | 'verificationPending'>('selectRole')
  const [role, setRole] = useState<'conductor' | 'viajero' | ''>('')
  const [isUserVerified, setIsUserVerified] = useState(false)
  const [documents, setDocuments] = useState<Documents>({ dni: null, license: null })
  const router = useRouter()

  const { capturePhoto, startCamera, stopCamera, videoRef } = useCamera()

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, docType: DocumentType) => {
    const file = event.target.files?.[0]
    if (file) {
      setDocuments(prev => ({ ...prev, [docType]: file }))
    }
  }

  const handleCameraCapture = async (docType: DocumentType) => {
    await startCamera()
    const file = await capturePhoto(`${docType}.jpg`)
    if (file) {
      setDocuments(prev => ({ ...prev, [docType]: file }))
    }
    stopCamera()
  }

  const renderStep = () => {
    switch (step) {
      case 'selectRole':
        return (
          <>
            <DialogHeader className="pb-4">
              <DialogTitle>Seleccionar Rol</DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <RadioGroup onValueChange={(value: 'conductor' | 'viajero') => setRole(value)}>
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="conductor" id="conductor" />
                  <Label htmlFor="conductor">Conductor</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="viajero" id="viajero" />
                  <Label htmlFor="viajero">Viajero</Label>
                </div>
              </RadioGroup>
              <div className="flex justify-end">
                <Button onClick={() => setStep('verifyIdentity')} disabled={!role}>
                  Siguiente <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )
      case 'verifyIdentity':
        return (
          <>
            <DialogHeader className="pb-4">
              <DialogTitle>Verificación de Identidad</DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <div>
                <Label htmlFor="dni">DNI</Label>
                <div className="flex items-center space-x-2">
                  <Input id="dni" type="file" onChange={(e) => handleFileUpload(e, 'dni')} />
                  <Button onClick={() => handleCameraCapture('dni')}>
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                {documents.dni && <p className="text-sm text-green-500 mt-1">Documento cargado</p>}
              </div>
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" type="tel" />
              </div>
              <div>
                <Label htmlFor="gender">Género (opcional)</Label>
                <Input id="gender" />
              </div>
              {role === 'conductor' && (
                <div>
                  <Label htmlFor="license">Licencia de Conducir</Label>
                  <div className="flex items-center space-x-2">
                    <Input id="license" type="file" onChange={(e) => handleFileUpload(e, 'license')} />
                    <Button onClick={() => handleCameraCapture('license')}>
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  {documents.license && <p className="text-sm text-green-500 mt-1">Documento cargado</p>}
                </div>
              )}
              <div className="flex justify-between">
                <Button onClick={() => setStep('selectRole')}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Atrás
                </Button>
                <Button onClick={() => setStep('verificationPending')} disabled={!documents.dni || (role === 'conductor' && !documents.license)}>
                  Siguiente <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )
      case 'verificationPending':
        return (
          <>
            <DialogHeader className="pb-4">
              <DialogTitle>Verificación Pendiente</DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <p>Su documentación está siendo revisada. Le notificaremos cuando el proceso esté completo.</p>
              <div className="flex justify-between">
                <Button onClick={() => setIsUserVerified(true)}>
                  Entendido
                </Button>
                <Button onClick={() => {
                  router.push('/')
                }}>
                  <CarIcon className="mr-2 h-4 w-4" /> Buscar Viajes
                </Button>
              </div>
            </div>
          </>
        )
    }
  }

  if (isUserVerified) {
    return null
  }

  return (
    <Dialog open={!isUserVerified} onOpenChange={(open) => !open && setIsUserVerified(true)}>
      <DialogContent className="sm:max-w-[425px]">
        {renderStep()}
        <video ref={videoRef} style={{ display: 'none' }} />
      </DialogContent>
    </Dialog>
  )
}