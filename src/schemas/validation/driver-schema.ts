import { z } from "zod";
import { fileSchema } from "./file-schema";

  export const driverLicenseSchema = z.object({
    expirationDate: z.string()
      .refine((date) => {
        const expDate = new Date(date);
        const today = new Date();
        const maxDate = new Date();
        maxDate.setFullYear(today.getFullYear() + 10);
        return expDate > today && expDate <= maxDate;
      }, "La fecha de vencimiento debe ser futura y no puede exceder 10 años"),
    frontImage: fileSchema.optional(),
    backImage: fileSchema.optional(),
  }).refine(
    (data) => {
      return !!data.expirationDate;
    },
    {
      message: "La fecha de vencimiento es obligatoria",
      path: ["expirationDate"],
    }
  );
  
export const serverDriverLicenseSchema = z.object({
    expirationDate: z.string()
      .refine((date) => {
        const expDate = new Date(date);
        const today = new Date();
        const maxDate = new Date();
        maxDate.setFullYear(today.getFullYear() + 10);
        return expDate > today && expDate <= maxDate;
      }, "La fecha de vencimiento debe ser futura y no puede exceder 10 años"),
    frontImage: fileSchema
      .optional()
      .nullable(),
    backImage: fileSchema
      .optional()
      .nullable(),
});

  export type DriverLicenseInput = z.infer<typeof driverLicenseSchema>;