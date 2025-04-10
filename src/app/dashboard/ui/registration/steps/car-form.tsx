// 'use client'

// import { useEffect, useState } from 'react'
// import { useForm } from 'react-hook-form'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { useMutation, useQuery } from '@tanstack/react-query'
// import { toast } from 'sonner'
// import { ArrowRight, Car, Loader2 } from 'lucide-react'
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Button } from "@/components/ui/button"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
// import { Skeleton } from '@/components/ui/skeleton'
// import { CarRegistrationInput, carRegistrationSchema } from '@/schemas/validation/car-schema'
// import { Brand, Group, Model } from '@/types/car-types'
// import { getBrands, getGroups, getModelDetails, getModels } from '@/actions/car-api/car-api-actions'
// import { useDebounce } from '@/hooks/registration/useDebounce'
// import { checkPlateExists } from '@/actions/car/check-car-plate'
// import { getYearRange } from '@/utils/helpers/get-year-range'

// interface CarFormProps {
//     onSubmit: (data: CarRegistrationInput) => Promise<void>
//     data: {
//         role: 'traveler' | 'driver'
//         personalInfo: any
//         identityCard: any
//         driverLicense: any
//         carInfo?: CarRegistrationInput
//     }
// }

// export default function CarForm({ onSubmit, data }: CarFormProps) {
//     // Estados locales
//     const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null)
//     const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
//     const [selectedModel, setSelectedModel] = useState<Model | null>(null)
//     const [loading, setLoading] = useState(false)

//     // React Hook Form
//     const { register, handleSubmit, setValue, watch, formState: { errors, isValid } } = useForm<CarRegistrationInput>({
//         resolver: zodResolver(carRegistrationSchema),
//         mode: "onChange",
//         defaultValues: data.carInfo || {
//             brand: { name: '' },
//             model: { name: '', year: new Date().getFullYear(), averageFuelConsume: undefined, fuelType: undefined },
//             car: { plate: '' }
//         }
//     })

//     // Queries
//     const {
//         data: brandsData,
//         isLoading: isLoadingBrands,
//         error: brandsError
//     } = useQuery({
//         queryKey: ['brands'],
//         queryFn: getBrands,
//         select: (response) => response.success ? response.data : [],
//         staleTime: Infinity
//     })

//     const {
//         data: groupsData,
//         isLoading: isLoadingGroups,
//         error: groupsError
//     } = useQuery({
//         queryKey: ['groups', selectedBrand?.id],
//         queryFn: async () => {
//             if (!selectedBrand) return null;
//             const response = await getGroups(selectedBrand.id);
//             return response;
//         },
//         select: (response) => {
//             return response?.success ? response.data : [];
//         },
//         enabled: !!selectedBrand
//     });

//     const {
//         data: modelsData,
//         isLoading: isLoadingModels,
//         error: modelsError
//     } = useQuery({
//         queryKey: ['models', selectedBrand?.id, selectedGroup?.id],
//         queryFn: () => selectedBrand && selectedGroup ? getModels(selectedBrand.id, selectedGroup.id) : null,
//         select: (response) => response?.success ? response.data : [],
//         enabled: !!(selectedBrand && selectedGroup)
//     })

//     const {
//         data: modelDetailsData,
//         isLoading: isLoadingDetails,
//         error: modelDetailsError
//     } = useQuery({
//         queryKey: ['modelDetails', selectedModel?.id],
//         queryFn: () => selectedModel ? getModelDetails(selectedModel.id) : null,
//         select: (response) => response?.success ? response.data : null,
//         enabled: !!selectedModel
//     })

//     // Manejo centralizado de errores
//     useEffect(() => {
//         if (brandsError) {
//             toast.error('Error al cargar las marcas')
//         }
//         if (groupsError) {
//             toast.error('Error al cargar las líneas')
//         }
//         if (modelsError) {
//             toast.error('Error al cargar los modelos')
//         }
//         if (modelDetailsError) {
//             toast.error('Error al cargar los detalles del modelo')
//         }
//     }, [brandsError, groupsError, modelsError, modelDetailsError])

//     const handleBrandSelect = (brandName: string) => {
//         const brand = brandsData?.find(b => b.name === brandName);
//         if (brand) {
//             setSelectedBrand(brand);
//             setValue('brand.name', brand.name);
//             // Reset other selections
//             setSelectedGroup(null);
//             setSelectedModel(null);
//             setValue('model.name', '');
//             setValue('model.year', new Date().getFullYear());
//         }
//     }

//     const handleGroupSelect = (groupName: string) => {
//         const group = groupsData?.find(g => g.name === groupName)
//         if (group) {
//             setSelectedGroup(group)
//             setSelectedModel(null)
//             setValue('model.year', new Date().getFullYear())
//         }
//     }

//     const handleModelSelect = (modelId: string) => {
//         const model = modelsData?.find(m => m.id === parseInt(modelId))
//         if (model) {
//             setSelectedModel(model)
//             setValue('model.name', model.name)
//             if (modelDetailsData) {
//                 setValue('model.fuelType', modelDetailsData.fuelType)
//                 setValue('model.averageFuelConsume', modelDetailsData.fuelConsume)
//             }
//         }
//     }

//     // Estado para el mensaje de error de la patente
//     const [plateError, setPlateError] = useState<string | null>(null)
//     const [isCheckingPlate, setIsCheckingPlate] = useState(false);

//     // Obtenemos el valor actual de la patente
//     const plateValue = watch('car.plate')

//     // Debounce del valor de la patente para no hacer demasiadas peticiones
//     const debouncedPlate = useDebounce(plateValue, 500)

//     // Modify the mutation to better handle responses
//     const checkPlateMutation = useMutation({
//         mutationFn: checkPlateExists,
//         onMutate: () => {
//             setIsCheckingPlate(true);
//         },
//         onSettled: () => {
//             setIsCheckingPlate(false);
//         },
//         onSuccess: (response) => {
//             if (response.success && response.data?.exists) {
//                 setPlateError(response.data.message);
//             } else {
//                 setPlateError(null);
//             }
//         },
//         onError: () => {
//             toast.error('Error al verificar la patente');
//         }
//     });

//     useEffect(() => {
//         const validatePlate = async () => {
//             console.log('Debounced plate value:', debouncedPlate);

//             // Only check if the plate matches either format and is long enough
//             if (debouncedPlate && debouncedPlate.length >= 6) {
//                 const platePattern = /^[A-Z0-9]{6,7}$/;
//                 if (platePattern.test(debouncedPlate.toUpperCase())) {
//                     checkPlateMutation.mutate(debouncedPlate.toUpperCase());
//                 }
//             }
//         };

//         validatePlate();
//     }, [debouncedPlate, checkPlateMutation]);

//     // Modificar el handleFormSubmit para incluir la validación
//     const handleFormSubmit = async (formData: CarRegistrationInput) => {
//         // Check if we're currently validating the plate
//         if (isCheckingPlate) {
//             toast.error('Por favor, espere mientras se verifica la patente');
//             return;
//         }

//         // Check if there's a plate error
//         if (plateError) {
//             toast.error(plateError);
//             return;
//         }

//         try {
//             setLoading(true);
//             await onSubmit(formData);
//         } catch (error) {
//             console.log(error)
//             toast.error('Error al registrar el vehículo');
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Loading component
//     const SelectSkeleton = () => <Skeleton className="h-10 w-full" />


//     return (
//         <div className="flex flex-col min-h-[calc(100vh-10rem)]">
//             <Alert className="mb-6">
//                 <Car className="h-4 w-4" />
//                 <AlertTitle>Registro de Vehículo</AlertTitle>
//                 <AlertDescription>
//                     Para poder ofrecer viajes, necesitamos registrar la información de tu vehículo.
//                 </AlertDescription>
//             </Alert>

//             <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
//                 <div className="space-y-4">
//                     {/* Marca */}
//                     <div>
//                         <Label htmlFor="brand">Marca</Label>
//                         {isLoadingBrands ? (
//                             <SelectSkeleton />
//                         ) : (
//                             <Select
//                                 onValueChange={handleBrandSelect}
//                                 value={selectedBrand?.name}
//                             >
//                                 <SelectTrigger>
//                                     <SelectValue placeholder="Selecciona una marca" />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     {brandsData?.map((brand) => (
//                                         <SelectItem key={brand.id} value={brand.name}>
//                                             {brand.name}
//                                         </SelectItem>
//                                     ))}
//                                 </SelectContent>
//                             </Select>
//                         )}
//                         {errors.brand?.name && (
//                             <p className="text-sm text-destructive mt-1">{errors.brand.name.message}</p>
//                         )}
//                     </div>

//                     {/* Línea */}
//                     {selectedBrand && (
//                         <div>
//                             <Label htmlFor="group">Línea</Label>
//                             {isLoadingGroups ? (
//                                 <SelectSkeleton />
//                             ) : (
//                                 <Select onValueChange={handleGroupSelect} value={selectedGroup?.name}>
//                                     <SelectTrigger>
//                                         <SelectValue placeholder="Selecciona una línea" />
//                                     </SelectTrigger>
//                                     <SelectContent
//                                         align="start"
//                                         className="max-h-[200px] overflow-y-auto"
//                                         style={{
//                                             scrollBehavior: 'smooth',
//                                             overscrollBehavior: 'contain'
//                                         }}
//                                     >
//                                         {groupsData?.map((group) => (
//                                             <SelectItem key={group.id} value={group.name}>
//                                                 {group.name}
//                                             </SelectItem>
//                                         ))}
//                                     </SelectContent>
//                                 </Select>
//                             )}
//                         </div>
//                     )}

//                     {/* Modelo */}
//                     {selectedGroup && (
//                         <div>
//                             <Label htmlFor="model">Modelo</Label>
//                             {isLoadingModels ? (
//                                 <SelectSkeleton />
//                             ) : (
//                                 <Select onValueChange={handleModelSelect} value={selectedModel?.id.toString()}>
//                                     <SelectTrigger>
//                                         <SelectValue placeholder="Selecciona un modelo específico" />
//                                     </SelectTrigger>
//                                     <SelectContent
//                                         align="start"
//                                         className="max-h-[200px] overflow-y-auto"
//                                         style={{
//                                             scrollBehavior: 'smooth',
//                                             overscrollBehavior: 'contain'
//                                         }}>
//                                         {modelsData?.map((model) => (
//                                             <SelectItem key={model.id} value={model.id.toString()}>
//                                                 {model.name}
//                                             </SelectItem>
//                                         ))}
//                                     </SelectContent>
//                                 </Select>
//                             )}
//                             {errors.model?.name && (
//                                 <p className="text-sm text-destructive mt-1">{errors.model.name.message}</p>
//                             )}
//                         </div>
//                     )}

//                     {/* Año y Patente */}
//                     {selectedModel && (
//                         <>
//                             {isLoadingDetails ? (
//                                 <div className="space-y-4 animate-pulse">
//                                     <div>
//                                         <Label className="opacity-50">Año</Label>
//                                         <SelectSkeleton />
//                                     </div>
//                                     <div>
//                                         <Label className="opacity-50">Patente</Label>
//                                         <SelectSkeleton />
//                                     </div>
//                                 </div>
//                             ) : modelDetailsData && (
//                                 <div className="space-y-4 animate-in fade-in-50">
//                                     <div>
//                                         <Label htmlFor="year">Año</Label>
//                                         <Select
//                                             onValueChange={(year) => setValue('model.year', parseInt(year))}
//                                             value={watch('model.year').toString()}
//                                         >
//                                             <SelectTrigger>
//                                                 <SelectValue placeholder="Selecciona el año" />
//                                             </SelectTrigger>
//                                             <SelectContent>
//                                                 {getYearRange().map((year) => (
//                                                     <SelectItem key={year} value={year.toString()}>
//                                                         {year}
//                                                     </SelectItem>
//                                                 ))}
//                                             </SelectContent>
//                                         </Select>
//                                         {errors.model?.year && (
//                                             <p className="text-sm text-destructive mt-1">
//                                                 {errors.model.year.message}
//                                             </p>
//                                         )}
//                                     </div>

//                                     <div className="space-y-2">
//                                         <Label htmlFor="plate">Patente</Label>
//                                         <div className="relative">
//                                             <Input
//                                                 id="plate"
//                                                 {...register('car.plate')}
//                                                 placeholder="Ingresa la patente"
//                                                 className={`uppercase ${errors.car?.plate || plateError ? 'border-destructive' : ''}`}
//                                             />
//                                             {isCheckingPlate && (
//                                                 <div className="absolute right-3 top-1/2 -translate-y-1/2">
//                                                     <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
//                                                 </div>
//                                             )}
//                                         </div>
//                                         {(errors.car?.plate || plateError) && (
//                                             <p className="text-sm font-medium text-destructive">
//                                                 {errors.car?.plate?.message || plateError}
//                                             </p>
//                                         )}
//                                     </div>
//                                 </div>
//                             )}
//                         </>
//                     )}
//                 </div>

//                 <div className="flex-grow" />

//                 <footer className="sticky bottom-0 left-0 right-0 p-4 bg-background border-t">
//                     <Button
//                         type="submit"
//                         className="w-full"
//                         disabled={!isValid || loading || !selectedModel || !modelDetailsData || isCheckingPlate || !!plateError}
//                     >
//                         {loading ? (
//                             <>
//                                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                                 Registrando...
//                             </>
//                         ) : (
//                             <>
//                                 Registrar Vehículo
//                                 <ArrowRight className="ml-2 h-4 w-4" />
//                             </>
//                         )}
//                     </Button>
//                 </footer>
//             </form>
//         </div>
//     )
// }

'use client'

import { useEffect, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowRight, Car, Loader2 } from 'lucide-react'
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { CarRegistrationInput, carRegistrationSchema } from '@/schemas/validation/car-schema'
import { Brand, Group, Model } from '@/types/car-types'
import { getBrands, getGroups, getModelDetails, getModels } from '@/actions/car-api/car-api-actions'
import { getYearRange } from '@/utils/helpers/get-year-range'
import { usePlateValidation } from '@/hooks/registration/usePlateValidation'
import { PlateInput } from './components/car/PlateInput'

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
    // Local states
    const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null)
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
    const [selectedModel, setSelectedModel] = useState<Model | null>(null)
    const [loading, setLoading] = useState(false)
    const formRef = useRef<HTMLFormElement>(null)
    const plateInputRef = useRef<HTMLInputElement>(null)

    // Use the improved plate validation hook
    const {
        plate,
        plateError,
        isValidating: isCheckingPlate,
        resetValidation,
        validateNow,
        handlePlateChange
    } = usePlateValidation(data.carInfo?.car.plate || '')

    // React Hook Form
    const { handleSubmit, setValue, watch, formState: { errors, isValid } } = useForm<CarRegistrationInput>({
        resolver: zodResolver(carRegistrationSchema),
        mode: "onChange",
        defaultValues: data.carInfo || {
            brand: { name: '' },
            model: { name: '', year: new Date().getFullYear(), averageFuelConsume: undefined, fuelType: undefined },
            car: { plate: '' }
        }
    })

    // Update form values when plate changes - without causing re-renders
    useEffect(() => {
        if (plate) {
            setValue('car.plate', plate, { shouldValidate: true });
        }
    }, [plate, setValue]);

    // Brands data query
    const {
        data: brandsData,
        isLoading: isLoadingBrands,
        error: brandsError
    } = useQuery({
        queryKey: ['brands'],
        queryFn: getBrands,
        select: (response) => response.success ? response.data : [],
        staleTime: Infinity
    })

    // Groups data query
    const {
        data: groupsData,
        isLoading: isLoadingGroups,
        error: groupsError
    } = useQuery({
        queryKey: ['groups', selectedBrand?.id],
        queryFn: async () => {
            if (!selectedBrand) return null;
            const response = await getGroups(selectedBrand.id);
            return response;
        },
        select: (response) => response?.success ? response.data : [],
        enabled: !!selectedBrand
    });

    // Models data query
    const {
        data: modelsData,
        isLoading: isLoadingModels,
        error: modelsError
    } = useQuery({
        queryKey: ['models', selectedBrand?.id, selectedGroup?.id],
        queryFn: () => selectedBrand && selectedGroup ? getModels(selectedBrand.id, selectedGroup.id) : null,
        select: (response) => response?.success ? response.data : [],
        enabled: !!(selectedBrand && selectedGroup)
    })

    // Model details query
    const {
        data: modelDetailsData,
        isLoading: isLoadingDetails,
        error: modelDetailsError
    } = useQuery({
        queryKey: ['modelDetails', selectedModel?.id],
        queryFn: () => selectedModel ? getModelDetails(selectedModel.id) : null,
        select: (response) => response?.success ? response.data : null,
        enabled: !!selectedModel
    })

    // Error handling
    useEffect(() => {
        if (brandsError) toast.error('Error al cargar las marcas')
        if (groupsError) toast.error('Error al cargar las líneas')
        if (modelsError) toast.error('Error al cargar los modelos')
        if (modelDetailsError) toast.error('Error al cargar los detalles del modelo')
    }, [brandsError, groupsError, modelsError, modelDetailsError])

    // Reset plate validation when brand changes
    useEffect(() => {
        resetValidation()
    }, [selectedBrand, resetValidation])

    // Brand selection handler
    const handleBrandSelect = (brandName: string) => {
        const brand = brandsData?.find(b => b.name === brandName);
        if (brand) {
            setSelectedBrand(brand);
            setValue('brand.name', brand.name);
            // Reset other selections
            setSelectedGroup(null);
            setSelectedModel(null);
            setValue('model.name', '');
            setValue('model.year', new Date().getFullYear());
            // Reset plate validation
            resetValidation();
        }
    }

    // Group selection handler
    const handleGroupSelect = (groupName: string) => {
        const group = groupsData?.find(g => g.name === groupName)
        if (group) {
            setSelectedGroup(group)
            setSelectedModel(null)
            setValue('model.year', new Date().getFullYear())
        }
    }

    // Model selection handler
    const handleModelSelect = (modelId: string) => {
        const model = modelsData?.find(m => m.id === parseInt(modelId))
        if (model) {
            setSelectedModel(model)
            setValue('model.name', model.name)
            if (modelDetailsData) {
                setValue('model.fuelType', modelDetailsData.fuelType)
                setValue('model.averageFuelConsume', modelDetailsData.fuelConsume)
            }
        }
    }

    // Form submission handler
    const handleFormSubmit = async (formData: CarRegistrationInput) => {
        // Don't submit if plate is being validated
        if (isCheckingPlate) {
            toast.error('Por favor, espere mientras se verifica la patente');
            return;
        }

        // Final plate validation before submission
        const plateValidation = await validateNow();
        if (!plateValidation.isValid) {
            toast.error(plateValidation.error || 'Error de validación de patente');
            // Focus the plate input for better UX
            plateInputRef.current?.focus();
            return;
        }

        try {
            setLoading(true);
            await onSubmit({
                ...formData,
                car: {
                    ...formData.car,
                    plate: plate.toUpperCase()
                }
            });
        } catch (error) {
            console.error('Error registering vehicle:', error);
            toast.error('Error al registrar el vehículo');
        } finally {
            setLoading(false);
        }
    };

    // Loading skeleton component
    const SelectSkeleton = () => <Skeleton className="h-10 w-full" />

    return (
        <div className="flex flex-col min-h-[calc(100vh-10rem)]">
            <Alert className="mb-6">
                <Car className="h-4 w-4" />
                <AlertTitle>Registro de Vehículo</AlertTitle>
                <AlertDescription>
                    Para poder ofrecer viajes, necesitamos registrar la información de tu vehículo.
                </AlertDescription>
            </Alert>

            <form ref={formRef} onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                <div className="space-y-4">
                    {/* Brand */}
                    <div>
                        <Label htmlFor="brand">Marca</Label>
                        {isLoadingBrands ? (
                            <SelectSkeleton />
                        ) : (
                            <Select
                                onValueChange={handleBrandSelect}
                                value={selectedBrand?.name}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona una marca" />
                                </SelectTrigger>
                                <SelectContent>
                                    {brandsData?.map((brand) => (
                                        <SelectItem key={brand.id} value={brand.name}>
                                            {brand.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                        {errors.brand?.name && (
                            <p className="text-sm text-destructive mt-1">{errors.brand.name.message}</p>
                        )}
                    </div>

                    {/* Line */}
                    {selectedBrand && (
                        <div>
                            <Label htmlFor="group">Línea</Label>
                            {isLoadingGroups ? (
                                <SelectSkeleton />
                            ) : (
                                <Select onValueChange={handleGroupSelect} value={selectedGroup?.name}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona una línea" />
                                    </SelectTrigger>
                                    <SelectContent
                                        align="start"
                                        className="max-h-[200px] overflow-y-auto"
                                        style={{
                                            scrollBehavior: 'smooth',
                                            overscrollBehavior: 'contain'
                                        }}
                                    >
                                        {groupsData?.map((group) => (
                                            <SelectItem key={group.id} value={group.name}>
                                                {group.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                    )}

                    {/* Model */}
                    {selectedGroup && (
                        <div>
                            <Label htmlFor="model">Modelo</Label>
                            {isLoadingModels ? (
                                <SelectSkeleton />
                            ) : (
                                <Select onValueChange={handleModelSelect} value={selectedModel?.id?.toString()}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona un modelo específico" />
                                    </SelectTrigger>
                                    <SelectContent
                                        align="start"
                                        className="max-h-[200px] overflow-y-auto"
                                        style={{
                                            scrollBehavior: 'smooth',
                                            overscrollBehavior: 'contain'
                                        }}>
                                        {modelsData?.map((model) => (
                                            <SelectItem key={model.id} value={model.id.toString()}>
                                                {model.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                            {errors.model?.name && (
                                <p className="text-sm text-destructive mt-1">{errors.model.name.message}</p>
                            )}
                        </div>
                    )}

                    {/* Year and License Plate */}
                    {selectedModel && (
                        <>
                            {isLoadingDetails ? (
                                <div className="space-y-4 animate-pulse">
                                    <div>
                                        <Label className="opacity-50">Año</Label>
                                        <SelectSkeleton />
                                    </div>
                                    <div>
                                        <Label className="opacity-50">Patente</Label>
                                        <SelectSkeleton />
                                    </div>
                                </div>
                            ) : modelDetailsData && (
                                <div className="space-y-4 animate-in fade-in-50">
                                    {/* Year selector */}
                                    <div>
                                        <Label htmlFor="year">Año</Label>
                                        <Select
                                            onValueChange={(year) => setValue('model.year', parseInt(year))}
                                            value={watch('model.year').toString()}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona el año" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {getYearRange().map((year) => (
                                                    <SelectItem key={year} value={year.toString()}>
                                                        {year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.model?.year && (
                                            <p className="text-sm text-destructive mt-1">
                                                {errors.model.year.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Plate input */}
                                    <PlateInput
                                        ref={plateInputRef}
                                        value={plate}
                                        onChange={handlePlateChange}
                                        error={plateError}
                                        isValidating={isCheckingPlate}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="flex-grow" />

                <footer className="sticky bottom-0 left-0 right-0 p-4 bg-background border-t">
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={!isValid || loading || !selectedModel || !modelDetailsData || isCheckingPlate || !!plateError}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Registrando...
                            </>
                        ) : (
                            <>
                                Registrar Vehículo
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                </footer>
            </form>
        </div>
    )
}