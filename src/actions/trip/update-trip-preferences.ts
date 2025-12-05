// src/actions/trip/update-trip-preferences.ts
'use server'

import { headers } from "next/headers";

import { ApiHandler } from "@/lib/api-handler";
import { auth } from "@/lib/auth";
import { ServerActionError } from "@/lib/exceptions/server-action-error";
import prisma from "@/lib/prisma";
import { logActionWithErrorHandling } from "@/services/logging/logging-service";
import { TipoAccionUsuario } from "@/types/actions-logs";
import { calculateHoursUntilDeparture } from "@/utils/helpers/time-restrictions-helper";
import { notifyUser } from "@/utils/notifications/notification-helpers";

interface TripPreferences {
  autoApproveReservations: boolean;
  allowPets: boolean;
  allowChildren: boolean;
  smokingAllowed: boolean;
  departureTime?: string; // New field for departure time modification
  additionalNotes?: string; // New field for additional notes
}

export async function updateTripPreferences(tripId: string, preferences: TripPreferences) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw ServerActionError.AuthenticationFailed('update-trip-preferences.ts', 'updateTripPreferences');
    }

    const userId = session.user.id;

    // Get the trip first to verify permissions and check for CONFIRMED passengers
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        driverCar: {
          include: {
            driver: true
          }
        },
        passengers: {
          where: {
            reservationStatus: {
              in: ['APPROVED', 'CONFIRMED']
            }
          },
          select: {
            id: true,
            reservationStatus: true,
            passenger: {
              select: {
                userId: true,
                user: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!trip) {
      throw ServerActionError.NotFound('update-trip-preferences.ts', 'updateTripPreferences', 'Viaje no encontrado');
    }

    // Verify that the user is the driver of this trip
    if (trip.driverCar.driver.userId !== userId) {
      throw ServerActionError.AuthorizationFailed('update-trip-preferences.ts', 'updateTripPreferences');
    }

    // Check if trip is in a state that allows modifications
    if (!['PENDING', 'ACTIVE'].includes(trip.status)) {
      throw ServerActionError.ValidationFailed(
        'update-trip-preferences.ts',
        'updateTripPreferences',
        'No se pueden modificar las preferencias de un viaje completado o cancelado'
      );
    }

    // Prepare update data
    const updateData: any = {
      autoApproveReservations: preferences.autoApproveReservations,
      allowPets: preferences.allowPets,
      allowChildren: preferences.allowChildren,
      smokingAllowed: preferences.smokingAllowed
    };

    // If updating departure time, validate it's in the future
    if (preferences.departureTime) {
      const newDepartureTime = new Date(preferences.departureTime);
      const now = new Date();

      if (isNaN(newDepartureTime.getTime())) {
        throw ServerActionError.ValidationFailed(
          'update-trip-preferences.ts',
          'updateTripPreferences',
          'La hora de salida no es válida'
        );
      }

      if (newDepartureTime < now) {
        throw ServerActionError.ValidationFailed(
          'update-trip-preferences.ts',
          'updateTripPreferences',
          'La hora de salida debe ser en el futuro'
        );
      }

      // Validación 1: Cambio máximo de ±6 horas (Sección 2.3)
      const originalDepartureTime = trip.originalDepartureTime || trip.departureTime;
      const hoursDifference = Math.abs(
        (newDepartureTime.getTime() - originalDepartureTime.getTime()) / (1000 * 60 * 60)
      );

      if (hoursDifference > 6) {
        throw ServerActionError.ValidationFailed(
          'update-trip-preferences.ts',
          'updateTripPreferences',
          `El cambio de horario no puede ser mayor a ±6 horas del horario original. Diferencia actual: ${hoursDifference.toFixed(1)} horas`
        );
      }

      // Validación 2: Restricción de 36h si hay pasajeros CONFIRMED (Sección 2.3)
      const hasConfirmedPassengers = trip.passengers.some(
        p => p.reservationStatus === 'CONFIRMED'
      );

      if (hasConfirmedPassengers) {
        const hoursUntilDeparture = calculateHoursUntilDeparture(trip.departureTime);

        if (hoursUntilDeparture < 36) {
          throw ServerActionError.ValidationFailed(
            'update-trip-preferences.ts',
            'updateTripPreferences',
            `No se puede modificar el horario del viaje porque hay pasajeros confirmados (que pagaron) y faltan menos de 36 horas para la salida. Tiempo restante: ${Math.floor(hoursUntilDeparture)}h ${Math.floor((hoursUntilDeparture % 1) * 60)}m`
          );
        }
      }

      // Guardar el horario original si no existe
      if (!trip.originalDepartureTime) {
        updateData.originalDepartureTime = trip.departureTime;
      }
    }

    // Add optional fields if they are provided
    if (preferences.departureTime) {
      updateData.departureTime = new Date(preferences.departureTime);
    }
    
    if (preferences.additionalNotes !== undefined) {
      updateData.additionalNotes = preferences.additionalNotes;
    }

    // Update the trip preferences
    const updatedTrip = await prisma.trip.update({
      where: { id: tripId },
      data: updateData
    });

    // If departure time was modified, notify all affected passengers
    const timeWasModified = preferences.departureTime &&
      new Date(preferences.departureTime).getTime() !== new Date(trip.departureTime).getTime();

    if (timeWasModified) {
      const newDepartureTime = new Date(preferences.departureTime!);
      const oldDepartureTime = trip.departureTime;

      // Formatear fechas para mostrar en la notificación
      const formatDate = (date: Date) => {
        return date.toLocaleDateString('es-AR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      };

      // Notificar a todos los pasajeros APPROVED y CONFIRMED
      const notificationPromises = trip.passengers.map(passenger =>
        notifyUser(
          passenger.passenger.userId,
          'Cambio de horario del viaje',
          `El conductor ha modificado el horario del viaje de ${trip.originCity} a ${trip.destinationCity}.

**Horario anterior:** ${formatDate(oldDepartureTime)}
**Nuevo horario:** ${formatDate(newDepartureTime)}

Por favor, confirma que puedes asistir en el nuevo horario.`,
          undefined,
          `/viajes/${tripId}`
        )
      );

      // Ejecutar todas las notificaciones en paralelo
      await Promise.allSettled(notificationPromises);
    }

    await logActionWithErrorHandling(
      {
        userId,
        action: TipoAccionUsuario.MODIFICACION_VIAJE,
        status: 'SUCCESS',
        details: { 
          tripId,
          preferences,
          timeModified: timeWasModified
        }
      },
      {
        fileName: 'update-trip-preferences.ts',
        functionName: 'updateTripPreferences'
      }
    );

    return ApiHandler.handleSuccess(
      updatedTrip,
      'Preferencias del viaje actualizadas exitosamente'
    );
  } catch (error) {
    await logActionWithErrorHandling(
      {
        userId: '',
        action: TipoAccionUsuario.MODIFICACION_VIAJE,
        status: 'FAILED',
        details: { 
          tripId,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      },
      {
        fileName: 'update-trip-preferences.ts',
        functionName: 'updateTripPreferences'
      }
    );
    
    throw error;
  }
}