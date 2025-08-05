export type DocumentType = 'IDENTITY' | 'LICENCE' | 'INSURANCE' | 'CARD';

export interface BaseDocument {
  id: string;
  frontFileKey?: string;
  backFileKey?: string;
  fileKey?: string;
  status: string;
}

export type DocumentValidationRequest = {
  documentId: string;
  documentType: DocumentType;
  status: 'VERIFIED' | 'FAILED';
  failedImages?: {
    front?: boolean;
    back?: boolean;
  };
  failureReason?: string;
}
