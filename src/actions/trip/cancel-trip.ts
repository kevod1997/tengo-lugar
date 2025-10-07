// src/actions/trip/cancel-trip.ts
'use server'

import prisma from "@/lib/prisma";
import { ApiHandler } from "@/lib/api-handler";
import { ServerActionError } from "@/lib/exceptions/server-action-error";
import { requireAuthentication } from "@/utils/helpers/auth-helper";
import { logActionWithErrorHandling } from "@/services/logging/logging-service";
import { TipoAccionUsuario } from "@/types/actions-logs";
import { notifyUser, notifyMultipleUsers } from "@/utils/notifications/notification-helpers";
import { processPassengerCancellation, processDriverCancellation } from "@/utils/helpers/cancellation-helper";

export async function cancelTrip(tripId: string, isDriver: boolean, reason: string = "Cancelación") {
  try {
    // 1. Autenticación
    const session = await requireAuthentication('cancel-trip.ts', 'cancelTrip');
    const userId = session.user.id;

    // 2. Obtener información del viaje
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      select: {
        id: true,
        status: true,
        originCity: true,
        destinationCity: true,
        departureTime: true,
        driverCar: {
          include: {
            driver: {
              select: {
                id: true,
                userId: true
              }
            }
          }
        },
        passengers: {
          select: {
            id: true,
            reservationStatus: true,
            passenger: {
              select: {
                id: true,
                userId: true
              }
            }
          }
        }
      }
    });

    if (!trip) {
      throw ServerActionError.NotFound('cancel-trip.ts', 'cancelTrip', 'Viaje no encontrado');
    }

    // 3. Verificar autorización
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

    // 4. Procesar cancelación según quien cancela
    if (isDriver) {
      // Cancelación por conductor
      const result = await prisma.$transaction(async (tx) => {
        return await processDriverCancellation(tripId, reason, tx);
      });

      // Log de acción
      await logActionWithErrorHandling(
        {
          userId,
          action: TipoAccionUsuario.CANCELACION_VIAJE,
          status: 'SUCCESS',
          details: {
            tripId,
            cancelledBy: 'driver',
            hoursBeforeDeparture: result.cancellationDetails.hoursBeforeDeparture,
            affectedPassengers: result.affectedPassengers
          }
        },
        {
          fileName: 'cancel-trip.ts',
          functionName: 'cancelTrip'
        }
      );

      // Notificar pasajeros afectados
      const affectedPassengerIds = trip.passengers
        .filter(p => ['PENDING_APPROVAL', 'APPROVED', 'CONFIRMED'].includes(p.reservationStatus))
        .map(p => p.passenger.userId);

      if (affectedPassengerIds.length > 0) {
        await notifyMultipleUsers(
          affectedPassengerIds,
          "Viaje cancelado",
          `El viaje de ${trip.originCity} a ${trip.destinationCity} ha sido cancelado por el conductor. ${result.affectedPassengers > 0 ? 'Se procesarán los reembolsos correspondientes.' : ''}`,
          undefined,
          `/viajes`
        );
      }

      return ApiHandler.handleSuccess(
        { success: true, affectedPassengers: result.affectedPassengers },
        'Viaje cancelado exitosamente. Se notificó a todos los pasajeros.'
      );

    } else if (isPassenger && passengerTripId) {
      // Cancelación por pasajero - usar la misma lógica que cancel-reservation
      const result = await prisma.$transaction(async (tx) => {
        return await processPassengerCancellation(passengerTripId, reason, tx);
      });

      // Log de acción
      await logActionWithErrorHandling(
        {
          userId,
          action: TipoAccionUsuario.CANCELACION_VIAJE,
          status: 'SUCCESS',
          details: {
            tripId,
            passengerTripId,
            cancelledBy: 'passenger',
            refundProcessed: result.refundProcessed,
            newStatus: result.cancellationDetails.newStatus,
            hoursBeforeDeparture: result.cancellationDetails.hoursBeforeDeparture,
            refundPercentage: result.cancellationDetails.refundPercentage
          }
        },
        {
          fileName: 'cancel-trip.ts',
          functionName: 'cancelTrip'
        }
      );

      // Notificar al conductor
      await notifyUser(
        trip.driverCar.driver.userId,
        "Reserva cancelada",
        `Un pasajero canceló su reserva para el viaje de ${trip.originCity} a ${trip.destinationCity}.`,
        undefined,
        `/viajes/${tripId}/gestionar-viaje`
      );

      const message = result.refundProcessed
        ? `Reservación cancelada. Se procesará un reembolso del ${result.cancellationDetails.refundPercentage}% del precio del viaje.`
        : 'Tu reservación ha sido cancelada';

      return ApiHandler.handleSuccess(
        {
          success: true,
          refundPercentage: result.cancellationDetails.refundPercentage,
          refundProcessed: result.refundProcessed
        },
        message
      );
    }

    throw ServerActionError.ValidationFailed(
      'cancel-trip.ts',
      'cancelTrip',
      'No se pudo procesar la cancelación'
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

    return ApiHandler.handleError(error);
  }
}
