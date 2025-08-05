import { object, string } from "zod";

const getPasswordSchema = (type: "password" | "confirmPassword") => {
  const label = type === "password" ? "La contraseña" : "La confirmación de contraseña";
  return string({ required_error: `${label} es requerida` })
    .min(8, `${label} debe tener al menos 8 caracteres`)
    .max(32, `${label} no puede exceder los 32 caracteres`);
}

const getEmailSchema = () =>
  string({ required_error: "El email es requerido" })
    .min(1, "El email es requerido")
    .email("Email inválido");

const getNameSchema = () =>
  string({ required_error: "El nombre es requerido" })
    .min(1, "El nombre es requerido")
    .max(50, "El nombre debe tener menos de 50 caracteres");

export const signUpSchema = object({
  name: getNameSchema(),
  email: getEmailSchema(),
  password: getPasswordSchema("password"),
  confirmPassword: getPasswordSchema("confirmPassword"),
})
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export const signInSchema = object({
  email: getEmailSchema(),
  password: getPasswordSchema("password"),
});

export const forgotPasswordSchema = object({
  email: getEmailSchema(),
});

export const resetPasswordSchema = object({
  password: getPasswordSchema("password"),
  confirmPassword: getPasswordSchema("confirmPassword"),
})
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });