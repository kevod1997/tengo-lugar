import { z } from "zod";

/**
 * Schema para crear un ticket de soporte
 */
export const createTicketSchema = z.object({
  category: z.enum(['PAYMENT_ISSUE', 'TRIP_ISSUE', 'ACCOUNT_ISSUE', 'OTHER'], {
    required_error: "La categoría es obligatoria",
    invalid_type_error: "Categoría inválida"
  }),
  subject: z.string()
    .min(5, "El asunto debe tener al menos 5 caracteres")
    .max(100, "El asunto no puede superar los 100 caracteres")
    .trim(),
  description: z.string()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(1000, "La descripción no puede superar los 1000 caracteres")
    .trim()
});

/**
 * Schema para resolver un ticket (admin)
 */
export const resolveTicketSchema = z.object({
  ticketId: z.string().uuid("ID de ticket inválido"),
  resolution: z.string()
    .min(10, "La resolución debe tener al menos 10 caracteres")
    .max(500, "La resolución no puede superar los 500 caracteres")
    .trim()
});

// Tipos TypeScript inferidos de los schemas
export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type ResolveTicketInput = z.infer<typeof resolveTicketSchema>;
