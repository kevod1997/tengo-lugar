'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card'
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import {
  CarIcon,
  ArrowRightIcon,
  LuggageIcon,
  PawPrintIcon,
  BabyIcon,
  CigaretteOffIcon,
  InfoIcon,
  UserIcon
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/header/header'
import { TripReservationModal } from './TripReservationModal'

// Define props to receive trip data from server component
interface TripDetailProps {
  trip: any; // You should define a proper Trip type
}

export default function TripDetail({ trip }: TripDetailProps) {
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false)

  // Format date and time
  const tripDate = format(new Date(trip.date), 'EEEE d MMMM, yyyy', { locale: es })
  const departureTime = format(new Date(trip.departureTime), 'HH:mm', { locale: es })
  
  // Get car details
  const carModel = trip.driverCar.car.carModel.model
  const carBrand = trip.driverCar.car.carModel.brand.name
  const carYear = trip.driverCar.car.carModel.year
  const carFuelType = trip.driverCar.car.carModel.fuelType
  
  // Get driver details
  const driverFirstName = trip.driverCar.driver.user?.name.split(' ')[0]
  const profileImageKey = trip.driverCar.driver.user?.profileImageKey

  // Service fee rate (would come from the trip or app settings)
  const serviceFeeRate = trip.fee || 10 // Example: 10% service fee

  // Translate fuel type
  const fuelTypeMap: Record<string, string> = {
    'DIESEL': 'Diésel',
    'NAFTA': 'Gasolina',
    'ELECTRICO': 'Eléctrico',
    'HIBRIDO': 'Híbrido',
    'GNC': 'GNC'
  }
  
  // Translate luggage allowance
  const luggageMap: Record<string, string> = {
    'SMALL': 'Pequeño',
    'MEDIUM': 'Mediano',
    'LARGE': 'Grande',
    'EXTRA': 'Extra grande'
  }
  
  // Translate trip status
  const statusMap: Record<string, { label: string, color: string }> = {
    'PENDING': { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
    'ACTIVE': { label: 'Activo', color: 'bg-green-100 text-green-800' },
    'COMPLETED': { label: 'Completado', color: 'bg-blue-100 text-blue-800' },
    'CANCELLED': { label: 'Cancelado', color: 'bg-red-100 text-red-800' }
  }

  return (
    <>
      <Header 
        breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Buscar Viajes', href: '/buscar-viaje' },
            { label: 'Detalles del viaje' },
        ]} />
      <div className="container mx-auto py-6 px-4 lg:px-8 max-w-5xl">
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">
                  {trip.originCity} a {trip.destinationCity}
                </CardTitle>
                <CardDescription>
                  {tripDate} • {departureTime}
                </CardDescription>
              </div>
              <Badge 
                className={`${statusMap[trip.status].color} px-3 py-1 text-sm font-medium`}
              >
                {statusMap[trip.status].label}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Route information */}
            <div className="bg-slate-50 rounded-lg p-4 space-y-4">
              <div className="flex items-start space-x-3">
                <div className="mt-1">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div className="h-12 w-0.5 bg-slate-300 mx-auto my-1"></div>
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                </div>
                <div className="space-y-4 flex-1">
                  <div>
                    <p className="font-medium text-slate-900">{trip.originCity}, {trip.originProvince}</p>
                    <p className="text-sm text-slate-500">{trip.originAddress}</p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{trip.destinationCity}, {trip.destinationProvince}</p>
                    <p className="text-sm text-slate-500">{trip.destinationAddress}</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                <div className="bg-white rounded-md p-3 border border-slate-200">
                  <p className="text-xs text-slate-500">Distancia</p>
                  <p className="font-medium">{Math.round(trip.distance)} km</p>
                </div>
                <div className="bg-white rounded-md p-3 border border-slate-200">
                  <p className="text-xs text-slate-500">Duración</p>
                  <p className="font-medium">{trip.duration}</p>
                </div>
                <div className="bg-white rounded-md p-3 border border-slate-200">
                  <p className="text-xs text-slate-500">Asientos</p>
                  <p className="font-medium">{trip.availableSeats} disponibles</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <Link 
                  href={trip.googleMapsUrl || '#'} 
                  target="_blank" 
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                  >
                  Ver ruta en Google Maps
                  <ArrowRightIcon className="h-4 w-4 ml-1" />
                </Link>
                
                {/* Driver information - More compact */}
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    {profileImageKey ? (
                      <Image 
                      src={profileImageKey} 
                      alt={driverFirstName}
                      width={32}
                      height={32}
                      />
                    ) : (
                      <UserIcon className="h-4 w-4" />
                    )}
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{driverFirstName}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Trip details */}
            <Tabs defaultValue="price" className="mt-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="price">Precio</TabsTrigger>
                <TabsTrigger value="details">Detalles</TabsTrigger>
                <TabsTrigger value="car">Vehículo</TabsTrigger>
              </TabsList>
              
              <TabsContent value="price" className="space-y-4 py-4">
                <div className="bg-white rounded-lg border p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">Precio por asiento</h4>
                    <p className="text-xl font-bold">${trip.price}</p>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    {trip.hasTolls && trip.tollEstimatedPrice && (
                        <div className="flex justify-between">
                        <span className="text-slate-600">Peajes estimados</span>
                        <span>${trip.tollEstimatedPrice}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between border-t pt-2 mt-2">
                      <span className="font-medium">Tarifa de servicio</span>
                      <span>{serviceFeeRate}%</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="details" className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <LuggageIcon className="h-5 w-5 text-slate-500" />
                    <span>Equipaje: {luggageMap[trip.luggageAllowance]}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PawPrintIcon className="h-5 w-5 text-slate-500" />
                    <span>{trip.allowPets ? 'Mascotas permitidas' : 'No se permiten mascotas'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BabyIcon className="h-5 w-5 text-slate-500" />
                    <span>{trip.allowChildren ? 'Niños permitidos' : 'No se permiten niños'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CigaretteOffIcon className="h-5 w-5 text-slate-500" />
                    <span>{trip.smokingAllowed ? 'Se permite fumar' : 'No se permite fumar'}</span>
                  </div>
                </div>
                
                {trip.additionalNotes && (
                    <div className="mt-4 border-t pt-4">
                    <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                      <InfoIcon className="h-4 w-4" />
                      Notas adicionales
                    </h4>
                    <p className="text-slate-700">{trip.additionalNotes}</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="car" className="space-y-4 py-4">
                <div className="bg-white rounded-lg border p-4">
                  <h4 className="font-medium flex items-center gap-2 mb-2">
                    <CarIcon className="h-4 w-4" />
                    Información del vehículo
                  </h4>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <p className="text-sm text-slate-500">Marca y Modelo</p>
                      <p className="font-medium">{carBrand} {carModel}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Año</p>
                      <p className="font-medium">{carYear}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Combustible</p>
                      <p className="font-medium">{carFuelType ? fuelTypeMap[carFuelType] || carFuelType : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Patente</p>
                      <p className="font-medium">{trip.driverCar.car.plate}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          
          <CardFooter className="pb-4">
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => setIsReservationModalOpen(true)}
              disabled={trip.status !== 'ACTIVE' && trip.status !== 'PENDING'}
            >
              Reservar asiento
            </Button>
          </CardFooter>
        </Card>
      </div>

      <TripReservationModal
        isOpen={isReservationModalOpen}
        onClose={() => setIsReservationModalOpen(false)}
        tripId={trip.id}
        basePrice={trip.price}
        availableSeats={trip.availableSeats}
        serviceFeeRate={serviceFeeRate}
      />
    </>
  )
}