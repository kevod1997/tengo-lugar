'use server'

import { ApiHandler } from "@/lib/api-handler";
import prisma from "@/lib/prisma";
import { getPendingReviewsSchema } from "@/schemas/validation/review-schema";
import { logActionWithErrorHandling } from "@/services/logging/logging-service";
import { TipoAccionUsuario } from "@/types/actions-logs";
import { requireAuthentication } from "@/utils/helpers/auth-helper";
import { hasAlreadyReviewed } from "@/utils/helpers/review-validation-helper";

/**
 * Obtiene la lista de viajes completados con reviews pendientes
 * @param data - Datos de búsqueda (page, limit)
 * @returns ApiResponse con viajes pendientes de calificar
 */
export async function getPendingReviews(data: unknown = {}) {
  try {
    // 1. Authentication
    const session = await requireAuthentication('get-pending-reviews.ts', 'getPendingReviews');

    // 2. Validation
    const validatedData = getPendingReviewsSchema.parse(data);
    const { page, limit } = validatedData;

    // 3. Query
    const result = await prisma.$transaction(async (tx) => {
      // 3.1 Fecha límite: últimos 10 días (desde que se marcó COMPLETED)
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

      // 3.2 Obtener trips como driver (COMPLETED en últimos 10 días)
      const tripsAsDriver = await tx.trip.findMany({
        where: {
          driverCar: {
            driver: { userId: session.user.id }
          },
          status: 'COMPLETED',
          updatedAt: { gte: tenDaysAgo }
        },
        include: {
          passengers: {
            where: { reservationStatus: { in: ['APPROVED', 'COMPLETED'] } },
            include: {
              passenger: {
                include: {
                  user: {
                    select: { id: true, name: true, image: true }
                  }
                }
              }
            }
          }
        },
        orderBy: { updatedAt: 'desc' }
      });

      // 3.3 Obtener trips como passenger (COMPLETED en últimos 10 días)
      const tripsAsPassenger = await tx.trip.findMany({
        where: {
          passengers: {
            some: {
              passenger: { userId: session.user.id },
              reservationStatus: { in: ['APPROVED', 'COMPLETED'] }
            }
          },
          status: 'COMPLETED',
          updatedAt: { gte: tenDaysAgo }
        },
        include: {
          driverCar: {
            include: {
              driver: {
                include: {
                  user: {
                    select: { id: true, name: true, image: true }
                  }
                }
              }
            }
          },
          passengers: {
            where: {
              reservationStatus: { in: ['APPROVED', 'COMPLETED'] },
              passenger: { userId: { not: session.user.id } }
            },
            include: {
              passenger: {
                include: {
                  user: {
                    select: { id: true, name: true, image: true }
                  }
                }
              }
            }
          }
        },
        orderBy: { updatedAt: 'desc' }
      });

      // 3.4 Procesar trips como driver - verificar pasajeros pendientes
      const pendingReviewsAsDriver = [];

      for (const trip of tripsAsDriver) {
        const pendingUsers = [];

        for (const tp of trip.passengers) {
          const alreadyReviewed = await hasAlreadyReviewed(
            trip.id,
            session.user.id,
            tp.passenger.userId,
            tx
          );

          if (!alreadyReviewed) {
            pendingUsers.push({
              id: tp.passenger.userId,
              name: tp.passenger.user.name || 'Usuario',
              image: tp.passenger.user.image,
              role: 'PASSENGER' as const
            });
          }
        }

        if (pendingUsers.length > 0) {
          pendingReviewsAsDriver.push({
            trip: {
              id: trip.id,
              origin: `${trip.originCity}, ${trip.originProvince}`,
              destination: `${trip.destinationCity}, ${trip.destinationProvince}`,
              departureTime: trip.departureTime,
              completedAt: trip.updatedAt
            },
            pendingUsers,
            userRole: 'DRIVER' as const,
            totalPending: pendingUsers.length
          });
        }
      }

      // 3.5 Procesar trips como passenger - verificar conductor y co-pasajeros
      const pendingReviewsAsPassenger = [];

      for (const trip of tripsAsPassenger) {
        const pendingUsers = [];

        // Verificar si falta calificar al conductor
        const driverAlreadyReviewed = await hasAlreadyReviewed(
          trip.id,
          session.user.id,
          trip.driverCar.driver.userId,
          tx
        );

        if (!driverAlreadyReviewed) {
          pendingUsers.push({
            id: trip.driverCar.driver.userId,
            name: trip.driverCar.driver.user.name || 'Conductor',
            image: trip.driverCar.driver.user.image,
            role: 'DRIVER' as const,
            isPrimary: true // El conductor es la calificación principal
          });
        }

        // Verificar co-pasajeros (opcional)
        for (const tp of trip.passengers) {
          const alreadyReviewed = await hasAlreadyReviewed(
            trip.id,
            session.user.id,
            tp.passenger.userId,
            tx
          );

          if (!alreadyReviewed) {
            pendingUsers.push({
              id: tp.passenger.userId,
              name: tp.passenger.user.name || 'Pasajero',
              image: tp.passenger.user.image,
              role: 'PASSENGER' as const,
              isPrimary: false // Co-pasajeros son opcionales
            });
          }
        }

        if (pendingUsers.length > 0) {
          pendingReviewsAsPassenger.push({
            trip: {
              id: trip.id,
              origin: `${trip.originCity}, ${trip.originProvince}`,
              destination: `${trip.destinationCity}, ${trip.destinationProvince}`,
              departureTime: trip.departureTime,
              completedAt: trip.updatedAt
            },
            pendingUsers,
            userRole: 'PASSENGER' as const,
            totalPending: pendingUsers.length,
            hasPrimaryPending: pendingUsers.some(u => u.isPrimary) // Indica si falta el conductor
          });
        }
      }

      // 3.6 Combinar y ordenar por fecha
      const allPendingReviews = [
        ...pendingReviewsAsDriver,
        ...pendingReviewsAsPassenger
      ].sort((a, b) => {
        const dateA = a.trip.completedAt ? new Date(a.trip.completedAt).getTime() : 0;
        const dateB = b.trip.completedAt ? new Date(b.trip.completedAt).getTime() : 0;
        return dateB - dateA; // Más recientes primero
      });

      // 3.7 Aplicar paginación manual
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedReviews = allPendingReviews.slice(startIndex, endIndex);

      return {
        pendingReviews: paginatedReviews,
        pagination: {
          total: allPendingReviews.length,
          page,
          limit,
          totalPages: Math.ceil(allPendingReviews.length / limit)
        },
        summary: {
          totalTripsWithPendingReviews: allPendingReviews.length,
          asDriver: pendingReviewsAsDriver.length,
          asPassenger: pendingReviewsAsPassenger.length,
          totalPendingUsers: allPendingReviews.reduce(
            (sum, pr) => sum + pr.totalPending,
            0
          )
        }
      };
    });

    // 4. Log
    await logActionWithErrorHandling({
      userId: session.user.id,
      action: TipoAccionUsuario.GET_PENDING_REVIEWS,
      status: 'SUCCESS',
      details: {
        totalFound: result.summary.totalTripsWithPendingReviews,
        totalPendingUsers: result.summary.totalPendingUsers
      }
    }, { fileName: 'get-pending-reviews.ts', functionName: 'getPendingReviews' });

    // 5. Return
    return ApiHandler.handleSuccess(
      result,
      result.summary.totalTripsWithPendingReviews > 0
        ? `Tienes ${result.summary.totalPendingUsers} calificaciones pendientes`
        : 'No tienes calificaciones pendientes'
    );

  } catch (error) {
    return ApiHandler.handleError(error);
  }
}
