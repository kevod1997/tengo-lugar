'use server'

import { ApiHandler } from "@/lib/api-handler";
import { ServerActionError } from "@/lib/exceptions/server-action-error";
import { inngest } from "@/lib/inngest";
import prisma from "@/lib/prisma";
import { createReviewSchema } from "@/schemas/validation/review-schema";
import { logActionWithErrorHandling, logError } from "@/services/logging/logging-service";
import { TipoAccionUsuario } from "@/types/actions-logs";
import { requireAuthentication } from "@/utils/helpers/auth-helper";
import {
  updateDriverRating,
  updatePassengerRating
} from "@/utils/helpers/rating-helper";
import {
  isWithinReviewWindow,
  userParticipatedInTrip,
  hasAlreadyReviewed
} from "@/utils/helpers/review-validation-helper";


/**
 * Crea una review para un viaje completado
 * @param data - Datos de la review (tripId, reviewedId, revieweeType, rating, comments)
 * @returns ApiResponse con la review creada
 */
export async function createReview(data: unknown) {
  try {
    // 1. Authentication
    const session = await requireAuthentication('create-review.ts', 'createReview');

    // 2. Validation
    const validatedData = createReviewSchema.parse(data);
    const { tripId, reviewedId, revieweeType, rating, comments } = validatedData;

    // 3. Validar que no se califique a sí mismo
    if (session.user.id === reviewedId) {
      throw ServerActionError.ValidationFailed(
        'create-review.ts',
        'createReview',
        'No puedes calificarte a ti mismo'
      );
    }

    // 4. Business Logic Transaction
    const result = await prisma.$transaction(async (tx) => {
      // 4.1 Obtener trip con información necesaria
      const trip = await tx.trip.findUnique({
        where: { id: tripId },
        select: {
          id: true,
          status: true,
          updatedAt: true
        }
      });

      // 4.2 Validar que el trip existe y está COMPLETED
      if (!trip) {
        throw ServerActionError.ValidationFailed(
          'create-review.ts',
          'createReview',
          'Viaje no encontrado'
        );
      }

      if (trip.status !== 'COMPLETED') {
        throw ServerActionError.ValidationFailed(
          'create-review.ts',
          'createReview',
          'Solo se pueden calificar viajes completados'
        );
      }

      // 4.3 Validar ventana de 10 días (desde updatedAt cuando cambió a COMPLETED)
      if (!isWithinReviewWindow(trip.updatedAt)) {
        throw ServerActionError.ValidationFailed(
          'create-review.ts',
          'createReview',
          'La ventana para calificar este viaje ha expirado (10 días)'
        );
      }

      // 4.4 Validar que el reviewer participó en el trip
      const reviewerParticipation = await userParticipatedInTrip(
        session.user.id,
        tripId,
        tx
      );

      if (!reviewerParticipation.participated) {
        throw ServerActionError.ValidationFailed(
          'create-review.ts',
          'createReview',
          'No participaste en este viaje'
        );
      }

      // 4.5 Validar que el reviewed user participó en el trip
      const reviewedParticipation = await userParticipatedInTrip(
        reviewedId,
        tripId,
        tx
      );

      if (!reviewedParticipation.participated) {
        throw ServerActionError.ValidationFailed(
          'create-review.ts',
          'createReview',
          'El usuario calificado no participó en este viaje'
        );
      }

      // 4.6 Validar que no existe review duplicada
      const alreadyReviewed = await hasAlreadyReviewed(
        tripId,
        session.user.id,
        reviewedId,
        tx
      );

      if (alreadyReviewed) {
        throw ServerActionError.ValidationFailed(
          'create-review.ts',
          'createReview',
          'Ya has calificado a este usuario para este viaje'
        );
      }

      // 4.7 Validar que revieweeType es correcto
      // Verification is done via userParticipatedInTrip helper
      // which already checks if users are valid driver/passenger

      // 4.8 Crear Review
      const review = await tx.review.create({
        data: {
          tripId,
          reviewerId: session.user.id,
          reviewedId,
          revieweeType,
          rating,
          comments: comments || null
        },
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
              image: true
            }
          },
          reviewed: {
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
        }
      });

      // 4.9 Actualizar rating del reviewed user
      if (revieweeType === 'DRIVER') {
        // Buscar driver del reviewed user
        const driver = await tx.driver.findUnique({
          where: { userId: reviewedId },
          select: { id: true }
        });

        if (driver) {
          await updateDriverRating(driver.id, rating, tx);
        } else {
          throw ServerActionError.DatabaseError(
            'create-review.ts',
            'createReview',
            'Driver no encontrado para actualizar rating'
          );
        }
      } else {
        // Buscar passenger del reviewed user
        const passenger = await tx.passenger.findUnique({
          where: { userId: reviewedId },
          select: { id: true }
        });

        if (passenger) {
          await updatePassengerRating(passenger.id, rating, tx);
        } else {
          throw ServerActionError.DatabaseError(
            'create-review.ts',
            'createReview',
            'Passenger no encontrado para actualizar rating'
          );
        }
      }

      return review;
    });

    // 5. Success logging
    await logActionWithErrorHandling({
      userId: session.user.id,
      action: TipoAccionUsuario.CREATE_REVIEW,
      status: 'SUCCESS',
      details: {
        tripId: validatedData.tripId,
        reviewedId: validatedData.reviewedId,
        revieweeType: validatedData.revieweeType,
        rating: validatedData.rating
      }
    }, { fileName: 'create-review.ts', functionName: 'createReview' });

    // 6. Send review received notification to the reviewed user
    try {
      // Get reviewed user details
      const reviewedUser = await prisma.user.findUnique({
        where: { id: reviewedId },
        select: {
          id: true,
          name: true,
          email: true
        }
      });

      // Get reviewer name
      const reviewerUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          name: true
        }
      });

      if (reviewedUser && reviewerUser) {
        await inngest.send({
          name: 'review-received-notification',
          data: {
            userId: reviewedUser.id,
            userName: reviewedUser.name || 'Usuario',
            userEmail: reviewedUser.email,
            reviewerName: reviewerUser.name || 'Un usuario',
            rating: validatedData.rating,
            tripId: validatedData.tripId
          }
        });

        console.log(`[Review Created] Review received notification triggered for user ${reviewedUser.id}`);
      }
    } catch (notificationError) {
      // Log error but DO NOT fail review creation
      await logError({
        origin: 'Review Creation - Review Received Notification',
        code: 'REVIEW_RECEIVED_NOTIFICATION_ERROR',
        message: 'Failed to send review received notification',
        details: JSON.stringify({
          tripId: validatedData.tripId,
          reviewedId: validatedData.reviewedId,
          error: notificationError instanceof Error ? notificationError.message : 'Unknown error',
          stack: notificationError instanceof Error ? notificationError.stack : undefined
        }),
        fileName: 'create-review.ts',
        functionName: 'createReview'
      });

      console.error(`[Review Created] Failed to send review received notification:`, notificationError);
    }

    // 7. Return success
    return ApiHandler.handleSuccess(
      result,
      'Review creada exitosamente'
    );

  } catch (error) {
    return ApiHandler.handleError(error);
  }
}
