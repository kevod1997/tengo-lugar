// src/actions/payment/get-payment-details.ts
'use server'

import prisma from "@/lib/prisma";
import { ApiHandler } from "@/lib/api-handler";
import { ServerActionError } from "@/lib/exceptions/server-action-error";
import { requireAuthentication } from "@/utils/helpers/auth-helper";
import { logActionWithErrorHandling } from "@/services/logging/logging-service";
import { TipoAccionUsuario } from "@/types/actions-logs";

export interface PaymentDetails {
  // Trip information
  tripId: string;
  origin: string;
  destination: string;
  originProvince: string;
  destinationProvince: string;
  tripDate: string;
  departureTime: string;

  // Reservation information
  reservationId: string;
  seatsReserved: number;
  reservationStatus: string;

  // Payment information
  paymentId: string;
  paymentStatus: string;
  tripPrice: number;
  serviceFee: number;
  serviceFeeRate: number;
  subtotal: number;
  totalAmount: number;
  currency: string;

  // User information
  userPhoneNumber: string;
  userName: string;
}

export async function getPaymentDetails(tripId: string) {
  try {
    const session = await requireAuthentication('get-payment-details.ts', 'getPaymentDetails');
    const userId = session.user.id;

    // Get trip passenger with payment info
    const tripPassenger = await prisma.tripPassenger.findFirst({
      where: {
        tripId,
        passenger: {
          userId
        }
      },
      include: {
        trip: {
          select: {
            id: true,
            originCity: true,
            destinationCity: true,
            originProvince: true,
            destinationProvince: true,
            date: true,
            departureTime: true,
            serviceFee: true,
            price: true,
          }
        },
        passenger: {
          include: {
            user: {
              select: {
                name: true,
                phoneNumber: true,
              }
            }
          }
        },
        payment: true
      }
    });

    if (!tripPassenger) {
      throw ServerActionError.NotFound('get-payment-details.ts', 'getPaymentDetails', 'Reserva no encontrada');
    }

    // Verify the reservation is in APPROVED status
    if (tripPassenger.reservationStatus !== 'APPROVED') {
      throw ServerActionError.ValidationFailed(
        'get-payment-details.ts',
        'getPaymentDetails',
        'Esta reserva no está en estado de pago pendiente'
      );
    }

    // Verify payment exists
    if (!tripPassenger.payment) {
      throw ServerActionError.NotFound('get-payment-details.ts', 'getPaymentDetails', 'Pago no encontrado');
    }

    // Verify user has phone number
    if (!tripPassenger.passenger.user.phoneNumber) {
      throw ServerActionError.ValidationFailed(
        'get-payment-details.ts',
        'getPaymentDetails',
        'Debes tener un número de teléfono registrado para realizar el pago'
      );
    }

    const paymentDetails: PaymentDetails = {
      // Trip information
      tripId: tripPassenger.trip.id,
      origin: tripPassenger.trip.originCity,
      destination: tripPassenger.trip.destinationCity,
      originProvince: tripPassenger.trip.originProvince,
      destinationProvince: tripPassenger.trip.destinationProvince,
      tripDate: tripPassenger.trip.date.toISOString(),
      departureTime: tripPassenger.trip.departureTime.toISOString(),

      // Reservation information
      reservationId: tripPassenger.id,
      seatsReserved: tripPassenger.seatsReserved,
      reservationStatus: tripPassenger.reservationStatus,

      // Payment information
      paymentId: tripPassenger.payment.id,
      paymentStatus: tripPassenger.payment.status,
      tripPrice: tripPassenger.trip.price,
      serviceFee: tripPassenger.payment.serviceFee,
      serviceFeeRate: tripPassenger.trip.serviceFee || 0,
      subtotal: tripPassenger.trip.price,
      totalAmount: tripPassenger.payment.totalAmount,
      currency: tripPassenger.payment.currency,

      // User information
      userPhoneNumber: tripPassenger.passenger.user.phoneNumber,
      userName: tripPassenger.passenger.user.name,
    };

    await logActionWithErrorHandling(
      {
        userId,
        action: TipoAccionUsuario.CONSULTA,
        status: 'SUCCESS',
        details: {
          tripId,
          paymentId: tripPassenger.payment.id,
        }
      },
      {
        fileName: 'get-payment-details.ts',
        functionName: 'getPaymentDetails'
      }
    );

    return ApiHandler.handleSuccess(paymentDetails, 'Detalles de pago obtenidos correctamente');
  } catch (error) {
    return ApiHandler.handleError(error);
  }
}
