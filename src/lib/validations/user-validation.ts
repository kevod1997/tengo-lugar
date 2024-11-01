import { z } from "zod";

export const userSchema = z.object({
  firstName: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(20, "El nombre no puede exceder los 20 caracteres"),
  lastName: z
    .string()
    .min(2, "El apellido debe tener al menos 2 caracteres")
    .max(20, "El apellido no puede exceder los 20 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Número de teléfono inválido")
    .optional(),
  birthDate: z.string().refine((date: string | number | Date) => {
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= 18;
  }, "Debes ser mayor de 18 años"),
  termsAccepted: z.boolean().refine((val: boolean) => val === true, "Debes aceptar los términos y condiciones"),
});

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

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
  frontImage: z.object({
    file: z.custom<File>()
      .refine((file) => file instanceof File, "Archivo requerido")
      .refine((file) => file.size <= MAX_FILE_SIZE, "El archivo no debe superar 5MB")
      .refine(
        (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
        "Solo se aceptan archivos .jpg, .jpeg, o .png"
      ),
    source: z.enum(["camera", "upload"])
  }).optional(),
  backImage: z.object({
    file: z.custom<File>()
      .refine((file) => file instanceof File, "Archivo requerido")
      .refine((file) => file.size <= MAX_FILE_SIZE, "El archivo no debe superar 5MB")
      .refine(
        (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
        "Solo se aceptan archivos .jpg, .jpeg, o .png"
      ),
    source: z.enum(["camera", "upload"])
  }).optional(),
}).refine(
  (data) => {
    if (data.isVerificationRequired) {
      return !!data.idNumber && !!data.frontImage && !!data.backImage;
    }
    return true;
  },
  {
    message: "Todos los campos son obligatorios para la verificación",
    path: ["idNumber", "frontImage", "backImage"],
  }
);


export type CreateUserInput = z.infer<typeof userSchema>;
export type IdentityCardInput = z.infer<typeof identityCardSchema>;