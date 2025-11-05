// src/actions/trip/cancel-trip.ts
'use server'

import prisma from "@/lib/prisma";
import { ApiHandler } from "@/lib/api-handler";
import { ServerActionError } from "@/lib/exceptions/server-action-error";
import { requireAuthentication } from "@/utils/helpers/auth-helper";
import { logActionWithErrorHandling } from "@/services/logging/logging-service";
import { TipoAccionUsuario } from "@/types/actions-logs";
import { notifyUser, notifyMultipleUsers } from "@/utils/notifications/notification-helpers";
import { processPassengerCancellation, processDriverCancellation, validateCancellationEligibility } from "@/utils/helpers/cancellation-helper";

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

    // 3. Validar estado del viaje
    if (trip.status === 'COMPLETED') {
      throw ServerActionError.ValidationFailed(
        'cancel-trip.ts',
        'cancelTrip',
        'No se puede cancelar un viaje completado'
      );
    }

    if (trip.status === 'CANCELLED') {
      throw ServerActionError.ValidationFailed(
        'cancel-trip.ts',
        'cancelTrip',
        'Este viaje ya ha sido cancelado'
      );
    }

    // 3.1 Validar restricción de tiempo (última hora) - Solo aplica con pagos confirmados
    const now = new Date();
    const hoursUntilDeparture = (trip.departureTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilDeparture < 1) {
      if (isDriver) {
        // Conductor: Solo bloquear si tiene al menos un pasajero CONFIRMED (pagado)
        const hasConfirmedPassengers = trip.passengers.some(p => p.reservationStatus === 'CONFIRMED');
        if (hasConfirmedPassengers) {
          throw ServerActionError.ValidationFailed(
            'cancel-trip.ts',
            'cancelTrip',
            'No se puede cancelar un viaje con menos de 1 hora antes de la salida cuando tienes pasajeros confirmados. Si tienes una emergencia, contacta a soporte.'
          );
        }
      } else {
        // Pasajero: Solo bloquear si su propia reserva está CONFIRMED (pagada)
        const passengerTrip = trip.passengers.find(p => p.passenger.userId === userId);
        if (passengerTrip?.reservationStatus === 'CONFIRMED') {
          throw ServerActionError.ValidationFailed(
            'cancel-trip.ts',
            'cancelTrip',
            'No se puede cancelar una reserva confirmada con menos de 1 hora antes de la salida. Si tienes una emergencia, contacta a soporte.'
          );
        }
      }
    }

    // 4. Verificar autorización
    let authorized = false;
    let isPassenger = false;
    let passengerTripId: string | null = null;

    if (isDriver) {
      authorized = trip.driverCar.driver.userId === userId;
    } else {
      const passengerTrip = trip.passengers.find(p => p.passenger.userId === userId);
      if (passengerTrip) {
        // Validar elegibilidad de cancelación para el pasajero
        const validation = validateCancellationEligibility(
          passengerTrip.reservationStatus,
          trip.status
        );

        if (!validation.canCancel) {
          throw ServerActionError.ValidationFailed(
            'cancel-trip.ts',
            'cancelTrip',
            validation.reason || 'No se puede cancelar esta reserva'
          );
        }

        authorized = true;
        isPassenger = true;
        passengerTripId = passengerTrip.id;
      }
    }

    if (!authorized) {
      throw ServerActionError.AuthorizationFailed('cancel-trip.ts', 'cancelTrip');
    }

    // 5. Procesar cancelación según quien cancela
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

      const message = result.affectedPassengers > 0
        ? `Viaje cancelado exitosamente. Se procesarán ${result.affectedPassengers} reembolso${result.affectedPassengers > 1 ? 's' : ''} completo${result.affectedPassengers > 1 ? 's' : ''} del precio del viaje (la tarifa de servicio se retiene). Se notificó a todos los pasajeros.`
        : 'Viaje cancelado exitosamente. Se notificó a los pasajeros afectados.';

      return ApiHandler.handleSuccess(
        {
          success: true,
          affectedPassengers: result.affectedPassengers,
          hoursBeforeDeparture: result.cancellationDetails.hoursBeforeDeparture
        },
        message
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
        ? `Reservación cancelada exitosamente. Se procesará un reembolso del ${result.cancellationDetails.refundPercentage}% del precio del viaje (la tarifa de servicio no se reembolsa). El conductor recibirá una compensación del ${100 - result.cancellationDetails.refundPercentage}% del precio del viaje.`
        : 'Tu reservación ha sido cancelada exitosamente. No se realizó ningún pago, por lo que no hay reembolso que procesar.';

      return ApiHandler.handleSuccess(
        {
          success: true,
          refundPercentage: result.cancellationDetails.refundPercentage,
          refundProcessed: result.refundProcessed,
          hoursBeforeDeparture: result.cancellationDetails.hoursBeforeDeparture,
          newStatus: result.cancellationDetails.newStatus
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
