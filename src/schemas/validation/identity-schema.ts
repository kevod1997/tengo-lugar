import { z } from "zod";
import { fileSchema } from "./file-schema";

export const identityCardSchema = z.object({
  isVerificationRequired: z.boolean(),
  idNumber: z.string()
    .min(7, "El número de identificación debe tener al menos 7 caracteres")
    .max(8, "El número de identificación no debe exceder 8 caracteres")
    .regex(
      /^[0-9]+$/,
      "El número de identificación solo debe contener números"
    )
    .transform((val) => val.trim())
    .transform((val) => parseInt(val, 10))
    .optional(),
  frontImage: fileSchema,
  backImage: fileSchema,
}).refine(
  (data) => {
    if (data.isVerificationRequired) {
      // Solo requerimos los campos que no están ya verificados
      return !!data.idNumber;
    }
    return true;
  },
  {
    message: "El número de identificación es obligatorio para la verificación",
    path: ["idNumber"],
  }
);

export const serverIdentityCardSchema = z.object({
  isVerificationRequired: z.boolean(),
  idNumber: z.number()
    .min(1000000, "El número de identificación debe tener al menos 7 caracteres")
    .max(99999999, "El número de identificación no debe exceder 8 caracteres"),
  frontImage: fileSchema
    .optional()  // Hacemos las imágenes opcionales para permitir actualizaciones parciales
    .nullable(), // Permitimos null para indicar que no se está actualizando
  backImage: fileSchema
    .optional()
    .nullable(),
}).refine(
  (data) => {
    if (data.isVerificationRequired) {
      // Al menos debe proporcionarse el número de identificación
      return !!data.idNumber;
    }
    return true;
  },
  {
    message: "El número de identificación es obligatorio para la verificación",
    path: ["idNumber"],
  }
);

export type IdentityCardInput = z.infer<typeof identityCardSchema>;
