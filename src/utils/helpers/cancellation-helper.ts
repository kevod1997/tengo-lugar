// src/utils/helpers/cancellation-helper.ts
import prisma from "@/lib/prisma";
import { ReservationStatus, CancelledBy, RefundType } from "@prisma/client";

/**
 * Calcula los detalles de una cancelación basándose en el tiempo antes de la salida
 */
export interface CancellationDetails {
  hoursBeforeDeparture: number;
  newStatus: ReservationStatus;
  refundPercentage: number;
  refundType: RefundType;
}

/**
 * Calcula los detalles de cancelación para un pasajero
 *
 * Regla especial (Sección 1.4): Si el pasajero reservó hace menos de 24 horas
 * Y cancela dentro de 1 hora de haber reservado, recibe reembolso completo
 * independientemente del tiempo hasta la salida.
 */
export function calculatePassengerCancellationDetails(
  departureTime: Date,
  cancelledAt: Date = new Date(),
  reservationCreatedAt?: Date
): CancellationDetails {
  const hoursBeforeDeparture = (departureTime.getTime() - cancelledAt.getTime()) / (1000 * 60 * 60);

  // Regla especial: Cancelación dentro de 1 hora de reserva reciente
  if (reservationCreatedAt) {
    const hoursSinceReservation = (cancelledAt.getTime() - reservationCreatedAt.getTime()) / (1000 * 60 * 60);
    const hoursSinceReservationFromNow = (new Date().getTime() - reservationCreatedAt.getTime()) / (1000 * 60 * 60);

    // Si reservó hace menos de 24h Y cancela dentro de 1h de la reserva → 100% reembolso
    if (hoursSinceReservationFromNow < 24 && hoursSinceReservation < 1) {
      return {
        hoursBeforeDeparture,
        newStatus: 'CANCELLED_EARLY',
        refundPercentage: 100,
        refundType: 'FULL_REFUND'
      };
    }
  }

  // Determinar estado y porcentaje de reembolso según reglas de negocio estándar
  if (hoursBeforeDeparture > 24) {
    return {
      hoursBeforeDeparture,
      newStatus: 'CANCELLED_EARLY',
      refundPercentage: 100,
      refundType: 'FULL_REFUND'
    };
  } else if (hoursBeforeDeparture >= 12 && hoursBeforeDeparture <= 24) {
    return {
      hoursBeforeDeparture,
      newStatus: 'CANCELLED_MEDIUM',
      refundPercentage: 75,
      refundType: 'PARTIAL_REFUND_75'
    };
  } else {
    return {
      hoursBeforeDeparture,
      newStatus: 'CANCELLED_LATE',
      refundPercentage: 50,
      refundType: 'PARTIAL_REFUND_50'
    };
  }
}

/**
 * Calcula los detalles de cancelación para un conductor
 */
export function calculateDriverCancellationDetails(
  departureTime: Date,
  cancelledAt: Date = new Date()
): { hoursBeforeDeparture: number; newStatus: ReservationStatus } {
  const hoursBeforeDeparture = (departureTime.getTime() - cancelledAt.getTime()) / (1000 * 60 * 60);

  // Determinar estado según reglas de negocio
  if (hoursBeforeDeparture > 48) {
    return {
      hoursBeforeDeparture,
      newStatus: 'CANCELLED_BY_DRIVER_EARLY'
    };
  } else {
    return {
      hoursBeforeDeparture,
      newStatus: 'CANCELLED_BY_DRIVER_LATE'
    };
  }
}

/**
 * Calcula los montos de reembolso para una cancelación
 */
export interface RefundAmounts {
  refundAmount: number;
  driverCompensation: number;
  serviceFeeRetained: number;
}

export function calculateRefundAmounts(
  totalPaymentAmount: number,
  tripPrice: number,
  serviceFee: number,
  refundPercentage: number
): RefundAmounts {
  // El fee SIEMPRE se retiene (regla fundamental)
  const serviceFeeRetained = serviceFee;

  // Calcular reembolso del precio del viaje
  const refundAmount = (tripPrice * refundPercentage) / 100;

  // Compensación al conductor es lo que no se reembolsa
  const driverCompensation = tripPrice - refundAmount;

  return {
    refundAmount,
    driverCompensation,
    serviceFeeRetained
  };
}

/**
 * Crea un registro de cancelación en la base de datos
 */
export async function createCancellationRecord(
  cancelledBy: CancelledBy,
  reason: string,
  hoursBeforeDeparture: number,
  refundPercentage: number,
  tripPassengerId?: string,
  tripId?: string
) {
  return await prisma.cancellation.create({
    data: {
      cancelledBy,
      reason,
      hoursBeforeDeparture,
      refundPercentage,
      tripPassengerId,
      tripId
    }
  });
}

/**
 * Crea un registro de reembolso en la base de datos
 */
export async function createRefundRecord(
  paymentId: string,
  refundAmount: number,
  driverCompensation: number,
  serviceFeeRetained: number,
  refundType: RefundType
) {
  return await prisma.refund.create({
    data: {
      paymentId,
      refundAmount,
      driverCompensation,
      serviceFeeRetained,
      refundStatus: 'PROCESSING',
      refundType,
      processedAt: new Date()
    }
  });
}

/**
 * Valida si una reserva puede ser cancelada
 */
export function validateCancellationEligibility(
  reservationStatus: ReservationStatus,
  tripStatus: string
): { canCancel: boolean; reason?: string } {
  // Estados que indican que ya está cancelada
  const cancelledStatuses: ReservationStatus[] = [
    'CANCELLED_EARLY',
    'CANCELLED_MEDIUM',
    'CANCELLED_LATE',
    'CANCELLED_BY_DRIVER_EARLY',
    'CANCELLED_BY_DRIVER_LATE',
    'NO_SHOW',
    'EXPIRED'
  ];

  if (cancelledStatuses.includes(reservationStatus)) {
    return {
      canCancel: false,
      reason: 'Esta reservación ya ha sido cancelada'
    };
  }

  if (tripStatus === 'COMPLETED') {
    return {
      canCancel: false,
      reason: 'No se puede cancelar una reservación de un viaje completado'
    };
  }

  if (tripStatus === 'CANCELLED') {
    return {
      canCancel: false,
      reason: 'Este viaje ya ha sido cancelado'
    };
  }

  return { canCancel: true };
}

/**
 * Procesa la cancelación de un pasajero con toda la lógica de reembolso
 */
export async function processPassengerCancellation(
  tripPassengerId: string,
  reason: string,
  tx: any // Prisma transaction client
) {
  // Obtener información de la reserva
  const reservation = await tx.tripPassenger.findUnique({
    where: { id: tripPassengerId },
    include: {
      trip: true,
      payment: true
    }
  });

  if (!reservation) {
    throw new Error('Reservación no encontrada');
  }

  // Validar elegibilidad
  const validation = validateCancellationEligibility(
    reservation.reservationStatus,
    reservation.trip.status
  );

  if (!validation.canCancel) {
    throw new Error(validation.reason);
  }

  // Calcular detalles de cancelación (incluye regla de 1 hora)
  const cancellationDetails = calculatePassengerCancellationDetails(
    reservation.trip.departureTime,
    new Date(),
    reservation.createdAt
  );

  // Actualizar estado de la reserva
  await tx.tripPassenger.update({
    where: { id: tripPassengerId },
    data: { reservationStatus: cancellationDetails.newStatus }
  });

  // Crear registro de cancelación
  await createCancellationRecord(
    'PASSENGER',
    reason,
    cancellationDetails.hoursBeforeDeparture,
    cancellationDetails.refundPercentage,
    tripPassengerId
  );

  // Si la reserva estaba confirmada (pagada), procesar reembolso
  if (reservation.reservationStatus === 'CONFIRMED' && reservation.payment?.status === 'COMPLETED') {
    const totalAmount = reservation.payment.totalAmount;
    const tripPrice = reservation.totalPrice;
    const serviceFee = reservation.payment.serviceFee;

    const refundAmounts = calculateRefundAmounts(
      totalAmount,
      tripPrice,
      serviceFee,
      cancellationDetails.refundPercentage
    );

    // Crear registro de reembolso
    await createRefundRecord(
      reservation.payment.id,
      refundAmounts.refundAmount,
      refundAmounts.driverCompensation,
      refundAmounts.serviceFeeRetained,
      cancellationDetails.refundType
    );

    // Actualizar estado del pago
    await tx.payment.update({
      where: { id: reservation.payment.id },
      data: { status: 'REFUNDED' }
    });
  }

  // Liberar asientos si la reserva estaba activa
  if (['APPROVED', 'CONFIRMED'].includes(reservation.reservationStatus)) {
    const newRemainingSeats = reservation.trip.remainingSeats + reservation.seatsReserved;

    await tx.trip.update({
      where: { id: reservation.trip.id },
      data: {
        remainingSeats: newRemainingSeats,
        isFull: false
      }
    });
  }

  return {
    success: true,
    cancellationDetails,
    refundProcessed: reservation.reservationStatus === 'CONFIRMED'
  };
}

/**
 * Procesa la cancelación de un viaje por el conductor
 */
export async function processDriverCancellation(
  tripId: string,
  reason: string,
  tx: any // Prisma transaction client
) {
  // Obtener información del viaje
  const trip = await tx.trip.findUnique({
    where: { id: tripId },
    include: {
      passengers: {
        where: {
          reservationStatus: {
            in: ['PENDING_APPROVAL', 'APPROVED', 'CONFIRMED']
          }
        },
        include: {
          payment: true
        }
      }
    }
  });

  if (!trip) {
    throw new Error('Viaje no encontrado');
  }

  // Calcular detalles de cancelación
  const cancellationDetails = calculateDriverCancellationDetails(trip.departureTime);

  // Actualizar estado del viaje
  await tx.trip.update({
    where: { id: tripId },
    data: { status: 'CANCELLED' }
  });

  // Crear registro de cancelación del viaje
  await createCancellationRecord(
    'DRIVER',
    reason,
    cancellationDetails.hoursBeforeDeparture,
    0, // No aplica refundPercentage para conductor
    undefined,
    tripId
  );

  // Procesar cada pasajero
  const affectedPassengers = [];

  for (const passenger of trip.passengers) {
    // Actualizar estado de la reserva
    await tx.tripPassenger.update({
      where: { id: passenger.id },
      data: { reservationStatus: cancellationDetails.newStatus }
    });

    affectedPassengers.push(passenger);

    // Si el pasajero tenía pago confirmado, crear reembolso completo (100% precio viaje, 0% fee)
    if (passenger.reservationStatus === 'CONFIRMED' && passenger.payment?.status === 'COMPLETED') {
      // const totalAmount = passenger.payment.totalAmount;
      const tripPrice = passenger.totalPrice;
      const serviceFee = passenger.payment.serviceFee;

      // Conductor canceló: pasajero recibe 100% del precio del viaje, fee se retiene
      await createRefundRecord(
        passenger.payment.id,
        tripPrice, // 100% del precio del viaje
        0, // Sin compensación al conductor (él canceló)
        serviceFee, // Fee siempre retenido
        'FULL_REFUND'
      );

      // Actualizar estado del pago
      await tx.payment.update({
        where: { id: passenger.payment.id },
        data: { status: 'REFUNDED' }
      });
    }
  }

  return {
    success: true,
    cancellationDetails,
    affectedPassengers: affectedPassengers.length
  };
}

/**
 * Procesa la cancelación automática de un viaje por el sistema
 * Se usa cuando un viaje expira sin pasajeros confirmados
 */
export async function processSystemCancellation(
  tripId: string,
  reason: string,
  tx: any // Prisma transaction client
): Promise<void> {
  // Obtener información del viaje
  const trip = await tx.trip.findUnique({
    where: { id: tripId },
    include: {
      passengers: {
        where: {
          reservationStatus: {
            in: ['PENDING_APPROVAL', 'APPROVED', 'WAITLISTED']
          }
        }
      }
    }
  });

  if (!trip) {
    throw new Error('Viaje no encontrado');
  }

  // 1. Actualizar estado del viaje a CANCELLED
  await tx.trip.update({
    where: { id: tripId },
    data: { status: 'CANCELLED' }
  });

  // 2. Crear registro de cancelación con SYSTEM
  await tx.cancellation.create({
    data: {
      tripId,
      cancelledBy: 'SYSTEM',
      reason,
      hoursBeforeDeparture: 0,
      refundPercentage: 0
    }
  });

  // 3. Cancelar pasajeros no confirmados si los hay
  if (trip.passengers.length > 0) {
    await tx.tripPassenger.updateMany({
      where: {
        tripId,
        reservationStatus: {
          in: ['PENDING_APPROVAL', 'APPROVED', 'WAITLISTED']
        }
      },
      data: {
        reservationStatus: 'CANCELLED_BY_DRIVER_LATE'
      }
    });
  }
}
