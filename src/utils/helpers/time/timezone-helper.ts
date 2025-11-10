/**
 * timezone-helper.ts
 *
 * Utilidades para manejar conversiones de zona horaria entre Argentina (UTC-3) y UTC.
 *
 * IMPORTANTE: Argentina no usa horario de verano (DST) desde 2009, por lo que
 * el offset es constante todo el año: UTC-3
 */

/**
 * Offset de Argentina en horas (UTC-3)
 */
export const ARGENTINA_UTC_OFFSET_HOURS = 3;

/**
 * Convierte una fecha de Argentina (UTC-3) a UTC para queries en la base de datos.
 *
 * Ejemplo:
 * - Input: 2025-11-08 22:00:00 (hora Argentina)
 * - Output: 2025-11-09 01:00:00 (UTC)
 *
 * @param localDate Fecha en hora local de Argentina
 * @returns Fecha ajustada a UTC
 */
export function argentinaToUTC(localDate: Date): Date {
  const utc = new Date(localDate);
  utc.setHours(utc.getHours() + ARGENTINA_UTC_OFFSET_HOURS);
  return utc;
}

/**
 * Convierte una fecha de DB (UTC) a hora de Argentina (UTC-3) para display.
 *
 * Ejemplo:
 * - Input: 2025-11-09 01:00:00 (UTC desde DB)
 * - Output: 2025-11-08 22:00:00 (hora Argentina para mostrar)
 *
 * @param utcDate Fecha en UTC desde la DB
 * @returns Fecha ajustada a hora Argentina
 */
export function utcToArgentina(utcDate: Date): Date {
  const local = new Date(utcDate);
  local.setHours(local.getHours() - ARGENTINA_UTC_OFFSET_HOURS);
  return local;
}

/**
 * Formatea una fecha UTC a string en hora Argentina.
 * Útil para debugging y logs.
 *
 * @param utcDate Fecha en UTC
 * @returns String formateado en hora Argentina
 */
export function formatArgentinaTime(utcDate: Date): string {
  const local = utcToArgentina(utcDate);
  return local.toISOString().replace('T', ' ').substring(0, 19) + ' (ART)';
}
