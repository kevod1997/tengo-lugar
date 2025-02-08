'use client'

import { useForm } from 'react-hook-form'
import { useUserStore } from "@/store/user-store"
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ArrowRight, AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DocumentUpload } from '@/components/document-upload/DocumentUpload'
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE } from '@/config/constants'
import { CardType } from '@prisma/client'
import { VehicleCardInput, vehicleCardSchema } from '@/schemas/validation/car-card-schema'

interface CarCardFormProps {
    onSubmit: (data: VehicleCardInput) => Promise<void>
    data?: VehicleCardInput
}

export default function CarCardForm({ onSubmit, data }: CarCardFormProps) {
    console.log('CarCardForm', data)

    const { user } = useUserStore()

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isValid }
    } = useForm<VehicleCardInput>({
        resolver: zodResolver(vehicleCardSchema),
        defaultValues: {
            ...data,
            carId: data?.carId || user?.cars[0]?.id, // Default to first car if no carId provided
            cardFile: undefined,
        },
        mode: 'onChange'
    })

    const watchCarId = watch('carId')
    const watchCardType = watch('cardType')
    const watchExpirationDate = watch('expirationDate')
    const watchCardFile = watch('cardFile')

    const isFormValid = () => {
        return isValid && watchCardType && watchExpirationDate && watchCardFile
    }

    const selectedCar = user?.cars.find(car => car.id === watchCarId)

    const isCardTypeAvailable = (type: CardType) => {
        if (!selectedCar) return true
        if (type === 'GREEN' && selectedCar.hasGreenCard) return false
        if (type === 'BLUE' && selectedCar.hasBlueCard) return false
        return true
    }

    const handleFormSubmit = async (formData: VehicleCardInput) => {
        await onSubmit(formData)
    }

    return (
        <div className="flex flex-col min-h-[calc(100vh-10rem)]">
            <Alert className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Verificación de Tarjeta Vehicular</AlertTitle>
                <AlertDescription>
                    Para garantizar la seguridad y legalidad del vehículo, necesitamos verificar
                    la tarjeta vehicular. Por favor, completa la información solicitada.
                </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
                <div className="space-y-4">

                    {user && (
                        <div className="space-y-2">
                            <Label htmlFor="carId">Vehículo</Label>
                            <Select
                                onValueChange={(value) => setValue('carId', value, { shouldValidate: true })}
                                defaultValue={watchCarId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona el vehículo" />
                                </SelectTrigger>
                                <SelectContent>
                                    {user?.cars.map(car => (
                                        <SelectItem key={car.id} value={car.id}>
                                            {car.brand} {car.model} - {car.plate}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.carId && (
                                <p className="text-sm text-destructive">{errors.carId.message}</p>
                            )}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="cardType">Tipo de Tarjeta</Label>
                        <Select
                            onValueChange={(value) => setValue('cardType', value as CardType, { shouldValidate: true })}
                            defaultValue={data?.cardType}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona el tipo de tarjeta" />
                            </SelectTrigger>
                            <SelectContent>
                                {isCardTypeAvailable('GREEN') && (
                                    <SelectItem value="GREEN">Tarjeta Verde</SelectItem>
                                )}
                                {isCardTypeAvailable('BLUE') && (
                                    <SelectItem value="BLUE">Tarjeta Azul</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                        {errors.cardType && (
                            <p className="text-sm text-destructive">{errors.cardType.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="expirationDate">Fecha de Vencimiento</Label>
                        <Input
                            id="expirationDate"
                            type="date"
                            {...register('expirationDate')}
                        />
                        {errors.expirationDate && (
                            <p className="text-sm text-destructive">{errors.expirationDate.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Tarjeta Vehicular</Label>
                        <DocumentUpload
                            id="card-file"
                            onCapture={(file, preview) => {
                                setValue('cardFile', { file, source: 'upload', preview }, { shouldValidate: true })
                            }}
                            title="Subir tarjeta vehicular (PDF o imagen en formato jpeg, jpg o png)"
                            accept={ACCEPTED_FILE_TYPES.join(',')}
                            maxSize={MAX_FILE_SIZE}
                        />
                        {errors.cardFile && (
                            <p className="text-sm text-destructive">{errors.cardFile.message}</p>
                        )}
                    </div>
                </div>

                <footer className="sticky bottom-0 left-0 right-0 p-4 bg-background border-t">
                    <Button type="submit" className="w-full" disabled={!isFormValid()}>
                        Verificar Tarjeta
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </footer>
            </form>
        </div>
    )
}