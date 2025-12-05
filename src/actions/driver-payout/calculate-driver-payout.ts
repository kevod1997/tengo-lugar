// src/actions/driver-payout/calculate-driver-payout.ts
'use server'

import { PaymentStatus, ReservationStatus } from "@prisma/client";

import { ServerActionError } from "@/lib/exceptions/server-action-error";
import prisma from "@/lib/prisma";
import type { DriverPayoutCalculation } from "@/types/driver-payout";


/**
 * Calculates the payout amount for a driver based on trip data
 *
 * Formula:
 * payoutAmount = totalReceived - serviceFee - lateCancellationPenalty
 *
 * Where:
 * - totalReceived = Sum of all COMPLETED payments from APPROVED/COMPLETED passengers
 * - serviceFee = Platform commission based on FeePolicy
 * - lateCancellationPenalty = Sum of seat prices for CANCELLED_LATE reservations
 *
 * @param tripId - The ID of the trip to calculate payout for
 * @returns DriverPayoutCalculation object with detailed breakdown
 * @throws ServerActionError if trip not found or validation fails
 */
export async function calculateDriverPayout(
  tripId: string
): Promise<DriverPayoutCalculation> {
  try {
    // Fetch trip with all necessary relations
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      select: {
        id: true,
        price: true, // price per seat
        serviceFee: true, // service fee from trip (if stored)
        category: {
          select: {
            feePolicy: {
              select: {
                serviceFeeRate: true,
                serviceFeeType: true,
                minimumFee: true,
                maximumFee: true,
              }
            }
          }
        },
        passengers: {
          select: {
            id: true,
            reservationStatus: true,
            totalPrice: true,
            payment: {
              select: {
                id: true,
                status: true,
                totalAmount: true,
                serviceFee: true,
              }
            }
          }
        }
      }
    });

    if (!trip) {
      throw ServerActionError.NotFound(
        'calculate-driver-payout.ts',
        'calculateDriverPayout',
        `Trip not found: ${tripId}`
      );
    }

    // Valid reservation statuses for payout calculation
    const validStatuses: ReservationStatus[] = ['APPROVED', 'COMPLETED', 'CONFIRMED'];

    // Filter valid passengers (those who should contribute to driver's payout)
    const validPassengers = trip.passengers.filter(
      p => validStatuses.includes(p.reservationStatus) &&
           p.payment &&
           p.payment.status === PaymentStatus.COMPLETED
    );

    // Calculate total received from valid payments
    const totalReceived = validPassengers.reduce(
      (sum, passenger) => sum + (passenger.payment?.totalAmount || 0),
      0
    );

    // Count valid passengers
    const validPassengersCount = validPassengers.length;

    // Calculate service fee based on FeePolicy
    let serviceFee = 0;
    if (trip.category?.feePolicy) {
      const { serviceFeeRate, serviceFeeType, minimumFee, maximumFee } = trip.category.feePolicy;

      switch (serviceFeeType) {
        case 'PERCENTAGE':
          serviceFee = totalReceived * (serviceFeeRate / 100);
          break;
        case 'FIXED_AMOUNT':
          serviceFee = serviceFeeRate;
          break;
        case 'PER_SEAT':
          serviceFee = serviceFeeRate * validPassengersCount;
          break;
        default:
          serviceFee = 0;
      }

      // Apply minimum and maximum fee constraints
      if (minimumFee !== null && serviceFee < minimumFee) {
        serviceFee = minimumFee;
      }
      if (maximumFee !== null && serviceFee > maximumFee) {
        serviceFee = maximumFee;
      }
    } else if (trip.serviceFee !== null) {
      // Fallback: use service fee stored directly in trip
      serviceFee = trip.serviceFee;
    } else {
      // No fee policy defined, use 0
      serviceFee = 0;
    }

    // Calculate late cancellation penalty
    // Late cancellations mean the driver loses potential income from those seats
    const lateCancellations = trip.passengers.filter(
      p => p.reservationStatus === ReservationStatus.CANCELLED_LATE
    );

    const lateCancellationCount = lateCancellations.length;

    // Penalty: driver loses the seat price for each late cancellation
    // This is because they couldn't fill the seat due to late notice
    const lateCancellationPenalty = lateCancellations.reduce(
      (sum) => sum + trip.price, // Use price per seat from trip
      0
    );

    // Calculate final payout amount
    // Cannot be negative (edge case: penalties exceed income)
    const payoutAmount = Math.max(
      0,
      totalReceived - serviceFee - lateCancellationPenalty
    );

    const calculation: DriverPayoutCalculation = {
      totalReceived,
      serviceFee,
      lateCancellationPenalty,
      lateCancellationCount,
      payoutAmount,
      validPassengersCount,
    };

    return calculation;
  } catch (error) {
    if (error instanceof ServerActionError) {
      throw error;
    }

    throw ServerActionError.DatabaseError(
      'calculate-driver-payout.ts',
      'calculateDriverPayout',
      `Error calculating driver payout: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
