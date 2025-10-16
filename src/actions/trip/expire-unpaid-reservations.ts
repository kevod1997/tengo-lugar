// src/actions/trip/expire-unpaid-reservations.ts
'use server'

import prisma from "@/lib/prisma";
import { ApiHandler } from "@/lib/api-handler";
import { logActionWithErrorHandling } from "@/services/logging/logging-service";
import { TipoAccionUsuario } from "@/types/actions-logs";
import { notifyUser } from "@/utils/notifications/notification-helpers";
import { shouldExpireUnpaidReservation, calculateHoursUntilDeparture } from "@/utils/helpers/time-restrictions-helper";

/**
 * Expira automáticamente reservas APPROVED sin pago confirmado
 * que están dentro de 2 horas de la salida
 *
 * Según REGLAS_DE_NEGOCIO_PAGOS.md Sección 9.3:
 * - Expira APPROVED con Payment.status = PENDING dentro de 2h
 */
export async function expireUnpaidReservations() {
  try {
    const now = new Date();
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    // Buscar reservas APPROVED con pago PENDING que salen en menos de 2 horas
    const reservationsToCheck = await prisma.tripPassenger.findMany({
      where: {
        reservationStatus: 'APPROVED',
        trip: {
          departureTime: {
            lte: twoHoursFromNow,
            gt: now // No incluir viajes ya pasados
          },
          status: {
            in: ['PENDING', 'ACTIVE'] // Solo viajes no completados/cancelados
          }
        },
        payment: {
          status: 'PENDING' // Solo pagos pendientes
        }
      },
      include: {
        trip: {
          select: {
            id: true,
            departureTime: true,
            originCity: true,
            destinationCity: true,
            remainingSeats: true,
          }
        },
        passenger: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        },
        payment: {
          select: {
            id: true,
            status: true,
          }
        }
      }
    });

    const reservationsToExpire: typeof reservationsToCheck = [];

    // Filtrar usando lógica del helper
    for (const reservation of reservationsToCheck) {
      const check = shouldExpireUnpaidReservation(
        reservation.trip.departureTime,
        reservation.payment!.status as 'PENDING' | 'COMPLETED'
      );

      if (check.isAllowed) {
        reservationsToExpire.push(reservation);
      }
    }

    if (reservationsToExpire.length === 0) {
      await logActionWithErrorHandling(
        {
          userId: 'SYSTEM',
          action: TipoAccionUsuario.EXPIRACION_RESERVA_SIN_PAGO,
          status: 'SUCCESS',
          details: {
            message: 'No hay reservas sin pago para expirar',
            checkedCount: reservationsToCheck.length,
            expiredCount: 0,
          }
        },
        {
          fileName: 'expire-unpaid-reservations.ts',
          functionName: 'expireUnpaidReservations'
        }
      );

      return ApiHandler.handleSuccess(
        { expiredCount: 0 },
        'No hay reservas sin pago para expirar'
      );
    }

    // Procesar cada reserva en una transacción individual
    const results = await Promise.allSettled(
      reservationsToExpire.map(async (reservation) => {
        return await prisma.$transaction(async (tx) => {
          // 1. Actualizar estado de reserva a EXPIRED
          await tx.tripPassenger.update({
            where: { id: reservation.id },
            data: {
              reservationStatus: 'EXPIRED',
            }
          });

          // 2. Liberar asientos del viaje
          await tx.trip.update({
            where: { id: reservation.trip.id },
            data: {
              remainingSeats: {
                increment: reservation.seatsReserved
              },
              isFull: false
            }
          });

          // 3. Actualizar estado de pago a CANCELLED
          if (reservation.payment) {
            await tx.payment.update({
              where: { id: reservation.payment.id },
              data: {
                status: 'CANCELLED',
              }
            });
          }

          return reservation;
        });
      })
    );

    const successfulExpirations = results.filter(r => r.status === 'fulfilled').length;

    // Enviar notificaciones a pasajeros afectados
    for (const result of results) {
      if (result.status === 'fulfilled') {
        const reservation = result.value;
        const hoursUntil = calculateHoursUntilDeparture(reservation.trip.departureTime);

        await notifyUser(
          reservation.passenger.userId,
          'Reserva expirada por falta de pago',
          `Tu reserva para el viaje de ${reservation.trip.originCity} a ${reservation.trip.destinationCity} expiró porque no se confirmó el pago a tiempo.\n\nTiempo restante hasta salida: ${Math.floor(hoursUntil)}h ${Math.floor((hoursUntil % 1) * 60)}m`,
          undefined,
          `/viajes/${reservation.trip.id}`
        );
      }
    }

    await logActionWithErrorHandling(
      {
        userId: 'SYSTEM',
        action: TipoAccionUsuario.EXPIRACION_RESERVA_SIN_PAGO,
        status: 'SUCCESS',
        details: {
          checkedCount: reservationsToCheck.length,
          expiredCount: successfulExpirations,
          reservationIds: reservationsToExpire.map(r => r.id),
        }
      },
      {
        fileName: 'expire-unpaid-reservations.ts',
        functionName: 'expireUnpaidReservations'
      }
    );

    return ApiHandler.handleSuccess(
      { expiredCount: successfulExpirations },
      `${successfulExpirations} reservas sin pago expiradas exitosamente`
    );

  } catch (error) {
    return ApiHandler.handleError(error);
  }
}
