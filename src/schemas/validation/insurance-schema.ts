import { z } from "zod";
import { fileSchema } from "./file-schema";

export const insuranceSchema = z.object({
  insuranceId: z.string({
    required_error: "La compañía de seguros es requerida",
  }).uuid("El ID de la compañía de seguros debe ser un UUID válido"),

  carId: z.string().uuid("El ID del vehículo debe ser un UUID válido"),

  policyNumber: z.union([
    z.string().regex(/^\d+$/, "El número de póliza debe contener solo números"),
    z.number()
  ])
  .transform(val => typeof val === 'string' ? parseInt(val, 10) : val)
  .refine(
    (num) => num > 0 && num <= 999999999,
    "El número de póliza debe estar entre 1 y 999999999"
  ),

  startDate: z.union([
    z.string(),
    z.date()
  ])
  .transform(val => val instanceof Date ? val : new Date(val))
  .refine(
    (date) => !isNaN(date.getTime()),
    "La fecha de inicio no es válida"
  )
  .refine(
    (date) => date <= new Date(),
    "La fecha de inicio no puede ser posterior a hoy"
  ),

  expireDate: z.union([
    z.string(),
    z.date()
  ])
  .transform(val => val instanceof Date ? val : new Date(val))
  .refine(
    (date) => !isNaN(date.getTime()),
    "La fecha de vencimiento no es válida"
  )
  .refine(
    (date) => date > new Date(),
    "La fecha de vencimiento debe ser futura"
  ),

  policyFile: fileSchema,
}).refine(
  (data) => data.startDate < data.expireDate,
  {
    message: "La fecha de vencimiento debe ser posterior a la fecha de inicio",
    path: ["expireDate"],
  }
);

export type InsuranceInput = z.input<typeof insuranceSchema>; // Type for the input data
export type InsuranceOutput = z.output<typeof insuranceSchema>; // Type for the validated data