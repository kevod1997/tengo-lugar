'use server'

import { requireAuthentication } from "@/utils/helpers/auth-helper";
import { ApiHandler } from "@/lib/api-handler";
import { logActionWithErrorHandling } from "@/services/logging/logging-service";
import { TipoAccionUsuario } from "@/types/actions-logs";
import prisma from "@/lib/prisma";
import { canUserReviewSchema } from "@/schemas/validation/review-schema";
import {
  isWithinReviewWindow,
  userParticipatedInTrip,
  getReviewableUsersForTrip
} from "@/utils/helpers/review-validation-helper";

/**
 * Verifica si un usuario puede calificar un viaje y obtiene la lista de usuarios calificables
 * @param data - Datos de verificación (tripId)
 * @returns ApiResponse con información de calificabilidad y lista de usuarios
 */
export async function canUserReview(data: unknown) {
  try {
    // 1. Authentication
    const session = await requireAuthentication('can-user-review.ts', 'canUserReview');

    // 2. Validation
    const validatedData = canUserReviewSchema.parse(data);
    const { tripId } = validatedData;

    // 3. Transaction
    const result = await prisma.$transaction(async (tx) => {
      // 3.1 Obtener trip
      const trip = await tx.trip.findUnique({
        where: { id: tripId },
        select: {
          id: true,
          status: true,
          updatedAt: true,
          departureTime: true,
          originCity: true,
          originProvince: true,
          destinationCity: true,
          destinationProvince: true
        }
      });

      // 3.2 Validaciones básicas
      if (!trip) {
        return {
          canReview: false,
          reason: 'Viaje no encontrado',
          reviewableUsers: [],
          userRole: null,
          tripCompletedAt: null
        };
      }

      if (trip.status !== 'COMPLETED') {
        return {
          canReview: false,
          reason: 'El viaje no está completado',
          reviewableUsers: [],
          userRole: null,
          tripCompletedAt: null
        };
      }

      // Use updatedAt as completion date (when trip status changed to COMPLETED)
      const completedAt = trip.updatedAt;

      if (!isWithinReviewWindow(completedAt)) {
        return {
          canReview: false,
          reason: 'La ventana para calificar ha expirado (10 días)',
          reviewableUsers: [],
          userRole: null,
          tripCompletedAt: completedAt
        };
      }

      // 3.3 Verificar participación
      const participation = await userParticipatedInTrip(
        session.user.id,
        tripId,
        tx
      );

      if (!participation.participated) {
        return {
          canReview: false,
          reason: 'No participaste en este viaje',
          reviewableUsers: [],
          userRole: null,
          tripCompletedAt: completedAt
        };
      }

      // 3.4 Obtener usuarios calificables
      const reviewableUsers = await getReviewableUsersForTrip(
        session.user.id,
        tripId,
        tx
      );

      // Filtrar solo usuarios que aún no han sido calificados
      const pendingUsers = reviewableUsers.filter(user => !user.alreadyReviewed);

      return {
        canReview: pendingUsers.length > 0,
        reason: pendingUsers.length > 0 ? null : 'Ya has calificado a todos los participantes',
        reviewableUsers: reviewableUsers, // Incluye todos (con flag alreadyReviewed)
        pendingUsers: pendingUsers, // Solo los que faltan calificar
        userRole: participation.role,
        tripCompletedAt: completedAt,
        tripInfo: {
          origin: `${trip.originCity}, ${trip.originProvince}`,
          destination: `${trip.destinationCity}, ${trip.destinationProvince}`
        }
      };
    });

    // 4. Log
    await logActionWithErrorHandling({
      userId: session.user.id,
      action: TipoAccionUsuario.CHECK_CAN_REVIEW,
      status: 'SUCCESS',
      details: {
        tripId,
        canReview: result.canReview,
        pendingCount: result.pendingUsers?.length || 0
      }
    }, { fileName: 'can-user-review.ts', functionName: 'canUserReview' });

    // 5. Return
    return ApiHandler.handleSuccess(
      result,
      result.canReview ? 'Puedes calificar este viaje' : 'No puedes calificar este viaje'
    );

  } catch (error) {
    return ApiHandler.handleError(error);
  }
}
