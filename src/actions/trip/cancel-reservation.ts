// src/actions/trip/cancel-reservation.ts
'use server'

import prisma from "@/lib/prisma";
import { ApiHandler } from "@/lib/api-handler";
import { ServerActionError } from "@/lib/exceptions/server-action-error";
import { requireAuthentication } from "@/utils/helpers/auth-helper";
import { logActionWithErrorHandling } from "@/services/logging/logging-service";
import { TipoAccionUsuario } from "@/types/actions-logs";
import { processPassengerCancellation } from "@/utils/helpers/cancellation-helper";
import { notifyUser } from "@/utils/notifications/notification-helpers";

export async function cancelReservation(reservationId: string, reason: string = "Cancelación del pasajero") {
  try {
    // 1. Autenticación
    const session = await requireAuthentication('cancel-reservation.ts', 'cancelReservation');
    const userId = session.user.id;

    // 2. Verificar que la reserva existe y pertenece al usuario
    const reservation = await prisma.tripPassenger.findUnique({
      where: { id: reservationId },
      include: {
        passenger: {
          select: {
            userId: true
          }
        },
        trip: {
          select: {
            id: true,
            originCity: true,
            destinationCity: true,
            departureTime: true,
            status: true,
            driverCar: {
              select: {
                driver: {
                  select: {
                    userId: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!reservation) {
      throw ServerActionError.NotFound(
        'cancel-reservation.ts',
        'cancelReservation',
        'Reservación no encontrada'
      );
    }

    // 3. Verificar autorización
    if (reservation.passenger.userId !== userId) {
      throw ServerActionError.AuthorizationFailed(
        'cancel-reservation.ts',
        'cancelReservation'
      );
    }

    // 4. Procesar cancelación en transacción
    const result = await prisma.$transaction(async (tx) => {
      return await processPassengerCancellation(reservationId, reason, tx);
    });

    // 5. Notificar al conductor
    await notifyUser(
      reservation.trip.driverCar.driver.userId,
      "Reserva cancelada",
      `Un pasajero canceló su reserva para el viaje de ${reservation.trip.originCity} a ${reservation.trip.destinationCity}.`,
      undefined,
      `/viajes/${reservation.trip.id}/gestionar-viaje`
    );

    // 6. Log de acción exitosa
    await logActionWithErrorHandling(
      {
        userId,
        action: TipoAccionUsuario.CANCELACION_VIAJE,
        status: 'SUCCESS',
        details: {
          reservationId,
          tripId: reservation.trip.id,
          refundProcessed: result.refundProcessed,
          newStatus: result.cancellationDetails.newStatus,
          hoursBeforeDeparture: result.cancellationDetails.hoursBeforeDeparture,
          refundPercentage: result.cancellationDetails.refundPercentage
        }
      },
      {
        fileName: 'cancel-reservation.ts',
        functionName: 'cancelReservation'
      }
    );

    // 7. Respuesta exitosa
    const message = result.refundProcessed
      ? `Reservación cancelada. Se procesará un reembolso del ${result.cancellationDetails.refundPercentage}% del precio del viaje.`
      : 'Reservación cancelada exitosamente';

    return ApiHandler.handleSuccess(
      {
        success: true,
        refundPercentage: result.cancellationDetails.refundPercentage,
        refundProcessed: result.refundProcessed
      },
      message
    );
  } catch (error) {
    return ApiHandler.handleError(error);
  }
}
