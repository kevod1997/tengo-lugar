'use client'

import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { useUser } from "@clerk/nextjs"
import { ArrowRight } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useUserStore } from '@/store/user-store'
import { userSchema } from '@/schemas'

interface PersonalInfoFormProps {
  data?: {
    personalInfo?: any;
  };
  onNext: (data: any) => void;
}

export default function PersonalInfoForm({ data, onNext }: PersonalInfoFormProps) {
  const { user: clerkUser } = useUser()
  const { user: storeUser } = useUserStore()

  const { control, register, handleSubmit, formState: { errors, isValid }, reset } = useForm({
    resolver: zodResolver(userSchema),
    mode: 'onChange',
    defaultValues: {
      // Priority: Store Data > Received Data > Clerk Data
      firstName: storeUser?.firstName || data?.personalInfo?.firstName || clerkUser?.firstName || '',
      lastName: storeUser?.lastName || data?.personalInfo?.lastName || clerkUser?.lastName || '',
      email: storeUser?.email || data?.personalInfo?.email || clerkUser?.primaryEmailAddress?.emailAddress || '',
      phone: storeUser?.phone || data?.personalInfo?.phone || '',
      birthDate: storeUser?.birthDate
        ? new Date(storeUser.birthDate).toISOString().split('T')[0]
        : data?.personalInfo?.birthDate
          ? new Date(data.personalInfo.birthDate).toISOString().split('T')[0]
          : '',
      gender: storeUser?.gender || data?.personalInfo?.gender || '',
      termsAccepted: Boolean(storeUser?.termsAccepted) || Boolean(data?.personalInfo?.termsAccepted) || false,
    }
  })

  useEffect(() => {
    if (storeUser || data?.personalInfo) {
      const initialData = {
        firstName: storeUser?.firstName || data?.personalInfo?.firstName || clerkUser?.firstName || '',
        lastName: storeUser?.lastName || data?.personalInfo?.lastName || clerkUser?.lastName || '',
        email: storeUser?.email || data?.personalInfo?.email || clerkUser?.primaryEmailAddress?.emailAddress || '',
        phone: storeUser?.phone || data?.personalInfo?.phone || '',
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
  }, [storeUser, data?.personalInfo, clerkUser, reset])

  const onSubmit = async (formData: any) => {
    onNext(formData)
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