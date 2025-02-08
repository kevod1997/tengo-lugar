import { BaseError } from "./base-error";

export class S3ServiceError extends BaseError {
    constructor(message: string, code: string, fileName: string, functionName: string) {
        super(message, `S3_SERVICE_${code}`, 'S3 Service', fileName, functionName);
    }

    static UploadFailed(fileName: string, functionName: string, details: string) {
        return new S3ServiceError(
            `Error al subir archivo: ${details}`,
            'UPLOAD',
            fileName,
            functionName
        );
    }

    static UrlGenerationFailed(fileName: string, functionName: string, details: string) {
        return new S3ServiceError(
            `Error al generar URL: ${details}`,
            'URL_GENERATION',
            fileName,
            functionName
        );
    }

    static DownloadFailed(fileName: string, functionName: string, details: string) {
        return new S3ServiceError(
            `${details}`,
            'DOWNLOAD',
            fileName,
            functionName
        );
    }

    static DeleteFailed(fileName: string, functionName: string, details: string) {
        return new S3ServiceError(
            `Error al eliminar archivo: ${details}`,
            'DELETE',
            fileName,
            functionName
        );
    }

    static S3ConfigFailed(fileName: string, functionName: string) {
        return new S3ServiceError(
            'Configuración de S3 requerida',
            'CONFIG',
            fileName,
            functionName
        );
    }

    static InvalidBucketOperation(fileName: string, functionName: string, details: string) {
        return new S3ServiceError(
            `Operación inválida en el bucket: ${details}`,
            'INVALID_OPERATION',
            fileName,
            functionName
        );
    }
}