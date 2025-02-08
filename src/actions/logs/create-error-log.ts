'use server'

import prisma from "@/lib/prisma"
import { ErrorLogData } from "@/services/logging/logging-service"

export async function createErrorLogAction(errorData: ErrorLogData) {
    try {
        const details = {
            fileName: errorData.fileName,
            functionName: errorData.functionName,
            additionalDetails: errorData.details || ''
        };

        await prisma.errorLog.create({
            data: {
                origin: errorData.origin,
                code: errorData.code,
                message: errorData.message,
                details: JSON.stringify(details)
            }
        });
    } catch (error) {
        throw error
    }
}