// src/actions/trip/complete-trip.ts
'use server'

import prisma from "@/lib/prisma";
import { ApiHandler } from "@/lib/api-handler";
import { ServerActionError } from "@/lib/exceptions/server-action-error";
import { logActionWithErrorHandling } from "@/services/logging/logging-service";
import { TipoAccionUsuario } from "@/types/actions-logs";
import { TRIP_COMPLETION_CONFIG } from "@/lib/constants/trip-completion-config";
import { processSystemCancellation } from "@/utils/helpers/cancellation-helper";

export async function completeTripAction(tripId: string, isAutomated = false) {
  try {
    // Get the trip first to verify it exists and can be completed
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        passengers: {
          where: {
            reservationStatus: 'CONFIRMED'
          }
        }
      }
    });

    if (!trip) {
      throw ServerActionError.NotFound('complete-trip.ts', 'completeTripAction', 'Viaje no encontrado');
    }

    // Verify trip can be completed (must be ACTIVE)
    if (trip.status !== 'ACTIVE') {
      throw ServerActionError.ValidationFailed(
        'complete-trip.ts',
        'completeTripAction',
        `Viaje no puede ser completado. Estado actual: ${trip.status}`
      );
    }

    // Verify trip departure time + 24 hours has passed (for automated completion)
    if (isAutomated) {
      const twentyFourHoursAfterDeparture = new Date(trip.departureTime);
      twentyFourHoursAfterDeparture.setHours(twentyFourHoursAfterDeparture.getHours() + 24);

      if (new Date() < twentyFourHoursAfterDeparture) {
        throw ServerActionError.ValidationFailed(
          'complete-trip.ts',
          'completeTripAction',
          'No han pasado 24 horas desde la hora de salida del viaje'
        );
      }
    }

    // Check if trip has confirmed passengers
    // If no CONFIRMED passengers, cancel trip instead of completing it
    if (trip.passengers.length === 0) {
      await prisma.$transaction(async (tx) => {
        await processSystemCancellation(
          tripId,
          'Viaje cancelado automáticamente por el sistema: sin pasajeros confirmados al momento de expiración',
          tx
        );
      });

      await logActionWithErrorHandling(
        {
          userId: 'SYSTEM',
          action: TipoAccionUsuario.CANCELACION_VIAJE,
          status: 'SUCCESS',
          details: {
            tripId,
            reason: 'no_confirmed_passengers',
            isAutomated: true,
            cancelledBy: 'SYSTEM',
            departureTime: trip.departureTime.toISOString()
          }
        },
        {
          fileName: 'complete-trip.ts',
          functionName: 'completeTripAction'
        }
      );

      return ApiHandler.handleSuccess(
        {
          tripId,
          status: 'CANCELLED',
          reason: 'no_confirmed_passengers',
          cancelledPassengers: 0
        },
        'Viaje cancelado por falta de pasajeros confirmados'
      );
    }

    // Update trip status and passenger reservations in a transaction
    await prisma.$transaction([
      // Update trip status to COMPLETED
      prisma.trip.update({
        where: { id: tripId },
        data: { status: 'COMPLETED' }
      }),
      // Update all confirmed passenger reservations to COMPLETED
      prisma.tripPassenger.updateMany({
        where: { 
          tripId,
          reservationStatus: 'APPROVED'
        },
        data: { reservationStatus: 'COMPLETED' }
      })
    ]);

    await logActionWithErrorHandling(
      {
        userId: 'SYSTEM', // For automated completion
        action: TipoAccionUsuario.FINALIZACION_VIAJE,
        status: 'SUCCESS',
        details: {
          tripId,
          isAutomated,
          completedPassengers: trip.passengers.length,
          departureTime: trip.departureTime.toISOString()
        }
      },
      {
        fileName: 'complete-trip.ts',
        functionName: 'completeTripAction'
      }
    );

    // Create DriverPayout automatically after trip completion
    // This is done AFTER trip completion to avoid rollback if payout creation fails
    let payoutCreated = false;
    let payoutId: string | undefined;

    try {
      const { createDriverPayout } = await import('@/actions/driver-payout/create-driver-payout');
      const payoutResult = await createDriverPayout(tripId);

      if (payoutResult.success && payoutResult.data) {
        payoutCreated = true;
        payoutId = payoutResult.data.id;
        console.log(`[Trip Completion] DriverPayout created successfully: ${payoutId}`);
      }
    } catch (payoutError) {
      // Log error but DO NOT fail trip completion
      // Admin can manually create payout from dashboard
      const { logError } = await import('@/services/logging/logging-service');
      await logError({
        origin: 'Trip Completion - Payout Creation',
        code: 'PAYOUT_CREATION_FAILED',
        message: 'Failed to create DriverPayout after trip completion',
        details: JSON.stringify({
          tripId,
          error: payoutError instanceof Error ? payoutError.message : 'Unknown error',
          stack: payoutError instanceof Error ? payoutError.stack : undefined
        }),
        fileName: 'complete-trip.ts',
        functionName: 'completeTripAction'
      });

      console.error(`[Trip Completion] Failed to create DriverPayout for trip ${tripId}:`, payoutError);
    }

    return ApiHandler.handleSuccess(
      {
        success: true,
        tripId,
        status: 'COMPLETED',
        completedPassengers: trip.passengers.length,
        payoutCreated,
        payoutId
      },
      'Viaje completado exitosamente'
    );
  } catch (error) {
    await logActionWithErrorHandling(
      {
        userId: 'SYSTEM',
        action: TipoAccionUsuario.FINALIZACION_VIAJE,
        status: 'FAILED',
        details: { 
          tripId,
          isAutomated,
          error: error instanceof Error ? error.message : 'Unknown error' 
        }
      },
      {
        fileName: 'complete-trip.ts',
        functionName: 'completeTripAction'
      }
    );
    
    throw error;
  }
}

export async function completeExpiredTrips() {
  try {
    const now = new Date();
    const bufferSeconds = TRIP_COMPLETION_CONFIG.COMPLETION_BUFFER_SECONDS;

    // Query optimizada: La DB calcula y filtra directamente
    // Solo devuelve viajes que YA deben completarse
    // Lógica SQL: now >= (departureTime + durationSeconds + buffer)
    // Reescrito: (departureTime + INTERVAL durationSeconds + buffer) <= now
    const tripsToComplete = await prisma.$queryRaw<
      Array<{ id: string; departureTime: Date; durationSeconds: number }>
    >`
      SELECT id, "departureTime", "durationSeconds"
      FROM "Trip"
      WHERE status = 'ACTIVE'
        AND "durationSeconds" IS NOT NULL
        AND "durationSeconds" > 0
        AND ("departureTime" + (("durationSeconds" + ${bufferSeconds}) * interval '1 second')) <= ${now}
    `;

    // Query separada para viajes sin duración (para logging)
    const skippedTrips = await prisma.$queryRaw<
      Array<{ id: string; departureTime: Date }>
    >`
      SELECT id, "departureTime"
      FROM "Trip"
      WHERE status = 'ACTIVE'
        AND ("durationSeconds" IS NULL OR "durationSeconds" <= 0)
    `;

    // Log si hay viajes sin duración (problema de datos)
    if (skippedTrips.length > 0) {
      await logActionWithErrorHandling(
        {
          userId: 'SYSTEM',
          action: TipoAccionUsuario.FINALIZACION_VIAJE,
          status: 'FAILED',
          details: {
            message: 'Viajes activos sin durationSeconds detectados',
            skippedCount: skippedTrips.length,
            tripIds: skippedTrips.map(t => t.id),
          }
        },
        {
          fileName: 'complete-trip.ts',
          functionName: 'completeExpiredTrips'
        }
      );
    }

    if (tripsToComplete.length === 0) {
      return ApiHandler.handleSuccess(
        {
          processedTrips: 0,
          completedTrips: 0,
          cancelledTrips: 0,
          successCount: 0,
          failureCount: 0,
          skippedTrips: skippedTrips.length,
          tripIds: []
        },
        skippedTrips.length > 0
          ? `${skippedTrips.length} viajes sin durationSeconds fueron ignorados`
          : 'No hay viajes para completar'
      );
    }

    // Completar cada viaje en paralelo para mejor performance
    const completionResults = await Promise.allSettled(
      tripsToComplete.map(trip =>
        completeTripAction(trip.id, true)
          .then(result => ({ tripId: trip.id, success: true, result }))
      )
    );

    // Mapear resultados de Promise.allSettled a formato esperado
    const results = completionResults.map((result, index) => {
      const tripId = tripsToComplete[index].id;
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          tripId,
          success: false,
          error: result.reason instanceof Error ? result.reason.message : 'Unknown error'
        };
      }
    });

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;
    const completedTrips = results.filter(r => r.success && 'result' in r && r.result?.data?.status === 'COMPLETED').length;
    const cancelledTrips = results.filter(r => r.success && 'result' in r && r.result?.data?.status === 'CANCELLED').length;

    // Log de resultados
    if (results.length > 0) {
      await logActionWithErrorHandling(
        {
          userId: 'SYSTEM',
          action: TipoAccionUsuario.FINALIZACION_VIAJE,
          status: successCount > 0 ? 'SUCCESS' : 'FAILED',
          details: {
            totalProcessed: tripsToComplete.length,
            successCount,
            failureCount,
            completedTrips,
            cancelledTrips,
            skippedCount: skippedTrips.length,
            results: results.map(r => ({
              tripId: r.tripId,
              success: r.success,
              status: r.success && 'result' in r ? r.result?.data?.status : undefined
            })),
            bufferUsed: TRIP_COMPLETION_CONFIG.COMPLETION_BUFFER_SECONDS,
          }
        },
        {
          fileName: 'complete-trip.ts',
          functionName: 'completeExpiredTrips'
        }
      );
    }

    return ApiHandler.handleSuccess(
      {
        processedTrips: tripsToComplete.length,
        completedTrips,
        cancelledTrips,
        successCount,
        failureCount,
        skippedTrips: skippedTrips.length,
        tripIds: results.map(r => r.tripId)
      },
      `Procesados ${tripsToComplete.length} viajes. ${completedTrips} completados, ${cancelledTrips} cancelados (sin pasajeros), ${failureCount} fallaron. ${skippedTrips.length} ignorados por falta de duración.`
    );
  } catch (error) {
    await logActionWithErrorHandling(
      {
        userId: 'SYSTEM',
        action: TipoAccionUsuario.FINALIZACION_VIAJE,
        status: 'FAILED',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      },
      {
        fileName: 'complete-trip.ts',
        functionName: 'completeExpiredTrips'
      }
    );

    return ApiHandler.handleError(error);
  }
}