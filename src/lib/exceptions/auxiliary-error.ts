import { BaseError } from "./base-error";

export class AuxiliaryError extends BaseError {
    constructor(message: string, code: string, fileName: string, functionName: string) {
        super(message, `AUXILIARY_${code}`, 'Auxiliary', fileName, functionName);
    }

    static ImageProcessingFailed(fileName: string, functionName: string, details: string) {
        return new AuxiliaryError(
            `Error al procesar imagen: ${details}`,
            'IMAGE_PROCESSING_FAILED',
            fileName,
            functionName
        );
    }

    static FileAnalysisFailed(fileName: string, functionName: string, details: string) {
        return new AuxiliaryError(
            `Error al analizar archivo: ${details}`,
            'FILE_ANALYSIS_FAILED',
            fileName,
            functionName
        );
    }

    static ValidationFailed(fileName: string, functionName: string, details: string) {
        return new AuxiliaryError(
            `Error de validación: ${details}`,
            'VALIDATION_FAILED',
            fileName,
            functionName
        );
    }

    static FileProcessingFailed(fileName: string, functionName: string, details: string) {
        return new AuxiliaryError(
            `${details}`,
            'FILE_PROCESSING_FAILED',
            fileName,
            functionName
        );
    }
}