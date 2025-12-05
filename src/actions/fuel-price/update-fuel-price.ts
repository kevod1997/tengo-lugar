'use server'

import { ApiHandler } from "@/lib/api-handler";
import { ServerActionError } from "@/lib/exceptions/server-action-error";
import prisma from "@/lib/prisma";
import type { UpdateFuelPriceInput } from "@/schemas/validation/fuel-price-schema";
import { updateFuelPriceSchema } from "@/schemas/validation/fuel-price-schema";
import { logActionWithErrorHandling } from "@/services/logging/logging-service";
import { TipoAccionUsuario } from "@/types/actions-logs";
import { requireAuthorization } from "@/utils/helpers/auth-helper";

export async function updateFuelPrice(data: UpdateFuelPriceInput) {
  try {
    const session = await requireAuthorization('admin', 'update-fuel-price.ts', 'updateFuelPrice');

    const validatedData = updateFuelPriceSchema.parse(data);

    // Check if fuel price exists
    const existingFuelPrice = await prisma.fuelPrice.findUnique({
      where: { id: validatedData.id },
    });

    if (!existingFuelPrice) {
      throw ServerActionError.NotFound(
        'update-fuel-price.ts',
        'updateFuelPrice',
        'Precio de combustible no encontrado'
      );
    }

    const updatedFuelPrice = await prisma.fuelPrice.update({
      where: { id: validatedData.id },
      data: {
        name: validatedData.name,
        fuelType: validatedData.fuelType,
        price: validatedData.price,
        effectiveDate: validatedData.effectiveDate,
        isActive: validatedData.isActive,
      },
    });

    await logActionWithErrorHandling(
      {
        userId: session.user.id,
        action: TipoAccionUsuario.ADMIN_UPDATE_FUEL_PRICE,
        status: 'SUCCESS',
        details: {
          fuelPriceId: updatedFuelPrice.id,
          changes: {
            name: updatedFuelPrice.name,
            fuelType: updatedFuelPrice.fuelType,
            price: updatedFuelPrice.price,
            effectiveDate: updatedFuelPrice.effectiveDate,
            isActive: updatedFuelPrice.isActive,
          },
        },
      },
      {
        fileName: 'update-fuel-price.ts',
        functionName: 'updateFuelPrice',
      }
    );

    return ApiHandler.handleSuccess(
      updatedFuelPrice,
      'Precio de combustible actualizado exitosamente'
    );
  } catch (error) {
    return ApiHandler.handleError(error);
  }
}
