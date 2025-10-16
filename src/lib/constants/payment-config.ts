// src/lib/constants/payment-config.ts

/**
 * Configuración de información bancaria de Tengo Lugar
 *
 * IMPORTANTE: Estos valores deben configurarse en las variables de entorno
 * antes de usar el sistema de pagos en producción.
 */

export const PAYMENT_CONFIG = {
  // Información bancaria de Tengo Lugar
  BANK_INFO: {
    RAZON_SOCIAL: process.env.TENGO_LUGAR_RAZON_SOCIAL || 'Tengo Lugar S.A.',
    CUIT: process.env.TENGO_LUGAR_CUIT || '[COMPLETAR EN .env]',
    BANK_NAME: process.env.TENGO_LUGAR_BANK_NAME || '[COMPLETAR EN .env]',
    ACCOUNT_TYPE: 'Cuenta Corriente',
    CBU: process.env.TENGO_LUGAR_BANK_CBU || '[COMPLETAR EN .env]',
    ALIAS: process.env.TENGO_LUGAR_BANK_ALIAS || 'tengo.lugar.pagos',
  },

  // WhatsApp para recepción de comprobantes
  WHATSAPP: {
    NUMBER: process.env.NEXT_PUBLIC_TENGO_LUGAR_WHATSAPP || '[COMPLETAR EN .env]',
    // Formato internacional sin el +
    // Ejemplo: 5491112345678 para Argentina
  },

  // Tiempos y límites
  PAYMENT_TIMEOUT_HOURS: 24, // Tiempo límite para completar el pago después de aprobación
  VERIFICATION_TIME_HOURS: 24, // Tiempo estimado de verificación de pago

  // Formatos de comprobante aceptados
  ACCEPTED_PROOF_FORMATS: ['JPG', 'PNG', 'PDF'],

  // Tamaño máximo de archivo (en MB)
  MAX_FILE_SIZE_MB: 5,
} as const;

/**
 * Validar que las variables de entorno estén configuradas
 */
export function validatePaymentConfig(): { isValid: boolean; missingVars: string[] } {
  const missingVars: string[] = [];

  if (!process.env.TENGO_LUGAR_CUIT || process.env.TENGO_LUGAR_CUIT === '[COMPLETAR EN .env]') {
    missingVars.push('TENGO_LUGAR_CUIT');
  }

  if (!process.env.TENGO_LUGAR_BANK_NAME || process.env.TENGO_LUGAR_BANK_NAME === '[COMPLETAR EN .env]') {
    missingVars.push('TENGO_LUGAR_BANK_NAME');
  }

  if (!process.env.TENGO_LUGAR_BANK_CBU || process.env.TENGO_LUGAR_BANK_CBU === '[COMPLETAR EN .env]') {
    missingVars.push('TENGO_LUGAR_BANK_CBU');
  }

  if (!process.env.NEXT_PUBLIC_TENGO_LUGAR_WHATSAPP || process.env.NEXT_PUBLIC_TENGO_LUGAR_WHATSAPP === '[COMPLETAR EN .env]') {
    missingVars.push('NEXT_PUBLIC_TENGO_LUGAR_WHATSAPP');
  }

  return {
    isValid: missingVars.length === 0,
    missingVars
  };
}

/**
 * Generar mensaje pre-cargado para WhatsApp
 */
export function generateWhatsAppMessage(
  reservationId: string,
  origin: string,
  destination: string,
  tripDate: string,
  totalAmount: number
): string {
  return `Hola! Envío comprobante de pago para:

Viaje: ${origin} → ${destination}
Fecha: ${tripDate}
Reserva ID: ${reservationId}
Monto: $${totalAmount}

Adjunto comprobante de transferencia.`;
}

/**
 * Obtener URL de WhatsApp con mensaje pre-cargado
 */
export function getWhatsAppUrl(message: string): string {
  const encodedMessage = encodeURIComponent(message);
  const whatsappNumber = PAYMENT_CONFIG.WHATSAPP.NUMBER;

  return `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
}
