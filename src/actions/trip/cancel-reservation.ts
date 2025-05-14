// // src/actions/trip/cancel-reservation.ts
// 'use server'

// import prisma from "@/lib/prisma";
// import { ApiHandler } from "@/lib/api-handler";
// import { ServerActionError } from "@/lib/exceptions/server-action-error";
// import { auth } from "@/lib/auth";
// import { headers } from "next/headers";
// import { logActionWithErrorHandling } from "@/services/logging/logging-service";
// import { TipoAccionUsuario } from "@/types/actions-logs";

// export async function cancelReservation(reservationId: string) {
//   try {
//     const session = await auth.api.getSession({
//       headers: await headers(),
//     });

//     if (!session) {
//       throw ServerActionError.AuthenticationFailed('cancel-reservation.ts', 'cancelReservation');
//     }

//     const userId = session.user.id;
    
//     // Get the reservation with passenger info to check authorization
//     const reservation = await prisma.tripPassenger.findUnique({
//       where: { id: reservationId },
//       include: {
//         passenger: true,
//         trip: true
//       }
//     });
    
//     if (!reservation) {
//       throw ServerActionError.NotFound('cancel-reservation.ts', 'cancelReservation', 'Reservación no encontrada');
//     }
    
//     // Check if the user is the owner of this reservation
//     if (reservation.passenger.userId !== userId) {
//       throw ServerActionError.AuthorizationFailed('cancel-reservation.ts', 'cancelReservation');
//     }
    
//     // Check if the reservation can be cancelled
//     if (['CANCELLED_BY_DRIVER', 'CANCELLED_BY_PASSENGER'].includes(reservation.reservationStatus)) {
//       throw ServerActionError.ValidationFailed(
//         'cancel-reservation.ts',
//         'cancelReservation',
//         'Esta reservación ya ha sido cancelada'
//       );
//     }
    
//     if (reservation.trip.status === 'COMPLETED') {
//       throw ServerActionError.ValidationFailed(
//         'cancel-reservation.ts',
//         'cancelReservation',
//         'No se puede cancelar una reservación de un viaje completado'
//       );
//     }
    
//     // Update the reservation status
//     await prisma.tripPassenger.update({
//       where: { id: reservationId },
//       data: { reservationStatus: 'CANCELLED_BY_PASSENGER' }
//     });
    
//     // If the trip was full, mark it as not full anymore
//     if (reservation.trip.isFull) {
//       await prisma.trip.update({
//         where: { id: reservation.trip.id },
//         data: { isFull: false }
//       });
//     }
    
//     // Log the action
//     await logActionWithErrorHandling(
//       {
//         userId,
//         action: TipoAccionUsuario.CANCELACION_VIAJE,
//         status: 'SUCCESS',
//         details: { reservationId, tripId: reservation.trip.id }
//       },
//       {
//         fileName: 'cancel-reservation.ts',
//         functionName: 'cancelReservation'
//       }
//     );
    
//     return ApiHandler.handleSuccess(
//       { success: true },
//       'Reservación cancelada exitosamente'
//     );
//   } catch (error) {
//     throw error;
//   }
// }

// src/actions/trip/cancel-reservation.ts
'use server'

import prisma from "@/lib/prisma";
import { ApiHandler } from "@/lib/api-handler";
import { ServerActionError } from "@/lib/exceptions/server-action-error";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { logActionWithErrorHandling } from "@/services/logging/logging-service";
import { TipoAccionUsuario } from "@/types/actions-logs";

export async function cancelReservation(reservationId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw ServerActionError.AuthenticationFailed('cancel-reservation.ts', 'cancelReservation');
    }

    const userId = session.user.id;
    
    // Get the reservation with passenger info to check authorization
    const reservation = await prisma.tripPassenger.findUnique({
      where: { id: reservationId },
      include: {
        passenger: true,
        trip: true
      }
    });
    
    if (!reservation) {
      throw ServerActionError.NotFound('cancel-reservation.ts', 'cancelReservation', 'Reservación no encontrada');
    }
    
    // Check if the user is the owner of this reservation
    if (reservation.passenger.userId !== userId) {
      throw ServerActionError.AuthorizationFailed('cancel-reservation.ts', 'cancelReservation');
    }
    
    // Check if the reservation can be cancelled
    if (['CANCELLED_BY_DRIVER', 'CANCELLED_BY_PASSENGER'].includes(reservation.reservationStatus)) {
      throw ServerActionError.ValidationFailed(
        'cancel-reservation.ts',
        'cancelReservation',
        'Esta reservación ya ha sido cancelada'
      );
    }
    
    if (reservation.trip.status === 'COMPLETED') {
      throw ServerActionError.ValidationFailed(
        'cancel-reservation.ts',
        'cancelReservation',
        'No se puede cancelar una reservación de un viaje completado'
      );
    }
    
    // If this was an active reservation (APPROVED or CONFIRMED), update the remaining seats
    const shouldUpdateSeats = ['APPROVED', 'CONFIRMED'].includes(reservation.reservationStatus);
    
    // Update the reservation status
    await prisma.tripPassenger.update({
      where: { id: reservationId },
      data: { reservationStatus: 'CANCELLED_BY_PASSENGER' }
    });
    
    // If the reservation was active, update the trip's remaining seats
    if (shouldUpdateSeats) {
      const newRemainingSeats = reservation.trip.remainingSeats + reservation.seatsReserved;
      
      await prisma.trip.update({
        where: { id: reservation.trip.id },
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
        action: TipoAccionUsuario.CANCELACION_VIAJE,
        status: 'SUCCESS',
        details: { reservationId, tripId: reservation.trip.id }
      },
      {
        fileName: 'cancel-reservation.ts',
        functionName: 'cancelReservation'
      }
    );
    
    return ApiHandler.handleSuccess(
      { success: true },
      'Reservación cancelada exitosamente'
    );
  } catch (error) {
    throw error;
  }
}