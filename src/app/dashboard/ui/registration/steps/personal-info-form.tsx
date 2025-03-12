'use client'

import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { ArrowRight } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useUserStore } from '@/store/user-store'
import { userSchema } from '@/schemas'
import { PhoneVerification } from '@/components/phone-verification/PhoneVerification'
import { toast } from 'sonner'
import { formatNumberForWhatsApp } from '@/utils/format/format-whatsapp-phone'
import { CountryCode } from 'libphonenumber-js'

interface PersonalInfoFormProps {
  data?: {
    personalInfo?: any;
  };
  onNext: (data: any) => void;
}

export default function PersonalInfoForm({ data, onNext }: PersonalInfoFormProps) {
  const { user: storeUser } = useUserStore()

  const { control, register, handleSubmit, formState: { errors, isValid }, reset, setValue, watch } = useForm({
    resolver: zodResolver(userSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: storeUser?.firstName || data?.personalInfo?.firstName || '',
      lastName: storeUser?.lastName || data?.personalInfo?.lastName || '',
      email: storeUser?.email || data?.personalInfo?.email || '',
      phoneNumber: storeUser?.phoneNumber || data?.personalInfo?.phoneNumber || '',
      phoneNumberVerified: storeUser?.phoneNumberVerified || data?.personalInfo?.phoneNumberVerified || false,
      birthDate: storeUser?.birthDate
        ? new Date(storeUser.birthDate).toISOString().split('T')[0]
        : data?.personalInfo?.birthDate
          ? new Date(data.personalInfo.birthDate).toISOString().split('T')[0]
          : '',
      gender: storeUser?.gender || data?.personalInfo?.gender || '',
      termsAccepted: Boolean(storeUser?.termsAccepted) || Boolean(data?.personalInfo?.termsAccepted) || false,
    }
  })

  const phoneNumberValue = watch('phoneNumber')
  const phoneNumberVerified = watch('phoneNumberVerified')
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>('AR')

  // Esta función permite que el componente PhoneNumberVerification actualice el estado del formulario
  const handlePhoneNumberVerified = (phoneNumber: string, isVerified: boolean) => {
    setValue('phoneNumber', phoneNumber, { shouldValidate: true })
    setValue('phoneNumberVerified', isVerified, { shouldValidate: true })
  }

  useEffect(() => {
    if (storeUser || data?.personalInfo) {
      const initialData = {
        firstName: storeUser?.firstName || data?.personalInfo?.firstName || '',
        lastName: storeUser?.lastName || data?.personalInfo?.lastName || '',
        email: storeUser?.email || data?.personalInfo?.email || '',
        phoneNumber: storeUser?.phoneNumber || data?.personalInfo?.phoneNumber || '',
        phoneNumberVerified: storeUser?.phoneNumberVerified || data?.personalInfo?.phoneNumberVerified || false,
        birthDate: storeUser?.birthDate
          ? new Date(storeUser.birthDate).toISOString().split('T')[0]
          : data?.personalInfo?.birthDate
            ? new Date(data.personalInfo.birthDate).toISOString().split('T')[0]
            : '',
        gender: storeUser?.gender || data?.personalInfo?.gender || '',
        termsAccepted: Boolean(storeUser?.termsAccepted) || Boolean(data?.personalInfo?.termsAccepted) || false,
      }
      reset(initialData)
    }
  }, [storeUser, data?.personalInfo, reset])

  const onSubmit = async (formData: any) => {
    let dataToSubmit = null;

    //todo ver de mostrar info al usuario de porque deberia verificar el numero
    if (storeUser?.phoneNumber === null && storeUser?.phoneNumberVerified === false) {
      // Formatear el número de teléfono
      const formattedPhone = formatNumberForWhatsApp(formData.phoneNumber);

      if (!formattedPhone) {
        // Mostrar error si el formato es inválido
        toast.error("El formato del número de teléfono es inválido");
        return;
      }

      // Actualizar el número con el formato correcto
      dataToSubmit = {
        ...formData,
        phoneNumber: formattedPhone
      };
    }

    // Continuar con el envío
    onNext(dataToSubmit ? dataToSubmit : formData);
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-10rem)]">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="firstName">Nombre</Label>
          <Input id="firstName" {...register('firstName')} />
          {errors.firstName && (
            <p className="text-sm text-destructive mt-1">{errors.firstName.message as string}</p>
          )}
        </div>
        <div>
          <Label htmlFor="lastName">Apellido</Label>
          <Input id="lastName" {...register('lastName')} />
          {errors.lastName && (
            <p className="text-sm text-destructive mt-1">{errors.lastName.message as string}</p>
          )}
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register('email')} disabled={true} />
          {errors.email && (
            <p className="text-sm text-destructive mt-1">{errors.email.message as string}</p>
          )}
        </div>

        {/* Reemplazamos el campo de teléfono con nuestro componente de verificación */}
        <div>
          <PhoneVerification
            initialPhone={phoneNumberValue}
            initialVerified={phoneNumberVerified}
            onVerificationChange={handlePhoneNumberVerified}
            selectedCountry={selectedCountry}
            setSelectedCountry={setSelectedCountry}
            // Podemos pasar un prop para ajustar el comportamiento según el contexto
            required={true}
          />
          {errors.phoneNumber && (
            <p className="text-sm text-destructive mt-1">{errors.phoneNumber.message as string}</p>
          )}
        </div>

        <div>
          <Label htmlFor="birthDate">Fecha de nacimiento</Label>
          <Input id="birthDate" type="date" {...register('birthDate')} />
          {errors.birthDate && (
            <p className="text-sm text-destructive mt-1">{errors.birthDate.message as string}</p>
          )}
        </div>
        <div>
          <Label htmlFor="gender">Género</Label>
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona un género" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MASCULINO">Masculino</SelectItem>
                  <SelectItem value="FEMENINO">Femenino</SelectItem>
                  <SelectItem value="NO_BINARIO">No binario</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.gender && (
            <p className="text-sm text-destructive mt-1">{errors.gender.message as string}</p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Controller
            name="termsAccepted"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="termsAccepted"
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={Boolean(storeUser?.termsAccepted)}
              />
            )}
          />
          <Label htmlFor="termsAccepted" className="text-sm">
            {storeUser?.termsAccepted && storeUser.termsAccepted
              ? "Términos y condiciones aceptados"
              : "Acepto los términos y condiciones"}
          </Label>
        </div>
        {errors.termsAccepted && (
          <p className="text-sm text-destructive">{errors.termsAccepted.message as string}</p>
        )}
        <div className="flex-grow" />
        <footer className="sticky bottom-0 left-0 right-0 p-4 bg-background border-t">
          <Button type="submit" className="w-full" disabled={!isValid}>
            Continuar
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </footer>
      </form>
    </div>
  )
}