'use server'

import { ApiHandler } from "@/lib/api-handler"
import prisma from "@/lib/prisma"

export const getFuels = async () => {
    try {
        const fuels = await prisma.fuelPrice.findMany({
            where: {
                isActive: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
        return ApiHandler.handleSuccess(fuels)
    } catch (error) {
        return ApiHandler.handleError(error)
    }
}