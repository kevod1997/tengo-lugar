import type { PrismaClient } from "@prisma/client";

/**
 * Calcula el nuevo promedio de rating cuando se agrega una nueva calificación
 * @param currentAvg - Promedio actual
 * @param totalReviews - Total de reviews existentes
 * @param newRating - Nueva calificación a agregar
 * @returns Nuevo promedio redondeado a 2 decimales
 */
export function calculateNewAverageRating(
  currentAvg: number,
  totalReviews: number,
  newRating: number
): number {
  const totalPoints = currentAvg * totalReviews;
  const newTotal = totalPoints + newRating;
  const newAverage = newTotal / (totalReviews + 1);

  // Redondear a 2 decimales
  return Math.round(newAverage * 100) / 100;
}

/**
 * Actualiza el rating promedio de un conductor
 * @param driverId - ID del conductor
 * @param newRating - Nueva calificación (1-5)
 * @param tx - Transacción de Prisma
 */
export async function updateDriverRating(
  driverId: string,
  newRating: number,
  tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">
): Promise<void> {
  // Obtener rating actual del conductor
  const driver = await tx.driver.findUnique({
    where: { id: driverId },
    select: {
      averageRating: true,
      totalReviews: true
    }
  });

  if (!driver) {
    throw new Error(`Driver con ID ${driverId} no encontrado`);
  }

  // Calcular nuevo promedio
  const newAverage = calculateNewAverageRating(
    driver.averageRating,
    driver.totalReviews,
    newRating
  );

  // Actualizar driver
  await tx.driver.update({
    where: { id: driverId },
    data: {
      averageRating: newAverage,
      totalReviews: { increment: 1 }
    }
  });
}

/**
 * Actualiza el rating promedio de un pasajero
 * @param passengerId - ID del pasajero
 * @param newRating - Nueva calificación (1-5)
 * @param tx - Transacción de Prisma
 */
export async function updatePassengerRating(
  passengerId: string,
  newRating: number,
  tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">
): Promise<void> {
  // Obtener rating actual del pasajero
  const passenger = await tx.passenger.findUnique({
    where: { id: passengerId },
    select: {
      averageRating: true,
      totalReviews: true
    }
  });

  if (!passenger) {
    throw new Error(`Passenger con ID ${passengerId} no encontrado`);
  }

  // Calcular nuevo promedio
  const newAverage = calculateNewAverageRating(
    passenger.averageRating,
    passenger.totalReviews,
    newRating
  );

  // Actualizar passenger
  await tx.passenger.update({
    where: { id: passengerId },
    data: {
      averageRating: newAverage,
      totalReviews: { increment: 1 }
    }
  });
}
