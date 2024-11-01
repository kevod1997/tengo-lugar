'use client'

import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { userSchema } from '@/lib/validations/user-validation'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { useUser } from "@clerk/nextjs"

interface PersonalInfoFormProps {
  data: {
    personalInfo: any;
  };
  onNext: (data: any) => void;
}

export default function PersonalInfoForm({ data, onNext }: PersonalInfoFormProps) {
  const { user } = useUser()
  const { control, register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(userSchema),
    mode: 'onChange',
    defaultValues: data.personalInfo || {}
  })

  useEffect(() => {
    const clerkData = {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.primaryEmailAddress?.emailAddress || '',
    }

    const initialData = {
      ...clerkData,
      ...data.personalInfo,
    }

    reset(initialData)
  }, [user, data.personalInfo, reset])

  const onSubmit = async (formData: any) => {
    onNext(formData)
  }

  return (
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
        <Input id="email" type="email" {...register('email')} />
        {errors.email && (
          <p className="text-sm text-destructive mt-1">{errors.email.message as string}</p>
        )}
      </div>
      <div>
        <Label htmlFor="phone">Teléfono</Label>
        <Input id="phone" {...register('phone')} />
        {errors.phone && (
          <p className="text-sm text-destructive mt-1">{errors.phone.message as string}</p>
        )}
      </div>
      <div>
        <Label htmlFor="birthDate">Fecha de nacimiento</Label>
        <Input id="birthDate" type="date" {...register('birthDate')} />
        {errors.birthDate && (
          <p className="text-sm text-destructive mt-1">{errors.birthDate.message as string}</p>
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
            />
          )}
        />
        <Label htmlFor="termsAccepted">Acepto los términos y condiciones</Label>
      </div>
      {errors.termsAccepted && (
        <p className="text-sm text-destructive">{errors.termsAccepted.message as string}</p>
      )}
      <Button type="submit" className="w-full">
        Continuar
      </Button>
    </form>
  )
}