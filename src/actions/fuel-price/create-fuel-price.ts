'use server'

import { ApiHandler } from "@/lib/api-handler";
import prisma from "@/lib/prisma";
import type { CreateFuelPriceInput } from "@/schemas/validation/fuel-price-schema";
import { createFuelPriceSchema } from "@/schemas/validation/fuel-price-schema";
import { logActionWithErrorHandling } from "@/services/logging/logging-service";
import { TipoAccionUsuario } from "@/types/actions-logs";
import { requireAuthorization } from "@/utils/helpers/auth-helper";

export async function createFuelPrice(data: CreateFuelPriceInput) {
  try {
    const session = await requireAuthorization('admin', 'create-fuel-price.ts', 'createFuelPrice');

    const validatedData = createFuelPriceSchema.parse(data);

    const fuelPrice = await prisma.fuelPrice.create({
      data: {
        name: validatedData.name,
        fuelType: validatedData.fuelType,
        price: validatedData.price,
        effectiveDate: validatedData.effectiveDate,
        isActive: true,
      },
    });

    await logActionWithErrorHandling(
      {
        userId: session.user.id,
        action: TipoAccionUsuario.ADMIN_CREATE_FUEL_PRICE,
        status: 'SUCCESS',
        details: {
          fuelPriceId: fuelPrice.id,
          name: fuelPrice.name,
          fuelType: fuelPrice.fuelType,
          price: fuelPrice.price,
          effectiveDate: fuelPrice.effectiveDate,
        },
      },
      {
        fileName: 'create-fuel-price.ts',
        functionName: 'createFuelPrice',
      }
    );

    return ApiHandler.handleSuccess(
      fuelPrice,
      'Precio de combustible creado exitosamente'
    );
  } catch (error) {
    return ApiHandler.handleError(error);
  }
}
