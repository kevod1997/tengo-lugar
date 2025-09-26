// src/app/viajes/[id]/components/PassengersList.tsx
'use client'

import { useState } from 'react'
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
  TabsTrigger,
} from "@/components/ui/tabs"
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  User,
  MessageSquare,
  Check,
  X,
  AlertCircle,
  Calendar,
  Clock
} from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { formatDatetoLocaleDateString } from '@/utils/format/formatDate'
import { managePassenger } from '@/actions/trip/manage-passenger'

type PassengersListProps = {
  trip: any
}

export default function PassengersList({ trip }: PassengersListProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [passengerToCancel, setPassengerToCancel] = useState<{id: string, name: string} | null>(null)
  
  // Sort and filter passengers
  const pendingPassengers = trip.passengers.filter(
    (p: any) => p.reservationStatus === 'PENDING_APPROVAL'
  )
  
  const approvedPassengers = trip.passengers.filter(
    (p: any) => ['APPROVED', 'CONFIRMED'].includes(p.reservationStatus)
  )
  
  const cancelledPassengers = trip.passengers.filter(
    (p: any) => ['CANCELLED_BY_DRIVER', 'CANCELLED_BY_PASSENGER'].includes(p.reservationStatus)
  )

  // Calculate total seats
  const totalSeatsReserved = approvedPassengers.reduce(
    (total: number, p: any) => total + p.seatsReserved, 0
  )
  
  const seatsAvailable = trip.availableSeats - totalSeatsReserved

  // Helper function to get only the first name
  const getFirstName = (fullName: string): string => {
    return fullName.split(' ')[0]
  }

  // Handle passenger status updates
  const handlePassengerAction = async (passengerId: string, action: 'approve' | 'reject') => {
    setIsSubmitting(true)
    
    try {
      const result = await managePassenger({
        tripId: trip.id,
        passengerTripId: passengerId,
        action
      })
      
      toast.success(
        action === 'approve' ? 'Pasajero aprobado' : 'Pasajero rechazado', 
        { description: result.message }
      )
      
      router.refresh()
    } catch (error) {
      toast.error('Error al procesar', {
        description: error instanceof Error ? error.message : 'Ocurrió un error al procesar la acción'
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
      case 'APPROVED':
        return <Badge className="bg-blue-100 text-blue-800">Aprobado</Badge>
      case 'CONFIRMED':
        return <Badge className="bg-green-100 text-green-800">Confirmado</Badge>
      case 'CANCELLED_BY_DRIVER':
        return <Badge className="bg-red-100 text-red-800">Cancelado por conductor</Badge>
      case 'CANCELLED_BY_PASSENGER':
        return <Badge className="bg-red-100 text-red-800">Cancelado por pasajero</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="bg-white p-4 rounded-lg border flex-1">
          <h3 className="font-medium text-lg">Resumen de asientos</h3>
          <div className="mt-2 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Total de asientos:</span>
              <span>{trip.availableSeats}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Asientos ocupados:</span>
              <span>{totalSeatsReserved}</span>
            </div>
            <div className="flex justify-between text-sm font-medium">
              <span>Asientos disponibles:</span>
              <span>{seatsAvailable}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border flex-1">
          <h3 className="font-medium text-lg">Solicitudes pendientes</h3>
          <div className="mt-2">
            {pendingPassengers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay solicitudes pendientes</p>
            ) : (
              <p className="text-sm">
                Tienes <span className="font-medium">{pendingPassengers.length}</span> solicitudes pendientes de aprobación
              </p>
            )}
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="pending" className="relative">
            Pendientes
            {pendingPassengers.length > 0 && (
              <Badge className="ml-2">{pendingPassengers.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">
            Aprobados
            {approvedPassengers.length > 0 && (
              <Badge variant="outline" className="ml-2">{approvedPassengers.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Cancelados
            {cancelledPassengers.length > 0 && (
              <Badge variant="outline" className="ml-2">{cancelledPassengers.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="mt-6">
          {pendingPassengers.length === 0 ? (
            <div className="text-center p-10 bg-muted/30 rounded-lg">
              <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay solicitudes pendientes</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {pendingPassengers.map((passenger: any) => (
                <Card key={passenger.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar>
                          <AvatarImage src={passenger.passenger.user.profileImageKey} />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base">{getFirstName(passenger.passenger.user.name)}</CardTitle>
                          <CardDescription className="text-xs">
                            Asientos: {passenger.seatsReserved}
                          </CardDescription>
                        </div>
                      </div>
                      {getStatusBadge(passenger.reservationStatus)}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pb-2 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Solicitud: {formatDatetoLocaleDateString(passenger.createdAt)}</span>
                      </div>
                      
                      {passenger.reservationMessage && (
                        <div className="flex items-start gap-2 mt-2">
                          <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="font-medium text-xs mb-1">Mensaje del pasajero:</p>
                            <p className="text-sm">{passenger.reservationMessage}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between pt-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={isSubmitting}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Rechazar
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Rechazar solicitud?</AlertDialogTitle>
                          <AlertDialogDescription>
                            ¿Estás seguro de que deseas rechazar la solicitud de {getFirstName(passenger.passenger.user.name)}?
                            Esta acción no se puede deshacer y el pasajero será notificado.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handlePassengerAction(passenger.id, 'reject')}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Confirmar rechazo
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <Button
                      size="sm"
                      onClick={() => handlePassengerAction(passenger.id, 'approve')}
                      disabled={isSubmitting || seatsAvailable < passenger.seatsReserved}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Aprobar
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="approved" className="mt-6">
          {approvedPassengers.length === 0 ? (
            <div className="text-center p-10 bg-muted/30 rounded-lg">
              <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay pasajeros aprobados</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {approvedPassengers.map((passenger: any) => (
                <Card key={passenger.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar>
                          <AvatarImage src={passenger.passenger.user.profileImageKey} />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base">{getFirstName(passenger.passenger.user.name)}</CardTitle>
                          <CardDescription className="text-xs">
                            Asientos: {passenger.seatsReserved}
                          </CardDescription>
                        </div>
                      </div>
                      {getStatusBadge(passenger.reservationStatus)}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pb-2 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Aprobado: {formatDatetoLocaleDateString(passenger.updatedAt)}</span>
                      </div>
                      
                      {passenger.payment && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>Pago: {passenger.payment.status === 'COMPLETED' ? 'Completado' : 'Pendiente'}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-end pt-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={isSubmitting}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancelar reservación
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Cancelar reservación?</AlertDialogTitle>
                          <AlertDialogDescription>
                            ¿Estás seguro de que deseas cancelar la reservación de {getFirstName(passenger.passenger.user.name)}?
                            Esta acción no se puede deshacer y el pasajero será notificado.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handlePassengerAction(passenger.id, 'reject')}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Confirmar cancelación
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="cancelled" className="mt-6">
          {cancelledPassengers.length === 0 ? (
            <div className="text-center p-10 bg-muted/30 rounded-lg">
              <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay pasajeros cancelados</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {cancelledPassengers.map((passenger: any) => (
                <Card key={passenger.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar>
                          <AvatarImage src={passenger.passenger.user.profileImageKey} />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base">{getFirstName(passenger.passenger.user.name)}</CardTitle>
                          <CardDescription className="text-xs">
                            Asientos: {passenger.seatsReserved}
                          </CardDescription>
                        </div>
                      </div>
                      {getStatusBadge(passenger.reservationStatus)}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pb-2 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Cancelado: {formatDatetoLocaleDateString(passenger.updatedAt)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}