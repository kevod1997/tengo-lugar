import { z } from "zod";

export const Gender = z.enum(["MASCULINO", "FEMENINO", "NO_BINARIO"]);

export const userSchema = z.object({
  firstName: z
    .string({
      required_error: "El nombre es requerido",
    })
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(20, "El nombre no puede exceder los 20 caracteres"),
  lastName: z
    .string({
      required_error: "El apellido es requerido",
    })
    .min(2, "El apellido debe tener al menos 2 caracteres")
    .max(20, "El apellido no puede exceder los 20 caracteres"),
  email: z
    .string({
      required_error: "El email es requerido",
    })
    .email("El formato del email es inválido"),
  phone: z
    .string()
    .regex(
      /^(?:\+?54)?(?:9)?([2-9]\d{1,3})(\d{6,8})$/,
      "El formato del número de teléfono es inválido. Omití 0 y 15."
    )
    .optional()
    .or(z.literal('')),
  gender: Gender.optional().refine((val) => val !== undefined, {
    message: "Por favor, selecciona un género",
  }),
  birthDate: z
    .string({
      required_error: "La fecha de nacimiento es requerida",
    })
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age >= 18;
    }, "Debes ser mayor de 18 años"),
  termsAccepted: z
    .boolean({
      required_error: "Debes aceptar los términos y condiciones",
    })
    .refine((val) => val === true, "Debes aceptar los términos y condiciones"),
});

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

const fileSchema = z.object({
  file: z.custom<File>()
    .refine((file) => file instanceof File, "Archivo requerido")
    .refine((file) => file.size <= MAX_FILE_SIZE, "El archivo no debe superar 5MB")
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Solo se aceptan archivos .jpg, .jpeg, o .png"
    )
    .optional(),
  source: z.enum(["camera", "upload"])
}).optional();

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
      return !!data.idNumber && !!data.frontImage?.file && !!data.backImage?.file;
    }
    return true;
  },
  {
    message: "Todos los campos son obligatorios para la verificación",
    path: ["idNumber", "frontImage", "backImage"],
  }
);

// Server action validation schema (actions/identity-card.ts)
export const serverIdentityCardSchema = z.object({
  isVerificationRequired: z.boolean(),
  idNumber: z.number()
    .min(1000000, "El número de identificación debe tener al menos 7 caracteres")
    .max(99999999, "El número de identificación no debe exceder 8 caracteres"),
  frontImage: z.object({
    // En el servidor, file será un objeto con los datos del archivo
    file: z.any(), // Aquí podrías validar la estructura específica que llega
    source: z.enum(["camera", "upload"])
  }),
  backImage: z.object({
    file: z.any(),
    source: z.enum(["camera", "upload"])
  })
});

// Schema para el cliente
export const driverLicenseSchema = z.object({
  isVerificationRequired: z.boolean(),
  expirationDate: z.string()
  .refine((date) => {
    const expDate = new Date(date);
    const today = new Date();
    const maxDate = new Date();
    maxDate.setFullYear(today.getFullYear() + 10); 
    return expDate > today && expDate <= maxDate;
  }, "La fecha de vencimiento debe ser futura y no puede exceder 10 años")
    .optional(),
  frontImage: fileSchema,
  backImage: fileSchema,
}).refine(
  (data) => {
    if (data.isVerificationRequired) {
      return !!data.expirationDate && !!data.frontImage?.file && !!data.backImage?.file;
    }
    return true;
  },
  {
    message: "Todos los campos son obligatorios para la verificación",
    path: ["expirationDate", "frontImage", "backImage"],
  }
);

// Schema para el servidor
export const serverDriverLicenseSchema = z.object({
  isVerificationRequired: z.boolean(),
  expirationDate: z.string()
  .refine((date) => {
    const expDate = new Date(date);
    const today = new Date();
    const maxDate = new Date();
    maxDate.setFullYear(today.getFullYear() + 10); 
    return expDate > today && expDate <= maxDate;
  }, "La fecha de vencimiento debe ser futura y no puede exceder 10 años"),
  frontImage: z.object({
    file: z.any(),
    source: z.enum(["camera", "upload"])
  }),
  backImage: z.object({
    file: z.any(),
    source: z.enum(["camera", "upload"])
  })
});

// Tipo para TypeScript
export type DriverLicenseInput = z.infer<typeof driverLicenseSchema>;
export type CreateUserInput = z.infer<typeof userSchema>;
export type IdentityCardInput = z.infer<typeof identityCardSchema>;