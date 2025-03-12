'use client'

import { useState, useRef, useEffect } from 'react'
import { useUserStore } from '@/store/user-store'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { useApiResponse } from '@/hooks/ui/useApiResponse'
import { handleProfileImageUpload } from '@/utils/helpers/profile/profile-image-handler'
import { CountryCode } from 'libphonenumber-js'
import { PhoneVerification } from '@/components/phone-verification/PhoneVerification'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangleIcon, CalendarIcon, CameraIcon, Loader2Icon } from "lucide-react"

interface ProfileFormProps {
  isIdentityVerified: boolean
}

//todo ajustar el click en la imagen del perfil para solo cambiarlo cuando se hace click en la  camara

export default function ProfileForm({ isIdentityVerified }: ProfileFormProps) {
  const { user, setUser } = useUserStore()
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { handleResponse } = useApiResponse()

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      phoneNumberVerified: false,
      gender: '',
      birthDate: '',
    }
  });

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        phoneNumberVerified: user.phoneNumberVerified || false,
        gender: user.gender || '',
        birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : '',
      });
    }
  }, [user, reset]);

  const phoneNumberValue = watch('phoneNumber')
  const phoneNumberVerified = watch('phoneNumberVerified')
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>('AR')

  const handlePhoneNumberVerified = (phoneNumber: string, isVerified: boolean) => {
    setValue('phoneNumber', phoneNumber, { shouldValidate: true })
    setValue('phoneNumberVerified', isVerified, { shouldValidate: true })
  }

  const onSubmit = async (data: any) => {
    if (!user) return
    
    setIsLoading(true)
    try {
      // Implement actual submission logic
      console.log("Form data to submit:", data);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      // Update user in Zustand store
      setUser({
        ...user,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        gender: data.gender,
        birthDate: data.birthDate
      })
      
      toast.success("Perfil actualizado", {
        description: "Tus datos han sido actualizados correctamente"
      })
    } catch (error) {
      toast.error("Error", {
        description: "No se pudieron actualizar tus datos. Intenta nuevamente."
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return

    await handleProfileImageUpload({
      event,
      user,
      setIsUploadingImage,
      setUser,
      handleResponse
    })
  }

  if (!user) return null

  return (
    <Card className="mb-8">
      <CardHeader className="flex items-center pb-2">
        <div className="relative" onClick={handleImageClick}>
          <Avatar className="h-24 w-24 cursor-pointer relative">
            <AvatarImage
              src={user.profileImageKey || ''}
              alt={`${user.firstName} ${user.lastName}`}
              className={isUploadingImage ? 'opacity-50' : ''}
            />
            <AvatarFallback className="text-2xl">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </AvatarFallback>
            {isUploadingImage && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
          </Avatar>
          <div className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1">
            <CameraIcon className="h-4 w-4" />
          </div>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden cursor-pointer"
          accept="image/jpeg,image/png"
          onChange={handleImageChange}
          disabled={isUploadingImage}
        />
      </CardHeader>
      <CardContent>
        {isIdentityVerified && (
          <Alert className="mb-6 bg-muted">
            <AlertTriangleIcon className="h-4 w-4" />
            <AlertTitle>Identidad verificada</AlertTitle>
            <AlertDescription>
              No puedes modificar tu nombre, apellido y fecha de nacimiento ya que tu identidad ha sido verificada.
            </AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nombre</Label>
              <Input
                id="firstName"
                {...register('firstName', { required: 'El nombre es requerido' })}
                disabled={isIdentityVerified}
                className={isIdentityVerified ? 'bg-muted' : ''}
              />
              {errors.firstName && (
                <p className="text-destructive text-xs">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Apellido</Label>
              <Input
                id="lastName"
                {...register('lastName', { required: 'El apellido es requerido' })}
                disabled={isIdentityVerified}
                className={isIdentityVerified ? 'bg-muted' : ''}
              />
              {errors.lastName && (
                <p className="text-destructive text-xs">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              {...register('email', {
                required: 'El email es requerido',
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: 'Ingrese un email válido'
                }
              })}
              disabled
            />
            {errors.email && (
              <p className="text-destructive text-xs">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <PhoneVerification
              initialPhone={phoneNumberValue}
              initialVerified={phoneNumberVerified}
              onVerificationChange={handlePhoneNumberVerified}
              selectedCountry={selectedCountry}
              setSelectedCountry={setSelectedCountry}
              required={true}
            />
            {errors.phoneNumber && (
              <p className="text-sm text-destructive mt-1">{errors.phoneNumber.message as string}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gender">Género</Label>
              <Select
                defaultValue={user.gender}
                onValueChange={(value) => {
                  register('gender').onChange({
                    target: { name: 'gender', value }
                  });
                }}
              >
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Seleccione una opción" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MASCULINO">Masculino</SelectItem>
                  <SelectItem value="FEMENINO">Femenino</SelectItem>
                  <SelectItem value="NO_BINARIO">No binario</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate">Fecha de nacimiento</Label>
              <div className="relative">
                <Input
                  id="birthDate"
                  type="date"
                  {...register('birthDate')}
                  disabled={isIdentityVerified}
                  className={isIdentityVerified ? 'bg-muted' : ''}
                />
                <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => toast.info('Operación cancelada')}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar cambios'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}