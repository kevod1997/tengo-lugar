'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { calculateRoute } from '@/actions/route/calculate-route'
import { createTrip } from '@/actions/trip/create-trip'
import { Card } from '@/components/ui/card'
import { LoadingButton } from '@/components/ui/loading-button'
import { useLocationInput } from '@/hooks/map/useLocationInput'
import { useAsyncLoading } from '@/hooks/ui/useAsyncLoading'
import { useGoogleMapsScript } from '@/hooks/ui/useGoogleMapsScripts'
import { useLoadingStore } from '@/store/loadingStore'
import { useTripPreferencesStore } from '@/store/trip-preferences-store'
import type { RouteResponse } from '@/types/route-types'
import type { TripData } from '@/types/trip-types'
import type { UserCar } from '@/types/user-types'
import { formatDuration } from '@/utils/format/formatDuration'
import { getGoogleMapsUrl } from '@/utils/helpers/getGoogleMapsUrl'

import DateTimePicker from './DateTimePicker'
import LocationInput from './LocationInput'
import RouteInfoCard from './RouteInfoCard'
import TravelCostCalculator from './TravelCostCalculator'
import TripPreferencesForm from './TripPreferencesForm'

import type { LuggageAllowance } from '@prisma/client'
import type { SubmitHandler} from 'react-hook-form';


interface RouteCalculatorProps {
    initialOrigin?: string
    initialDestination?: string
    apiKey: string
    fuels: any
    cars: UserCar[]
}

interface FormValues {
    tripDate: Date
    departureTime: string
  }

const RouteCalculator = ({
    initialOrigin = '',
    initialDestination = '',
    apiKey,
    fuels,
    cars
}: RouteCalculatorProps) => {
    const router = useRouter()
    const { isLoaded } = useGoogleMapsScript({ apiKey, libraries: ['places'] })

    // Hooks de Zustand
    const { isLoading } = useLoadingStore()
    const preferences = useTripPreferencesStore()

    // Nuestro hook para ejecutar operaciones con estado de carga
    const { executeWithLoading } = useAsyncLoading()

    // Estado local y formulario
    const [routeInfo, setRouteInfo] = useState<RouteResponse | null>(null)
    const [selectedCar, setSelectedCar] = useState('')
    const [calculatedPrice, setCalculatedPrice] = useState({ price: 0, priceGuide: 0 })
    // NUEVO: Estado para controlar la redirección
    const [isRedirecting, setIsRedirecting] = useState(false)

    const { control, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
        defaultValues: {
            tripDate: undefined,
            departureTime: undefined
        }
    })

    // Custom hooks para campos de ubicación
    const origin = useLocationInput({
        initialValue: initialOrigin,
        isGoogleMapsLoaded: isLoaded,
        elementId: 'origin-input'
    })

    const destination = useLocationInput({
        initialValue: initialDestination,
        isGoogleMapsLoaded: isLoaded,
        elementId: 'destination-input'
    })

    // Función para calcular la ruta
    const onCalculateRoute: SubmitHandler<FormValues> = async (formData) => {
        if (!origin.value || !destination.value) {
            toast.error('Por favor ingrese origen y destino')
            return
        }

        // Asegurar coordenadas
        const originCoordinatesReady = await executeWithLoading(
            'geocodingOrigin',
            async () => origin.ensureCoordinates(),
            { showToastOnError: true, errorMessage: 'Error al obtener coordenadas de origen' }
        )

        const destinationCoordinatesReady = await executeWithLoading(
            'geocodingDestination',
            async () => destination.ensureCoordinates(),
            { showToastOnError: true, errorMessage: 'Error al obtener coordenadas de destino' }
        )

        if (!originCoordinatesReady || !destinationCoordinatesReady) {
            return
        }

        // Combinar fecha y hora
        const combinedDepartureTime = new Date(formData.tripDate)
        const [hours, minutes] = formData.departureTime.split(':').map(Number)
        combinedDepartureTime.setHours(hours, minutes, 0, 0)

        // Calcular ruta con loading state
        const response = await executeWithLoading(
            'calculatingRoute',
            async () => {
                return calculateRoute({
                    origin: origin.coordinates!,
                    destination: destination.coordinates!,
                    vehicleType: 'GASOLINE',
                    departureTime: combinedDepartureTime
                })
            },
            { showToastOnError: true }
        )

        if (response?.success && response.data) {
            setRouteInfo(response.data)
        }
    }

    const handleCreateTrip = async () => {
        // Primero verificamos que tenemos todos los datos necesarios
        const tripDate = watch('tripDate');
        const timeString = watch('departureTime');
        
        if (!routeInfo || !selectedCar || !tripDate || !timeString || calculatedPrice.price <= 0) {
          toast.error('Por favor completa todos los campos requeridos');
          return;
        }
        
        // Construimos un objeto Date que combine la fecha y la hora
        const combinedDateTime = new Date(tripDate);
        const [hours, minutes] = timeString.split(':').map(Number);
        combinedDateTime.setHours(hours, minutes, 0, 0); // Configuramos la hora, minutos, segundos y milisegundos
        
        // Ahora usamos este objeto Date completo para el campo departureTime
        const tripData: TripData = {
          driverCarId: selectedCar,
          
          // Origen
          originAddress: origin.value,
          originCity: origin.locationInfo.city,
          originProvince: origin.locationInfo.province,
          originCoords: origin.coordinates!,
          
          // Destino
          destinationAddress: destination.value,
          destinationCity: destination.locationInfo.city,
          destinationProvince: destination.locationInfo.province,
          destinationCoords: destination.coordinates!,
          
          // Información de ruta
          googleMapsUrl: getGoogleMapsUrl(
            `${origin.coordinates!.latitude},${origin.coordinates!.longitude}`,
            `${destination.coordinates!.latitude},${destination.coordinates!.longitude}`
          ),
          date: combinedDateTime, // Usar la misma base para evitar inconsistencias de timezone
          departureTime: combinedDateTime, // Esta es la fecha CON hora
          price: calculatedPrice.price,
          priceGuide: calculatedPrice.priceGuide,
          distance: routeInfo.routes[0].distanceMeters / 1000,
          duration: formatDuration(routeInfo.routes[0].duration),
          durationSeconds: parseInt(routeInfo.routes[0].duration.replace('s', '')),
          
          // Información de peajes
          hasTolls: !!routeInfo.routes[0].travelAdvisory?.tollInfo?.estimatedPrice,
          tollEstimatedPrice: routeInfo.routes[0].travelAdvisory?.tollInfo?.estimatedPrice
            ? parseFloat(routeInfo.routes[0].travelAdvisory.tollInfo.estimatedPrice[0].units)
            : undefined,
          
          // Preferencias
          availableSeats: preferences.availableSeats,
          autoApproveReservations: preferences.autoApproveReservations,
          luggageAllowance: preferences.luggageAllowance as LuggageAllowance,
          allowPets: preferences.allowPets,
          allowChildren: preferences.allowChildren,
          smokingAllowed: preferences.smokingAllowed,
          additionalNotes: preferences.additionalNotes
        };
        
        // MEJORADO: Enviar los datos al servidor con mejor manejo de toast
        const result = await executeWithLoading(
          'creatingTrip',
          async () => createTrip(tripData),
          { showToastOnError: false } // Manejamos el toast manualmente
        );

        if (result?.success) {
          // NUEVO: Toast de éxito con información
          toast.success('¡Viaje creado exitosamente!', {
            description: `${origin.locationInfo.city} → ${destination.locationInfo.city}`,
            duration: 3000
          });
          
          // NUEVO: Activar estado de redirección
          setIsRedirecting(true);
          
          // NUEVO: Delay para mostrar los toasts antes de redirigir
          setTimeout(() => {
            router.push('/viajes');
          }, 1500);
        } else {
          // MEJORADO: Toast de error más informativo
          toast.error('Error al crear el viaje', {
            description: result?.error?.message || 'Ocurrió un error inesperado. Intenta nuevamente.',
            duration: 5000
          });
        }
      };

      // NUEVO: Determinar si la interfaz debe estar deshabilitada
      const isInterfaceDisabled = isRedirecting || isLoading('creatingTrip');

      return (
        <Card className="max-w-3xl mx-auto p-6">
          {/* NUEVO: Overlay de redirección */}
          {isRedirecting && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <p className="text-lg font-medium">Redirigiendo...</p>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Te estamos llevando a tus viajes
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onCalculateRoute)} className="space-y-4">
            <LocationInput 
              label="Origen"
              elementId={origin.elementId}
              value={origin.value}
              onChange={origin.onChange}
              locationInfo={origin.locationInfo}
              isLoading={isLoading('geocodingOrigin')}
            />
            
            <LocationInput 
              label="Destino"
              elementId={destination.elementId}
              value={destination.value}
              onChange={destination.onChange}
              locationInfo={destination.locationInfo}
              isLoading={isLoading('geocodingDestination')}
            />
            
            <DateTimePicker 
              control={control} 
              errors={errors} 
            />
            
            <LoadingButton
              type="submit"
              operation="calculatingRoute"
              disabled={!isLoaded || isInterfaceDisabled}
              className="w-full"
            >
              Calcular Ruta
            </LoadingButton>
          </form>
    
          {routeInfo && (
            <>
              <RouteInfoCard
                routeInfo={routeInfo}
                origin={origin.value}
                destination={destination.value}
                tripDate={watch('tripDate')}
                departureTime={watch('departureTime')}
                originInfo={origin.locationInfo}
                destinationInfo={destination.locationInfo}
                originCoordinates={origin.coordinates}
                destinationCoordinates={destination.coordinates}
              />

              {fuels.length === 0 && (
                <p className="text-sm text-red-500 mt-4">No hay combustibles disponibles</p>
              )}
              
              <TravelCostCalculator
                routeInfo={routeInfo}
                fuels={fuels}
                cars={cars}
                onPriceChange={setCalculatedPrice}
                onCarChange={setSelectedCar}
              />
    
              <TripPreferencesForm />
    
              {calculatedPrice.priceGuide > 0 && (
                <div className="mt-6 flex justify-end">
                  <LoadingButton
                    size="lg"
                    className="bg-primary hover:bg-primary/90"
                    operation="creatingTrip"
                    onClick={handleCreateTrip}
                    disabled={isInterfaceDisabled}
                  >
                    {/* MEJORADO: Texto más descriptivo durante loading */}
                    {isLoading('creatingTrip') 
                      ? 'Creando viaje...' 
                      : `Crear viaje por $${calculatedPrice.price.toFixed(2)}`
                    }
                  </LoadingButton>
                </div>
              )}
            </>
          )}
        </Card>
      )
    }
    
    export default RouteCalculator