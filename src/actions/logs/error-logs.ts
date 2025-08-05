'use server'

import { ServerActionError } from '@/lib/exceptions/server-action-error'
import prisma from '@/lib/prisma'

interface FetchErrorLogsParams {
    page: number
    pageSize: number
    origin?: string
    code?: string
}

export async function fetchErrorLogs({ page, pageSize, origin, code }: FetchErrorLogsParams) {
    try {
        const where = {
            ...(origin && { origin }),
            ...(code && { code }),
        }

        const [errorLogs, totalLogs, uniqueOrigins, uniqueCodes] = await Promise.all([
            prisma.errorLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            prisma.errorLog.count({ where }),
            prisma.errorLog.findMany({
                select: { origin: true },
                distinct: ['origin'],
            }),
            prisma.errorLog.findMany({
                select: { code: true },
                distinct: ['code'],
            })
        ])

        // Ensure dates are serialized consistently
        const serializedLogs = errorLogs.map(log => ({
            ...log,
            createdAt: log.createdAt.toISOString(),
        }))

        return {
            errorLogs: serializedLogs,
            totalPages: Math.ceil(totalLogs / pageSize),
            uniqueOrigins: uniqueOrigins.map(item => item.origin),
            uniqueCodes: uniqueCodes.map(item => item.code),
        }
    } catch (error) {
        console.error('Error fetching error logs:', error)
        throw ServerActionError.FetchingFailed(__filename, 'fetchErrorLogs', ` ${error instanceof Error ? error.message : String(error)}`)
    }
}

