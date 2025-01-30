'use server'

import { StorageService } from "@/lib/s3/storage";
import { AuxiliaryError } from "../exceptions/auxiliary-error";
import { S3ServiceError } from "../exceptions/s3-service-error";

interface FileInput {
  file?: File;
  preview?: string;
}

interface UserInfo {
  id: string;
  firstName: string;
  lastName: string;
}

interface UploadResult {
  frontFileKey: string;
  backFileKey: string;
}

export async function uploadDocuments(
  frontDocument: FileInput | undefined,
  backDocument: FileInput | undefined,
  userInfo: UserInfo,
  type: 'identity' | 'license' | 'insurance'
): Promise<Partial<UploadResult>> {
  try {
    if (!frontDocument?.file && !backDocument?.file) {
      throw AuxiliaryError.ValidationFailed(
        'upload-documents.ts',
        'uploadDocuments',
        'Se requiere al menos un documento'
      );
    }

    const getFileData = async (fileInput: FileInput | undefined) => {
      if (!fileInput?.file || !fileInput.preview) {
        return null;
      }

      // Si es una imagen, asumimos que ya fue procesada y usamos directamente el preview
      if (fileInput.file.type.startsWith('image/')) {
        return Buffer.from(
          fileInput.preview.replace(/^data:image\/\w+;base64,/, ''),
          'base64'
        );
      }

      // Si es PDF, lo convertimos a buffer
      if (fileInput.file.type === 'application/pdf') {
        return Buffer.from(await fileInput.file.arrayBuffer());
      }

      return null;
    };

    // Seleccionamos la función apropiada para obtener la URL
    const getUploadUrl = {
      identity: StorageService.getIdentityDocumentUploadUrl,
      license: StorageService.getDriverLicenseUploadUrl,
      insurance: StorageService.getInsuranceDocumentUploadUrl
    }[type];

    // Procesamos los documentos que existan
    const processedDocuments = await Promise.all([
      frontDocument?.file ? getFileData(frontDocument) : null,
      backDocument?.file ? getFileData(backDocument) : null,
    ]);

    // Preparamos las URLs de subida
    const uploadDataPromises = [];
    if (frontDocument?.file) {
      const extension = frontDocument.file.type === 'application/pdf' ? 'pdf' : 'jpg';
      uploadDataPromises.push(getUploadUrl(extension, frontDocument.file.type, userInfo));
    }
    if (backDocument?.file) {
      const extension = backDocument.file.type === 'application/pdf' ? 'pdf' : 'jpg';
      uploadDataPromises.push(getUploadUrl(extension, backDocument.file.type, userInfo));
    }

    const uploadData = await Promise.all(uploadDataPromises);
    const resultData: Partial<UploadResult> = {};

    // Subimos los documentos
    const uploadPromises = [];
    if (processedDocuments[0] && uploadData[0]) {
      uploadPromises.push(
        fetch(uploadData[0].signedUrl, {
          method: 'PUT',
          body: processedDocuments[0],
          headers: {
            'Content-Type': frontDocument!.file!.type,
            'Cache-Control': 'no-store'
          },
          cache: 'no-store'
        })
      );
      resultData.frontFileKey = uploadData[0].key;
    }

    if (processedDocuments[1] && uploadData[uploadData.length - 1]) {
      uploadPromises.push(
        fetch(uploadData[uploadData.length - 1].signedUrl, {
          method: 'PUT',
          body: processedDocuments[1],
          headers: {
            'Content-Type': backDocument!.file!.type,
            'Cache-Control': 'no-store'
          },
          cache: 'no-store'
        })
      );
      resultData.backFileKey = uploadData[uploadData.length - 1].key;
    }

    await Promise.all(uploadPromises).catch(error => {
      throw S3ServiceError.UploadFailed('upload-images.ts', 'uploadImages', error.message);
    });

    return resultData;

  } catch (error) {
    throw error;
  }
}