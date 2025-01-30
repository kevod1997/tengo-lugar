import { z } from 'zod'

// export const carRegistrationSchema = z.object({
//   brand: z.object({
//     name: z.string()
//       .min(2, 'El nombre de la marca debe tener al menos 2 caracteres')
//       .max(50, 'El nombre de la marca no puede exceder 50 caracteres')
//   }),
//   model: z.object({
//     name: z.string()
//       .min(2, 'El nombre del modelo debe tener al menos 2 caracteres')
//       .max(50, 'El nombre del modelo no puede exceder 50 caracteres'),
//     year: z.number()
//       .min(2000, 'Año inválido')
//       .max(new Date().getFullYear() + 1),
//     fuelType: z.enum(['NAFTA', 'DIESEL', 'GNC', 'ELECTRICO', 'HIBRIDO']).optional(),
//     averageFuelConsume: z.number().positive().optional()
//   }),
//   car: z.object({
//     plate: z.string()
//       .regex(/^[A-Z0-9]{6,7}$/, 'Formato de patente inválido')
//   })
// })

// export type CarRegistrationInput = z.infer<typeof carRegistrationSchema>


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
      .regex(/^[A-Z0-9]{6,7}$/, 'Formato de patente inválido')
  })
})

export type CarRegistrationInput = z.infer<typeof carRegistrationSchema>

