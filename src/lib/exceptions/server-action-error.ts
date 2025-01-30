import { BaseError } from "./base-error";

export class ServerActionError extends BaseError {
    constructor(message: string, code: string, fileName: string, functionName: string) {
        super(message, `SERVER_ACTION_${code}`, 'Server Action', fileName, functionName);
    }

    static AuthenticationFailed(fileName: string, functionName: string) {
        return new ServerActionError(
            'Usuario no autenticado',
            'AUTHENTICATION_FAILED',
            fileName,
            functionName
        );
    }

    static AuthorizationFailed(fileName: string, functionName: string) {
        return new ServerActionError(
            'Usuario no autorizado',
            'AUTHORIZATION_FAILED',
            fileName,
            functionName
        );
    }

    static UserNotFound(fileName: string, functionName: string) {
        return new ServerActionError(
            'Usuario no encontrado',
            'USER_NOT_FOUND',
            fileName,
            functionName
        );
    }

    static NotFound(fileName: string, functionName: string, details: string) {
        return new ServerActionError(
            details,
            'NOT_FOUND',
            fileName,
            functionName
        );
    }

    static EmailInUse(fileName: string, functionName: string) {
        return new ServerActionError(
            'El email ya está en uso',
            'EMAIL_IN_USE',
            fileName,
            functionName
        );
    }

    static DocumentAlreadyUploaded(documentType: string, fileName: string, functionName: string) {
        return new ServerActionError(
            `El documento (${documentType}) ya ha sido subido`,
            'DOCUMENT_ALREADY_UPLOADED',
            fileName,
            functionName
        );
    }

    static DnitAlredyUploadedByOtherUser(fileName: string, functionName: string) {
        return new ServerActionError(
            'El documento de identidad ya ha sido subido por otro usuario',
            'DOCUMENT_ALREADY_UPLOADED_BY_OTHER_USER',
            fileName,
            functionName
        );
    }

    static ValidationFailed(fileName: string, functionName: string, details: string) {
        return new ServerActionError(
            `Error de validación: ${details}`,
            'VALIDATION_FAILED',
            fileName,
            functionName
        );
    }

    static DuplicateEntry(fileName: string, functionName: string, details: string) {
        return new ServerActionError(
            `Entrada duplicada: ${details}`,
            'DUPLICATE_ENTRY',
            fileName,
            functionName
        );
    }

    static FetchingFailed(fileName: string, functionName: string, details: string) {
        return new ServerActionError(
            `Error al fetchear datos: ${details}`,
            'FETCHING_FAILED',
            fileName,
            functionName
        );
    }

    static DatabaseError(fileName: string, functionName: string, details: string) {
        return new ServerActionError(
            `Error en la base de datos: ${details}`,
            'DATABASE_ERROR',
            fileName,
            functionName
        );
    }
}