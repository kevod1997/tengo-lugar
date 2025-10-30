/**
 * Utilidades para validar restricciones temporales de pagos
 * Según REGLAS_DE_NEGOCIO_PAGOS.md Sección 9
 */

export interface TimeRestrictionResult {
  isAllowed: boolean;
  reason?: string;
  hoursUntilDeparture: number;
}

/**
 * Calcula horas hasta la salida del viaje
 */
export function calculateHoursUntilDeparture(departureTime: Date): number {
  const now = new Date();
  const diffMs = departureTime.getTime() - now.getTime();
  return diffMs / (1000 * 60 * 60); // convertir a horas
}

/**
 * Verifica si se puede crear una nueva reserva
 * Regla: NO se permiten reservas dentro de 3 horas de la salida
 */
export function canCreateReservation(departureTime: Date): TimeRestrictionResult {
  const hoursUntilDeparture = calculateHoursUntilDeparture(departureTime);

  if (hoursUntilDeparture < 3) {
    return {
      isAllowed: false,
      reason: 'No se pueden crear reservas dentro de las 3 horas previas a la salida',
      hoursUntilDeparture
    };
  }

  return {
    isAllowed: true,
    hoursUntilDeparture
  };
}

/**
 * Verifica si el conductor puede aprobar una reserva
 * Regla: NO se permiten aprobaciones dentro de 3 horas de la salida
 */
export function canApproveReservation(departureTime: Date): TimeRestrictionResult {
  const hoursUntilDeparture = calculateHoursUntilDeparture(departureTime);

  if (hoursUntilDeparture < 3) {
    return {
      isAllowed: false,
      reason: 'No se pueden aprobar reservas dentro de las 3 horas previas a la salida',
      hoursUntilDeparture
    };
  }

  return {
    isAllowed: true,
    hoursUntilDeparture
  };
}

/**
 * Verifica si una reserva APPROVED debe expirar por falta de pago
 * Regla: Expira dentro de 2 horas si Payment.status = PENDING
 */
export function shouldExpireUnpaidReservation(
  departureTime: Date,
  paymentStatus: 'PENDING' | 'COMPLETED'
): TimeRestrictionResult {
  const hoursUntilDeparture = calculateHoursUntilDeparture(departureTime);

  // Si el pago ya está COMPLETED, no expira
  if (paymentStatus === 'COMPLETED') {
    return {
      isAllowed: false,
      reason: 'El pago ya fue completado',
      hoursUntilDeparture
    };
  }

  // Expira si faltan menos de 2 horas y el pago está PENDING
  if (hoursUntilDeparture < 2 && paymentStatus === 'PENDING') {
    return {
      isAllowed: true, // debe expirar
      reason: 'Reserva sin pago confirmado dentro de 2 horas de la salida',
      hoursUntilDeparture
    };
  }

  return {
    isAllowed: false,
    hoursUntilDeparture
  };
}

/**
 * Verifica si el conductor puede remover un pasajero APPROVED
 * Regla (Sección 2.5.1): Ventanas de protección según tiempo hasta salida:
 * - >24h hasta salida: 8h de protección desde aprobación
 * - 12-24h hasta salida: 4h de protección desde aprobación
 * - 3-12h hasta salida: 2h de protección desde aprobación
 * - <3h hasta salida: NO se puede remover (ya bloqueado por otra regla)
 */
export function canDriverRemoveApprovedPassenger(
  departureTime: Date,
  approvedAt: Date
): TimeRestrictionResult {
  const hoursUntilDeparture = calculateHoursUntilDeparture(departureTime);
  const hoursSinceApproval = (new Date().getTime() - approvedAt.getTime()) / (1000 * 60 * 60);

  // Determinar ventana de protección según tiempo hasta salida
  let protectionWindowHours = 0;
  let timeRangeDescription = '';

  if (hoursUntilDeparture > 24) {
    protectionWindowHours = 8;
    timeRangeDescription = 'más de 24 horas';
  } else if (hoursUntilDeparture >= 12 && hoursUntilDeparture <= 24) {
    protectionWindowHours = 4;
    timeRangeDescription = '12-24 horas';
  } else if (hoursUntilDeparture >= 3 && hoursUntilDeparture < 12) {
    protectionWindowHours = 2;
    timeRangeDescription = '3-12 horas';
  } else {
    // Menos de 3 horas - no se puede remover de ninguna manera
    return {
      isAllowed: false,
      reason: 'No se pueden rechazar pasajeros dentro de las 3 horas previas a la salida',
      hoursUntilDeparture
    };
  }

  // Verificar si el pasajero está dentro de la ventana de protección
  if (hoursSinceApproval < protectionWindowHours) {
    const remainingProtectionTime = protectionWindowHours - hoursSinceApproval;
    const hours = Math.floor(remainingProtectionTime);
    const minutes = Math.floor((remainingProtectionTime % 1) * 60);

    return {
      isAllowed: false,
      reason: `El pasajero fue aprobado recientemente y está protegido durante ${protectionWindowHours}h (rango ${timeRangeDescription} hasta salida). Tiempo restante de protección: ${hours}h ${minutes}m`,
      hoursUntilDeparture
    };
  }

  return {
    isAllowed: true,
    hoursUntilDeparture
  };
}

/**
 * Formatea un mensaje de error user-friendly
 */
export function formatTimeRestrictionError(result: TimeRestrictionResult): string {
  const hours = Math.abs(Math.floor(result.hoursUntilDeparture));
  const minutes = Math.abs(Math.floor((result.hoursUntilDeparture % 1) * 60));

  return `${result.reason}. Tiempo restante: ${hours}h ${minutes}m`;
}
