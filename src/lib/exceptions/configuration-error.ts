// src/lib/exceptions/configuration-error.ts
import { BaseError } from "./base-error";

export class ConfigurationError extends BaseError {
    constructor(message: string, code: string, fileName: string, functionName: string) {
        super(message, `CONFIG_${code}`, 'Configuration', fileName, functionName);
    }

    static MissingEnvironmentVariables(serviceName: string, missing: string[], fileName: string, functionName: string) {
        return new ConfigurationError(
            `Faltan las envs para ${serviceName}: ${missing.join(', ')}`,
            'MISSING_ENV_VARS',
            fileName,
            functionName
        );
    }

    static ServiceUnavailable(serviceName: string, fileName: string, functionName: string) {
        return new ConfigurationError(
            `Servicio ${serviceName} no esta configurado o no disponible`,
            'SERVICE_UNAVAILABLE',
            fileName,
            functionName
        );
    }

    static RedisConnectionFailed(fileName: string, functionName: string, details?: string) {
        return new ConfigurationError(
            `Fallo la conexion a Redis${details ? `: ${details}` : ''}`,
            'REDIS_CONNECTION_FAILED',
            fileName,
            functionName
        );
    }
}