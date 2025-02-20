import { z } from 'zod'

export const carRegistrationSchema = z.object({
  brand: z.object({
    name: z.string()
      .min(2, 'El nombre de la marca debe tener al menos 2 caracteres')
      .max(50, 'El nombre de la marca no puede exceder 50 caracteres')
  }),
  model: z.object({
    name: z.string()
      .min(2, 'El nombre del modelo debe tener al menos 2 caracteres')
      .max(50, 'El nombre del modelo no puede exceder 50 caracteres'),
    year: z.number()
      .min(2000, 'Año inválido')
      .max(new Date().getFullYear() + 1),
    fuelType: z.enum(['NAFTA', 'DIESEL', 'GNC', 'ELECTRICO', 'HIBRIDO']).optional(),
    averageFuelConsume: z.number().positive().optional()
  }),
  car: z.object({
    plate: z.string()
      .regex(
        /^[A-Za-z]{3}\d{3}$|^[A-Za-z]{2}\d{3}[A-Za-z]{2}$/,
        'Formato de patente inválido. Debe ser formato viejo (ABC123) o nuevo (AB123CD)'
      )
      .transform(val => val.toUpperCase())
  })
})

export type CarRegistrationInput = z.infer<typeof carRegistrationSchema>

