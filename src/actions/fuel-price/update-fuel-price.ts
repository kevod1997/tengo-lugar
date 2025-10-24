'use server'

import prisma from "@/lib/prisma";
import { ApiHandler } from "@/lib/api-handler";
import { ServerActionError } from "@/lib/exceptions/server-action-error";
import { requireAuthorization } from "@/utils/helpers/auth-helper";
import { logActionWithErrorHandling } from "@/services/logging/logging-service";
import { TipoAccionUsuario } from "@/types/actions-logs";
import { updateFuelPriceSchema, UpdateFuelPriceInput } from "@/schemas/validation/fuel-price-schema";

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

    // Check if there's another active price for this fuel type with the same effective date
    const conflictingPrice = await prisma.fuelPrice.findFirst({
      where: {
        id: { not: validatedData.id },
        fuelType: validatedData.fuelType,
        isActive: true,
        effectiveDate: validatedData.effectiveDate,
      },
    });

    if (conflictingPrice && validatedData.isActive) {
      throw ServerActionError.ValidationFailed(
        'update-fuel-price.ts',
        'updateFuelPrice',
        `Ya existe otro precio activo para ${validatedData.fuelType} con la misma fecha efectiva`
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
