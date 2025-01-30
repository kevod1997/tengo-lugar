// 'use client'

// import { useState, useRef } from 'react'
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Alert, AlertDescription } from "@/components/ui/alert"
// import { Loader2 } from 'lucide-react'
// import { useLoadScript, Autocomplete } from '@react-google-maps/api'
// import { calculateRoute } from '@/actions/route/calculate-route'

// interface RouteCalculatorProps {
//   onRouteCalculated?: (routeData: any) => void;
// }

// interface FormattedPlace {
//   formatted_address: string;
//   geometry: {
//     location: {
//       latitude: number;
//       longitude: number;
//     };
//   };
//   place_id: string;
//   name: string;
// }

// function formatPlaceResult(place: google.maps.places.PlaceResult): FormattedPlace {
//   return {
//     formatted_address: place.formatted_address || '',
//     geometry: {
//       location: {
//         latitude: place.geometry?.location?.lat() || 0,
//         longitude: place.geometry?.location?.lng() || 0
//       }
//     },
//     place_id: place.place_id || '',
//     name: place.name || ''
//   };
// }

// const libraries: ("places")[] = ["places"];

// export function RouteCalculator({ onRouteCalculated }: RouteCalculatorProps) {
//   const [origin, setOrigin] = useState('')
//   const [destination, setDestination] = useState('')
//   const [originPlace, setOriginPlace] = useState<FormattedPlace | null>(null);
//   const [destinationPlace, setDestinationPlace] = useState<FormattedPlace | null>(null);
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)

//   // Estas referencias serán para los componentes Autocomplete
//   const originAutocomplete = useRef<google.maps.places.Autocomplete | null>(null)
//   const destinationAutocomplete = useRef<google.maps.places.Autocomplete | null>(null)
//   const originRef = useRef<HTMLInputElement>(null)
//   const destinationRef = useRef<HTMLInputElement>(null)

//   const { isLoaded, loadError } = useLoadScript({
//     googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
//     libraries,
//     region: 'AR',
//     language: 'es',
//   })

//   const handleCalculateRoute = async () => {
//     console.log('--- Inicio handleCalculateRoute ---');
//     console.log('originPlace:', originPlace);
//     console.log('destinationPlace:', destinationPlace);
//     console.log('originPlace geometry:', originPlace?.geometry);
//     console.log('destinationPlace geometry:', destinationPlace?.geometry);
//     console.log('originPlace location:', originPlace?.geometry?.location);
//     console.log('destinationPlace location:', destinationPlace?.geometry?.location);
//     console.log('Loading state:', loading);
//     console.log('Button disabled:', loading || !originPlace?.geometry?.location || !destinationPlace?.geometry?.location);

//     if (!originPlace?.geometry?.location || !destinationPlace?.geometry?.location) {
//       console.log('Validación falló: ubicaciones no válidas');
//       setError('Por favor, seleccione ubicaciones válidas del autocompletado.')
//       return
//     }

//     setLoading(true)
//     setError(null)

//     try {
//       const routeData = await calculateRoute({
//         origin: {
//           latitude: originPlace.geometry.location.latitude,
//           longitude: originPlace.geometry.location.longitude
//         },
//         destination: {
//           latitude: destinationPlace.geometry.location.latitude,
//           longitude: destinationPlace.geometry.location.longitude
//         },
//         vehicleType: 'GASOLINE',
//         tollPasses: ['AR_TELEPASE']
//       })

//       console.log('Server Action Response:', routeData);

//       if (!routeData.success) {
//         throw new Error(routeData.error?.message || 'Error al calcular la ruta')
//       }

//       if (onRouteCalculated && routeData.data) {
//         onRouteCalculated(routeData.data)
//       }
//     } catch (error) {
//       console.error('Error calculating route:', error)
//       setError('Hubo un error al calcular la ruta. Por favor, intente nuevamente.')
//     }
//     setLoading(false)
//   }

//   if (!isLoaded) return <div>Cargando...</div>
//   if (loadError) return <div>Error al cargar Google Maps</div>

//   return (
//     <Card className="w-full max-w-md mx-auto">
//     <CardContent>
//       <form onSubmit={(e) => { e.preventDefault(); handleCalculateRoute(); }} className="space-y-4">
//         <div>
//           <Autocomplete
//             onLoad={(autocomplete) => {
//               originAutocomplete.current = autocomplete;
//               autocomplete.setComponentRestrictions({ country: 'ar' });
//               // Especificar solo los campos que necesitamos
//               autocomplete.setFields([
//                 'formatted_address',
//                 'geometry',
//                 'place_id',
//                 'name'
//               ]);
//             }}
//             onPlaceChanged={() => {
//               if (originAutocomplete.current) {
//                 const place = originAutocomplete.current.getPlace();
//                 const formattedPlace = formatPlaceResult(place);
//                 console.log('Formatted origin place:', formattedPlace);
//                 setOriginPlace(formattedPlace);
//                 setOrigin(place.formatted_address || '');
//               }
//             }}
//           >
//             <Input
//               ref={originRef}
//               placeholder="Ingrese el origen"
//               value={origin}
//               onChange={(e) => setOrigin(e.target.value)}
//               required
//             />
//           </Autocomplete>
//         </div>

//         <div>
//           <Autocomplete
//             onLoad={(autocomplete) => {
//               destinationAutocomplete.current = autocomplete;
//               autocomplete.setComponentRestrictions({ country: 'ar' });
//               autocomplete.setFields([
//                 'formatted_address',
//                 'geometry',
//                 'place_id',
//                 'name'
//               ]);
//             }}
//             onPlaceChanged={() => {
//               if (destinationAutocomplete.current) {
//                 const place = destinationAutocomplete.current.getPlace();
//                 const formattedPlace = formatPlaceResult(place);
//                 console.log('Formatted destination place:', formattedPlace);
//                 setDestinationPlace(formattedPlace);
//                 setDestination(place.formatted_address || '');
//               }
//             }}
//           >
//             <Input
//               ref={destinationRef}
//               placeholder="Ingrese el destino"
//               value={destination}
//               onChange={(e) => setDestination(e.target.value)}
//               required
//             />
//           </Autocomplete>
//         </div>

//         <Button 
//           type="submit" 
//           className="w-full" 
//           disabled={loading || !originPlace?.geometry.location.latitude || !destinationPlace?.geometry.location.latitude}
//         >
//           {loading ? (
//             <>
//               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//               Calculando...
//             </>
//           ) : (
//             'Calcular Ruta'
//           )}
//         </Button>
//       </form>

//       {error && (
//         <Alert variant="destructive" className="mt-4">
//           <AlertDescription>{error}</AlertDescription>
//         </Alert>
//       )}
//     </CardContent>
//   </Card>
//   )
// }