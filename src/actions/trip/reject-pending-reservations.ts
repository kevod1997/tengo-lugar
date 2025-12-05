// src/actions/trip/reject-pending-reservations.ts
'use server'

import { ApiHandler } from "@/lib/api-handler";
import { ServerActionError } from "@/lib/exceptions/server-action-error";
import prisma from "@/lib/prisma";
import { logActionWithErrorHandling } from "@/services/logging/logging-service";
import { TipoAccionUsuario } from "@/types/actions-logs";

export async function rejectPendingReservationsAction(reservationIds: string[], isAutomated = false) {
  try {
    if (reservationIds.length === 0) {
      throw ServerActionError.ValidationFailed(
        'reject-pending-reservations.ts',
        'rejectPendingReservationsAction',
        'No se proporcionaron IDs de reservaciones'
      );
    }

    // Get reservations to verify they exist and can be rejected
    const reservations = await prisma.tripPassenger.findMany({
      where: {
        id: { in: reservationIds },
        reservationStatus: 'PENDING_APPROVAL'
      },
      include: {
        trip: {
          select: {
            id: true,
            departureTime: true,
            status: true
          }
        },
        passenger: {
          select: {
            userId: true
          }
        }
      }
    });

    if (reservations.length === 0) {
      throw ServerActionError.NotFound(
        'reject-pending-reservations.ts',
        'rejectPendingReservationsAction',
        'No se encontraron reservaciones pendientes con los IDs proporcionados'
      );
    }

    // Verify all reservations are for active trips and within time constraint (for automated rejection)
    if (isAutomated) {
      // IMPORTANTE: Usar UTC para evitar problemas de timezone
      // JavaScript Date almacena internamente timestamps UTC
      const nowUTC = new Date();
      const twoHoursInMs = 2 * 60 * 60 * 1000;
      const twoHoursFromNowUTC = new Date(nowUTC.getTime() + twoHoursInMs);

      for (const reservation of reservations) {
        if (reservation.trip.status !== 'ACTIVE') {
          throw ServerActionError.ValidationFailed(
            'reject-pending-reservations.ts',
            'rejectPendingReservationsAction',
            `Reservación ${reservation.id} no puede ser rechazada. Viaje no está activo.`
          );
        }

        if (reservation.trip.departureTime > twoHoursFromNowUTC) {
          throw ServerActionError.ValidationFailed(
            'reject-pending-reservations.ts',
            'rejectPendingReservationsAction',
            `Reservación ${reservation.id} no puede ser rechazada automáticamente. Faltan más de 2 horas para la salida.`
          );
        }
      }
    }

    // Update all reservations to REJECTED in a transaction
    await prisma.tripPassenger.updateMany({
      where: {
        id: { in: reservationIds },
        reservationStatus: 'PENDING_APPROVAL'
      },
      data: {
        reservationStatus: 'REJECTED'
      }
    });

    // Log each rejection
    for (const reservation of reservations) {
      await logActionWithErrorHandling(
        {
          userId: isAutomated ? 'SYSTEM' : reservation.passenger.userId,
          action: TipoAccionUsuario.RECHAZO_RESERVACION_PENDIENTE,
          status: 'SUCCESS',
          details: {
            reservationId: reservation.id,
            tripId: reservation.trip.id,
            isAutomated,
            departureTime: reservation.trip.departureTime.toISOString(),
            reason: isAutomated ? 'Tiempo límite excedido (< 2 horas)' : 'Rechazo manual'
          }
        },
        {
          fileName: 'reject-pending-reservations.ts',
          functionName: 'rejectPendingReservationsAction'
        }
      );
    }

    return ApiHandler.handleSuccess(
      {
        success: true,
        rejectedReservations: reservations.length,
        reservationIds: reservationIds
      },
      `${reservations.length} reservaciones rechazadas exitosamente`
    );
  } catch (error) {
    await logActionWithErrorHandling(
      {
        userId: 'SYSTEM',
        action: TipoAccionUsuario.RECHAZO_RESERVACION_PENDIENTE,
        status: 'FAILED',
        details: {
          reservationIds,
          isAutomated,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      },
      {
        fileName: 'reject-pending-reservations.ts',
        functionName: 'rejectPendingReservationsAction'
      }
    );

    throw error;
  }
}

export async function rejectExpiredPendingReservations() {
  try {
    // IMPORTANTE: Usar UTC para evitar problemas de timezone
    // JavaScript Date almacena internamente timestamps UTC
    // Prisma automáticamente convierte a UTC cuando envía a PostgreSQL
    const nowUTC = new Date();
    const twoHoursInMs = 2 * 60 * 60 * 1000;
    const twoHoursFromNowUTC = new Date(nowUTC.getTime() + twoHoursInMs);

    const expiredReservations = await prisma.tripPassenger.findMany({
      where: {
        reservationStatus: 'PENDING_APPROVAL',
        trip: {
          status: 'ACTIVE',
          departureTime: {
            lt: twoHoursFromNowUTC
          }
        }
      },
      select: {
        id: true,
        trip: {
          select: {
            id: true,
            departureTime: true
          }
        }
      }
    });

    if (expiredReservations.length === 0) {
      return ApiHandler.handleSuccess(
        { processedReservations: 0 },
        'No hay reservaciones pendientes que deban ser rechazadas'
      );
    }

    // Store the count before processing
    const totalReservationsToProcess = expiredReservations.length;
    
    // Extract reservation IDs
    const reservationIds = expiredReservations.map(r => r.id);

    // Process rejections
    const result = await rejectPendingReservationsAction(reservationIds, true);

    // Only log if processing was successful
    if (result.success) {
        await logActionWithErrorHandling(
        {
          userId: 'SYSTEM',
          action: TipoAccionUsuario.RECHAZO_RESERVACION_PENDIENTE,
          status: 'SUCCESS',
          details: {
            totalReservations: totalReservationsToProcess,
            processedReservations: reservationIds.length,
            reservationIds,
            trips: expiredReservations.map(r => ({
              tripId: r.trip.id,
              departureTime: r.trip.departureTime.toISOString()
            }))
          }
        },
        {
          fileName: 'reject-pending-reservations.ts',
          functionName: 'rejectExpiredPendingReservations'
        }
      );
    }

    return ApiHandler.handleSuccess(
      {
        processedReservations: totalReservationsToProcess,
        rejectedReservations: result.data?.rejectedReservations || 0,
        trips: expiredReservations.map(r => r.trip.id)
      },
      `Procesadas ${totalReservationsToProcess} reservaciones expiradas. ${result.data?.rejectedReservations || 0} rechazadas exitosamente.`
    );
  } catch (error) {
    await logActionWithErrorHandling(
      {
        userId: 'SYSTEM',
        action: TipoAccionUsuario.RECHAZO_RESERVACION_PENDIENTE,
        status: 'FAILED',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      },
      {
        fileName: 'reject-pending-reservations.ts',
        functionName: 'rejectExpiredPendingReservations'
      }
    );

    throw error;
  }
}