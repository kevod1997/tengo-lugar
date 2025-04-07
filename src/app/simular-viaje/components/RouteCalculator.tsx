// 'use client'

// import { useState, useEffect, useRef } from 'react'
// import { calculateRoute } from '@/actions/route/calculate-route'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
// import { Loader2, ExternalLink, Calendar as CalendarIcon, Clock } from 'lucide-react'
// import { formatDuration } from '@/utils/format/formatDuration'
// import { toast } from 'sonner'
// import { Calendar } from '@/components/ui/calendar'
// import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
// import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTrigger,
//     SelectValue
// } from '@/components/ui/select'
// import { addDays, addHours, format, isBefore, isToday, parse } from 'date-fns'
// import { es } from 'date-fns/locale'
// import { Label } from '@/components/ui/label'
// import Link from 'next/link'
// import { useGoogleMapsScript } from '@/hooks/ui/useGoogleMapsScripts'
// import { useGeocodingService } from '@/hooks/map/useGeocodingService'
// import { Coordinates, LocationInfo, RouteResponse } from '@/types/route-types'
// import { generateTimeOptions } from '@/utils/helpers/time/generate-time-options'
// import { getGoogleMapsUrl } from '@/utils/helpers/getGoogleMapsUrl'
// import TravelCostCalculator from './TravelCostCalculator'
// import TripPreferencesForm from './TripPreferencesForm'
// import { useRouter } from 'next/navigation'
// import { createTrip } from '@/actions/trip/create-trip'
// import { LuggageAllowance } from '@prisma/client'
// import { TripData } from '@/types/trip-types'

// interface RouteCalculatorProps {
//     initialOrigin?: string
//     initialDestination?: string
//     apiKey: string
//     fuels: any
// }

// const RouteCalculator = ({
//     initialOrigin = '',
//     initialDestination = '',
//     apiKey,
//     fuels
// }: RouteCalculatorProps) => {
//     // Script de Google Maps
//     const { isLoaded } = useGoogleMapsScript({
//         apiKey,
//         libraries: ['places']
//     })

//     // Servicio de geocodificación
//     const { geocodeAddress, isGeocoding } = useGeocodingService(isLoaded)

//     // Estado para inputs del formulario
//     const [origin, setOrigin] = useState(initialOrigin)
//     const [destination, setDestination] = useState(initialDestination)
//     const defaultVehicleType = 'GASOLINE' as const;
//     const router = useRouter()
//     const [selectedCar, setSelectedCar] = useState<string>('')

//     //Estado para preferencias
//     const [calculatedPrice, setCalculatedPrice] = useState({
//         price: 0,
//         priceGuide: 0

//     })
//     console.log(calculatedPrice)
//     const [tripPreferences, setTripPreferences] = useState({
//         luggageAllowance: 'MEDIUM',
//         allowPets: false,
//         allowChildren: true,
//         smokingAllowed: false,
//         autoApproveReservations: false,
//         additionalNotes: '',
//         availableSeats: 4, // Default to 4 seats
//     })

//     // Estado para fecha y hora
//     const [tripDate, setTripDate] = useState<Date | undefined>(undefined)
//     const [departureTime, setDepartureTime] = useState<string | undefined>(undefined)

//     // Estado para detalles de ubicación
//     const [originInfo, setOriginInfo] = useState<LocationInfo>({
//         address: '',
//         city: '',
//         province: '',
//     })

//     const [destinationInfo, setDestinationInfo] = useState<LocationInfo>({
//         address: '',
//         city: '',
//         province: '',
//     })

//     // Estado para resultados
//     const [routeInfo, setRouteInfo] = useState<RouteResponse | null>(null)
//     const [isLoading, setIsLoading] = useState(false)

//     // Estado para coordenadas
//     const [originCoords, setOriginCoords] = useState<Coordinates | null>(null)
//     const [destinationCoords, setDestinationCoords] = useState<Coordinates | null>(null)

//     // Generar opciones de tiempo para el select
//     const getAvailableTimeOptions = () => {
//         const now = new Date()
//         const baseOptions = generateTimeOptions()

//         // Si la fecha seleccionada es hoy, filtra las horas que están al menos 4 horas después de la hora actual
//         if (tripDate && isToday(tripDate)) {
//             const fourHoursFromNow = addHours(now, 4)
//             return baseOptions.filter((option: { value: string; label: string }) => {
//                 const optionTime = parse(option.value, 'HH:mm', new Date())
//                 optionTime.setFullYear(now.getFullYear(), now.getMonth(), now.getDate())
//                 return isBefore(fourHoursFromNow, optionTime)
//             })
//         }

//         // Si la fecha es futura, muestra todas las opciones
//         return baseOptions
//     }

//     const today = new Date();
//     today.setHours(0, 0, 0, 0); // Set to beginning of day

//     // Create a date 15 days from now
//     const maxDate = addDays(today, 15);
//     maxDate.setHours(23, 59, 59, 999); // Set to end of day

//     // This will disable dates after 15 days from now
//     const disabledDays = {
//         after: maxDate, // Disable all dates after 15 days from now
//         before: today   // Also disable all dates before today
//     };

//     // Effect to check if departure time is valid when date changes
//     useEffect(() => {
//         // Si la fecha seleccionada es hoy y hay una hora seleccionada, verifica si es válida
//         if (tripDate && isToday(tripDate) && departureTime) {
//             const now = new Date()
//             const selectedTime = parse(departureTime, 'HH:mm', new Date())
//             selectedTime.setFullYear(now.getFullYear(), now.getMonth(), now.getDate())

//             const fourHoursFromNow = addHours(now, 4)

//             // Si la hora seleccionada es menor a 4 horas desde ahora, resetear
//             if (isBefore(selectedTime, fourHoursFromNow)) {
//                 setDepartureTime(undefined)
//             }
//         }
//     }, [tripDate, departureTime])

//     // Use refs to avoid dependency issues with origin/destination
//     const originRef = useRef(origin);
//     const destinationRef = useRef(destination);

//     // Update refs when values change
//     useEffect(() => {
//         originRef.current = origin;
//     }, [origin]);

//     useEffect(() => {
//         destinationRef.current = destination;
//     }, [destination]);

//     // Initialize Places Autocomplete
//     useEffect(() => {
//         if (!isLoaded) return;

//         // Referencias para limpiar los listeners después
//         let originListener: google.maps.MapsEventListener | null = null;
//         let destinationListener: google.maps.MapsEventListener | null = null;

//         // Configurar origen
//         const originInput = document.getElementById('origin-input') as HTMLInputElement;
//         if (originInput) {
//             const originAutocomplete = new google.maps.places.Autocomplete(originInput, {
//                 fields: ['geometry', 'formatted_address', 'address_components', 'place_id'],
//             });

//             originListener = originAutocomplete.addListener('place_changed', () => {
//                 const place = originAutocomplete.getPlace();
//                 if (place?.geometry?.location) {
//                     setOrigin(place.formatted_address || originRef.current);
//                     setOriginCoords({
//                         latitude: place.geometry.location.lat(),
//                         longitude: place.geometry.location.lng(),
//                     });

//                     // Extraer información de dirección
//                     let address = '';
//                     let city = '';
//                     let province = '';

//                     if (place.address_components) {
//                         for (const component of place.address_components) {
//                             const componentType = component.types[0];

//                             // Para dirección
//                             if (componentType === 'street_number') {
//                                 address = component.long_name + ' ' + address;
//                             }

//                             if (componentType === 'route') {
//                                 address = address ? address + ' ' + component.long_name : component.long_name;
//                             }

//                             // Para ciudad
//                             if (componentType === 'locality') {
//                                 city = component.long_name;
//                             }

//                             // Para provincia
//                             if (componentType === 'administrative_area_level_1') {
//                                 province = component.long_name;
//                             }
//                         }

//                         setOriginInfo({
//                             address,
//                             city,
//                             province
//                         });
//                     }
//                 }
//             });
//         }

//         // Configurar destino - separado completamente del origen
//         const destinationInput = document.getElementById('destination-input') as HTMLInputElement;
//         if (destinationInput) {
//             const destinationAutocomplete = new google.maps.places.Autocomplete(destinationInput, {
//                 fields: ['geometry', 'formatted_address', 'address_components', 'place_id'],
//             });

//             destinationListener = destinationAutocomplete.addListener('place_changed', () => {
//                 const place = destinationAutocomplete.getPlace();
//                 if (place?.geometry?.location) {
//                     setDestination(place.formatted_address || destinationRef.current);
//                     setDestinationCoords({
//                         latitude: place.geometry.location.lat(),
//                         longitude: place.geometry.location.lng(),
//                     });

//                     // Extraer información de dirección
//                     let address = '';
//                     let city = '';
//                     let province = '';

//                     if (place.address_components) {
//                         for (const component of place.address_components) {
//                             const componentType = component.types[0];

//                             // Para dirección
//                             if (componentType === 'street_number') {
//                                 address = component.long_name + ' ' + address;
//                             }

//                             if (componentType === 'route') {
//                                 address = address ? address + ' ' + component.long_name : component.long_name;
//                             }

//                             // Para ciudad
//                             if (componentType === 'locality') {
//                                 city = component.long_name;
//                             }

//                             // Para provincia
//                             if (componentType === 'administrative_area_level_1') {
//                                 province = component.long_name;
//                             }
//                         }

//                         setDestinationInfo({
//                             address,
//                             city,
//                             province
//                         });
//                     }
//                 }
//             });
//         }

//         // Limpieza al desmontar
//         return () => {
//             if (originListener) {
//                 google.maps.event.removeListener(originListener);
//             }
//             if (destinationListener) {
//                 google.maps.event.removeListener(destinationListener);
//             }
//         };
//     }, [isLoaded]);

//     // Función para asegurar que tenemos coordenadas
//     const ensureCoordinates = async (): Promise<boolean> => {
//         if (!isLoaded) {
//             toast.error('Google Maps aún no ha terminado de cargar')
//             return false
//         }

//         // Obtener coordenadas de origen si es necesario
//         if (!originCoords && origin) {
//             const result = await geocodeAddress(origin)
//             if (!result) return false

//             setOriginCoords(result.coordinates)
//             setOriginInfo(result.locationInfo)
//         }

//         // Obtener coordenadas de destino si es necesario
//         if (!destinationCoords && destination) {
//             const result = await geocodeAddress(destination)
//             if (!result) return false

//             setDestinationCoords(result.coordinates)
//             setDestinationInfo(result.locationInfo)
//         }

//         return true
//     }

//     // Manejar envío del formulario
//     const handleCalculateRoute = async (e: React.FormEvent) => {
//         e.preventDefault()

//         if (!origin || !destination) {
//             toast.error('Por favor ingrese origen y destino')
//             return
//         }

//         if (!tripDate && !departureTime) {
//             toast.error('Por favor seleccione una fecha y hora de salida')
//             return
//         }

//         setIsLoading(true)

//         try {
//             // Asegurar que tenemos coordenadas para ambas direcciones
//             const coordinatesReady = await ensureCoordinates()
//             if (!coordinatesReady) {
//                 setIsLoading(false)
//                 return
//             }

//             // Combinar fecha y hora si ambas están disponibles
//             let combinedDepartureTime: Date | undefined = undefined
//             if (tripDate && departureTime) {
//                 combinedDepartureTime = new Date(tripDate)
//                 const [hours, minutes] = departureTime.split(':').map(Number)
//                 combinedDepartureTime.setHours(hours, minutes, 0, 0)
//             }

//             // Llamar a la acción del servidor para calcular la ruta
//             const routeData = {
//                 origin: originCoords!,
//                 destination: destinationCoords!,
//                 vehicleType: defaultVehicleType,
//                 departureTime: combinedDepartureTime!,
//                 originInfo,
//                 destinationInfo
//             }

//             const response = await calculateRoute(routeData)

//             if (response.success && response.data) {
//                 setRouteInfo(response.data)
//             } else {
//                 toast.error(response.error?.message || 'Error al calcular la ruta')
//             }
//         } catch (error) {
//             console.error('Error calculating route:', error)
//             toast.error('Ocurrió un error al calcular la ruta')
//         } finally {
//             setIsLoading(false)
//         }
//     }
//     const handleCreateTrip = async () => {
//         if (!routeInfo || !selectedCar || !tripDate || !departureTime || calculatedPrice.price <= 0) {
//             toast.error('Por favor completa todos los campos requeridos');
//             return;
//         }

//         setIsLoading(true);

//         try {
//             // Create a combined date time object for departure
//             const departureDateTime = new Date(tripDate);
//             const [hours, minutes] = departureTime.split(':').map(Number);
//             departureDateTime.setHours(hours, minutes, 0, 0);

//             // Build trip data object
//             const tripData: TripData = {
//                 driverCarId: selectedCar,

//                 // Origin
//                 originAddress: origin,
//                 originCity: originInfo.city,
//                 originProvince: originInfo.province,
//                 originCoords: originCoords!,

//                 // Destination
//                 destinationAddress: destination,
//                 destinationCity: destinationInfo.city,
//                 destinationProvince: destinationInfo.province,
//                 destinationCoords: destinationCoords!,

//                 // Route details
//                 googleMapsUrl: getGoogleMapsUrl(origin, destination),
//                 date: tripDate,
//                 departureTime: departureDateTime,
//                 price: calculatedPrice.price,
//                 priceGuide: calculatedPrice.priceGuide,
//                 distance: routeInfo.routes[0].distanceMeters / 1000,
//                 duration: formatDuration(routeInfo.routes[0].duration),
//                 durationSeconds: parseInt(routeInfo.routes[0].duration.replace('s', '')),

//                 // Toll info
//                 hasTolls: !!routeInfo.routes[0].travelAdvisory?.tollInfo?.estimatedPrice,
//                 tollEstimatedPrice: routeInfo.routes[0].travelAdvisory?.tollInfo?.estimatedPrice
//                     ? parseFloat(routeInfo.routes[0].travelAdvisory.tollInfo.estimatedPrice[0].units)
//                     : undefined,

//                 // Preferences
//                 availableSeats: tripPreferences.availableSeats || 4, // Default to 4 if not provided
//                 autoApproveReservations: tripPreferences.autoApproveReservations,
//                 luggageAllowance: tripPreferences.luggageAllowance as LuggageAllowance,
//                 allowPets: tripPreferences.allowPets,
//                 allowChildren: tripPreferences.allowChildren,
//                 smokingAllowed: tripPreferences.smokingAllowed,
//                 additionalNotes: tripPreferences.additionalNotes
//             };

//             const result = await createTrip(tripData);

//             if (result.success) {
//                 toast.success('Viaje creado exitosamente');
//                 router.push('/viajes'); // Redirect to trips page
//             } else {
//                 toast.error(result.error?.message || 'Error al crear el viaje');
//             }
//         } catch (error) {
//             console.error('Error creating trip:', error);
//             toast.error('Error al crear el viaje');
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     return (
//         <div className="max-w-2xl mx-auto">
//             <form onSubmit={handleCalculateRoute} className="space-y-4">
//                 <div className="space-y-2">
//                     <Label htmlFor="origin-input">Origen</Label>
//                     <Input
//                         id="origin-input"
//                         value={origin}
//                         onChange={(e) => setOrigin(e.target.value)}
//                         placeholder="Ingrese dirección de origen"
//                         required
//                     />
//                     {originInfo.city && originInfo.province && (
//                         <p className="text-xs text-muted-foreground">
//                             Ciudad: {originInfo.city}, Provincia: {originInfo.province}
//                         </p>
//                     )}
//                 </div>

//                 <div className="space-y-2">
//                     <Label htmlFor="destination-input">Destino</Label>
//                     <Input
//                         id="destination-input"
//                         value={destination}
//                         onChange={(e) => setDestination(e.target.value)}
//                         placeholder="Ingrese dirección de destino"
//                         required
//                     />
//                     {destinationInfo.city && destinationInfo.province && (
//                         <p className="text-xs text-muted-foreground">
//                             Ciudad: {destinationInfo.city}, Provincia: {destinationInfo.province}
//                         </p>
//                     )}
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                     {/* Date Picker */}
//                     <div className="space-y-2">
//                         <Label>Fecha del viaje</Label>
//                         <Popover>
//                             <PopoverTrigger asChild>
//                                 <Button
//                                     variant="outline"
//                                     className="w-full justify-start text-left font-normal"
//                                 >
//                                     <CalendarIcon className="mr-2 h-4 w-4" />
//                                     {tripDate ? format(tripDate, 'PPP', { locale: es }) : 'Seleccionar fecha'}
//                                 </Button>
//                             </PopoverTrigger>
//                             <PopoverContent className="w-auto p-0" align="start">
//                                 <Calendar
//                                     mode="single"
//                                     disabled={disabledDays}
//                                     selected={tripDate}
//                                     onSelect={setTripDate}
//                                     autoFocus
//                                     locale={es}
//                                     defaultMonth={today}
//                                     startMonth={today}
//                                     endMonth={maxDate}
//                                 />
//                             </PopoverContent>
//                         </Popover>
//                     </div>

//                     {/* Time Picker */}
//                     <div className="space-y-2">
//                         <Label>Hora de salida</Label>
//                         <Select onValueChange={setDepartureTime}>
//                             <SelectTrigger className="w-full">
//                                 <SelectValue placeholder={`
//                                     ${getAvailableTimeOptions().length > 0 ? 'Seleccionar hora' : 'No hay horas disponibles'}`}>
//                                     {departureTime ? (
//                                         <>
//                                             <Clock className="mr-2 h-4 w-4 inline" />
//                                             {departureTime}
//                                         </>
//                                     ) : "Seleccionar hora"}
//                                 </SelectValue>
//                             </SelectTrigger>
//                             <SelectContent>
//                                 {getAvailableTimeOptions().map((option) => (
//                                     <SelectItem key={option.value} value={option.value}>
//                                         {option.label}
//                                     </SelectItem>
//                                 ))}
//                             </SelectContent>
//                         </Select>
//                     </div>
//                 </div>

//                 <Button
//                     type="submit"
//                     disabled={isLoading || !isLoaded || isGeocoding}
//                     className="w-full"
//                 >
//                     {isLoading || isGeocoding ? (
//                         <>
//                             <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                             Calculando...
//                         </>
//                     ) : !isLoaded ? (
//                         <>
//                             <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                             Cargando Google Maps...
//                         </>
//                     ) : (
//                         'Calcular Ruta'
//                     )}
//                 </Button>
//             </form>

//             {routeInfo && routeInfo.routes && routeInfo.routes.length > 0 && (
//                 <>

//                     <Card className="mt-6">
//                         <CardHeader>
//                             <CardTitle>Información de la Ruta</CardTitle>
//                         </CardHeader>
//                         <CardContent className="space-y-4">
//                             <div className="grid grid-cols-2 gap-4">
//                                 <div>
//                                     <p className="text-sm text-muted-foreground">Distancia</p>
//                                     <p className="text-lg font-medium">
//                                         {(routeInfo.routes[0].distanceMeters / 1000).toFixed(1)} km
//                                     </p>
//                                 </div>
//                                 <div>
//                                     <p className="text-sm text-muted-foreground">Duración</p>
//                                     <p className="text-lg font-medium">
//                                         {formatDuration(routeInfo.routes[0].duration)}
//                                     </p>
//                                 </div>
//                             </div>

//                             {tripDate && departureTime && (
//                                 <div>
//                                     <p className="text-sm text-muted-foreground">Fecha y hora de salida</p>
//                                     <p className="text-lg font-medium">
//                                         {format(tripDate, 'PPP', { locale: es })} - {departureTime}
//                                     </p>
//                                 </div>
//                             )}

//                             {routeInfo.routes[0].travelAdvisory?.tollInfo?.estimatedPrice && (
//                                 <div>
//                                     <p className="text-sm text-muted-foreground">Costo estimado de Peaje</p>
//                                     <p className="text-lg font-medium">
//                                         {routeInfo.routes[0].travelAdvisory?.tollInfo?.estimatedPrice.map((price, index) => (
//                                             <span key={index}>
//                                                 ${price.units}
//                                             </span>
//                                         ))}
//                                     </p>
//                                 </div>
//                             )}

//                             {/* Display city and province information */}
//                             <div className="border-t pt-3">
//                                 <div className="mb-2">
//                                     <span className="text-sm font-medium">Origen: </span>
//                                     <span className="text-sm">{origin}</span>
//                                     {originInfo.city && originInfo.province && (
//                                         <p className="text-xs text-muted-foreground">
//                                             {originInfo.city !== originInfo.province ? originInfo.city : ''}, {originInfo.province}
//                                         </p>
//                                     )}
//                                 </div>
//                                 <div>
//                                     <span className="text-sm font-medium">Destino: </span>
//                                     <span className="text-sm">{destination}</span>
//                                     {destinationInfo.city && destinationInfo.province && (
//                                         <p className="text-xs text-muted-foreground">
//                                             {destinationInfo.city}, {destinationInfo.province}
//                                         </p>
//                                     )}
//                                 </div>
//                             </div>
//                         </CardContent>
//                         <CardFooter>
//                             <Link href={getGoogleMapsUrl(origin, destination)}
//                                 target="_blank"
//                                 rel="noopener noreferrer"
//                                 className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
//                                 <ExternalLink className="h-4 w-4 mr-1" />
//                                 Ver ruta en Google Maps
//                             </Link>
//                         </CardFooter>
//                     </Card>
//                     <TravelCostCalculator
//                         routeInfo={routeInfo}
//                         fuels={fuels}
//                         onPriceChange={setCalculatedPrice}
//                         onCarChange={setSelectedCar}
//                     />

//                     <TripPreferencesForm
//                         onPreferencesChange={setTripPreferences}
//                     />

//                     {calculatedPrice.priceGuide > 0 && (
//                         <div className="mt-6 flex justify-end">
//                             <Button
//                                 size="lg"
//                                 className="bg-primary hover:bg-primary/90"
//                                 onClick={handleCreateTrip}
//                                 disabled={isLoading}
//                             >
//                                 {isLoading ? (
//                                     <>
//                                         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                                         Creando viaje...
//                                     </>
//                                 ) : (
//                                     `Crear viaje por $${calculatedPrice.price.toFixed(2)}`
//                                 )}
//                             </Button>
//                         </div>
//                     )}
//                 </>
//             )}
//         </div>
//     )
// }

// export default RouteCalculator

'use client'

import { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { calculateRoute } from '@/actions/route/calculate-route'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { createTrip } from '@/actions/trip/create-trip'
import { LuggageAllowance } from '@prisma/client'
import { TripData } from '@/types/trip-types'
import { RouteResponse } from '@/types/route-types'
import { getGoogleMapsUrl } from '@/utils/helpers/getGoogleMapsUrl'
import { formatDuration } from '@/utils/format/formatDuration'

import { useGoogleMapsScript } from '@/hooks/ui/useGoogleMapsScripts'
import { useLocationInput } from '@/hooks/map/useLocationInput'

import LocationInput from './LocationInput'
import DateTimePicker from './DateTimePicker'
import RouteInfoCard from './RouteInfoCard'
import TravelCostCalculator from './TravelCostCalculator'
import TripPreferencesForm from './TripPreferencesForm'
import { useTripPreferencesStore } from '@/store/trip-preferences-store'
import { useLoadingStore } from '@/store/loadingStore'
import { useAsyncLoading } from '@/hooks/ui/useAsyncLoading'
import { LoadingButton } from '@/components/ui/loading-button'

interface RouteCalculatorProps {
    initialOrigin?: string
    initialDestination?: string
    apiKey: string
    fuels: any
}

interface FormValues {
    tripDate: Date
    departureTime: string
  }

const RouteCalculator = ({
    initialOrigin = '',
    initialDestination = '',
    apiKey,
    fuels
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
          googleMapsUrl: getGoogleMapsUrl(origin.value, destination.value),
          date: tripDate, // Esta es la fecha sin hora
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
        
        // Enviar los datos al servidor
        const result = await executeWithLoading(
          'creatingTrip',
          async () => createTrip(tripData),
          { showToastOnError: true }
        );
        
        if (result?.success) {
          toast.success('Viaje creado exitosamente');
          router.push('/viajes');
        }
      };

      return (
        <div className="max-w-2xl mx-auto">
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
              disabled={!isLoaded}
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
              />
              
              <TravelCostCalculator
                routeInfo={routeInfo}
                fuels={fuels}
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
                  >
                    Crear viaje por ${calculatedPrice.price.toFixed(2)}
                  </LoadingButton>
                </div>
              )}
            </>
          )}
        </div>
      )
    }
    
    export default RouteCalculator