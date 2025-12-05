// src/actions/driver-payout/upload-driver-payout-proof.ts
'use server'

import { ApiHandler } from "@/lib/api-handler";
import { ServerActionError } from "@/lib/exceptions/server-action-error";
import { uploadDocuments } from "@/lib/file/upload-documents";
import prisma from "@/lib/prisma";
import { logActionWithErrorHandling } from "@/services/logging/logging-service";
import { TipoAccionUsuario } from "@/types/actions-logs";
import { requireAuthorization } from "@/utils/helpers/auth-helper";

interface UploadDriverPayoutProofInput {
  payoutId: string;
  file: File;
  preview?: string; // base64 para imágenes, undefined para PDFs
}

export async function uploadDriverPayoutProof(input: UploadDriverPayoutProofInput) {
  try {
    const session = await requireAuthorization('admin', 'upload-driver-payout-proof.ts', 'uploadDriverPayoutProof');

    // Verify payout exists
    const payout = await prisma.driverPayout.findUnique({
      where: { id: input.payoutId },
      select: {
        id: true,
        driver: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        }
      }
    });

    if (!payout) {
      throw ServerActionError.NotFound(
        'upload-driver-payout-proof.ts',
        'uploadDriverPayoutProof',
        'Payout no encontrado'
      );
    }

    // Generate user info for S3 path
    const driverUser = payout.driver.user;
    const userInfo = {
      firstName: driverUser.name.split(' ')[0] || 'driver',
      lastName: driverUser.name.split(' ').slice(1).join(' ') || '',
      id: driverUser.id,
    };

    // Use uploadDocuments helper (handles signed URL + S3 upload internally)
    const result = await uploadDocuments(
      { file: input.file, preview: input.preview },
      undefined, // no back document
      userInfo,
      'driver-payout',
      undefined // no carPlate
    );

    await logActionWithErrorHandling(
      {
        userId: session.user.id,
        action: TipoAccionUsuario.ADMIN_UPLOAD_DRIVER_PAYOUT_PROOF,
        status: 'SUCCESS',
        details: {
          payoutId: input.payoutId,
          fileName: input.file.name,
          contentType: input.file.type,
          fileSize: input.file.size,
          fileKey: result.frontFileKey,
        }
      },
      {
        fileName: 'upload-driver-payout-proof.ts',
        functionName: 'uploadDriverPayoutProof'
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
