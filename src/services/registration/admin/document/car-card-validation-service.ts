import { handlePrismaError } from "@/lib/exceptions/prisma-error-handler";
import prisma from "@/lib/prisma";
import { s3Service } from "@/lib/s3/s3";

import { BaseDocumentValidationService } from "./base-document-validation";

export class CarCardValidationService extends BaseDocumentValidationService {
  protected async getDocument(id: string) {
    try {
      return await prisma.vehicleCard.findUnique({
        where: { id },
        select: {
          id: true,
          fileKey: true,
          status: true
        }
      });
    } catch (error) {
      handlePrismaError(error, 'VehicleCardValidationService.getDocument', 'vehicle-card-validation-service.ts');
    }
  }

  protected async updateDocument(id: string, data: any) {
    try {
      return await prisma.$transaction(async (tx) => {
        const updateData = {
          status: data.status,
          verifiedAt: data.verifiedAt,
          failureReason: data.failureReason,
          ...(data.fileKey !== undefined && { fileKey: data.fileKey }),
        };

        const updatedDocument = await tx.vehicleCard.update({
          where: { id },
          data: updateData,
          select: {
            id: true,
            status: true,
            verifiedAt: true,
            failureReason: true,
            car: {
              select: {
                plate: true
              }
            }
          }
        });

        return {
          documentId: updatedDocument.id,
          status: updatedDocument.status,
          verifiedAt: updatedDocument.verifiedAt,
          failureReason: updatedDocument.failureReason,
          carPlate: updatedDocument.car?.plate || null,
        };
      });
    } catch (error) {
      handlePrismaError(error, 'VehicleCardValidationService.updateDocument', 'vehicle-card-validation-service.ts');
    }
  }

  protected getModelName(): string {
    return 'Tarjeta vehicular';
  }

  protected async deleteFile(key: string) {
    await s3Service.deleteObject(key);
  }

  protected isDualSided(): boolean {
    return false;
  }
}