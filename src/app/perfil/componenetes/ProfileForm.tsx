'use client'

import { useState, useRef, useEffect } from 'react'
import { useUserStore } from '@/store/user-store'
import { toast } from 'sonner'
import { useForm, SubmitHandler } from 'react-hook-form'
import { useApiResponse } from '@/hooks/ui/useApiResponse'
import { handleProfileImageUpload } from '@/utils/helpers/profile/profile-image-handler'
import { CountryCode } from 'libphonenumber-js'
import { PhoneVerification } from '@/components/phone-verification/PhoneVerification'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangleIcon, CalendarIcon, Loader2Icon } from "lucide-react"
import { ExpandableAvatar } from '@/components/avatar-modal/AvatarModal'
import { ProfileImageUploadButton } from '@/app/dashboard/ui/dashboard/ProfileCard'
import { authClient } from '@/lib/auth-client'
import { splitFullName } from '@/utils/format/user-formatter'
import { UserRegistrationService } from '@/services/registration/user-service'

interface ProfileFormProps {
  isIdentityVerified: boolean
  birthDate: Date | null | undefined
  phoneNumber: string | null | undefined
}

interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  phoneNumberVerified: boolean;
  gender: string;
  birthDate: string;
}

export default function ProfileForm({ isIdentityVerified, birthDate, phoneNumber }: ProfileFormProps) {
  const { user, setUser } = useUserStore()
  const [isLoading, setIsLoading] = useState(false)
  // const [isReloading, setIsReloading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [formModified, setFormModified] = useState(false)
  const initialFormValues = useRef<FormValues>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    phoneNumberVerified: false,
    gender: '',
    birthDate: '',
  })
  // Add a flag to track initial form setup
  const formInitialized = useRef(false)
  const { data } = authClient.useSession()
  const userId = data?.user.id
  const { handleResponse } = useApiResponse()
  const { firstName, lastName } = splitFullName(data?.user.name || '')

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset, getValues } = useForm<FormValues>({
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
    if (user && data) {
      const { firstName, lastName } = splitFullName(data.user.name || '')

      const defaultValues: FormValues = {
        firstName: firstName || '',
        lastName: lastName || '',
        email: data.user.email || '',
        phoneNumber: phoneNumber || '',
        phoneNumberVerified: user.phoneNumberVerified || false,
        gender: user.gender || '',
        birthDate: birthDate ? new Date(birthDate).toISOString().split('T')[0] : '',
      }

      reset(defaultValues)
      // Store initial values for comparison
      initialFormValues.current = defaultValues

      // Set form as initialized after the first data load
      // Use a short timeout to ensure values are properly set
      setTimeout(() => {
        formInitialized.current = true
      }, 100)
    }
  }, [user, reset, data, birthDate, phoneNumber]);

  // Check for form modifications
  useEffect(() => {
    const subscription = watch(() => {
      // Only check for changes if the form has been initialized
      if (!formInitialized.current) return;

      // Compare current form values with initial values
      const currentValues = getValues()
      const initialValues = initialFormValues.current

      // Check if any field has changed by comparing individual fields
      const hasChanges = Object.keys(currentValues).some(key => {
        const formKey = key as keyof FormValues;
        return currentValues[formKey] !== initialValues[formKey];
      });

      setFormModified(hasChanges)
    })

    return () => subscription.unsubscribe()
  }, [watch, getValues])

  const phoneNumberValue = watch('phoneNumber')
  const phoneNumberVerified = watch('phoneNumberVerified')
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>('AR')

  const handlePhoneNumberVerified = (phoneNumber: string, isVerified: boolean) => {
    setValue('phoneNumber', phoneNumber, { shouldValidate: true })
    setValue('phoneNumberVerified', isVerified, { shouldValidate: true })
  }

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!user || !userId) return;
  
    const userService = new UserRegistrationService();
    setIsLoading(true);
  
    try {
      // 1. Call your service to update the profile
      const result = await userService.updateUserProfile(userId, {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        phoneNumberVerified: data.phoneNumberVerified,
        gender: data.gender,
        birthDate: data.birthDate,
        termsAccepted: true,
      });
  
      if (result.success) {
        // 2. Update local app state
        setUser(result.data!);
        
        // 3. Get fresh session data
        const { data: freshSessionData } = await authClient.getSession({
          query: { disableCookieCache: true }
        });
        
        // 4. Use the fresh session data to update form values
        if (freshSessionData) {
          const { firstName, lastName } = splitFullName(freshSessionData.user.name);
          
          // Create new initial form values with updated data
          const updatedValues = {
            ...getValues(),
            firstName,
            lastName,
            email: freshSessionData.user.email,
          };
          
          // Update the form with new values
          reset(updatedValues);
          
          // Update initial values reference
          initialFormValues.current = updatedValues;
          
          // Reset form modification state
          setFormModified(false);
        }
  
        toast.success("Perfil actualizado", {
          description: result.message || "Tus datos han sido actualizados correctamente"
        });
        
        // No need for page reload!
      } else {
        throw new Error(result.error?.message || "Error desconocido");
      }
    } catch (error) {
      toast.error("Error", {
        description: error instanceof Error ? error.message : "No se pudieron actualizar tus datos."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return

    await handleProfileImageUpload({
      event,
      userId: data!.user.id,
      user,
      setIsUploadingImage,
      setUser,
      handleResponse
    })
  }

  if (!user) return null

  // if (isReloading) {
  //   return (
  //     <div className="flex justify-center items-center p-8">
  //       <Loader2Icon className="animate-spin h-8 w-8 text-primary" />
  //       <span className="ml-2">Actualizando información...</span>
  //     </div>
  //   );
  // }

  return (
    <Card>
      {/* Card content remains the same */}
      <CardHeader className="flex items-center pb-2">
        <div className="relative">
          <ExpandableAvatar imageUrl={user.profileImageKey ?? undefined} firstName={firstName} lastName={lastName} />
          <ProfileImageUploadButton onUpload={handleImageChange} isUploading={isUploadingImage} />
        </div>
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
          {/* Form fields remain the same */}
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
              onClick={() => {
                reset(initialFormValues.current)
                setFormModified(false)
                toast.info('Cambios cancelados')
              }}
              disabled={isLoading || !formModified}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formModified}
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