// src/actions/payment/get-pending-payments.ts
'use server'

import { ApiHandler } from "@/lib/api-handler";
import prisma from "@/lib/prisma";
import { logActionWithErrorHandling } from "@/services/logging/logging-service";
import { TipoAccionUsuario } from "@/types/actions-logs";
import { requireAuthorization } from "@/utils/helpers/auth-helper";

import type { PaymentStatus } from "@prisma/client";

export interface PendingPayment {
  id: string;
  totalAmount: number;
  serviceFee: number;
  currency: string;
  status: PaymentStatus;
  createdAt: string;
  completedAt: string | null;

  // Trip info
  tripId: string;
  originCity: string;
  destinationCity: string;
  tripDate: string;

  // Passenger info
  passengerId: string;
  passengerName: string;
  passengerEmail: string;

  // Reservation info
  reservationId: string;
  reservationStatus: string;
  seatsReserved: number;

  // Bank transfer info
  hasProof: boolean;
  proofFileKey: string | null;
  verifiedAt: string | null;
  verifiedBy: string | null;
}

export interface PendingPaymentsResponse {
  payments: PendingPayment[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

interface GetPendingPaymentsParams {
  page?: number;
  pageSize?: number;
  status?: PaymentStatus | 'ALL';
  searchTerm?: string;
  startDate?: string;
  endDate?: string;
}

export async function getPendingPayments(params: GetPendingPaymentsParams = {}) {
  try {
    const session = await requireAuthorization('admin', 'get-pending-payments.ts', 'getPendingPayments');

    const {
      page = 1,
      pageSize = 10,
      status = 'ALL',
      searchTerm = '',
      startDate,
      endDate,
    } = params;

    // Build where clause
    const where: any = {};

    // Filter by status
    if (status !== 'ALL') {
      where.status = status;
    } else {
      // Default: show pending, processing, and completed payments without receipts
      where.OR = [
        { status: { in: ['PENDING', 'PROCESSING'] } },
        {
          AND: [
            { status: 'COMPLETED' },
            {
              OR: [
                { bankTransfer: null },
                { bankTransfer: { proofFileKey: null } }
              ]
            }
          ]
        }
      ];
    }

    // Filter by date range
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // Filter by search term (passenger name or email)
    if (searchTerm) {
      where.tripPassenger = {
        passenger: {
          user: {
            OR: [
              { name: { contains: searchTerm, mode: 'insensitive' } },
              { email: { contains: searchTerm, mode: 'insensitive' } },
            ]
          }
        }
      };
    }

    // Count total
    const total = await prisma.payment.count({ where });

    // Calculate pagination
    const totalPages = Math.ceil(total / pageSize);
    const skip = (page - 1) * pageSize;

    // Fetch payments
    const payments = await prisma.payment.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        tripPassenger: {
          include: {
            passenger: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  }
                }
              }
            },
            trip: {
              select: {
                id: true,
                originCity: true,
                destinationCity: true,
                date: true,
              }
            }
          }
        },
        bankTransfer: {
          select: {
            proofFileKey: true,
            verifiedAt: true,
            verifiedBy: true,
          }
        }
      }
    });

    const formattedPayments: PendingPayment[] = payments.map(payment => ({
      id: payment.id,
      totalAmount: payment.totalAmount,
      serviceFee: payment.serviceFee,
      currency: payment.currency,
      status: payment.status,
      createdAt: payment.createdAt.toISOString(),
      completedAt: payment.completedAt?.toISOString() || null,

      // Trip info
      tripId: payment.tripPassenger.trip.id,
      originCity: payment.tripPassenger.trip.originCity,
      destinationCity: payment.tripPassenger.trip.destinationCity,
      tripDate: payment.tripPassenger.trip.date.toISOString(),

      // Passenger info
      passengerId: payment.tripPassenger.passenger.userId,
      passengerName: payment.tripPassenger.passenger.user.name,
      passengerEmail: payment.tripPassenger.passenger.user.email,

      // Reservation info
      reservationId: payment.tripPassenger.id,
      reservationStatus: payment.tripPassenger.reservationStatus,
      seatsReserved: payment.tripPassenger.seatsReserved,

      // Bank transfer info
      hasProof: !!payment.bankTransfer?.proofFileKey,
      proofFileKey: payment.bankTransfer?.proofFileKey || null,
      verifiedAt: payment.bankTransfer?.verifiedAt?.toISOString() || null,
      verifiedBy: payment.bankTransfer?.verifiedBy || null,
    }));

    const response: PendingPaymentsResponse = {
      payments: formattedPayments,
      pagination: {
        total,
        page,
        pageSize,
        totalPages,
      }
    };

    await logActionWithErrorHandling(
      {
        userId: session.user.id,
        action: TipoAccionUsuario.ADMIN_GET_PENDING_PAYMENTS,
        status: 'SUCCESS',
        details: {
          page,
          pageSize,
          status,
          total,
        }
      },
      {
        fileName: 'get-pending-payments.ts',
        functionName: 'getPendingPayments'
      }
    );

    return ApiHandler.handleSuccess(response, 'Pagos obtenidos correctamente');
  } catch (error) {
    return ApiHandler.handleError(error);
  }
}
