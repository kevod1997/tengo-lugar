import { z } from "zod";

/**
 * Schema para crear una review
 */
export const createReviewSchema = z.object({
  tripId: z.string().uuid({ message: "Trip ID debe ser un UUID válido" }),
  reviewedId: z.string().uuid({ message: "Reviewed ID debe ser un UUID válido" }),
  revieweeType: z.enum(['DRIVER', 'PASSENGER'], {
    errorMap: () => ({ message: "Tipo de reviewee debe ser DRIVER o PASSENGER" })
  }),
  rating: z.number()
    .min(1, { message: "Rating mínimo es 1" })
    .max(5, { message: "Rating máximo es 5" }),
  comments: z.string()
    .max(200, { message: "Comentarios no pueden exceder 200 caracteres" })
    .trim()
    .optional()
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

/**
 * Schema para obtener reviews de un usuario
 */
export const getReviewsForUserSchema = z.object({
  userId: z.string().uuid({ message: "User ID debe ser un UUID válido" }),
  revieweeType: z.enum(['DRIVER', 'PASSENGER']).optional(),
  page: z.number().min(1, { message: "Página debe ser al menos 1" }).default(1),
  limit: z.number()
    .min(1, { message: "Límite debe ser al menos 1" })
    .max(50, { message: "Límite no puede exceder 50" })
    .default(10)
});

export type GetReviewsForUserInput = z.infer<typeof getReviewsForUserSchema>;

/**
 * Schema para verificar si un usuario puede calificar un viaje
 */
export const canUserReviewSchema = z.object({
  tripId: z.string().uuid({ message: "Trip ID debe ser un UUID válido" })
});

export type CanUserReviewInput = z.infer<typeof canUserReviewSchema>;

/**
 * Schema para obtener reviews pendientes
 */
export const getPendingReviewsSchema = z.object({
  page: z.number().min(1, { message: "Página debe ser al menos 1" }).default(1),
  limit: z.number()
    .min(1, { message: "Límite debe ser al menos 1" })
    .max(20, { message: "Límite no puede exceder 20" })
    .default(10)
});

export type GetPendingReviewsInput = z.infer<typeof getPendingReviewsSchema>;
