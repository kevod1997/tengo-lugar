// src/schemas/validation/payment-schema.ts
import { z } from "zod";

/**
 * Schema para obtener detalles de pago
 */
export const getPaymentDetailsSchema = z.object({
  tripId: z.string().uuid("ID de viaje inválido"),
  userId: z.string().uuid("ID de usuario inválido"),
});

/**
 * Schema para actualizar estado de pago (admin)
 */
export const updatePaymentStatusSchema = z.object({
  paymentId: z.string().uuid("ID de pago inválido"),
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED']),
  notes: z.string().optional(),
});

/**
 * Schema para subir comprobante de pago
 */
export const uploadPaymentProofSchema = z.object({
  paymentId: z.string().uuid("ID de pago inválido"),
  fileName: z.string().min(1, "Nombre de archivo requerido"),
  contentType: z.enum(
    ['image/jpeg', 'image/png', 'application/pdf'],
    { errorMap: () => ({ message: "Formato de archivo no válido. Solo JPG, PNG o PDF" }) }
  ),
  fileSize: z.number()
    .max(5 * 1024 * 1024, "El archivo no debe superar 5MB")
    .positive("El tamaño del archivo debe ser positivo"),
});

/**
 * Schema para aprobar pago con comprobante
 */
export const approvePaymentWithProofSchema = z.object({
  paymentId: z.string().uuid("ID de pago inválido"),
  proofFileKey: z.string().min(1, "El comprobante es obligatorio"),
});

/**
 * Schema para subir comprobante a pago completado
 */
export const uploadReceiptToCompletedSchema = z.object({
  paymentId: z.string().uuid("ID de pago inválido"),
  proofFileKey: z.string().min(1, "El comprobante es obligatorio"),
});

/**
 * Schema para rechazar pago
 */
export const rejectPaymentSchema = z.object({
  paymentId: z.string().uuid("ID de pago inválido"),
  failureReason: z.string().min(10, "La razón debe tener al menos 10 caracteres"),
});

/**
 * Type exports para TypeScript
 */
export type GetPaymentDetailsInput = z.infer<typeof getPaymentDetailsSchema>;
export type UpdatePaymentStatusInput = z.infer<typeof updatePaymentStatusSchema>;
export type UploadPaymentProofInput = z.infer<typeof uploadPaymentProofSchema>;
export type ApprovePaymentWithProofInput = z.infer<typeof approvePaymentWithProofSchema>;
export type UploadReceiptToCompletedInput = z.infer<typeof uploadReceiptToCompletedSchema>;
export type RejectPaymentInput = z.infer<typeof rejectPaymentSchema>;
