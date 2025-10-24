import { z } from 'zod';
import { FuelType } from '@prisma/client';

export const createFuelPriceSchema = z.object({
  name: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  fuelType: z.nativeEnum(FuelType, {
    errorMap: () => ({ message: 'Tipo de combustible inválido' }),
  }),
  price: z.number()
    .positive('El precio debe ser mayor a 0')
    .max(999999.99, 'El precio excede el máximo permitido'),
  effectiveDate: z.date({
    required_error: 'La fecha efectiva es requerida',
    invalid_type_error: 'Fecha inválida',
  }),
});

export const updateFuelPriceSchema = z.object({
  id: z.string().uuid('ID inválido'),
  name: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  fuelType: z.nativeEnum(FuelType, {
    errorMap: () => ({ message: 'Tipo de combustible inválido' }),
  }),
  price: z.number()
    .positive('El precio debe ser mayor a 0')
    .max(999999.99, 'El precio excede el máximo permitido'),
  effectiveDate: z.date({
    required_error: 'La fecha efectiva es requerida',
    invalid_type_error: 'Fecha inválida',
  }),
  isActive: z.boolean(),
});

export const toggleFuelPriceStatusSchema = z.object({
  id: z.string().uuid('ID inválido'),
  isActive: z.boolean(),
});

export const getFuelPricesSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(10),
  fuelType: z.nativeEnum(FuelType).optional(),
  isActive: z.boolean().optional(),
  searchTerm: z.string().optional(),
});

export type CreateFuelPriceInput = z.infer<typeof createFuelPriceSchema>;
export type UpdateFuelPriceInput = z.infer<typeof updateFuelPriceSchema>;
export type ToggleFuelPriceStatusInput = z.infer<typeof toggleFuelPriceStatusSchema>;
export type GetFuelPricesInput = z.infer<typeof getFuelPricesSchema>;
