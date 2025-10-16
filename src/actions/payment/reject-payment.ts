// src/actions/payment/reject-payment.ts
'use server'

import prisma from "@/lib/prisma";
import { ApiHandler } from "@/lib/api-handler";
import { ServerActionError } from "@/lib/exceptions/server-action-error";
import { requireAuthorization } from "@/utils/helpers/auth-helper";
import { logActionWithErrorHandling } from "@/services/logging/logging-service";
import { TipoAccionUsuario } from "@/types/actions-logs";
import { notifyUser } from "@/utils/notifications/notification-helpers";
import { z } from "zod";

const rejectPaymentSchema = z.object({
  paymentId: z.string().min(1, 'Payment ID es requerido'),
  reason: z.string().min(10, 'La razón debe tener al menos 10 caracteres'),
});

export async function rejectPayment(data: { paymentId: string; reason: string }) {
  try {
    const session = await requireAuthorization('admin', 'reject-payment.ts', 'rejectPayment');

    // Validate input
    const validatedData = rejectPaymentSchema.parse(data);
    const { paymentId, reason } = validatedData;

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
      throw ServerActionError.NotFound('reject-payment.ts', 'rejectPayment', 'Pago no encontrado');
    }

    // Verify payment is in a valid state to reject
    if (payment.status === 'COMPLETED') {
      throw ServerActionError.ValidationFailed(
        'reject-payment.ts',
        'rejectPayment',
        'No se puede rechazar un pago que ya fue completado'
      );
    }

    if (payment.status === 'CANCELLED') {
      throw ServerActionError.ValidationFailed(
        'reject-payment.ts',
        'rejectPayment',
        'Este pago ya fue cancelado anteriormente'
      );
    }

    if (!payment.bankTransfer) {
      throw ServerActionError.ValidationFailed(
        'reject-payment.ts',
        'rejectPayment',
        'No hay información de transferencia bancaria para este pago'
      );
    }

    // Update payment and bank transfer in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update payment status
      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: 'FAILED',
        }
      });

      // Update bank transfer with failure reason
      const updatedBankTransfer = await tx.bankTransfer.update({
        where: { paymentId },
        data: {
          failureReason: reason,
        }
      });

      return {
        payment: updatedPayment,
        bankTransfer: updatedBankTransfer,
      };
    });

    // Send notification to passenger
    const passengerUserId = payment.tripPassenger.passenger.userId;
    const trip = payment.tripPassenger.trip;

    await notifyUser(
      passengerUserId,
      'Pago rechazado',
      `Tu pago para el viaje de ${trip.originCity} a ${trip.destinationCity} no pudo ser verificado. Motivo: ${reason}. Por favor, verifica los datos y vuelve a enviar el comprobante.`,
      'payment_rejected',
      `/viajes/${trip.id}/pagar`
    );

    await logActionWithErrorHandling(
      {
        userId: session.user.id,
        action: TipoAccionUsuario.ADMIN_REJECT_PAYMENT,
        status: 'SUCCESS',
        details: {
          paymentId,
          tripId: trip.id,
          passengerId: passengerUserId,
          passengerName: payment.tripPassenger.passenger.user.name,
          amount: payment.totalAmount,
          reason,
        }
      },
      {
        fileName: 'reject-payment.ts',
        functionName: 'rejectPayment'
      }
    );

    return ApiHandler.handleSuccess(
      {
        paymentId: result.payment.id,
        status: result.payment.status,
      },
      'Pago rechazado exitosamente'
    );
  } catch (error) {
    return ApiHandler.handleError(error);
  }
}
