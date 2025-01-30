// import { z } from "zod";
// import { fileSchema } from "./file-schema";

// export const insuranceSchema = z.object({
//   insuranceId: z.string({
//     required_error: "La compañía de seguros es requerida",
//   }),
//   policyNumber: z.string()
//     .min(1, "El número de póliza es requerido")
//     .regex(/^\d+$/, "El número de póliza debe contener solo números")
//     .transform(val => parseInt(val, 10)),
//   startDate: z.string()
//     .refine((date) => {
//       const startDate = new Date(date);
//       const today = new Date();
//       return startDate <= today;
//     }, "La fecha de inicio no puede ser posterior a hoy"),
//   expireDate: z.string()
//     .refine((date) => {
//       const expireDate = new Date(date);
//       const today = new Date();
//       return expireDate > today;
//     }, "La fecha de vencimiento debe ser futura"),
//   policyFile: fileSchema,
// });

// export type InsuranceInput = z.infer<typeof insuranceSchema>;

// import { z } from "zod";
// import { fileSchema } from "./file-schema";

// export const insuranceSchema = z.object({
//   insuranceId: z.string({
//     required_error: "La compañía de seguros es requerida",
//   }).uuid("El ID de la compañía de seguros debe ser un UUID válido"), // Added UUID validation

//   policyNumber: z.string()
//     .min(1, "El número de póliza es requerido")
//     .regex(/^\d+$/, "El número de póliza debe contener solo números")
//     .transform(val => parseInt(val, 10))
//     // Add max value validation if needed
//     .refine(
//       (num) => num > 0 && num <= 999999999,
//       "El número de póliza debe estar entre 1 y 999999999"
//     ),

//   startDate: z.string()
//     .transform((date) => new Date(date)) // Transform to Date object
//     .refine(
//       (date) => !isNaN(date.getTime()),
//       "La fecha de inicio no es válida"
//     )
//     .refine(
//       (date) => date <= new Date(),
//       "La fecha de inicio no puede ser posterior a hoy"
//     ),

//   expireDate: z.string()
//     .transform((date) => new Date(date)) // Transform to Date object
//     .refine(
//       (date) => !isNaN(date.getTime()),
//       "La fecha de vencimiento no es válida"
//     )
//     .refine(
//       (date) => date > new Date(),
//       "La fecha de vencimiento debe ser futura"
//     ),

//   policyFile: fileSchema,
// }).refine(
//   // Add cross-field validation
//   (data) => {
//     const startDate = new Date(data.startDate);
//     const expireDate = new Date(data.expireDate);
//     return startDate < expireDate;
//   },
//   {
//     message: "La fecha de vencimiento debe ser posterior a la fecha de inicio",
//     path: ["expireDate"], // This will show the error on the expireDate field
//   }
// );

// // Define more specific types for better type inference
// export type InsuranceInput = z.input<typeof insuranceSchema>; // Type for the input data
// export type InsuranceOutput = z.output<typeof insuranceSchema>; // Type for the validated data

import { z } from "zod";
import { fileSchema } from "./file-schema";

export const insuranceSchema = z.object({
  insuranceId: z.string({
    required_error: "La compañía de seguros es requerida",
  }).uuid("El ID de la compañía de seguros debe ser un UUID válido"),

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