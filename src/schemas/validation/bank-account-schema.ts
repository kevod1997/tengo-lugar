import { z } from "zod";

export const bankAccountSchema = z.object({
  bankAlias: z.string()
    .min(6, 'El alias debe tener al menos 6 caracteres')
    .max(50, 'El alias no puede superar 50 caracteres')
    .regex(/^[a-zA-Z0-9._-]+$/, 'Solo se permiten letras, números, puntos, guiones y guiones bajos')
    .trim()
});

export type BankAccountFormData = z.infer<typeof bankAccountSchema>;
