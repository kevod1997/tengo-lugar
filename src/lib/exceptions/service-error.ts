import { BaseError } from "./base-error";

export class ServiceError extends BaseError {
    constructor(message: string, code: string, fileName: string, functionName: string) {
        super(message, `SERVICE_${code}`, 'Service Layer', fileName, functionName);
    }

    static ErrorGettingUser(fileName: string, functionName: string) {
        return new ServiceError(
            'Error al obtener el usuario',
            'ERROR_GETTING_USER',
            fileName,
            functionName
        );
    }

    static PayloadTooLarge(details: string, fileName: string, functionName: string) {
        return new ServiceError(
            details,
            'PAYLOAD_TOO_LARGE',
            fileName,
            functionName
        );
    }

    static DocumentUploadFailed(documentType: string, fileName: string, functionName: string) {
        return new ServiceError(
            `Error al subir: ${documentType}`,
            'DOCUMENT_UPLOAD_FAILED',
            fileName,
            functionName
        );
    }

    static DataSubmissionFailed(dataType: string, fileName: string, functionName: string) {
        return new ServiceError(
            `Error al enviar: ${dataType}`,
            'DATA_SUBMISSION_FAILED',
            fileName,
            functionName
        );
    }

    static UserCreationFailed(fileName: string, functionName: string) {
        return new ServiceError(
            'Error al crear el usuario',
            'USER_CREATION_FAILED',
            fileName,
            functionName
        );
    }

    static FormattingFailed(fileName: string, functionName: string) {
        return new ServiceError(
            'Error al formatear los datos del usuario',
            'USER_FORMATTING_FAILED',
            fileName,
            functionName
        );
    }

    static IdentityVerificationFailed(fileName: string, functionName: string) {
        return new ServiceError(
            'Error en la verificación de identidad',
            'IDENTITY_VERIFICATION_FAILED',
            fileName,
            functionName
        );
    }

    static InvalidDocumentData(fileName: string, functionName: string) {
        return new ServiceError(
            'Datos del documento inválidos',
            'INVALID_DOCUMENT_DATA',
            fileName,
            functionName
        );
    }

    static DocumentAccessFailed(documentType: string, fileName: string, functionName: string) {
        return new ServiceError(
            `Error al acceder a los documentos: ${documentType}.`,
            'DOCUMENT_ACCESS_FAILED',
            fileName,
            functionName
        );
    }

    static NotFound(entity: string, fileName: string, functionName: string) {
        return new ServiceError(
            `No se encontró ${entity.toLowerCase()}`,
            'ENTITY_NOT_FOUND',
            fileName,
            functionName
        );
    }

    static InvalidOperation(message: string, fileName: string, functionName: string) {
        return new ServiceError(
            message,
            'INVALID_OPERATION',
            fileName,
            functionName
        );
    }

    static ValidationError(message: string, fileName: string, functionName: string) {
        return new ServiceError(
            message,
            'VALIDATION_ERROR',
            fileName,
            functionName
        );
    }

    static DocumentValidationFailed(fileName: string, functionName: string) {
        return new ServiceError(
            'Se requiere un motivo de rechazo al invalidar documentos',
            'DOCUMENT_VALIDATION_FAILED',
            fileName,
            functionName
        );
    }

    static ConfigError(message: string, fileName: string, functionName: string) {
        return new ServiceError(
            message,
            'CONFIG_ERROR',
            fileName,
            functionName
        );
    }

    static ExternalApiError(message: string, fileName: string, functionName: string) {
        return new ServiceError(
            message,
            'EXTERNAL_API_ERROR',
            fileName,
            functionName
        );
    }

    static FailedToSendEmail(details: string, fileName: string, functionName: string) {
        return new ServiceError(`Failed to send email: ${details}`, 'SEND_FAILED', fileName, functionName);
    }

    static InvalidEmailTemplate(fileName: string, functionName: string) {
        return new ServiceError('Invalid email template', 'INVALID_TEMPLATE', fileName, functionName);
    }

    static ConfigurationError(details: string, fileName: string, functionName: string) {
        return new ServiceError(`Email service configuration error: ${details}`, 'CONFIG_ERROR', fileName, functionName);
    }
}