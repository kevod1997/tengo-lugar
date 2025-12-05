'use client'

import { useState } from 'react'

import Image from 'next/image'

import { zodResolver } from '@hookform/resolvers/zod'
import { X, ArrowRight, AlertTriangle, CheckCircle2 } from "lucide-react"
import { useForm } from 'react-hook-form'

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { DriverLicenseInput} from '@/schemas';
import { driverLicenseSchema } from '@/schemas'
import { useUserStore } from '@/store/user-store'

import { ImageCapture } from '../utils/image-capture'

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
  const { user } = useUserStore()

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<DriverLicenseInput>({
    resolver: zodResolver(driverLicenseSchema),
    defaultValues: {
      expirationDate: data.driverLicense?.expirationDate,
      frontImage: undefined,
      backImage: undefined
    },
    mode: 'onChange'
  });

  const [frontImage, setFrontImage] = useState<File | null>(null)
  const [backImage, setBackImage] = useState<File | null>(null)
  const [frontPreview, setFrontPreview] = useState<string | null>(null)
  const [backPreview, setBackPreview] = useState<string | null>(null)
  const watchExpirationDate = watch('expirationDate')

  // Check if documents are already uploaded
  const hasFrontDocument = user?.hasLicenseCardFrontkey
  const hasBackDocument = user?.hasLicenseCardBackKey

  const handleImageError = (error: string) => {
    console.error(error)
  }

  const handleImageCapture = (side: 'front' | 'back') => (file: File, preview: string, source: 'camera' | 'upload') => {
    if (side === 'front' && !hasFrontDocument) {
      setFrontImage(file);
      setFrontPreview(preview);
      setValue('frontImage', { file, source, preview }, { shouldValidate: true });
    } else if (side === 'back' && !hasBackDocument) {
      setBackImage(file);
      setBackPreview(preview);
      setValue('backImage', { file, source, preview }, { shouldValidate: true });
    }
  };

  const handleRemoveImage = (side: 'front' | 'back') => {
    if (side === 'front' && !hasFrontDocument) {
      setFrontImage(null);
      setFrontPreview(null);
      setValue('frontImage', undefined, { shouldValidate: true });
    } else if (side === 'back' && !hasBackDocument) {
      setBackImage(null);
      setBackPreview(null);
      setValue('backImage', undefined, { shouldValidate: true });
    }
  };

  const renderImageSection = (
    side: 'front' | 'back',
    title: string,
    preview: string | null,
    isUploaded: boolean,
    error?: string
  ) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>{title}</Label>
        {isUploaded && (
          <span className="text-sm text-green-600 flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4" />
            Documento cargado
          </span>
        )}
      </div>

      {isUploaded ? (
        <Alert className="bg-muted">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle>Documento ya verificado</AlertTitle>
          <AlertDescription>
            Este lado del documento ya fue verificado.
          </AlertDescription>
        </Alert>
      ) : preview ? (
        <div className="relative rounded-lg overflow-hidden" style={{ aspectRatio: '1.6', width: '100%' }}>
          {/* <img
            src={preview}
            alt={`Vista previa ${side}`}
            className="w-full h-full object-contain"
          /> */}
          {/* <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 rounded-full"
            onClick={() => handleRemoveImage(side)}
          > */}
          <Image
            src={preview}
            alt={`Vista previa ${side}`}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 rounded-full z-10"
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
    const expirationDateValid = !!watchExpirationDate;
    const frontValid = hasFrontDocument || frontPreview;
    const backValid = hasBackDocument || backPreview;

    // Si ya tenemos algunas imágenes, solo validamos las faltantes
    if (hasFrontDocument && hasBackDocument) {
      return expirationDateValid;
    } else if (hasFrontDocument) {
      return expirationDateValid && backValid;
    } else if (hasBackDocument) {
      return expirationDateValid && frontValid;
    } else {
      return expirationDateValid && frontValid && backValid;
    }
  };

  const handleFormSubmit = async (formData: DriverLicenseInput) => {
    const submitData: DriverLicenseInput = {
      expirationDate: formData.expirationDate,
      frontImage: !hasFrontDocument && frontImage ? {
        file: frontImage,
        source: 'upload',
        preview: frontPreview || ''
      } : undefined,
      backImage: !hasBackDocument && backImage ? {
        file: backImage,
        source: 'upload',
        preview: backPreview || ''
      } : undefined
    };

    try {
      //todo ajustar
      const result = await onSubmit(submitData);
      console.log('Form submitted:', result);
    } catch (error) {
      console.log('Error submitting form:', error);
    }
  };

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
            hasFrontDocument!,
            !frontPreview && !hasFrontDocument ? 'La imagen frontal es requerida' : undefined
          )}

          {renderImageSection(
            'back',
            'Dorso de la Licencia',
            backPreview,
            hasBackDocument!,
            !backPreview && !hasBackDocument ? 'La imagen del dorso es requerida' : undefined
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