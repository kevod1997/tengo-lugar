import prisma from "@/lib/prisma";
import { s3Service } from "@/lib/s3/s3";
import { BaseDocumentValidationService } from "./base-document-validation";
import { handlePrismaError } from "@/lib/exceptions/prisma-error-handler";

export class InsuranceValidationService extends BaseDocumentValidationService {
  protected async getDocument(id: string) {
    try {
      return await prisma.insurancePolicy.findUnique({
        where: { id },
        select: {
          id: true,
          fileKey: true,
          status: true
        }
      });
    } catch (error) {
      handlePrismaError(error, 'InsuranceValidationService.getDocument', 'insurance-validation-service.ts');
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

        const updatedDocument = await tx.insurancePolicy.update({
          where: { id },
          data: updateData,
          select: {
            id: true,
            status: true,
            verifiedAt: true,
            failureReason: true
          }
        });

        return {
          documentId: updatedDocument.id,
          status: updatedDocument.status,
          verifiedAt: updatedDocument.verifiedAt,
          failureReason: updatedDocument.failureReason
        };
      });
    } catch (error) {
      handlePrismaError(error, 'InsuranceValidationService.updateDocument', 'insurance-validation-service.ts');
    }
  }

  protected getModelName(): string {
    return 'Póliza de seguro';
  }

  protected async deleteFile(key: string) {
    await s3Service.deleteObject(key);
  }

  protected isDualSided(): boolean {
    return false;
  }
}