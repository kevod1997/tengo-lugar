import { Prisma } from "@prisma/client";

import { ServerActionError } from "./server-action-error";

export function handlePrismaError(error: unknown, functionName: string, fileName: string,): never {

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        const target = error.meta?.target as string[] || [];
        const details = error.meta?.details || '';

        switch (error.code) {
            case 'P2002': // Unique constraint violation
                throw ServerActionError.DatabaseError(
                    fileName,
                    functionName,
                    `Error de duplicación: Los campos ${target.join(', ')} deben ser únicos. ${details}`
                );

            case 'P2003': // Foreign key constraint violation
                throw ServerActionError.DatabaseError(
                    fileName,
                    functionName,
                    `Error de referencia: No se encontró el registro relacionado en ${target.join(', ')}. ${details}`
                );

            case 'P2025': // Record not found
                throw ServerActionError.DatabaseError(
                    fileName,
                    functionName,
                    `Registro no encontrado: ${error.meta?.cause || 'El registro solicitado no existe'}. ${details}`
                );

            case 'P2014': // Invalid ID value
                throw ServerActionError.DatabaseError(
                    fileName,
                    functionName,
                    `ID inválido: El valor proporcionado no es un ID válido. ${details}`
                );

            case 'P2000': // Input value too long
                throw ServerActionError.DatabaseError(
                    fileName,
                    functionName,
                    `Valor demasiado largo: El campo ${target.join(', ')} excede el límite permitido. ${details}`
                );

            case 'P2005': // Invalid field value
                throw ServerActionError.DatabaseError(
                    fileName,
                    functionName,
                    `Valor inválido: El valor proporcionado no es válido para el campo ${target.join(', ')}. ${details}`
                );

            case 'P2006': // Invalid data type
                throw ServerActionError.DatabaseError(
                    fileName,
                    functionName,
                    `Tipo de dato inválido: El valor proporcionado no coincide con el tipo esperado. ${details}`
                );

            default:
                throw ServerActionError.DatabaseError(
                    fileName,
                    functionName,
                    `Error en la base de datos [${error.code}]: ${error.message}\nDetalles: ${JSON.stringify(error.meta)}`
                );
        }
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
        throw ServerActionError.DatabaseError(
            fileName,
            functionName,
            `Error de validación: ${error.message}\n` +
            'Revisa que todos los campos requeridos estén presentes y con el formato correcto.'
        );
    }

    if (error instanceof Prisma.PrismaClientInitializationError) {
        throw ServerActionError.DatabaseError(
            fileName,
            functionName,
            `Error de conexión: No se pudo conectar a la base de datos.\n` +
            `Código: ${error.errorCode}\n` +
            `Mensaje: ${error.message}\n` +
            'Por favor, verifica la configuración de conexión y que la base de datos esté accesible.'
        );
    }

    if (error instanceof Prisma.PrismaClientRustPanicError) {
        throw ServerActionError.DatabaseError(
            fileName,
            functionName,
            `Error crítico en Prisma: ${error.message}\n` +
            'Se requiere atención inmediata del equipo de desarrollo.'
        );
    }

    // Para cualquier otro tipo de error
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    throw ServerActionError.DatabaseError(
        fileName,
        functionName,
        `Error inesperado en la base de datos: ${errorMessage}`
    );
}