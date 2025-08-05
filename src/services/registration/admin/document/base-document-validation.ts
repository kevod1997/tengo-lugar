import { ApiHandler } from '@/lib/api-handler';
import { ServiceError } from '@/lib/exceptions/service-error';
import { ApiResponse } from '@/types/api-types';
import { BaseDocument, DocumentValidationRequest, } from '@/types/request/image-documents-validation';
import { DocumentValidationResponse } from '@/types/response/image-documents-validation';

export abstract class BaseDocumentValidationService {
  protected abstract getDocument(id: string): Promise<BaseDocument | null>;
  protected abstract updateDocument(id: string, data: any): Promise<DocumentValidationResponse>;
  protected abstract getModelName(): string;
  protected abstract deleteFile(key: string): Promise<void>;
  protected abstract isDualSided(): boolean;

  async validateDocument(
    request: DocumentValidationRequest
  ): Promise<ApiResponse<DocumentValidationResponse>> {
    try {
      const document = await this.getDocument(request.documentId);

      if (!document) {
        throw ServiceError.NotFound(this.getModelName(), 'base-document-validation.ts', 'validateDocument');
      }

      if (document.status === 'VERIFIED') {
        throw ServiceError.ValidationError('Documento ya ha sido verificado', 'base-document-validation.ts', 'validateDocument');
      }

      if (request.status === 'FAILED') {
        if (!request.failureReason) {
          throw ServiceError.ValidationError('Se requiere un motivo de rechazo al invalidar documentos', 'base-document-validation.ts', 'validateDocument');
        }
        
        if (this.isDualSided()) {
          await this.handleDualSidedFailedImages(document, request.failedImages);
        } else {
          await this.handleSingleSidedFailedImage(document);
        }
      }

      const updatedDocument = await this.updateDocument(request.documentId, {
        status: request.status,
        verifiedAt: request.status === 'VERIFIED' ? new Date() : null,
        failureReason: request.status === 'FAILED' ? request.failureReason : null
      });

      const message = request.status === 'VERIFIED'
        ? `${this.getModelName()} ha sido verificado exitosamente.`
        : `${this.getModelName()} ha sido rechazado.`;

      return ApiHandler.handleSuccess({
        documentId: updatedDocument.documentId,
        status: updatedDocument.status,
        verifiedAt: updatedDocument.verifiedAt,
        failureReason: updatedDocument.failureReason
      }, message);

    } catch (error) {
      return ApiHandler.handleError(error);
    }
  }

  private async handleDualSidedFailedImages(
    document: BaseDocument,
    failedImages?: { front?: boolean; back?: boolean }
  ) {
    const deletePromises: Promise<void>[] = [];
    const updateData: any = {};

    if (failedImages?.front) {
      deletePromises.push(this.deleteFile(document.frontFileKey!));
      updateData.frontFileKey = '';
    }

    if (failedImages?.back) {
      deletePromises.push(this.deleteFile(document.backFileKey!));
      updateData.backFileKey = '';
    }

    if (deletePromises.length > 0) {
      await Promise.all([
        ...deletePromises,
        this.updateDocument(document.id, updateData)
      ]);
    }
  }

  private async handleSingleSidedFailedImage(document: BaseDocument) {
    await this.deleteFile(document.fileKey!);
    await this.updateDocument(document.id, { fileKey: '' });
  }
}