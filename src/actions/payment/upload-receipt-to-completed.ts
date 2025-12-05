// src/actions/payment/upload-receipt-to-completed.ts
'use server'

import { ApiHandler } from "@/lib/api-handler";
import { ServerActionError } from "@/lib/exceptions/server-action-error";
import prisma from "@/lib/prisma";
import { uploadReceiptToCompletedSchema } from "@/schemas/validation/payment-schema";
import { logActionWithErrorHandling } from "@/services/logging/logging-service";
import { TipoAccionUsuario } from "@/types/actions-logs";
import { requireAuthorization } from "@/utils/helpers/auth-helper";

export async function uploadReceiptToCompleted(paymentId: string, proofFileKey: string) {
  try {
    const session = await requireAuthorization('admin', 'upload-receipt-to-completed.ts', 'uploadReceiptToCompleted');

    // Validate input
    const validatedData = uploadReceiptToCompletedSchema.parse({
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
      throw ServerActionError.NotFound('upload-receipt-to-completed.ts', 'uploadReceiptToCompleted', 'Pago no encontrado');
    }

    // Verify payment is COMPLETED
    if (payment.status !== 'COMPLETED') {
      throw ServerActionError.ValidationFailed(
        'upload-receipt-to-completed.ts',
        'uploadReceiptToCompleted',
        'Solo se puede subir comprobante a pagos completados'
      );
    }

    // Verify BankTransfer exists
    if (!payment.bankTransfer) {
      throw ServerActionError.ValidationFailed(
        'upload-receipt-to-completed.ts',
        'uploadReceiptToCompleted',
        'El pago no tiene registro de transferencia bancaria'
      );
    }

    // Update bank transfer with proof file key
    const updatedBankTransfer = await prisma.bankTransfer.update({
      where: { paymentId },
      data: {
        proofFileKey: validatedData.proofFileKey,
      }
    });

    const trip = payment.tripPassenger.trip;

    await logActionWithErrorHandling(
      {
        userId: session.user.id,
        action: TipoAccionUsuario.ADMIN_UPLOAD_PAYMENT_PROOF,
        status: 'SUCCESS',
        details: {
          paymentId,
          tripId: trip.id,
          passengerId: payment.tripPassenger.passenger.userId,
          passengerName: payment.tripPassenger.passenger.user.name,
          amount: payment.totalAmount,
          proofFileKey: validatedData.proofFileKey,
          uploadedToCompleted: true,
        }
      },
      {
        fileName: 'upload-receipt-to-completed.ts',
        functionName: 'uploadReceiptToCompleted'
      }
    );

    return ApiHandler.handleSuccess(
      {
        paymentId: payment.id,
        proofFileKey: updatedBankTransfer.proofFileKey,
      },
      'Comprobante subido exitosamente'
    );
  } catch (error) {
    return ApiHandler.handleError(error);
  }
}
