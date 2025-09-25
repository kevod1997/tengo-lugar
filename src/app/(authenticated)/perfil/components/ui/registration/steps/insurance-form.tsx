'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ArrowRight, AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { InsuranceInput, insuranceSchema } from '@/schemas/validation/insurance-schema'
import { DocumentUpload } from '@/components/document-upload/DocumentUpload'
import Loading from '@/app/loading'
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE } from '@/config/constants'
import { useInsuranceStore } from '@/hooks/registration/useInsuranceCompanies'
import { useUserStore } from '@/store/user-store'

interface InsuranceFormProps {
    onSubmit: (data: InsuranceInput) => Promise<void>
    data: {
        role: 'traveler' | 'driver'
        personalInfo: any
        identityCard: any
        driverLicense: any
        carInfo: any
        insuranceInfo?: InsuranceInput
    }
}

export default function InsuranceForm({ onSubmit, data }: InsuranceFormProps) {
    // 1. Primero declaramos TODOS los hooks
    const [policyFile, setPolicyFile] = useState<File | null>(null)
    // const [policyPreview, setPolicyPreview] = useState<string | null>(null)
    const { companies, isLoading, error, fetch } = useInsuranceStore()
    const { user } = useUserStore()

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isValid }
    } = useForm<InsuranceInput>({
        resolver: zodResolver(insuranceSchema),
        defaultValues: {
            ...data.insuranceInfo,
            carPlate: data.insuranceInfo?.carPlate ?? user?.cars[0]?.plate, // Default to first car if no carPlate provided
            policyFile: undefined,
        },
        mode: 'onChange'
    })

    // 2. Efectos después de los hooks de estado
    useEffect(() => {
        fetch()
    }, [fetch])

    // 3. Variables derivadas del watch
    const watchInsuranceId = watch('insuranceId')
    const watchPolicyNumber = watch('policyNumber')
    const watchStartDate = watch('startDate')
    const watchExpireDate = watch('expireDate')
    const watchCarPlate = watch('carPlate')
    const hasMoreThanOneCar = (user?.cars?.length ?? 0) > 1

    // 4. Funciones del componente
    const isFormValid = () => {
        return isValid && policyFile && watchInsuranceId && watchPolicyNumber &&
            watchStartDate && watchExpireDate
    }

    const handleFormSubmit = async (formData: InsuranceInput) => {

        await onSubmit(formData)
    }

    // 5. Renderizado condicional DESPUÉS de todos los hooks
    if (isLoading) {
        return <Loading />
    }

    if (error) {
        return <div>Hubo un error, intenta nuevamente</div>
    }

    return (
        <div className="flex flex-col min-h-[calc(100vh-10rem)]">
            <Alert className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Verificación del seguro</AlertTitle>
                <AlertDescription>
                    Para garantizar la seguridad de todos los usuarios, necesitamos verificar
                    el seguro de tu vehículo. Por favor, completa la información solicitada.
                </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
                <div className="space-y-4">

                    {hasMoreThanOneCar && (
                        <div className="space-y-2">
                            <Label htmlFor="carPlate">Vehículo</Label>
                            <Select
                                onValueChange={(value) => setValue('carPlate', value, { shouldValidate: true })}
                                defaultValue={watchCarPlate}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona el vehículo" />
                                </SelectTrigger>
                                <SelectContent>
                                    {user?.cars.map(car => (
                                        <SelectItem key={car.plate} value={car.plate}>
                                            {car.brand} {car.model} - {car.plate}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.carPlate && (
                                <p className="text-sm text-destructive">{errors.carPlate.message}</p>
                            )}
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="insuranceId">Compañía de Seguros</Label>
                        <Select
                            onValueChange={(value) => setValue('insuranceId', value, { shouldValidate: true })}
                            defaultValue={data.insuranceInfo?.insuranceId}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona la compañía de seguros" />
                            </SelectTrigger>
                            <SelectContent>
                                {companies.map((company) => (
                                    <SelectItem key={company.id} value={company.id}>
                                        {company.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.insuranceId && (
                            <p className="text-sm text-destructive">{errors.insuranceId.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="policyNumber">Número de Póliza</Label>
                        <Input
                            id="policyNumber"
                            {...register('policyNumber')}
                            placeholder="Ingresa el número de póliza"
                        />
                        {errors.policyNumber && (
                            <p className="text-sm text-destructive">{errors.policyNumber.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Inicio de Cobertura</Label>
                            <Input
                                id="startDate"
                                type="date"
                                {...register('startDate')}
                            />
                            {errors.startDate && (
                                <p className="text-sm text-destructive">{errors.startDate.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="expireDate">Fin de Cobertura</Label>
                            <Input
                                id="expireDate"
                                type="date"
                                {...register('expireDate')}
                            />
                            {errors.expireDate && (
                                <p className="text-sm text-destructive">{errors.expireDate.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Póliza de Seguro</Label>
                        <DocumentUpload
                            id="policy-file"
                            onCapture={(file, preview) => {
                                setPolicyFile(file)
                                // setPolicyPreview(preview)
                                setValue('policyFile', { file, source: 'upload', preview }, { shouldValidate: true })
                            }}
                            title={`Subir póliza de seguro (PDF o imagen en formato jpeg, jpg o png)`}
                            accept={ACCEPTED_FILE_TYPES.join(',')}
                            maxSize={MAX_FILE_SIZE}
                        />
                        {errors.policyFile && (
                            <p className="text-sm text-destructive">{errors.policyFile.message}</p>
                        )}
                    </div>
                </div>

                <footer className="sticky bottom-0 left-0 right-0 p-4 bg-background border-t">
                    <Button type="submit" className="w-full" disabled={!isFormValid()}>
                        Verificar Seguro
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </footer>
            </form>
        </div>
    )
}