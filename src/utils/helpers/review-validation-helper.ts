import { PrismaClient } from "@prisma/client";

/**
 * Verifica si la review está dentro de la ventana de tiempo permitida (10 días)
 * @param tripCompletedAt - Fecha de completado del viaje
 * @returns true si están dentro de los 10 días, false si no
 */
export function isWithinReviewWindow(tripCompletedAt: Date): boolean {
  const now = new Date();
  const tenDaysInMs = 10 * 24 * 60 * 60 * 1000; // 10 días en milisegundos
  const timeDiff = now.getTime() - new Date(tripCompletedAt).getTime();

  return timeDiff <= tenDaysInMs;
}

/**
 * Tipo de retorno para la función userParticipatedInTrip
 */
export type UserParticipation = {
  participated: boolean;
  role: 'DRIVER' | 'PASSENGER' | null;
};

/**
 * Verifica si un usuario participó en un viaje y en qué rol
 * @param userId - ID del usuario
 * @param tripId - ID del viaje
 * @param tx - Transacción de Prisma
 * @returns Objeto con participated (boolean) y role ('DRIVER' | 'PASSENGER' | null)
 */
export async function userParticipatedInTrip(
  userId: string,
  tripId: string,
  tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">
): Promise<UserParticipation> {
  // Verificar si es el conductor
  const trip = await tx.trip.findFirst({
    where: {
      id: tripId,
      driverCar: {
        driver: {
          userId: userId
        }
      }
    }
  });

  if (trip) {
    return {
      participated: true,
      role: 'DRIVER'
    };
  }

  // Verificar si es pasajero (solo APPROVED o COMPLETED)
  const tripPassenger = await tx.tripPassenger.findFirst({
    where: {
      tripId: tripId,
      passenger: {
        userId: userId
      },
      reservationStatus: {
        in: ['APPROVED', 'COMPLETED']
      }
    }
  });

  if (tripPassenger) {
    return {
      participated: true,
      role: 'PASSENGER'
    };
  }

  return {
    participated: false,
    role: null
  };
}

/**
 * Verifica si ya existe una review entre dos usuarios para un viaje
 * @param tripId - ID del viaje
 * @param reviewerId - ID del usuario que califica
 * @param reviewedId - ID del usuario calificado
 * @param tx - Transacción de Prisma
 * @returns true si ya existe, false si no
 */
export async function hasAlreadyReviewed(
  tripId: string,
  reviewerId: string,
  reviewedId: string,
  tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">
): Promise<boolean> {
  const existingReview = await tx.review.findFirst({
    where: {
      tripId: tripId,
      reviewerId: reviewerId,
      reviewedId: reviewedId
    }
  });

  return existingReview !== null;
}

/**
 * Tipo de retorno para usuarios calificables
 */
export type ReviewableUser = {
  id: string;
  name: string;
  image: string | null;
  role: 'DRIVER' | 'PASSENGER';
  alreadyReviewed: boolean;
};

/**
 * Obtiene la lista de usuarios que un usuario puede calificar en un viaje
 * @param userId - ID del usuario que quiere calificar
 * @param tripId - ID del viaje
 * @param tx - Transacción de Prisma
 * @returns Array de usuarios calificables
 */
export async function getReviewableUsersForTrip(
  userId: string,
  tripId: string,
  tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">
): Promise<ReviewableUser[]> {
  const reviewableUsers: ReviewableUser[] = [];

  // Obtener información del viaje
  const trip = await tx.trip.findUnique({
    where: { id: tripId },
    include: {
      driverCar: {
        include: {
          driver: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true
                }
              }
            }
          }
        }
      },
      passengers: {
        where: {
          reservationStatus: {
            in: ['APPROVED', 'COMPLETED']
          }
        },
        include: {
          passenger: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!trip) {
    return [];
  }

  // Verificar rol del usuario actual
  const participation = await userParticipatedInTrip(userId, tripId, tx);

  if (!participation.participated) {
    return [];
  }

  // Si es conductor, puede calificar a todos los pasajeros
  if (participation.role === 'DRIVER') {
    for (const tp of trip.passengers) {
      const alreadyReviewed = await hasAlreadyReviewed(
        tripId,
        userId,
        tp.passenger.userId,
        tx
      );

      reviewableUsers.push({
        id: tp.passenger.userId,
        name: tp.passenger.user.name || 'Usuario',
        image: tp.passenger.user.image,
        role: 'PASSENGER',
        alreadyReviewed
      });
    }
  }

  // Si es pasajero, puede calificar al conductor y otros pasajeros
  if (participation.role === 'PASSENGER') {
    // Agregar conductor
    const driverAlreadyReviewed = await hasAlreadyReviewed(
      tripId,
      userId,
      trip.driverCar.driver.userId,
      tx
    );

    reviewableUsers.push({
      id: trip.driverCar.driver.userId,
      name: trip.driverCar.driver.user.name || 'Conductor',
      image: trip.driverCar.driver.user.image,
      role: 'DRIVER',
      alreadyReviewed: driverAlreadyReviewed
    });

    // Agregar otros pasajeros (co-pasajeros)
    for (const tp of trip.passengers) {
      // No incluir al usuario actual
      if (tp.passenger.userId === userId) {
        continue;
      }

      const alreadyReviewed = await hasAlreadyReviewed(
        tripId,
        userId,
        tp.passenger.userId,
        tx
      );

      reviewableUsers.push({
        id: tp.passenger.userId,
        name: tp.passenger.user.name || 'Pasajero',
        image: tp.passenger.user.image,
        role: 'PASSENGER',
        alreadyReviewed
      });
    }
  }

  return reviewableUsers;
}
