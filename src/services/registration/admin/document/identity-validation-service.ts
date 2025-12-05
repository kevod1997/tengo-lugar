import { handlePrismaError } from '@/lib/exceptions/prisma-error-handler';
import prisma from '@/lib/prisma';
import { s3Service } from '@/lib/s3/s3';

import { BaseDocumentValidationService } from './base-document-validation';


export class IdentityValidationService extends BaseDocumentValidationService {
    protected async getDocument(id: string) {
        try {
            return await prisma.identityCard.findUnique({
                where: { id },
                select: {
                    id: true,
                    frontFileKey: true,
                    backFileKey: true,
                    status: true
                }
            });
        } catch (error) {
            handlePrismaError(error, 'IdentityValidationService.getDocument', 'identity-validation-service.ts');
        }
    }

    protected async updateDocument(id: string, data: any) {
        try {
            return await prisma.$transaction(async (tx) => {
                const updatedDocument = await tx.identityCard.update({
                    where: { id },
                    data: {
                        status: data.status,
                        verifiedAt: data.verifiedAt,
                        failureReason: data.failureReason,
                        frontFileKey: data.frontFileKey,
                        backFileKey: data.backFileKey,
                    },
                    select: {
                        id: true,
                        status: true,
                        verifiedAt: true,
                        failureReason: true,
                        frontFileKey: true,
                        backFileKey: true,
                    }
                });

                return {
                    documentId: updatedDocument.id,
                    status: updatedDocument.status,
                    verifiedAt: updatedDocument.verifiedAt,
                    failureReason: updatedDocument.failureReason,
                    frontKey: !!updatedDocument.frontFileKey,
                    backKey: !!updatedDocument.backFileKey
                };
            });
        } catch (error) {
            handlePrismaError(error, 'IdentityValidationService.updateDocument', 'identity-validation-service.ts');
        }
    }


    protected getModelName(): string {
        return 'Documento de identidad';
    }

    protected async deleteFile(key: string) {
        await s3Service.deleteObject(key);
    }

    protected isDualSided(): boolean {
        return true;
      }
}

