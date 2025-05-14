// src/app/viajes/[id]/components/TripManagement.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertTriangle,
  Calendar,
  Clock,
  DollarSign,
  Map,
  MapPin,
  Settings,
  Trash2,
  Users,
  Car,
  Cigarette,
  PenSquare
} from 'lucide-react'
import { cancelTrip } from '@/actions/trip/cancel-trip'
import { updateTripPreferences } from '@/actions/trip/update-trip-preferences'

type TripManagementProps = {
  trip: any
}

export default function TripManagement({ trip }: TripManagementProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Format departure time for input field
  const formatTimeForInput = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  const [preferences, setPreferences] = useState({
    autoApproveReservations: trip.autoApproveReservations,
    allowPets: trip.allowPets,
    allowChildren: trip.allowChildren,
    smokingAllowed: trip.smokingAllowed,
    departureTime: formatTimeForInput(trip.departureTime),
    additionalNotes: trip.additionalNotes || ''
  })

  const handleCancelTrip = async () => {
    setIsSubmitting(true)

    try {
      await cancelTrip(trip.id, true)

      toast.success('Viaje cancelado', {
        description: 'El viaje ha sido cancelado exitosamente'
      })

      router.push('/viajes')
    } catch (error) {
      toast.error('Error al cancelar', {
        description: error instanceof Error ? error.message : 'No se pudo cancelar el viaje'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdatePreferences = async () => {
    setIsSubmitting(true)

    try {
      // Create the date object for departure time
      // We keep the original date but update the time
      const originalDate = new Date(trip.departureTime);
      const [hours, minutes] = preferences.departureTime.split(':').map(Number);

      const newDepartureTime = new Date(originalDate);
      newDepartureTime.setHours(hours, minutes, 0, 0);

      // Validate that the new departure time is in the future
      if (newDepartureTime < new Date()) {
        toast.error('Error de validación', {
          description: 'La hora de salida debe ser en el futuro'
        });
        setIsSubmitting(false);
        return;
      }

      await updateTripPreferences(trip.id, {
        ...preferences,
        departureTime: newDepartureTime.toISOString()
      })

      toast.success('Preferencias actualizadas', {
        description: 'Las preferencias del viaje han sido actualizadas'
      })

      router.refresh()
    } catch (error) {
      toast.error('Error al actualizar', {
        description: error instanceof Error ? error.message : 'No se pudieron actualizar las preferencias'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const canEditPreferences = ['PENDING', 'ACTIVE'].includes(trip.status)
  const canCancel = ['PENDING', 'ACTIVE'].includes(trip.status)

  // Check if trip is in the past
  const tripInPast = new Date(trip.departureTime) < new Date()

  return (
    <div className="space-y-6">
      {/* Trip Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Información del viaje</CardTitle>
          <CardDescription>Detalles generales del viaje</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Origen</p>
                  <p className="text-sm text-muted-foreground">{trip.originCity}, {trip.originProvince}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Map className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Destino</p>
                  <p className="text-sm text-muted-foreground">{trip.destinationCity}, {trip.destinationProvince}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Fecha</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(trip.date).toLocaleDateString('es-AR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Hora de salida actual</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(trip.departureTime).toLocaleTimeString('es-AR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Precio por asiento</p>
                  <p className="text-sm text-muted-foreground">${trip.price}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Asientos</p>
                  <p className="text-sm text-muted-foreground">
                    {trip.availableSeats} disponibles
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Departure Time and Notes Card */}
      <Card>
        <CardHeader>
          <CardTitle>Horario y notas</CardTitle>
          <CardDescription>Actualiza la hora de salida y notas del viaje</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="departure-time" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Hora de salida
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="departure-time"
                type="time"
                value={preferences.departureTime}
                onChange={(e) => setPreferences(prev => ({ ...prev, departureTime: e.target.value }))}
                disabled={!canEditPreferences || isSubmitting || tripInPast}
                className="w-full"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Cambiar la hora de salida notificará a los pasajeros aprobados.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="additional-notes" className="flex items-center gap-2">
              <PenSquare className="h-4 w-4" />
              Notas adicionales
            </Label>
            <Textarea
              id="additional-notes"
              value={preferences.additionalNotes}
              onChange={(e) => setPreferences(prev => ({ ...prev, additionalNotes: e.target.value }))}
              disabled={!canEditPreferences || isSubmitting}
              placeholder="Agrega notas adicionales sobre el viaje..."
              className="min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground">
              Información adicional para los pasajeros: puntos de encuentro, estacionamiento, etc.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleUpdatePreferences}
            disabled={!canEditPreferences || isSubmitting || tripInPast}
            className="w-full"
          >
            Guardar cambios
          </Button>
        </CardFooter>
      </Card>

      {/* Preferences Card */}
      <Card>
        <CardHeader>
          <CardTitle>Preferencias</CardTitle>
          <CardDescription>Modifica las configuraciones del viaje</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between space-x-2">
              <div className="flex items-center space-x-2">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="auto-approve" className="flex-1">Aprobación automática</Label>
              </div>
              <Switch
                id="auto-approve"
                checked={preferences.autoApproveReservations}
                onCheckedChange={(checked) =>
                  setPreferences(prev => ({ ...prev, autoApproveReservations: checked }))
                }
                disabled={!canEditPreferences || isSubmitting}
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <div className="flex items-center space-x-2">
                <Car className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="allow-pets" className="flex-1">Permitir mascotas</Label>
              </div>
              <Switch
                id="allow-pets"
                checked={preferences.allowPets}
                onCheckedChange={(checked) =>
                  setPreferences(prev => ({ ...prev, allowPets: checked }))
                }
                disabled={!canEditPreferences || isSubmitting}
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="allow-children" className="flex-1">Permitir niños</Label>
              </div>
              <Switch
                id="allow-children"
                checked={preferences.allowChildren}
                onCheckedChange={(checked) =>
                  setPreferences(prev => ({ ...prev, allowChildren: checked }))
                }
                disabled={!canEditPreferences || isSubmitting}
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <div className="flex items-center space-x-2">
                <Cigarette className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="smoking-allowed" className="flex-1">Permitir fumar</Label>
              </div>
              <Switch
                id="smoking-allowed"
                checked={preferences.smokingAllowed}
                onCheckedChange={(checked) =>
                  setPreferences(prev => ({ ...prev, smokingAllowed: checked }))
                }
                disabled={!canEditPreferences || isSubmitting}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleUpdatePreferences}
            disabled={!canEditPreferences || isSubmitting || tripInPast}
            className="w-full"
          >
            Guardar preferencias
          </Button>
        </CardFooter>
      </Card>

      {/* Cancel Trip Card */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Zona peligrosa</CardTitle>
          <CardDescription>Esta acción no puede deshacerse</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Advertencia</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    Cancelar este viaje notificará a todos los pasajeros y liberará sus reservaciones.
                    Esta acción no puede deshacerse.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="w-full"
                disabled={!canCancel || isSubmitting || tripInPast}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Cancelar viaje
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no puede deshacerse. Cancelará tu viaje y notificará a todos los pasajeros.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleCancelTrip}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Sí, cancelar viaje
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </div>
  )
}