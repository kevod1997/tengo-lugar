import { z } from "zod";
import { fileSchema } from "./file-schema";
import { CardType } from "@prisma/client";

export const vehicleCardSchema = z.object({
  cardType: z.nativeEnum(CardType, {
    required_error: "El tipo de tarjeta es requerido",
    invalid_type_error: "Tipo de tarjeta inválido"
  }),

  expirationDate: z.union([
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

  carPlate: z.string()
    .regex(
      /^[A-Za-z]{3}\d{3}$|^[A-Za-z]{2}\d{3}[A-Za-z]{2}$/,
      'Formato de patente inválido. Debe ser formato viejo (ABC123) o nuevo (AB123CD)'
    )
    .transform(val => val.toUpperCase()),

  cardFile: fileSchema.refine(
    (file) => file !== undefined,
    "El archivo de la tarjeta es requerido"
  ),
});

export type VehicleCardInput = z.input<typeof vehicleCardSchema>;
export type VehicleCardOutput = z.output<typeof vehicleCardSchema>;