import { ApiResponse } from "@/types/api-types";
import { ServiceError } from "./exceptions/service-error";
import { ServerActionError } from "./exceptions/server-action-error";
import { BaseError } from "./exceptions/base-error";
import { AuxiliaryError } from "./exceptions/auxiliary-error";
import { S3ServiceError } from "./exceptions/s3-service-error";
import { logError } from "@/services/logging/logging-service";

export class ApiHandler {
    static handleSuccess<T>(data: T, message?: string): ApiResponse<T> {
        return {
            success: true,
            data,
            message
        };
    }

    static async handleError(error: unknown): Promise<ApiResponse<never>> {
        let origin = 'Unknown Layer';
        let code = 'UNKNOWN_ERROR';
        let message = 'Ha ocurrido un error inesperado. Por favor, inténtalo más tarde.';
        let details = '';
        let fileName = 'Unknown';
        let functionName = 'Unknown';

        if (error instanceof BaseError) {
            origin = error.origin;
            code = error.code;
            message = error.message;
            fileName = error.fileName;
            functionName = error.functionName;

            if (error instanceof ServerActionError) {
                origin = 'Server Action';
            } else if (error instanceof ServiceError) {
                origin = 'Service Layer';
            } else if (error instanceof S3ServiceError) {
                origin = 'S3 Service';
            } else if (error instanceof AuxiliaryError) {
                origin = `Auxiliary Function: ${error.functionName}`;
            }
        } else if (error instanceof Error) {
            details = error.stack || error.message;
        } else {
            details = JSON.stringify(error);
        }

        // Log the error to the database
        await logError({
            origin,
            code,
            message,
            details,
            fileName,
            functionName
        });

        // Generic messages for infrastructure errors
        if (code.includes('DATABASE_ERROR') || code.includes('S3_SERVICE')) {
            message = 'Ha ocurrido un error en el sistema. Por favor, inténtalo más tarde.';
        }

        return {
            success: false,
            error: {
                code,
                message,
            }
        };
    }
}

