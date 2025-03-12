import { isValidPhoneNumber } from "libphonenumber-js";
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
    // El número de teléfono no es opcional
    phoneNumber: z
        .string({
            required_error: "El número de teléfono es requerido",
        })
        .refine(
            (value) => {
                try {
                    // Si ya está en formato internacional
                    if (value.includes('+')) {
                        return isValidPhoneNumber(value);
                    }

                    // Si no tiene formato internacional, asumimos Argentina
                    // Primero probamos con el prefijo 9 para móviles
                    if (isValidPhoneNumber(`+549${value.replace(/^0/, '')}`, 'AR')) {
                        return true;
                    }

                    // Si no funciona, probamos como un número fijo
                    return isValidPhoneNumber(value, 'AR');
                } catch (error) {
                    return false;
                }
            },
            {
                message: "El número de teléfono es inválido"
            }
        ),
    // La verificación es opcional
    phoneNumberVerified: z
        .boolean()
        .optional()
        .default(false),
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

// Podemos añadir una validación condicional para garantizar que si hay número, esté verificado
export const userSchemaWithConditionalVerification = userSchema.refine(
    (data) => {
        // Si hay un número de teléfono, debería estar verificado
        if (data.phoneNumber && data.phoneNumber.length > 0) {
            return data.phoneNumberVerified === true;
        }
        // Si no hay número, no es necesaria la verificación
        return true;
    },
    {
        message: "Si proporcionas un número de teléfono, debes verificarlo",
        path: ["phoneNumberVerified"]
    }
);

export type UpdateUserInput = z.infer<typeof userSchema>;