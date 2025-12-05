'use server'

import { ApiHandler } from "@/lib/api-handler";
import prisma from "@/lib/prisma";
import { getReviewsForUserSchema } from "@/schemas/validation/review-schema";
import { logActionWithErrorHandling } from "@/services/logging/logging-service";
import { TipoAccionUsuario } from "@/types/actions-logs";
import { requireAuthentication } from "@/utils/helpers/auth-helper";

/**
 * Obtiene las reviews de un usuario con paginación
 * @param data - Datos de búsqueda (userId, revieweeType, page, limit)
 * @returns ApiResponse con las reviews y paginación
 */
export async function getReviewsForUser(data: unknown) {
  try {
    // 1. Authentication
    const session = await requireAuthentication('get-reviews-for-user.ts', 'getReviewsForUser');

    // 2. Validation
    const validatedData = getReviewsForUserSchema.parse(data);
    const { userId, revieweeType, page, limit } = validatedData;

    // 3. Build where clause
    const where: any = { reviewedId: userId };
    if (revieweeType) {
      where.revieweeType = revieweeType;
    }

    // 4. Query con paginación
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
              image: true
            }
          },
          trip: {
            select: {
              id: true,
              originCity: true,
              originProvince: true,
              destinationCity: true,
              destinationProvince: true,
              departureTime: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.review.count({ where })
    ]);

    // 5. Log
    await logActionWithErrorHandling({
      userId: session.user.id,
      action: TipoAccionUsuario.VIEW_REVIEWS,
      status: 'SUCCESS',
      details: {
        viewedUserId: userId,
        revieweeType,
        resultsCount: reviews.length
      }
    }, { fileName: 'get-reviews-for-user.ts', functionName: 'getReviewsForUser' });

    // 6. Return
    return ApiHandler.handleSuccess(
      {
        reviews,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      },
      'Reviews obtenidas exitosamente'
    );

  } catch (error) {
    return ApiHandler.handleError(error);
  }
}
