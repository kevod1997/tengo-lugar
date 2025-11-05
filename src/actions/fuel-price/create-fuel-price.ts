'use server'

import prisma from "@/lib/prisma";
import { ApiHandler } from "@/lib/api-handler";
import { ServerActionError } from "@/lib/exceptions/server-action-error";
import { requireAuthorization } from "@/utils/helpers/auth-helper";
import { logActionWithErrorHandling } from "@/services/logging/logging-service";
import { TipoAccionUsuario } from "@/types/actions-logs";
import { createFuelPriceSchema, CreateFuelPriceInput } from "@/schemas/validation/fuel-price-schema";

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
