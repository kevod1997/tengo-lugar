'use server'

import prisma from "@/lib/prisma"
import type { ActionLogData } from "@/services/logging/logging-service"
import { getRequestMetadata } from "@/utils/helpers/logging/get-request-metadata"

export async function createActionLogAction(actionData: ActionLogData) {
    try {
        const metadata = await getRequestMetadata()

        await prisma.userActionLog.create({
            data: {
                userId: actionData.userId,
                action: actionData.action,
                status: actionData.status,
                details: actionData.details || {},
                metadata,
                createdAt: new Date()
            }
        })
    } catch (error) {
        throw error
    }
}