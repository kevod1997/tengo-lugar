'use server'

import { ApiHandler } from "@/lib/api-handler";
import { handlePrismaError } from "@/lib/exceptions/prisma-error-handler";
import prisma from "@/lib/prisma";
import { TipoAccionUsuario } from "@/types/actions-logs";

interface GetUserLogsParams {
  userId: string;
  page?: number;
  pageSize?: number;
  action?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export async function getUserLogs({
  userId,
  page = 1,
  pageSize = 10,
  action,
  status,
  startDate,
  endDate
}: GetUserLogsParams) {
  try {
    const skip = (page - 1) * pageSize;

     // Build where clause based on filters
     const where: any = {
      userId,
    }

    // Handle action filter
    if (action && action !== "all") {
      where.action = action
    } else if (action === "all") {
      // If 'all' is selected, we don't add any action filter
      // This will return all actions
    } else {
      // If no action is specified, we'll return all valid actions
      where.action = {
        in: Object.values(TipoAccionUsuario),
      }
    }

    // Handle status filter
    if (status && status !== "ALL") {
      where.status = status
    }

    // Handle date range filter
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }

    const [logs, total] = await Promise.all([
      prisma.userActionLog.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: pageSize,
        select: {
          id: true,
          action: true,
          details: true,
          status: true,
          metadata: true,
          createdAt: true,
          user: {
            select: {
              name:true,
              email: true
            }
          }
        }
      }),
      prisma.userActionLog.count({ where })
    ]).catch(error => {
      throw handlePrismaError(error, 'getUserLogs', 'get-user-logs.ts');
    });

    return ApiHandler.handleSuccess({
      logs,
      pagination: {
        total,
        pageCount: Math.ceil(total / pageSize),
        currentPage: page,
        pageSize
      }
    });

  } catch (error) {
    return ApiHandler.handleError(error);
  }
}