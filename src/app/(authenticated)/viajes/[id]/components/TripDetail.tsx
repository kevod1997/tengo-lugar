'use client'

import { useEffect, useState } from 'react'
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
  UserIcon,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { TripReservationModal } from './TripReservationModal'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cancelTrip } from '@/actions/trip/cancel-trip'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { UserProfileModal } from '@/components/user-profile-modal/UserProfileModal'
import { calculateAge } from '@/utils/helpers/calculate-age'
import { useLoadingStore } from '@/store/loadingStore'
import { PassengerTripInfo } from './PassengerTripInfo'
import { DriverTripHub } from './DriverTripHub'

interface TripDetailProps {
  trip: any;
  userId: string;
  canReserve: boolean;
  reserveReason?: string;
  availableSeats?: number;
  autoOpenReview?: boolean;
}

export default function TripDetail({
  trip,
  userId,
  canReserve,
  reserveReason,
  availableSeats = 0,
  autoOpenReview = false
}: TripDetailProps) {
  const router = useRouter()
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { stopLoading } = useLoadingStore();

  // 👇 Limpiar loading inmediatamente cuando el componente se hidrata
  useEffect(() => {
    stopLoading('navigatingToTrip');
  }, [stopLoading]); 

  // Extract role information
  const isDriver = trip.userRole?.isDriver || false;
  const isPassenger = trip.userRole?.isPassenger || false;
  const passengerInfo = trip.userRole?.passengerInfo;

  // Format date and time
  const tripDate = format(new Date(trip.date), 'EEEE d MMMM, yyyy', { locale: es })
  const departureTime = format(new Date(trip.departureTime), 'HH:mm', { locale: es })

  // Get car details
  const carModel = trip.driverCar.car.carModel.model
  const carBrand = trip.driverCar.car.carModel.brand.name
  const carYear = trip.driverCar.car.year
  const carFuelType = trip.driverCar.car.carModel.fuelType

  // Get driver details
  const driverFirstName = trip.driverCar.driver.user?.name.split(' ')[0]
  const profileImageKey = trip.driverCar.driver.user?.profileImageKey

  // Service fee rate
  const serviceFeeRate = trip.fee || 10

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

  // Trip status information
  const statusMap: Record<string, { label: string, color: string }> = {
    'PENDING': { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
    'ACTIVE': { label: 'Activo', color: 'bg-green-100 text-green-800' },
    'COMPLETED': { label: 'Completado', color: 'bg-blue-100 text-blue-800' },
    'CANCELLED': { label: 'Cancelado', color: 'bg-red-100 text-red-800' }
  }

  // Estados que permiten cancelación
  const cancellableReservationStatuses = ['PENDING_APPROVAL', 'WAITLISTED', 'APPROVED', 'CONFIRMED'];

  // Check if trip can be cancelled
  const canCancel = ['PENDING', 'ACTIVE'].includes(trip.status) && (isDriver || isPassenger) &&
    // If user is a passenger, check if their reservation is in a cancellable state
    (isDriver || (isPassenger && passengerInfo && cancellableReservationStatuses.includes(passengerInfo.reservationStatus)));

  // Calculate seats available
  const confirmedPassengers = trip.passengers.filter(
    (p: any) => ['CONFIRMED', 'APPROVED'].includes(p.reservationStatus)
  ).length

  // Get reservation button text based on status
  const getReservationButtonText = () => {
    if (!canReserve) {
      if (reserveReason === 'is_driver') return 'Eres el conductor';
      if (reserveReason === 'already_reserved') return 'Ya tienes una reserva';
      if (reserveReason === 'trip_full') return 'Viaje completo';
      if (reserveReason === 'trip_not_available') return 'Viaje no disponible';
      return 'No disponible';
    }
    return 'Reservar asiento';
  }

  // Handle trip cancellation
  const handleCancelTrip = async () => {
    setIsSubmitting(true)
    try {
      const result = await cancelTrip(trip.id, isDriver)

      toast.success('Viaje cancelado', {
        description: result.message || 'El viaje ha sido cancelado correctamente'
      })

      router.refresh()
    } catch (error) {
      toast.error('Error al cancelar', {
        description: error instanceof Error ? error.message : 'Hubo un problema al cancelar el viaje'
      })
    } finally {
      setIsSubmitting(false)
      setIsCancelDialogOpen(false)
    }
  }

  // Refresh the component when reservation modal is closed
  const handleReservationComplete = () => {
    setIsReservationModalOpen(false)
    router.refresh()
  }

  return (
    <>
      <div className="">
        {/* <div className="container mx-auto py-6 px-4 lg:px-8 max-w-5xl"> */}
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
            {/* Passenger Trip Hub - Collapsible section with participants and quick actions */}
            {isPassenger && passengerInfo && (
              <PassengerTripInfo
                reservation={{
                  status: passengerInfo.reservationStatus,
                  numberOfSeats: passengerInfo.seatsReserved,
                  totalPrice: passengerInfo.totalPrice
                }}
                trip={{
                  id: trip.id,
                  status: trip.status,
                  departureTime: new Date(trip.departureTime),
                  origin: trip.originAddress,
                  destination: trip.destinationAddress,
                  chatRoomId: trip.chatRoomId
                }}
                payment={passengerInfo.payment ? {
                  totalAmount: passengerInfo.payment.totalAmount,
                  status: passengerInfo.payment.status
                } : undefined}
                coPassengers={trip.passengers.filter(
                  (p: any) => ['CONFIRMED', 'APPROVED'].includes(p.reservationStatus) &&
                  p.passenger.userId !== passengerInfo.userId
                )}
                googleMapsUrl={trip.googleMapsUrl || '#'}
                userId={userId}
                autoOpenReview={autoOpenReview}
              />
            )}

            {/* Driver Trip Hub - Collapsible section with trip summary and quick actions */}
            {isDriver && (
              <DriverTripHub
                trip={{
                  id: trip.id,
                  status: trip.status,
                  departureTime: new Date(trip.departureTime),
                  origin: trip.originAddress,
                  destination: trip.destinationAddress,
                  chatRoomId: trip.chatRoomId,
                  pricePerSeat: trip.pricePerSeat,
                  confirmedPassengersCount: confirmedPassengers,
                  availableSeats: trip.availableSeats
                }}
                googleMapsUrl={trip.googleMapsUrl || '#'}
                userId={userId}
                autoOpenReview={autoOpenReview}
              />
            )}

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
                  <p className="font-medium">
                    {isDriver
                      ? `${confirmedPassengers}/${trip.availableSeats} ocupados`
                      : `${availableSeats} disponibles`
                    }
                  </p>
                </div>
              </div>

              <Link
                href={trip.googleMapsUrl || '#'}
                target="_blank"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                Ver ruta en Google Maps
                <ArrowRightIcon className="h-4 w-4 ml-1" />
              </Link>
            </div>

            {/* Enhanced Driver Information Card */}
            {!isDriver && (
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                  <CarIcon className="h-4 w-4 text-blue-600" />
                  Conductor del viaje
                </h4>
                <UserProfileModal
                  userId={trip.driverCar.driver.userId}
                  name={driverFirstName}
                  profileImage={profileImageKey || trip.driverCar.driver.user.image}
                  age={calculateAge(trip.driverCar.driver.user.birthDate)}
                  gender={trip.driverCar.driver.user.gender}
                  primaryRole="driver"
                  tripStats={{
                    asDriver: {
                      tripsCompleted: trip.driverCar.driver.totalTrips,
                      rating: trip.driverCar.driver.averageRating,
                      reviewCount: trip.driverCar.driver.totalReviews
                    }
                  }}
                >
                  <div className="flex items-center gap-4 cursor-pointer hover:bg-slate-50 p-3 rounded-lg transition-colors">
                    <Avatar className="h-14 w-14 border-2 border-white shadow-md">
                      {profileImageKey || trip.driverCar.driver.user.image ? (
                        <Image
                          src={profileImageKey || trip.driverCar.driver.user.image}
                          alt={driverFirstName}
                          width={56}
                          height={56}
                          className="object-cover"
                        />
                      ) : (
                        <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white w-full h-full flex items-center justify-center">
                          <UserIcon className="h-6 w-6" />
                        </div>
                      )}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-base text-slate-900 truncate">
                        {driverFirstName}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {trip.driverCar.driver.averageRating > 0 && (
                          <div className="flex items-center gap-1 text-sm text-amber-600">
                            <svg className="h-4 w-4 fill-amber-500" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="font-medium">{trip.driverCar.driver.averageRating.toFixed(1)}</span>
                          </div>
                        )}
                        <span className="text-sm text-slate-500">
                          {trip.driverCar.driver.totalTrips} {trip.driverCar.driver.totalTrips === 1 ? 'viaje' : 'viajes'}
                        </span>
                      </div>
                      <p className="text-xs text-blue-600 mt-1 hover:underline">
                        Ver perfil completo →
                      </p>
                    </div>
                  </div>
                </UserProfileModal>
              </div>
            )}

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
                    {(isDriver || (isPassenger && passengerInfo &&
                      ['APPROVED', 'CONFIRMED'].includes(passengerInfo.reservationStatus))) && (
                      <div>
                        <p className="text-sm text-slate-500">Patente</p>
                        <p className="font-medium">{trip.driverCar.car.plate}</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="pb-4 flex flex-col md:flex-row gap-3">
            {/* Main action buttons */}
            {isDriver && ['PENDING', 'ACTIVE'].includes(trip.status) && (
              <Button
                className="w-full md:flex-1"
                onClick={() => router.push(`/viajes/${trip.id}/pasajeros`)}
              >
                Gestionar pasajeros
              </Button>
            )}

            {canReserve && (
              <Button
                className="w-full md:flex-1"
                onClick={() => setIsReservationModalOpen(true)}
              >
                {getReservationButtonText()}
              </Button>
            )}
      
            {/* Cancel button as a separate styled button */}
            {canCancel && (
              <Button
                variant="outline"
                className="w-full md:flex-1 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                onClick={() => setIsCancelDialogOpen(true)}
              >
                Cancelar {isDriver ? 'viaje' : 'reserva'}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      {/* Reservation Modal */}
      <TripReservationModal
        isOpen={isReservationModalOpen}
        onClose={handleReservationComplete}
        tripId={trip.id}
        basePrice={trip.price}
        availableSeats={availableSeats}
        serviceFeeRate={serviceFeeRate}
      />

      {/* Cancellation Confirmation Dialog */}
      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{isDriver ? '¿Cancelar este viaje?' : '¿Cancelar tu reserva?'}</AlertDialogTitle>
            <AlertDialogDescription>
              {isDriver
                ? "Al cancelar este viaje, se notificará a todos los pasajeros confirmados y perderás tus reservas actuales."
                : "Al cancelar tu reserva, perderás tu lugar en este viaje y tendrás que volver a reservar si cambias de opinión."
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>No, mantener {isDriver ? 'viaje' : 'reserva'}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleCancelTrip()
              }}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? "Procesando..." : `Sí, cancelar ${isDriver ? 'viaje' : 'reserva'}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}