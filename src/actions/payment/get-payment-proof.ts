// src/actions/payment/get-payment-proof.ts
'use server'

import { ApiHandler } from "@/lib/api-handler";
import { ServerActionError } from "@/lib/exceptions/server-action-error";
import prisma from "@/lib/prisma";
import { s3Service } from "@/lib/s3/s3";
import { logActionWithErrorHandling } from "@/services/logging/logging-service";
import { TipoAccionUsuario } from "@/types/actions-logs";
import { requireAuthorization } from "@/utils/helpers/auth-helper";

export async function getPaymentProof(paymentId: string) {
  try {
    const session = await requireAuthorization('admin', 'get-payment-proof.ts', 'getPaymentProof');

    // Get payment with bank transfer info
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        bankTransfer: true,
        tripPassenger: {
          include: {
            passenger: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!payment) {
      throw ServerActionError.NotFound('get-payment-proof.ts', 'getPaymentProof', 'Pago no encontrado');
    }

    if (!payment.bankTransfer) {
      throw ServerActionError.NotFound('get-payment-proof.ts', 'getPaymentProof', 'Transferencia bancaria no encontrada');
    }

    if (!payment.bankTransfer.proofFileKey) {
      throw ServerActionError.NotFound(
        'get-payment-proof.ts',
        'getPaymentProof',
        'No hay comprobante de pago disponible. El pasajero aún no ha enviado el comprobante.'
      );
    }

    // Generate signed URL for the proof (1 hour expiration)
    const signedUrl = await s3Service.getSignedDownloadUrl(payment.bankTransfer.proofFileKey, 3600);

    await logActionWithErrorHandling(
      {
        userId: session.user.id,
        action: TipoAccionUsuario.ADMIN_VIEW_PAYMENT_PROOF,
        status: 'SUCCESS',
        details: {
          paymentId,
          passengerName: payment.tripPassenger.passenger.user.name,
          proofFileKey: payment.bankTransfer.proofFileKey,
        }
      },
      {
        fileName: 'get-payment-proof.ts',
        functionName: 'getPaymentProof'
      }
    );

    return ApiHandler.handleSuccess(
      {
        signedUrl,
        fileKey: payment.bankTransfer.proofFileKey,
        passengerName: payment.tripPassenger.passenger.user.name,
        passengerEmail: payment.tripPassenger.passenger.user.email,
      },
      'Comprobante obtenido correctamente'
    );
  } catch (error) {
    return ApiHandler.handleError(error);
  }
}
