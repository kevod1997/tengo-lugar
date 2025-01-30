'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ArrowRight } from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { CarRegistrationInput, carRegistrationSchema } from '@/schemas/validation/car-schema'
import { getBrands, getGroups, getModelDetails, getModels } from '@/actions/car/car-info'
import { Brand, DetailedModel, Group, Model } from '@/types/car-types'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Car } from 'lucide-react'

interface CarFormProps {
    onSubmit: (data: CarRegistrationInput) => Promise<void>
    data: {
        role: 'traveler' | 'driver'
        personalInfo: any
        identityCard: any
        driverLicense: any
        carInfo?: CarRegistrationInput
    }
}

export default function CarForm({ onSubmit, data }: CarFormProps) {
    // Estados para las diferentes opciones de selección
    const [brands, setBrands] = useState<Brand[]>([])
    const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null)

    const [groups, setGroups] = useState<Group[]>([])
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)

    const [models, setModels] = useState<Model[]>([])
    const [selectedModel, setSelectedModel] = useState<Model | null>(null)

    const [modelDetails, setModelDetails] = useState<DetailedModel | null>(null)
    const [loading, setLoading] = useState(false)

    const { register, handleSubmit, setValue, watch, formState: { errors, isValid } } = useForm<CarRegistrationInput>({
        resolver: zodResolver(carRegistrationSchema),
        defaultValues: data.carInfo || {
            brand: { name: '' },
            model: { name: '', year: new Date().getFullYear(), averageFuelConsume: undefined, fuelType: undefined },
            car: { plate: '' }
        }
    })

    // Cargar marcas al iniciar
    useEffect(() => {
        const loadBrands = async () => {
            const response = await getBrands()
            if (response.success) {
                setBrands(response.data!)
            }
        }
        loadBrands()
    }, [])

    // Cargar grupos cuando se selecciona una marca
    const handleBrandSelect = async (brandName: string) => {
        const brand = brands.find(b => b.name === brandName)
        if (brand) {
            setSelectedBrand(brand)
            setValue('brand.name', brand.name)

            // Resetear selecciones posteriores
            setSelectedGroup(null)
            setSelectedModel(null)
            setModelDetails(null)
            setValue('model.name', '')
            setValue('model.year', new Date().getFullYear())

            const response = await getGroups(brand.id)
            if (response.success) {
                setGroups(response.data!)
            }
        }
    }

    // Cargar modelos cuando se selecciona un grupo
    const handleGroupSelect = async (groupName: string) => {
        if (!selectedBrand) return

        const group = groups.find(g => g.name === groupName)
        if (group) {
            setSelectedGroup(group)

            // Resetear selecciones posteriores
            setSelectedModel(null)
            setModelDetails(null)
            setValue('model.year', new Date().getFullYear())

            const response = await getModels(selectedBrand.id, group.id)
            if (response.success) {
                setModels(response.data!)
            }
        }
    }

    // Cargar detalles cuando se selecciona un modelo específico
    const handleModelSelect = async (modelId: string) => {
        const model = models.find(m => m.id === parseInt(modelId))
        if (model) {
            setSelectedModel(model)
            setValue('model.name', model.name)

            const response = await getModelDetails(model.id)
            if (response.success) {
                setModelDetails(response.data!)
            }
        }
    }

    useEffect(() => {
        if (modelDetails) {
            setValue('model.fuelType', modelDetails.fuelType)
            setValue('model.averageFuelConsume', modelDetails.fuelConsume)
        }
    }, [modelDetails, setValue])

    // Manejar la selección del año
    const handleYearSelect = (year: string) => {
        setValue('model.year', parseInt(year))
    }

    const handleFormSubmit = async (formData: CarRegistrationInput) => {
        try {
            console.log('Submitting form:', formData)
            await onSubmit(formData)

        } catch (error) {
            console.error('Error submitting form:', error)
        }
    }

    return (
        <div className="flex flex-col min-h-[calc(100vh-10rem)]">
            <Alert className="mb-6">
                <Car className="h-4 w-4" />
                <AlertTitle>Registro de Vehículo</AlertTitle>
                <AlertDescription>
                    Para poder ofrecer viajes, necesitamos registrar la información de tu vehículo.
                </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                <div className="space-y-4">
                    {/* Selección de Marca */}
                    <div>
                        <Label htmlFor="brand">Marca</Label>
                        <Select
                            onValueChange={handleBrandSelect}
                            value={selectedBrand?.name}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona una marca" />
                            </SelectTrigger>
                            <SelectContent>
                                {brands.map((brand) => (
                                    <SelectItem key={brand.id} value={brand.name}>
                                        {brand.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.brand?.name && (
                            <p className="text-sm text-destructive mt-1">{errors.brand.name.message}</p>
                        )}
                    </div>

                    {/* Selección de Grupo/Línea */}
                    {selectedBrand && (
                        <div>
                            <Label htmlFor="group">Línea</Label>
                            <Select
                                onValueChange={handleGroupSelect}
                                value={selectedGroup?.name}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona una línea" />
                                </SelectTrigger>
                                <SelectContent>
                                    {groups.map((group) => (
                                        <SelectItem key={group.id} value={group.name}>
                                            {group.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Selección de Modelo Específico */}
                    {selectedGroup && (
                        <div>
                            <Label htmlFor="model">Modelo</Label>
                            <Select
                                onValueChange={handleModelSelect}
                                value={selectedModel?.id.toString()}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona un modelo específico" />
                                </SelectTrigger>
                                <SelectContent>
                                    {models.map((model) => (
                                        <SelectItem key={model.id} value={model.id.toString()}>
                                            {model.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.model?.name && (
                                <p className="text-sm text-destructive mt-1">{errors.model.name.message}</p>
                            )}
                        </div>
                    )}

                    {/* Selección de Año */}
                    {modelDetails && (
                        <div>
                            <Label htmlFor="year">Año</Label>
                            <Select
                                onValueChange={handleYearSelect}
                                value={watch('model.year').toString()}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona el año" />
                                </SelectTrigger>
                                <SelectContent>
                                    {modelDetails.years.map((year) => (
                                        <SelectItem key={year.id} value={year.year.toString()}>
                                            {year.year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.model?.year && (
                                <p className="text-sm text-destructive mt-1">{errors.model.year.message}</p>
                            )}
                        </div>
                    )}

                    {/* Ingreso de Patente */}
                    {selectedModel && modelDetails && (
                        <div>
                            <Label htmlFor="plate">Patente</Label>
                            <Input
                                id="plate"
                                {...register('car.plate')}
                                placeholder="Ingresa la patente"
                                className="uppercase"
                            />
                            {errors.car?.plate && (
                                <p className="text-sm text-destructive mt-1">{errors.car.plate.message}</p>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex-grow" />

                <footer className="sticky bottom-0 left-0 right-0 p-4 bg-background border-t">
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={!isValid || loading || !selectedModel || !modelDetails}
                    >
                        {loading ? 'Registrando...' : 'Registrar Vehículo'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </footer>
            </form>
        </div>
    )
}