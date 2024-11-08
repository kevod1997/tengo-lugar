'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { identityCardSchema, IdentityCardInput } from '@/lib/validations/user-validation'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { X, ArrowRight, AlertTriangle } from "lucide-react"
import { ImageCapture } from '../image-capture'
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useUserStore } from '@/store/user-store'

interface IdentityCardFormProps {
  onSubmit: (data: IdentityCardInput) => void
  onSkip: () => void
  data: {
    role: 'traveler' | 'driver'
    personalInfo: any
    identityCard: any
  }
}

export default function IdentityCardForm({ onSubmit, onSkip, data }: IdentityCardFormProps) {
  const { user } = useUserStore()
  const isVerificationRequired = data.role === 'driver'
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const formKey = 'identity-card-form'

  const { register, handleSubmit, setValue, watch, formState: { errors, isValid }, reset } = useForm<IdentityCardInput>({
    resolver: zodResolver(identityCardSchema),
    defaultValues: {
      ...data.identityCard,
      isVerificationRequired,
      frontImage: null,
      backImage: null
    },
    mode: 'onChange'
  })

  const [frontImage, setFrontImage] = useState<File | null>(null)
  const [backImage, setBackImage] = useState<File | null>(null)
  const [frontPreview, setFrontPreview] = useState<string | null>(null)
  const [backPreview, setBackPreview] = useState<string | null>(null)

  const watchIdNumber = watch('idNumber')

  // Load saved form data on mount
  useEffect(() => {
    const savedData = localStorage.getItem(formKey)
    if (savedData) {
      const parsedData = JSON.parse(savedData)
      reset({
        ...parsedData,
        frontImage: null,
        backImage: null
      })
      if (parsedData.frontImage?.preview) {
        setFrontPreview(parsedData.frontImage.preview)
      }
      if (parsedData.backImage?.preview) {
        setBackPreview(parsedData.backImage.preview)
      }
    } else if (data.identityCard) {
      reset({
        ...data.identityCard,
        frontImage: null,
        backImage: null
      })
      if (data.identityCard.frontImage?.preview) {
        setFrontPreview(data.identityCard.frontImage.preview)
      }
      if (data.identityCard.backImage?.preview) {
        setBackPreview(data.identityCard.backImage.preview)
      }
    }
  }, [data.identityCard, reset])

  // Save form data on change
  useEffect(() => {
    const subscription = watch((value) => {
      const formData = {
        ...value,
        frontImage: frontImage ? { preview: frontPreview } : null,
        backImage: backImage ? { preview: backPreview } : null,
      }
      localStorage.setItem(formKey, JSON.stringify(formData))
    })
    return () => subscription.unsubscribe()
  }, [watch, frontImage, backImage, frontPreview, backPreview])



  const handleImageError = (error: string) => {
    console.error(error)
  }

  const handleImageCapture = (side: 'front' | 'back') => (file: File, preview: string, source: 'camera' | 'upload') => {
    if (side === 'front') {
      setFrontImage(file)
      setFrontPreview(preview)
      setValue('frontImage', { file, source }, { shouldValidate: true })
    } else {
      setBackImage(file)
      setBackPreview(preview)
      setValue('backImage', { file, source }, { shouldValidate: true })
    }

    // Update form data immediately after capturing image
    const currentFormData = JSON.parse(localStorage.getItem(formKey) || '{}')
    const updatedFormData = {
      ...currentFormData,
      [side === 'front' ? 'frontImage' : 'backImage']: { file, preview, source }
    }
    localStorage.setItem(formKey, JSON.stringify(updatedFormData))
  }

  const handleRemoveImage = (side: 'front' | 'back') => {
    if (side === 'front') {
      setFrontImage(null)
      setFrontPreview(null)
      setValue('frontImage', undefined, { shouldValidate: true })
    } else {
      setBackImage(null)
      setBackPreview(null)
      setValue('backImage', undefined, { shouldValidate: true })
    }

    // Update form data immediately after removing image
    const currentFormData = JSON.parse(localStorage.getItem(formKey) || '{}')
    const updatedFormData = {
      ...currentFormData,
      [side === 'front' ? 'frontImage' : 'backImage']: undefined
    }
    localStorage.setItem(formKey, JSON.stringify(updatedFormData))
  }

  const renderImageSection = (
    side: 'front' | 'back',
    title: string,
    preview: string | null,
    error?: string
  ) => (
    <div className="space-y-4">
      <Label>{title}</Label>

      {preview ? (
        <div className="relative rounded-lg overflow-hidden" style={{ aspectRatio: '1.6', width: '100%' }}>
          <img
            src={preview}
            alt={`Vista previa ${side}`}
            className="w-full h-full object-contain"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 rounded-full"
            onClick={() => handleRemoveImage(side)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Eliminar imagen</span>
          </Button>
        </div>
      ) : (
        <ImageCapture
          id={`${side}-${Date.now()}`}
          onCapture={(file, preview) => handleImageCapture(side)(file, preview, 'camera')}
          onError={handleImageError}
          aspectRatio={1.6}
        />
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )

  const handleSkipWithWarning = () => {
    if (!isVerificationRequired) {
      setShowConfirmDialog(true)
    } else {
      // If verification is required, we shouldn't allow skipping
      console.warn("Attempted to skip required verification")
    }
  }

  const isFormValid = () => {
    if (isValid && ((isVerificationRequired && frontPreview && backPreview) || !isVerificationRequired) && watchIdNumber) {
      return true
    }
    return false
  }

  const handleFormSubmit = async (formData: IdentityCardInput) => {
    try {
      const processedData = {
        ...formData,
        frontImage: frontImage ? { file: frontImage, source: 'upload' as 'upload', preview: frontPreview } : undefined,
        backImage: backImage ? { file: backImage, source: 'upload' as 'upload', preview: backPreview } : undefined,
      }
      localStorage.removeItem(formKey) // Clear saved data on successful submit
      onSubmit(processedData)
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-10rem)]">
      <Alert className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Verificación de identidad</AlertTitle>
        <AlertDescription>
          Para garantizar la seguridad y confianza en nuestra plataforma, necesitamos verificar tu identidad.
          Esto nos ayuda a crear un ambiente más seguro para todos los usuarios de Tengo Lugar.
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
        <input type="hidden" {...register('isVerificationRequired')} />

        <div className="space-y-2">
          <Label htmlFor="idNumber">
            Número de Identificación (DNI)
            {!isVerificationRequired && <span className="text-sm text-muted-foreground ml-1">(Opcional)</span>}
          </Label>
          <Input
            id="idNumber"
            {...register('idNumber')}
            placeholder="Ingresa tu número de DNI"
          />
          {errors.idNumber && (
            <p className="text-sm text-destructive">{errors.idNumber.message as string}</p>
          )}
        </div>

        <div className="space-y-8">
          {renderImageSection(
            'front',
            'Frente del Documento',
            frontPreview,
            isVerificationRequired && !frontPreview ? 'La imagen frontal es requerida' : undefined
          )}

          {renderImageSection(
            'back',
            'Dorso del Documento',
            backPreview,
            isVerificationRequired && !backPreview ? 'La imagen del dorso es requerida' : undefined
          )}
        </div>

        <div className="flex-grow" />

        <footer className="sticky bottom-0 left-0 right-0 p-4 bg-background border-t">
          <div className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={!isFormValid()}>
              Verificar Identidad
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            {!user && !isVerificationRequired && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleSkipWithWarning}
              >
                Omitir por ahora
              </Button>
            )}
          </div>
        </footer>

        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro que deseas omitir la verificación?</AlertDialogTitle>
              <AlertDialogDescription>
                La verificación ayuda a crear un ambiente más seguro y confiable para todos los usuarios.
                Podrás completar la verificación más tarde desde tu perfil.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowConfirmDialog(false)}>Volver</AlertDialogCancel>
              <AlertDialogAction onClick={() => {
                setShowConfirmDialog(false)
                localStorage.removeItem(formKey)
                if (typeof onSkip === 'function') {
                  onSkip()
                } else {
                  console.error('onSkip is not a function')
                }
              }}>
                Continuar sin verificar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </form>
    </div>
  )
}