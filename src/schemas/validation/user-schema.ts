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
        .nullable()
        .transform(val => val === '' ? null : val),
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

export type CreateUserInput = z.infer<typeof userSchema>;