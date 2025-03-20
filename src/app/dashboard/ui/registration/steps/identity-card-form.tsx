'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { X, ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useUserStore } from '@/store/user-store'
import { IdentityCardInput, identityCardSchema } from '@/schemas'
import { ImageCapture } from '../utils/image-capture'
import Image from 'next/image'

interface IdentityCardFormProps {
  onSubmit: (data: IdentityCardInput) => any
  data: {
    role: 'traveler' | 'driver'
    personalInfo: any
    identityCard: any
  }
}

export default function IdentityCardForm({ onSubmit, data }: IdentityCardFormProps) {
  const { user } = useUserStore()
  const isVerificationRequired = data.role === 'driver' || data.role === 'traveler'

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<IdentityCardInput>({
    resolver: zodResolver(identityCardSchema),
    defaultValues: {
      isVerificationRequired,
      idNumber: data.identityCard?.idNumber,
      frontImage: undefined,
      backImage: undefined
    },
    mode: 'onChange'
  });

  const [frontImage, setFrontImage] = useState<File | null>(null)
  const [backImage, setBackImage] = useState<File | null>(null)
  const [frontPreview, setFrontPreview] = useState<string | null>(null)
  const [backPreview, setBackPreview] = useState<string | null>(null)
  const watchIdNumber = watch('idNumber')

  // Check if documents are already uploaded
  const hasFrontDocument = user?.hasIdentityCardFrontkey
  const hasBackDocument = user?.hasIdentityCardBackKey

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
          />
          <Button
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
    const idNumberValid = !!watchIdNumber;
    const frontValid = hasFrontDocument || frontPreview;
    const backValid = hasBackDocument || backPreview;

    if (isVerificationRequired) {
      // Si ya tenemos algunas imágenes, solo validamos las faltantes
      if (hasFrontDocument && hasBackDocument) {
        return idNumberValid;
      } else if (hasFrontDocument) {
        return idNumberValid && backValid;
      } else if (hasBackDocument) {
        return idNumberValid && frontValid;
      } else {
        return idNumberValid && frontValid && backValid;
      }
    }

    return idNumberValid;
  };

  const handleFormSubmit = async (formData: IdentityCardInput) => {
    const submitData: IdentityCardInput = {
      isVerificationRequired: formData.isVerificationRequired,
      idNumber: formData.idNumber,
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
      await onSubmit(submitData);
    } catch (error) {
      console.log('Error submitting form:', error);
    }
  };

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
            {!isVerificationRequired && <span className="text-sm text-muted-foreground ml-1"></span>}
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
            hasFrontDocument!,
            isVerificationRequired && !frontPreview && !hasFrontDocument ? 'La imagen frontal es requerida' : undefined
          )}

          {renderImageSection(
            'back',
            'Dorso del Documento',
            backPreview,
            hasBackDocument!,
            isVerificationRequired && !backPreview && !hasBackDocument ? 'La imagen del dorso es requerida' : undefined
          )}
        </div>

        <div className="flex-grow" />

        <footer className="sticky bottom-0 left-0 right-0 p-4 bg-background border-t">
          <div className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={!isFormValid()} onClick={() => {
            }}>
              Verificar Identidad
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </footer>
      </form>
    </div>
  )
}

function handleImageError(error: string): void {
  console.error('Image capture error:', error);
  alert('Hubo un error al capturar la imagen. Por favor, intenta nuevamente.');
}

