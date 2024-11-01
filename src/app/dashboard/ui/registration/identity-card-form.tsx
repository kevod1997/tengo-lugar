'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { identityCardSchema } from '@/lib/validations/user-validation'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { ImageCapture } from '../image-capture'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"
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

interface IdentityCardFormProps {
  onSubmit: (data: any) => void
  onSkip: () => void
  data: {
    role: 'traveler' | 'driver'
    personalInfo: any
    identityCard: any
  }
}

export default function IdentityCardForm({ onSubmit, onSkip, data }: IdentityCardFormProps) {
  const isVerificationRequired = data.role === 'driver'
  const [showWarning, setShowWarning] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(identityCardSchema),
    defaultValues: { ...data.identityCard, isVerificationRequired }
  })

  const [frontImage, setFrontImage] = useState<File | null>(null)
  const [backImage, setBackImage] = useState<File | null>(null)
  const [frontPreview, setFrontPreview] = useState<string | null>(null)
  const [backPreview, setBackPreview] = useState<string | null>(null)

  const handleImageCapture = (side: 'front' | 'back') => (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (side === 'front') {
        setFrontImage(file)
        setFrontPreview(e.target?.result as string)
        setValue('frontImage', { file, source: 'upload' }, { shouldValidate: true })
      } else {
        setBackImage(file)
        setBackPreview(e.target?.result as string)
        setValue('backImage', { file, source: 'upload' }, { shouldValidate: true })
      }
    }
    reader.readAsDataURL(file)
  }

  const handleImageError = (error: string) => {
    // Handle error (you could set an error state and display it in the UI)
    console.error(error)
  }

  const handleRemoveImage = (side: 'front' | 'back') => {
    if (side === 'front') {
      setFrontImage(null)
      setFrontPreview(null)
      setValue('frontImage', null, { shouldValidate: true })
    } else {
      setBackImage(null)
      setBackPreview(null)
      setValue('backImage', null, { shouldValidate: true })
    }
  }

  const renderImageSection = (
    side: 'front' | 'back',
    title: string,
    image: string | null,
    error?: string
  ) => (
    <div className="space-y-4">
      <Label>{title}</Label>
      
      {image ? (
        <div className="relative rounded-lg overflow-hidden">
          <img
            src={image}
            alt={`Vista previa ${side}`}
            className="w-full h-48 object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 rounded-full"
            onClick={() => handleRemoveImage(side)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <ImageCapture
          id={`${side}-${Date.now()}`}
          onCapture={handleImageCapture(side)}
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
      setShowWarning(true)
      setShowConfirmDialog(true)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <input type="hidden" {...register('isVerificationRequired')} />
      
      <div className="space-y-2">
        <Label htmlFor="idNumber">
          Número de Identificación
          {!isVerificationRequired && <span className="text-sm text-gray-500 ml-1">(Opcional)</span>}
        </Label>
        <Input
          id="idNumber"
          {...register('idNumber')}
          placeholder="Ingresa tu número de identificación"
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
          errors.frontImage?.message as string
        )}
        
        {renderImageSection(
          'back',
          'Dorso del Documento',
          backPreview,
          errors.backImage?.message as string
        )}
      </div>

      {showWarning && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Si no verificas tu identidad, algunas funciones estarán limitadas.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col space-y-4">
        <Button type="submit" className="w-full">
          Guardar Información
        </Button>
        {!isVerificationRequired && (
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

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Si no verificas tu identidad, algunas funciones de la plataforma estarán limitadas. Podrás completar la verificación más tarde desde tu perfil.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConfirmDialog(false)}>Volver</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setShowConfirmDialog(false)
              onSkip()
            }}>
              Continuar sin verificar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  )
}