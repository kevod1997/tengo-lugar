import { z } from 'zod';
import { PayoutStatus, PaymentMethod } from '@prisma/client';

/**
 * Schema for creating a new driver payout
 */
export const createDriverPayoutSchema = z.object({
  tripId: z.string().uuid('Trip ID debe ser un UUID válido'),
  driverId: z.string().uuid('Driver ID debe ser un UUID válido'),
  payoutAmount: z.number().min(0, 'El monto del payout no puede ser negativo'),
  totalReceived: z.number().optional(),
  serviceFee: z.number().optional(),
  lateCancellationPenalty: z.number().optional(),
  currency: z.string().default('ARS'),
  status: z.nativeEnum(PayoutStatus).default(PayoutStatus.PENDING),
  payoutMethod: z.nativeEnum(PaymentMethod).default(PaymentMethod.BANK_TRANSFER),
  notes: z.string().optional(),
});

/**
 * Schema for updating a driver payout
 */
export const updateDriverPayoutSchema = z.object({
  payoutId: z.string().uuid('Payout ID debe ser un UUID válido'),
  status: z.nativeEnum(PayoutStatus).optional(),
  notes: z.string().optional(),
  processedBy: z.string().uuid().optional(),
  processedAt: z.date().optional(),
  completedAt: z.date().optional(),
});

/**
 * Schema for querying driver payouts
 */
export const getDriverPayoutsSchema = z.object({
  page: z.number().min(1, 'La página debe ser mayor a 0').default(1),
  pageSize: z.number().min(1).max(100, 'El tamaño de página debe estar entre 1 y 100').default(10),
  status: z.union([z.nativeEnum(PayoutStatus), z.literal('ALL')]).optional().default('ALL'),
  searchTerm: z.string().optional().default(''),
  driverId: z.string().uuid().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
});

/**
 * Schema for processing a driver payout
 */
export const processDriverPayoutSchema = z.object({
  payoutId: z.string().uuid('Payout ID debe ser un UUID válido'),
  processedBy: z.string().uuid('Processed by debe ser un UUID válido'),
  notes: z.string().optional(),
});

/**
 * Schema for completing a driver payout
 */
export const completeDriverPayoutSchema = z.object({
  payoutId: z.string().uuid('Payout ID debe ser un UUID válido'),
  transferProofFileKey: z.string().min(1, 'El comprobante de transferencia es requerido'),
  transferDate: z.date(),
  transferredBy: z.string().uuid('Transferred by debe ser un UUID válido'),
  notes: z.string().optional(),
});

/**
 * Schema for payout calculation result
 */
export const payoutCalculationSchema = z.object({
  totalReceived: z.number().min(0),
  serviceFee: z.number().min(0),
  lateCancellationPenalty: z.number().min(0),
  lateCancellationCount: z.number().int().min(0),
  payoutAmount: z.number().min(0),
  validPassengersCount: z.number().int().min(0),
});

// Type exports for TypeScript
export type CreateDriverPayoutInput = z.infer<typeof createDriverPayoutSchema>;
export type UpdateDriverPayoutInput = z.infer<typeof updateDriverPayoutSchema>;
export type GetDriverPayoutsInput = z.infer<typeof getDriverPayoutsSchema>;
export type ProcessDriverPayoutInput = z.infer<typeof processDriverPayoutSchema>;
export type CompleteDriverPayoutInput = z.infer<typeof completeDriverPayoutSchema>;
export type PayoutCalculationResult = z.infer<typeof payoutCalculationSchema>;
