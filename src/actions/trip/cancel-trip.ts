// src/actions/trip/cancel-trip.ts
'use server'

import prisma from "@/lib/prisma";
import { ApiHandler } from "@/lib/api-handler";
import { ServerActionError } from "@/lib/exceptions/server-action-error";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { logActionWithErrorHandling } from "@/services/logging/logging-service";
import { TipoAccionUsuario } from "@/types/actions-logs";

export async function cancelTrip(tripId: string, isDriver: boolean) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw ServerActionError.AuthenticationFailed('cancel-trip.ts', 'cancelTrip');
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
        },
        passengers: {
          include: {
            passenger: true
          }
        }
      }
    });

    if (!trip) {
      throw ServerActionError.NotFound('cancel-trip.ts', 'cancelTrip', 'Viaje no encontrado');
    }

    // Verify that the user is either the driver or a passenger of this trip
    let authorized = false;
    let isPassenger = false;
    let passengerTripId: string | null = null;

    if (isDriver) {
      authorized = trip.driverCar.driver.userId === userId;
    } else {
      const passengerTrip = trip.passengers.find(p => p.passenger.userId === userId);
      if (passengerTrip) {
        authorized = true;
        isPassenger = true;
        passengerTripId = passengerTrip.id;
      }
    }

    if (!authorized) {
      throw ServerActionError.AuthorizationFailed('cancel-trip.ts', 'cancelTrip');
    }

    // Handle cancellation based on who is canceling
    if (isDriver) {
      // If driver is canceling, update the trip status and all passenger reservations
      await prisma.$transaction([
        prisma.trip.update({
          where: { id: tripId },
          data: { status: 'CANCELLED' }
        }),
        prisma.tripPassenger.updateMany({
          where: { 
            tripId,
            reservationStatus: { 
              in: ['PENDING_APPROVAL', 'APPROVED', 'CONFIRMED'] 
            }
          },
          data: { reservationStatus: 'CANCELLED_BY_DRIVER' }
        })
      ]);

      await logActionWithErrorHandling(
        {
          userId,
          action: TipoAccionUsuario.CANCELACION_VIAJE,
          status: 'SUCCESS',
          details: { tripId, cancelledBy: 'driver' }
        },
        {
          fileName: 'cancel-trip.ts',
          functionName: 'cancelTrip'
        }
      );
    } else if (isPassenger && passengerTripId) {
      // If passenger is canceling, only update their reservation status
      await prisma.tripPassenger.update({
        where: { id: passengerTripId },
        data: { reservationStatus: 'CANCELLED_BY_PASSENGER' }
      });

      // Check if this affects trip fullness
      await prisma.trip.update({
        where: { id: tripId },
        data: { isFull: false }
      });

      await logActionWithErrorHandling(
        {
          userId,
          action: TipoAccionUsuario.CANCELACION_VIAJE,
          status: 'SUCCESS',
          details: { tripId, passengerTripId, cancelledBy: 'passenger' }
        },
        {
          fileName: 'cancel-trip.ts',
          functionName: 'cancelTrip'
        }
      );
    }

    return ApiHandler.handleSuccess(
      { success: true },
      isDriver 
        ? 'Viaje cancelado exitosamente' 
        : 'Tu reservación ha sido cancelada'
    );
  } catch (error) {
    await logActionWithErrorHandling(
      {
        userId: '', // Can't get userId if auth fails
        action: TipoAccionUsuario.CANCELACION_VIAJE,
        status: 'FAILED',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      },
      {
        fileName: 'cancel-trip.ts',
        functionName: 'cancelTrip'
      }
    );
    
    throw error;
  }
}