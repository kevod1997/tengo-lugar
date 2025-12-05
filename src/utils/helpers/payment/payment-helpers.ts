// src/utils/helpers/payment/payment-helpers.ts
import type { PaymentStatus } from "@prisma/client";

/**
 * Obtener texto legible del estado de pago
 */
export function getPaymentStatusText(status: PaymentStatus): string {
  const statusMap: Record<PaymentStatus, string> = {
    PENDING: 'Pendiente',
    PROCESSING: 'Procesando',
    COMPLETED: 'Completado',
    FAILED: 'Fallido',
    CANCELLED: 'Cancelado',
    REFUNDED: 'Reembolsado'
  };

  return statusMap[status] || status;
}

/**
 * Obtener color del badge según estado de pago
 */
export function getPaymentStatusColor(status: PaymentStatus): string {
  const colorMap: Record<PaymentStatus, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    PROCESSING: 'bg-blue-100 text-blue-800 border-blue-200',
    COMPLETED: 'bg-green-100 text-green-800 border-green-200',
    FAILED: 'bg-red-100 text-red-800 border-red-200',
    CANCELLED: 'bg-gray-100 text-gray-800 border-gray-200',
    REFUNDED: 'bg-slate-100 text-slate-800 border-slate-200'
  };

  return colorMap[status] || 'bg-slate-100 text-slate-800';
}

/**
 * Verificar si un comprobante de pago es válido
 */
export function validatePaymentProof(file: File): { isValid: boolean; error?: string } {
  const MAX_SIZE_MB = 5;
  const ACCEPTED_FORMATS = ['image/jpeg', 'image/png', 'application/pdf'];

  // Validar tamaño
  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > MAX_SIZE_MB) {
    return {
      isValid: false,
      error: `El archivo es demasiado grande. Máximo ${MAX_SIZE_MB}MB`
    };
  }

  // Validar formato
  if (!ACCEPTED_FORMATS.includes(file.type)) {
    return {
      isValid: false,
      error: 'Formato no válido. Solo se aceptan JPG, PNG o PDF'
    };
  }

  return { isValid: true };
}

/**
 * Formatear fecha para mostrar en instrucciones de pago
 */
export function formatPaymentDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(dateObj);
}

/**
 * Copiar texto al portapapeles
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Error al copiar al portapapeles:', error);
    return false;
  }
}

/**
 * Calcular tiempo restante para completar el pago
 */
export function calculatePaymentDeadline(approvedAt: Date, timeoutHours: number = 24): {
  deadline: Date;
  hoursRemaining: number;
  isExpired: boolean;
} {
  const deadline = new Date(approvedAt);
  deadline.setHours(deadline.getHours() + timeoutHours);

  const now = new Date();
  const hoursRemaining = Math.max(0, (deadline.getTime() - now.getTime()) / (1000 * 60 * 60));
  const isExpired = hoursRemaining === 0;

  return {
    deadline,
    hoursRemaining: Math.round(hoursRemaining),
    isExpired
  };
}
