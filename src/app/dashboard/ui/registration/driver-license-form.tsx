'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { driverLicenseSchema, DriverLicenseInput } from '@/lib/validations/user-validation'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { X, ArrowRight, AlertTriangle } from "lucide-react"
import { ImageCapture } from '../image-capture'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

interface DriverLicenseFormProps {
  onSubmit: (data: DriverLicenseInput) => any
  data: {
    role: 'traveler' | 'driver'
    personalInfo: any
    identityCard: any
    driverLicense?: any
  }
}

export default function DriverLicenseForm({ onSubmit, data }: DriverLicenseFormProps) {
  const formKey = 'driver-license-form'

  const { register, handleSubmit, setValue, watch, formState: { errors, isValid }, reset } = useForm<DriverLicenseInput>({
    resolver: zodResolver(driverLicenseSchema),
    defaultValues: {
      ...data.driverLicense,
      frontImage: null,
      backImage: null
    },
    mode: 'onChange'
  })

  const [frontImage, setFrontImage] = useState<File | null>(null)
  const [backImage, setBackImage] = useState<File | null>(null)
  const [frontPreview, setFrontPreview] = useState<string | null>(null)
  const [backPreview, setBackPreview] = useState<string | null>(null)

  const watchExpirationDate = watch('expirationDate')

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
    } else if (data.driverLicense) {
      reset({
        ...data.driverLicense,
        frontImage: null,
        backImage: null
      })
      if (data.driverLicense.frontImage?.preview) {
        setFrontPreview(data.driverLicense.frontImage.preview)
      }
      if (data.driverLicense.backImage?.preview) {
        setBackPreview(data.driverLicense.backImage.preview)
      }
    }
  }, [data.driverLicense, reset])

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
      setValue('frontImage', { file, source, preview }, { shouldValidate: true })
    } else {
      setBackImage(file)
      setBackPreview(preview)
      setValue('backImage', { file, source, preview }, { shouldValidate: true })
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

  const isFormValid = () => {
    return isValid && frontPreview && backPreview && watchExpirationDate
  }

  //TODO SI HAY UN SUBMIT Y HUBO ERROR VER QUE SE LIMPIEN LOS CAMPOS O QUE NO SE PONGA DISABLED EL BOTON DE VERIFICAR 
  const handleFormSubmit = async (formData: DriverLicenseInput) => {
    try {
      const processedData = {
        ...formData,
        frontImage: frontImage ? { file: frontImage, source: 'upload' as 'upload', preview: frontPreview || '' } : undefined,
        backImage: backImage ? { file: backImage, source: 'upload' as 'upload', preview: backPreview || '' } : undefined,
      }
      const result = await onSubmit(formData);

      // Si el resultado fue exitoso
      if (result?.success) {
        localStorage.removeItem(formKey);
        return;
      }

    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-10rem)]">
      <Alert className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Verificación de licencia de conducir</AlertTitle>
        <AlertDescription>
          Para garantizar la seguridad y confianza en nuestra plataforma, necesitamos verificar tu licencia de conducir.
          Esto nos ayuda a crear un ambiente más seguro para todos los usuarios de Tengo Lugar.
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
        <div className="space-y-2">
          <Label htmlFor="expirationDate">Fecha de vencimiento</Label>
          <Input
            id="expirationDate"
            type="date"
            {...register('expirationDate')}
          />
          {errors.expirationDate && (
            <p className="text-sm text-destructive">{errors.expirationDate.message as string}</p>
          )}
        </div>

        <div className="space-y-8">
          {renderImageSection(
            'front',
            'Frente de la Licencia',
            frontPreview,
            !frontPreview ? 'La imagen frontal es requerida' : undefined
          )}

          {renderImageSection(
            'back',
            'Dorso de la Licencia',
            backPreview,
            !backPreview ? 'La imagen del dorso es requerida' : undefined
          )}
        </div>

        <div className="flex-grow" />

        <footer className="sticky bottom-0 left-0 right-0 p-4 bg-background border-t">
          <div className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={!isFormValid()}>
              Verificar Licencia de Conducir
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </footer>
      </form>
    </div>
  )
}