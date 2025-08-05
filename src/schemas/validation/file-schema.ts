import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE } from "@/config/constants";
import { z } from "zod";


export const fileSchema = z.object({
  file: z.custom<File>()
    .refine((file) => file instanceof File, "Archivo requerido")
    .refine((file) => file.size <= MAX_FILE_SIZE, "El archivo no debe superar 3MB")
    .refine(
      (file) => ACCEPTED_FILE_TYPES.includes(file.type),
      "Solo se aceptan archivos .jpg, .jpeg, .png o .pdf"
    )
    .optional(),
  source: z.enum(["camera", "upload"]),
  preview: z.string() 
}).optional();

export const documentFileSchema = z.object({
  file: z.custom<File>()
    .refine((file) => file instanceof File, "Archivo requerido")
    .refine((file) => file.size <= MAX_FILE_SIZE, "El archivo no debe superar 3MB")
    .refine(
      (file) => file.type === "application/pdf",
      "Solo se aceptan archivos PDF"
    )
    .optional(),
  source: z.literal("upload"),
  preview: z.string() 
}).optional();