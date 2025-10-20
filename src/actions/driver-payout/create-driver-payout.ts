// src/actions/driver-payout/create-driver-payout.ts
'use server'

import prisma from "@/lib/prisma";
import { ApiHandler } from "@/lib/api-handler";
import { ServerActionError } from "@/lib/exceptions/server-action-error";
import { logActionWithErrorHandling } from "@/services/logging/logging-service";
import { TipoAccionUsuario } from "@/types/actions-logs";
import { calculateDriverPayout } from "./calculate-driver-payout";
import { PayoutStatus, PaymentMethod, TripStatus } from "@prisma/client";

/**
 * Creates a DriverPayout for a completed trip
 *
 * Validations:
 * - Trip must exist and be COMPLETED
 * - No existing payout for this trip (unique constraint)
 * - At least one valid payment must exist
 *
 * States:
 * - PENDING: payoutAmount > 0 (normal case)
 * - ON_HOLD: payoutAmount === 0 (no valid passengers or all cancelled)
 *
 * @param tripId - The ID of the completed trip
 * @returns Created DriverPayout object
 * @throws ServerActionError if validations fail
 */
export async function createDriverPayout(tripId: string) {
  try {
    // 1. VALIDATION: Check if trip exists and is completed
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      select: {
        id: true,
        status: true,
        driverCar: {
          select: {
            driverId: true
          }
        }
      }
    });

    if (!trip) {
      throw ServerActionError.NotFound(
        'create-driver-payout.ts',
        'createDriverPayout',
        `Trip not found: ${tripId}`
      );
    }

    if (trip.status !== TripStatus.COMPLETED) {
      throw ServerActionError.ValidationFailed(
        'create-driver-payout.ts',
        'createDriverPayout',
        `Trip must be COMPLETED to create payout. Current status: ${trip.status}`
      );
    }

    // 2. VALIDATION: Check if payout already exists
    const existingPayout = await prisma.driverPayout.findUnique({
      where: { tripId }
    });

    if (existingPayout) {
      throw ServerActionError.ValidationFailed(
        'create-driver-payout.ts',
        'createDriverPayout',
        `Payout already exists for trip ${tripId}: ${existingPayout.id}`
      );
    }

    // 3. CALCULATE PAYOUT
    const calculation = await calculateDriverPayout(tripId);

    // 4. VALIDATION: Check if there are valid payments
    // Note: We allow payoutAmount === 0 but log it as ON_HOLD
    if (calculation.validPassengersCount === 0 && calculation.totalReceived === 0) {
      // No valid passengers and no payments - this is unusual but not an error
      // Create payout in ON_HOLD status
      await logActionWithErrorHandling(
        {
          userId: 'SYSTEM',
          action: TipoAccionUsuario.CREACION_PAYOUT_CONDUCTOR,
          status: 'SUCCESS',
          details: {
            tripId,
            reason: 'No valid passengers or payments - creating payout in ON_HOLD status',
            calculation
          }
        },
        {
          fileName: 'create-driver-payout.ts',
          functionName: 'createDriverPayout'
        }
      );
    }

    // 5. DETERMINE STATUS
    // - ON_HOLD: payoutAmount is 0 (no valid passengers, or penalties >= income)
    // - PENDING: payoutAmount > 0 (normal case)
    const status = calculation.payoutAmount === 0 ? PayoutStatus.ON_HOLD : PayoutStatus.PENDING;

    // 6. CREATE PAYOUT
    const payout = await prisma.driverPayout.create({
      data: {
        tripId,
        driverId: trip.driverCar.driverId,
        payoutAmount: calculation.payoutAmount,
        totalReceived: calculation.totalReceived,
        serviceFee: calculation.serviceFee,
        lateCancellationPenalty: calculation.lateCancellationPenalty,
        currency: 'ARS',
        status,
        payoutMethod: PaymentMethod.BANK_TRANSFER,
        notes: calculation.lateCancellationCount > 0
          ? `Payout con ${calculation.lateCancellationCount} cancelación(es) tardía(s). Penalización total: $${calculation.lateCancellationPenalty}`
          : undefined
      },
      include: {
        driver: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        trip: {
          select: {
            originCity: true,
            destinationCity: true,
            departureTime: true
          }
        }
      }
    });

    // 7. SUCCESS LOGGING
    await logActionWithErrorHandling(
      {
        userId: 'SYSTEM',
        action: TipoAccionUsuario.CREACION_PAYOUT_CONDUCTOR,
        status: 'SUCCESS',
        details: {
          tripId,
          payoutId: payout.id,
          driverId: payout.driverId,
          driverName: payout.driver.user.name,
          driverEmail: payout.driver.user.email,
          payoutAmount: calculation.payoutAmount,
          totalReceived: calculation.totalReceived,
          serviceFee: calculation.serviceFee,
          lateCancellationPenalty: calculation.lateCancellationPenalty,
          lateCancellationCount: calculation.lateCancellationCount,
          validPassengersCount: calculation.validPassengersCount,
          status,
          route: `${payout.trip.originCity} → ${payout.trip.destinationCity}`,
          departureTime: payout.trip.departureTime.toISOString()
        }
      },
      {
        fileName: 'create-driver-payout.ts',
        functionName: 'createDriverPayout'
      }
    );

    return ApiHandler.handleSuccess(
      payout,
      status === PayoutStatus.ON_HOLD
        ? 'Payout creado en estado ON_HOLD (monto $0)'
        : 'Payout creado exitosamente'
    );
  } catch (error) {
    // Error logging
    await logActionWithErrorHandling(
      {
        userId: 'SYSTEM',
        action: TipoAccionUsuario.CREACION_PAYOUT_CONDUCTOR,
        status: 'FAILED',
        details: {
          tripId,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      },
      {
        fileName: 'create-driver-payout.ts',
        functionName: 'createDriverPayout'
      }
    );

    return ApiHandler.handleError(error);
  }
}
