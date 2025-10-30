'use client'

import { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import { useForm, SubmitHandler } from 'react-hook-form'
import { PhoneVerification } from '@/components/phone-verification/PhoneVerification'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangleIcon, CalendarIcon, Loader2Icon } from "lucide-react"
import { authClient } from '@/lib/auth-client'
import { splitFullName } from '@/utils/format/user-formatter'
import { CountryCode } from 'libphonenumber-js'

interface ProfileFormProps {
  isIdentityVerified: boolean
  birthDate: Date | null | undefined
  phoneNumber: string | null | undefined
  phoneNumberVerified: boolean | null | undefined
  gender?: string | null
  onSubmit?: (formData: any) => Promise<void>
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

export default function ProfileForm({ 
  isIdentityVerified,
  birthDate,
  phoneNumber,
  phoneNumberVerified,
  gender: initialGender = null,
  onSubmit 
}: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false)
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

  // Update form when data changes
  useEffect(() => {
    if (data) {
      const { firstName, lastName } = splitFullName(data.user.name || '')

      const defaultValues: FormValues = {
        firstName: firstName || '',
        lastName: lastName || '',
        email: data.user.email || '',
        phoneNumber: phoneNumber || '',
        phoneNumberVerified: phoneNumberVerified ?? false,
        gender: initialGender || '',
        birthDate: birthDate ? new Date(birthDate).toISOString().split('T')[0] : '',
      }

      reset(defaultValues)
      // Store initial values for comparison
      initialFormValues.current = defaultValues

      // Set form as initialized after the first data load
      setTimeout(() => {
        formInitialized.current = true
      }, 100)
    }
  }, [reset, data, birthDate, phoneNumber, phoneNumberVerified, initialGender]);

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
  const formPhoneVerified = watch('phoneNumberVerified')
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>('AR')

  const handlePhoneNumberVerified = (phoneNumber: string, isVerified: boolean) => {
    setValue('phoneNumber', phoneNumber, { shouldValidate: true })
    setValue('phoneNumberVerified', isVerified, { shouldValidate: true })
  }

  const handleFormSubmit: SubmitHandler<FormValues> = async (formData) => {
    if (!userId) return;

    setIsLoading(true);

    try {
      // If we have an onSubmit prop provided by the parent component
      if (onSubmit) {
        await onSubmit(formData);

        // Update initial form values to new values after successful submission
        initialFormValues.current = { ...formData };
        setFormModified(false);

        toast.success("Perfil actualizado", {
          description: "Tus datos han sido actualizados correctamente"
        });
      } else {
        // Fallback if no onSubmit is provided
        toast.error("Error de configuración", {
          description: "No se pudo actualizar el perfil debido a un problema de configuración."
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: error instanceof Error ? error.message : "No se pudieron actualizar tus datos."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className='pt-6'>
        {isIdentityVerified && (
          <Alert className="mb-6 bg-muted">
            <AlertTriangleIcon className="h-4 w-4" />
            <AlertTitle>Identidad verificada</AlertTitle>
            <AlertDescription>
              No puedes modificar tu nombre, apellido y fecha de nacimiento ya que tu identidad ha sido verificada.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
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
              initialVerified={formPhoneVerified}
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
                defaultValue={initialGender || ''}
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