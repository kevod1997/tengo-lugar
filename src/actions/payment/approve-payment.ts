// src/actions/payment/approve-payment.ts
'use server'

import prisma from "@/lib/prisma";
import { ApiHandler } from "@/lib/api-handler";
import { ServerActionError } from "@/lib/exceptions/server-action-error";
import { requireAuthorization } from "@/utils/helpers/auth-helper";
import { logActionWithErrorHandling } from "@/services/logging/logging-service";
import { TipoAccionUsuario } from "@/types/actions-logs";
import { notifyUser } from "@/utils/notifications/notification-helpers";
import { approvePaymentWithProofSchema } from "@/schemas/validation/payment-schema";

export async function approvePayment(paymentId: string, proofFileKey: string) {
  try {
    const session = await requireAuthorization('admin', 'approve-payment.ts', 'approvePayment');

    // Validate input
    const validatedData = approvePaymentWithProofSchema.parse({
      paymentId,
      proofFileKey,
    });

    // Get payment with all related data
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
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
        bankTransfer: true,
      }
    });

    if (!payment) {
      throw ServerActionError.NotFound('approve-payment.ts', 'approvePayment', 'Pago no encontrado');
    }

    // Verify payment is in a valid state to approve
    if (payment.status === 'COMPLETED') {
      throw ServerActionError.ValidationFailed(
        'approve-payment.ts',
        'approvePayment',
        'Este pago ya fue aprobado anteriormente'
      );
    }

    if (payment.status === 'CANCELLED') {
      throw ServerActionError.ValidationFailed(
        'approve-payment.ts',
        'approvePayment',
        'No se puede aprobar un pago cancelado'
      );
    }

    // Create bank transfer record if it doesn't exist
    if (!payment.bankTransfer) {
      await prisma.bankTransfer.create({
        data: {
          paymentId: payment.id,
          proofFileKey: validatedData.proofFileKey,
        }
      });
    }

    // Update payment, reservation, and bank transfer in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update payment status
      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        }
      });

      // Update reservation status to CONFIRMED
      const updatedReservation = await tx.tripPassenger.update({
        where: { id: payment.tripPassengerId },
        data: {
          reservationStatus: 'CONFIRMED',
        }
      });

      // Update bank transfer verification info and proof file key
      const updatedBankTransfer = await tx.bankTransfer.update({
        where: { paymentId },
        data: {
          proofFileKey: validatedData.proofFileKey,
          verifiedAt: new Date(),
          verifiedBy: session.user.id,
        }
      });

      return {
        payment: updatedPayment,
        reservation: updatedReservation,
        bankTransfer: updatedBankTransfer,
      };
    });

    // Send notification to passenger
    const passengerUserId = payment.tripPassenger.passenger.userId;
    const trip = payment.tripPassenger.trip;

    await notifyUser(
      passengerUserId,
      '¡Pago confirmado!',
      `Tu pago para el viaje de ${trip.originCity} a ${trip.destinationCity} ha sido verificado. ¡Estás listo para viajar!`,
      undefined,
      `/viajes/${trip.id}`
    );

    await logActionWithErrorHandling(
      {
        userId: session.user.id,
        action: TipoAccionUsuario.ADMIN_APPROVE_PAYMENT,
        status: 'SUCCESS',
        details: {
          paymentId,
          tripId: trip.id,
          passengerId: passengerUserId,
          passengerName: payment.tripPassenger.passenger.user.name,
          amount: payment.totalAmount,
          proofFileKey: validatedData.proofFileKey,
        }
      },
      {
        fileName: 'approve-payment.ts',
        functionName: 'approvePayment'
      }
    );

    return ApiHandler.handleSuccess(
      {
        paymentId: result.payment.id,
        status: result.payment.status,
        reservationStatus: result.reservation.reservationStatus,
      },
      'Pago aprobado exitosamente'
    );
  } catch (error) {
    return ApiHandler.handleError(error);
  }
}
