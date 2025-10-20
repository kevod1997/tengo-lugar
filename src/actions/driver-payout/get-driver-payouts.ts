// src/actions/driver-payout/get-driver-payouts.ts
'use server'

import prisma from "@/lib/prisma";
import { ApiHandler } from "@/lib/api-handler";
import { requireAuthorization } from "@/utils/helpers/auth-helper";
import { logActionWithErrorHandling } from "@/services/logging/logging-service";
import { TipoAccionUsuario } from "@/types/actions-logs";
import { PayoutStatus } from "@prisma/client";
import { GetDriverPayoutsParams, GetDriverPayoutsResponse, DriverPayoutWithDetails } from "@/types/driver-payout";

/**
 * Retrieves driver payouts with filtering and pagination
 * Admin-only action
 *
 * Filters:
 * - status: Filter by PayoutStatus or 'ALL'
 * - searchTerm: Search by driver name, email, or trip ID
 * - driverId: Filter by specific driver
 * - dateFrom/dateTo: Filter by creation date range
 *
 * @param params - Filter and pagination parameters
 * @returns Paginated list of driver payouts with details
 */
export async function getDriverPayouts(params: GetDriverPayoutsParams = {}) {
  try {
    const session = await requireAuthorization(
      'admin',
      'get-driver-payouts.ts',
      'getDriverPayouts'
    );

    const {
      page = 1,
      pageSize = 10,
      status = 'ALL',
      searchTerm = '',
      driverId,
      dateFrom,
      dateTo,
    } = params;

    // Build where clause
    const where: any = {};

    // Filter by status
    if (status !== 'ALL') {
      where.status = status;
    } else {
      // Default: show pending, processing, and on_hold payouts
      where.status = {
        in: [PayoutStatus.PENDING, PayoutStatus.PROCESSING, PayoutStatus.ON_HOLD]
      };
    }

    // Filter by specific driver
    if (driverId) {
      where.driverId = driverId;
    }

    // Filter by date range
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = dateFrom;
      }
      if (dateTo) {
        where.createdAt.lte = dateTo;
      }
    }

    // Filter by search term (driver name, email, or trip ID)
    if (searchTerm) {
      where.OR = [
        // Search by driver name
        {
          driver: {
            user: {
              name: { contains: searchTerm, mode: 'insensitive' as const }
            }
          }
        },
        // Search by driver email
        {
          driver: {
            user: {
              email: { contains: searchTerm, mode: 'insensitive' as const }
            }
          }
        },
        // Search by trip ID (if valid UUID format)
        ...(searchTerm.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
          ? [{ tripId: searchTerm }]
          : [])
      ];
    }

    // Count total
    const total = await prisma.driverPayout.count({ where });

    // Calculate pagination
    const totalPages = Math.ceil(total / pageSize);
    const skip = (page - 1) * pageSize;

    // Fetch payouts with optimized includes
    const payouts = await prisma.driverPayout.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        tripId: true,
        driverId: true,
        payoutAmount: true,
        totalReceived: true,
        serviceFee: true,
        lateCancellationPenalty: true,
        currency: true,
        status: true,
        payoutMethod: true,
        notes: true,
        processedBy: true,
        createdAt: true,
        updatedAt: true,
        processedAt: true,
        completedAt: true,
        driver: {
          select: {
            id: true,
            bankAlias: true,
            bankCbuOrCvu: true,
            bankInfoVerified: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profileImageKey: true,
              }
            }
          }
        },
        trip: {
          select: {
            id: true,
            originCity: true,
            originProvince: true,
            destinationCity: true,
            destinationProvince: true,
            departureTime: true,
            price: true,
            status: true,
            chatRoomId: true,
          }
        },
        transferProof: {
          select: {
            id: true,
            proofFileKey: true,
            transferDate: true,
            transferredBy: true,
            notes: true,
          }
        }
      }
    });

    // Format payouts to match DriverPayoutWithDetails interface
    const formattedPayouts: DriverPayoutWithDetails[] = payouts.map(payout => ({
      id: payout.id,
      tripId: payout.tripId,
      driverId: payout.driverId,
      payoutAmount: payout.payoutAmount,
      totalReceived: payout.totalReceived ?? undefined,
      serviceFee: payout.serviceFee ?? undefined,
      lateCancellationPenalty: payout.lateCancellationPenalty ?? undefined,
      currency: payout.currency,
      status: payout.status,
      payoutMethod: payout.payoutMethod,
      notes: payout.notes,
      processedBy: payout.processedBy,
      createdAt: payout.createdAt,
      updatedAt: payout.updatedAt,
      processedAt: payout.processedAt,
      completedAt: payout.completedAt,
      driver: payout.driver,
      trip: payout.trip,
      transferProof: payout.transferProof ?? undefined,
    }));

    const response: GetDriverPayoutsResponse = {
      payouts: formattedPayouts,
      pagination: {
        currentPage: page,
        pageSize,
        totalItems: total,
        totalPages,
      }
    };

    await logActionWithErrorHandling(
      {
        userId: session.user.id,
        action: TipoAccionUsuario.CONSULTA_PAYOUTS_CONDUCTOR,
        status: 'SUCCESS',
        details: {
          page,
          pageSize,
          status,
          searchTerm,
          driverId,
          total,
          resultCount: formattedPayouts.length,
        }
      },
      {
        fileName: 'get-driver-payouts.ts',
        functionName: 'getDriverPayouts'
      }
    );

    return ApiHandler.handleSuccess(
      response,
      `${total} payout(s) encontrado(s)`
    );
  } catch (error) {
    return ApiHandler.handleError(error);
  }
}
