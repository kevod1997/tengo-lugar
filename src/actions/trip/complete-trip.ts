// src/actions/trip/complete-trip.ts
'use server'

import prisma from "@/lib/prisma";
import { ApiHandler } from "@/lib/api-handler";
import { ServerActionError } from "@/lib/exceptions/server-action-error";
import { logActionWithErrorHandling } from "@/services/logging/logging-service";
import { TipoAccionUsuario } from "@/types/actions-logs";

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

    return ApiHandler.handleSuccess(
      { 
        success: true,
        tripId,
        completedPassengers: trip.passengers.length
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
    // Find all active trips where departure time + 24 hours has passed
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const expiredTrips = await prisma.trip.findMany({
      where: {
        status: 'ACTIVE',
        departureTime: {
          lt: twentyFourHoursAgo
        }
      },
      select: {
        id: true,
        departureTime: true
      }
    });

    if (expiredTrips.length === 0) {
      return ApiHandler.handleSuccess(
        { processedTrips: 0 },
        'No hay viajes expirados para completar'
      );
    }

    // Store the count before processing
    const totalTripsToProcess = expiredTrips.length;
    
    // Process each expired trip
    const results = [];
    for (const trip of expiredTrips) {
      try {
        const result = await completeTripAction(trip.id, true);
        results.push({ tripId: trip.id, success: true, result });
      } catch (error) {
        results.push({ 
          tripId: trip.id, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    // Only log if there were actual results to process
    if (results.length > 0) {
        await logActionWithErrorHandling(
        {
          userId: 'SYSTEM',
          action: TipoAccionUsuario.FINALIZACION_VIAJE,
          status: successCount > 0 ? 'SUCCESS' : 'FAILED',
          details: {
            totalTrips: totalTripsToProcess,
            successCount,
            failureCount,
            results: results.map(r => ({ tripId: r.tripId, success: r.success }))
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
        processedTrips: totalTripsToProcess,
        successCount,
        failureCount,
        tripIds: results.map(r => r.tripId)
      },
      `Procesados ${totalTripsToProcess} viajes expirados. ${successCount} completados exitosamente, ${failureCount} fallaron.`
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