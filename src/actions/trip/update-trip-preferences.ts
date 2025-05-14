// src/actions/trip/update-trip-preferences.ts
'use server'

import prisma from "@/lib/prisma";
import { ApiHandler } from "@/lib/api-handler";
import { ServerActionError } from "@/lib/exceptions/server-action-error";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { logActionWithErrorHandling } from "@/services/logging/logging-service";
import { TipoAccionUsuario } from "@/types/actions-logs";

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

    // Get the trip first to verify permissions
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        driverCar: {
          include: {
            driver: true
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
    }

    // Prepare update data
    const updateData: any = {
      autoApproveReservations: preferences.autoApproveReservations,
      allowPets: preferences.allowPets,
      allowChildren: preferences.allowChildren,
      smokingAllowed: preferences.smokingAllowed
    };
    
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

    // If departure time was modified, we might want to notify passengers
    const timeWasModified = preferences.departureTime && 
      new Date(preferences.departureTime).getTime() !== new Date(trip.departureTime).getTime();
    
    if (timeWasModified) {
      // Here you can add logic to notify passengers about the schedule change
      // This could be through a server action call or direct database update
      
      // Example: Update all confirmed passengers with a notification
      await prisma.tripPassenger.findMany({
        where: {
          tripId,
          reservationStatus: { in: ['APPROVED', 'CONFIRMED'] }
        },
        select: {
          passenger: {
            select: {
              userId: true
            }
          }
        }
      });
      
      // In a production app, you would send notifications to these users
      // through your notification system (push, email, in-app, etc.)
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