// src/actions/payment/upload-payment-proof.ts
'use server'

import { ApiHandler } from "@/lib/api-handler";
import { ServerActionError } from "@/lib/exceptions/server-action-error";
import { uploadDocuments } from "@/lib/file/upload-documents";
import prisma from "@/lib/prisma";
import { logActionWithErrorHandling } from "@/services/logging/logging-service";
import { TipoAccionUsuario } from "@/types/actions-logs";
import { requireAuthorization } from "@/utils/helpers/auth-helper";

interface UploadPaymentProofInput {
  paymentId: string;
  file: File;
  preview?: string; // base64 para imágenes, undefined para PDFs
}

export async function uploadPaymentProof(input: UploadPaymentProofInput) {
  try {
    const session = await requireAuthorization('admin', 'upload-payment-proof.ts', 'uploadPaymentProof');

    // Verify payment exists
    const payment = await prisma.payment.findUnique({
      where: { id: input.paymentId },
      select: {
        id: true,
        tripPassenger: {
          select: {
            passenger: {
              select: {
                user: {
                  select: {
                    id: true,
                    name: true,
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!payment) {
      throw ServerActionError.NotFound(
        'upload-payment-proof.ts',
        'uploadPaymentProof',
        'Pago no encontrado'
      );
    }

    // Generate user info for S3 path
    const passengerUser = payment.tripPassenger.passenger.user;
    const userInfo = {
      firstName: passengerUser.name.split(' ')[0] || 'passenger',
      lastName: passengerUser.name.split(' ').slice(1).join(' ') || '',
      id: passengerUser.id,
    };

    // Use uploadDocuments helper (handles signed URL + S3 upload internally)
    const result = await uploadDocuments(
      { file: input.file, preview: input.preview },
      undefined, // no back document
      userInfo,
      'payment-proof',
      undefined // no carPlate
    );

    await logActionWithErrorHandling(
      {
        userId: session.user.id,
        action: TipoAccionUsuario.ADMIN_UPLOAD_PAYMENT_PROOF,
        status: 'SUCCESS',
        details: {
          paymentId: input.paymentId,
          fileName: input.file.name,
          contentType: input.file.type,
          fileSize: input.file.size,
          fileKey: result.frontFileKey,
        }
      },
      {
        fileName: 'upload-payment-proof.ts',
        functionName: 'uploadPaymentProof'
      }
    );

    return ApiHandler.handleSuccess(
      {
        fileKey: result.frontFileKey,
      },
      'Comprobante cargado exitosamente'
    );
  } catch (error) {
    return ApiHandler.handleError(error);
  }
}
