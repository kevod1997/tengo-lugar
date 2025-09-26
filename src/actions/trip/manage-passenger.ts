// src/actions/trip/manage-passenger.ts
'use server'

import prisma from "@/lib/prisma";
import { ApiHandler } from "@/lib/api-handler";
import { ServerActionError } from "@/lib/exceptions/server-action-error";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";
import { logActionWithErrorHandling } from "@/services/logging/logging-service";
import { TipoAccionUsuario } from "@/types/actions-logs";
import { notifyUser } from "@/utils/notifications/notification-helpers";

// Schema for validation
const managePassengerSchema = z.object({
  tripId: z.string().uuid(),
  passengerTripId: z.string().uuid(),
  action: z.enum(['approve', 'reject'])
});

export async function managePassenger(data: {
  tripId: string;
  passengerTripId: string;
  action: 'approve' | 'reject';
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw ServerActionError.AuthenticationFailed('manage-passenger.ts', 'managePassenger');
    }

    const userId = session.user.id;
    
    // Validate input data
    const validatedData = managePassengerSchema.parse(data);
    
    // Check if user is the driver of this trip
    const trip = await prisma.trip.findUnique({
      where: { id: validatedData.tripId },
      select: {
        id: true,
        remainingSeats: true,
        originCity: true,
        destinationCity: true,
        driverCar: {
          include: {
            driver: true
          }
        },
        passengers: {
          where: { id: validatedData.passengerTripId },
          include: {
            passenger: {
              select: { userId: true }
            }
          }
        }
      }
    });

    if (!trip) {
      throw ServerActionError.NotFound('manage-passenger.ts', 'managePassenger', 'Viaje no encontrado');
    }

    // Verify user is the driver
    if (trip.driverCar.driver.userId !== userId) {
      throw ServerActionError.AuthorizationFailed('manage-passenger.ts', 'managePassenger');
    }
    
    // Verify passenger trip exists
    if (trip.passengers.length === 0) {
      throw ServerActionError.NotFound('manage-passenger.ts', 'managePassenger', 'Pasajero no encontrado');
    }
    
    const passengerTrip = trip.passengers[0];
    
    // If approving, check that there are enough seats available
    if (validatedData.action === 'approve') {
      // Use the remainingSeats field for validation instead of calculating
      if (passengerTrip.seatsReserved > trip.remainingSeats) {
        throw ServerActionError.ValidationFailed(
          'manage-passenger.ts',
          'managePassenger',
          `No hay suficientes asientos disponibles (${trip.remainingSeats} disponibles, ${passengerTrip.seatsReserved} solicitados)`
        );
      }
      
      // Calculate new remaining seats
      const newRemainingSeats = trip.remainingSeats - passengerTrip.seatsReserved;
      
      // Update trip with new remainingSeats and possibly update isFull flag
      await prisma.trip.update({
        where: { id: trip.id },
        data: { 
          remainingSeats: newRemainingSeats,
          isFull: newRemainingSeats <= 0
        }
      });
    }
    
    // Update passenger status
    const newStatus = validatedData.action === 'approve' ? 'APPROVED' : 'CANCELLED_BY_DRIVER';
    
    await prisma.tripPassenger.update({
      where: { id: validatedData.passengerTripId },
      data: { reservationStatus: newStatus }
    });
    
    // If rejecting passenger that was previously approved, update remainingSeats and trip fullness
    if (validatedData.action === 'reject' && 
        ['APPROVED', 'CONFIRMED'].includes(passengerTrip.reservationStatus)) {
      
      // Calculate new remaining seats by adding back the passenger's seats
      const newRemainingSeats = trip.remainingSeats + passengerTrip.seatsReserved;
      
      await prisma.trip.update({
        where: { id: trip.id },
        data: { 
          remainingSeats: newRemainingSeats,
          isFull: false // Trip can't be full if we're freeing up seats
        }
      });
    }
    
    // Log the action
    await logActionWithErrorHandling(
      {
        userId,
        action: validatedData.action === 'approve'
          ? TipoAccionUsuario.VALIDACION_DOCUMENTO
          : TipoAccionUsuario.RECHAZO_DOCUMENTO,
        status: 'SUCCESS',
        details: {
          tripId: validatedData.tripId,
          passengerTripId: validatedData.passengerTripId,
          action: validatedData.action
        }
      },
      {
        fileName: 'manage-passenger.ts',
        functionName: 'managePassenger'
      }
    );

    // Notify the passenger about the decision
    const passengerUserId = passengerTrip.passenger.userId;
    const title = validatedData.action === 'approve'
      ? "Reserva aprobada"
      : "Reserva rechazada";

    const message = validatedData.action === 'approve'
      ? `Tu reserva para el viaje de ${trip.originCity} a ${trip.destinationCity} ha sido aprobada.`
      : `Tu reserva para el viaje de ${trip.originCity} a ${trip.destinationCity} ha sido rechazada por el conductor.`;

    await notifyUser(
      passengerUserId,
      title,
      message,
      undefined,
      `/viajes/${validatedData.tripId}`
    );
    
    return ApiHandler.handleSuccess(
      { success: true },
      validatedData.action === 'approve' 
        ? 'Pasajero aprobado exitosamente' 
        : 'Pasajero rechazado exitosamente'
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      throw ServerActionError.ValidationFailed(
        'manage-passenger.ts',
        'managePassenger',
        errorMessages
      );
    }
    
    throw error;
  }
}