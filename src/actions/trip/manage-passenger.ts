// src/actions/trip/manage-passenger.ts
'use server'

import { headers } from "next/headers";

import { z } from "zod";

import { ApiHandler } from "@/lib/api-handler";
import { auth } from "@/lib/auth";
import { ServerActionError } from "@/lib/exceptions/server-action-error";
import prisma from "@/lib/prisma";
import { logActionWithErrorHandling } from "@/services/logging/logging-service";
import { TipoAccionUsuario } from "@/types/actions-logs";
import { canApproveReservation, canDriverRemoveApprovedPassenger, formatTimeRestrictionError } from "@/utils/helpers/time-restrictions-helper";
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
        departureTime: true,
        originCity: true,
        destinationCity: true,
        price: true,
        serviceFee: true,
        driverCar: {
          include: {
            driver: true
          }
        },
        passengers: {
          where: { id: validatedData.passengerTripId },
          select: {
            id: true,
            reservationStatus: true,
            seatsReserved: true,
            totalPrice: true,
            approvedAt: true,
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

    // VALIDACIONES PARA RECHAZAR PASAJEROS
    if (validatedData.action === 'reject') {
      // Regla 1: NUNCA se puede rechazar un pasajero CONFIRMED (que ya pagó)
      if (passengerTrip.reservationStatus === 'CONFIRMED') {
        throw ServerActionError.ValidationFailed(
          'manage-passenger.ts',
          'managePassenger',
          'No se puede rechazar un pasajero que ya confirmó su pago. El pasajero tiene un lugar garantizado en el viaje.'
        );
      }

      // Regla 2: Ventanas de protección para pasajeros APPROVED
      if (passengerTrip.reservationStatus === 'APPROVED' && passengerTrip.approvedAt) {
        const protectionCheck = canDriverRemoveApprovedPassenger(
          trip.departureTime,
          passengerTrip.approvedAt
        );

        if (!protectionCheck.isAllowed) {
          throw ServerActionError.ValidationFailed(
            'manage-passenger.ts',
            'managePassenger',
            protectionCheck.reason || 'No se puede rechazar este pasajero en este momento'
          );
        }
      }
    }

    // If approving, check that there are enough seats available
    if (validatedData.action === 'approve') {
      // Validate time restriction: cannot approve reservations within 3 hours of departure
      const timeCheck = canApproveReservation(trip.departureTime);
      if (!timeCheck.isAllowed) {
        throw ServerActionError.ValidationFailed(
          'manage-passenger.ts',
          'managePassenger',
          formatTimeRestrictionError(timeCheck)
        );
      }

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
    const newStatus = validatedData.action === 'approve' ? 'APPROVED' : 'REJECTED';

    await prisma.tripPassenger.update({
      where: { id: validatedData.passengerTripId },
      data: { reservationStatus: newStatus,
        approvedAt: validatedData.action === 'approve' ? new Date() : null
      }
    });

    // 🆕 CREAR PAYMENT AUTOMÁTICAMENTE AL APROBAR
    if (validatedData.action === 'approve') {
      // El monto del pago es el totalPrice que ya incluye precio base + service fee
      await prisma.payment.create({
        data: {
          tripPassengerId: validatedData.passengerTripId,
          totalAmount: passengerTrip.totalPrice,
          serviceFee: trip.price * (trip.serviceFee || 0) / 100 * passengerTrip.seatsReserved, // service fee proporcional a los asientos
          currency: 'ARS',
          status: 'PENDING',
          paymentMethod: 'BANK_TRANSFER'
        }
      });
    }
    
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

    if (validatedData.action === 'approve') {
      const title = "¡Reserva aprobada!";
      const message = `El conductor aprobó tu reserva para el viaje de ${trip.originCity} a ${trip.destinationCity}.

**IMPORTANTE:** Debes completar el pago para confirmar tu lugar.

Hacé clic aquí para ver las instrucciones de pago.`;

      await notifyUser(
        passengerUserId,
        title,
        message,
        undefined,
        `/viajes/${validatedData.tripId}/pagar` // Link directo a página de pago
      );
    } else {
      const title = "Reserva rechazada";
      const message = `Tu reserva para el viaje de ${trip.originCity} a ${trip.destinationCity} ha sido rechazada por el conductor.`;

      await notifyUser(
        passengerUserId,
        title,
        message,
        undefined,
        `/viajes/${validatedData.tripId}`
      );
    }
    
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