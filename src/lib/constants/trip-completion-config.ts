/**
 * Configuración para completación automática de viajes
 *
 * Lógica:
 * - Tiempo de completación = departureTime + durationSeconds + buffer
 * - El viaje pasa a COMPLETED cuando `now >= completionTime`
 *
 * Ejemplo:
 * - Viaje sale a las 14:00, dura 2h 30min
 * - Llegada estimada: 16:30
 * - Buffer: 1.5h
 * - Tiempo de completación: 18:00
 * - Cron corre a las 18:00 o 20:00 → marca como COMPLETED
 */

export const TRIP_COMPLETION_CONFIG = {
  /**
   * Buffer adicional después de la hora estimada de llegada
   *
   * Ejemplo:
   * - Viaje termina a las 18:30
   * - Buffer: 1.5h
   * - Completación: 20:00
   */
  COMPLETION_BUFFER_SECONDS: 5400, // 1.5 horas (90 minutos)

  /**
   * Frecuencia de ejecución del cron job
   * Cada 2 horas es un balance entre precisión y carga del servidor
   */
  CRON_SCHEDULE: '0 */2 * * *', // Cada 2 horas

  /**
   * Safety nets para duraciones extremas
   * Protege contra datos incorrectos o casos edge
   */
  MIN_DURATION_SECONDS: 1800,    // Mínimo 30 minutos
  MAX_DURATION_SECONDS: 172800,  // Máximo 48 horas

  /**
   * Tiempo mínimo de anticipación para buscar y reservar viajes
   *
   * Razón de negocio:
   * - Tiempo mínimo para que el pasajero realice transferencia bancaria
   * - Tiempo para enviar comprobante vía WhatsApp
   * - Tiempo para verificación manual del admin
   * - Buffer adicional de 30min sobre la regla base de 3h
   *
   * Uso en búsqueda de viajes:
   * - Cuando se busca para el día actual, solo mostrar viajes que salgan en >3h 30min
   */
  MINIMUM_BOOKING_TIME_SECONDS: 12600, // 3 horas 30 minutos (3.5 horas)
} as const;

/**
 * Calcula el tiempo en el que un viaje debe marcarse como completado
 *
 * @param departureTime - Hora de salida del viaje
 * @param durationSeconds - Duración del viaje en segundos (REQUERIDO)
 * @param bufferSeconds - Buffer adicional (opcional, usa default config)
 * @returns Fecha/hora de completación
 * @throws Error si durationSeconds no está definido o es inválido
 *
 * @example
 * ```typescript
 * const departure = new Date('2025-01-15T14:00:00');
 * const duration = 9000; // 2h 30min
 * const completion = calculateTripCompletionTime(departure, duration);
 * // Result: 2025-01-15T18:00:00 (14:00 + 2:30 + 1:30 buffer)
 * ```
 */
export function calculateTripCompletionTime(
  departureTime: Date,
  durationSeconds: number,
  bufferSeconds: number = TRIP_COMPLETION_CONFIG.COMPLETION_BUFFER_SECONDS
): Date {
  // Validación estricta
  if (!durationSeconds || durationSeconds <= 0) {
    throw new Error(
      `durationSeconds es requerido y debe ser mayor a 0. Recibido: ${durationSeconds}`
    );
  }

  // Aplicar safety nets para duraciones extremas
  const safeDuration = Math.max(
    TRIP_COMPLETION_CONFIG.MIN_DURATION_SECONDS,
    Math.min(durationSeconds, TRIP_COMPLETION_CONFIG.MAX_DURATION_SECONDS)
  );

  // Calcular tiempo de completación
  const completionTime = new Date(departureTime);
  const totalSeconds = safeDuration + bufferSeconds;
  completionTime.setSeconds(completionTime.getSeconds() + totalSeconds);

  return completionTime;
}

/**
 * Formatea la duración en formato legible
 *
 * @param seconds - Duración en segundos
 * @returns String formateado (ej: "2h 30min")
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}min`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${minutes}min`;
  }
}
