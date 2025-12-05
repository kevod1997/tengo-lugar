'use server'

import { ApiHandler } from "@/lib/api-handler";
import { ServerActionError } from "@/lib/exceptions/server-action-error";
import prisma from "@/lib/prisma";
import type { ToggleFuelPriceStatusInput } from "@/schemas/validation/fuel-price-schema";
import { toggleFuelPriceStatusSchema } from "@/schemas/validation/fuel-price-schema";
import { logActionWithErrorHandling } from "@/services/logging/logging-service";
import { TipoAccionUsuario } from "@/types/actions-logs";
import { requireAuthorization } from "@/utils/helpers/auth-helper";

export async function toggleFuelPriceStatus(data: ToggleFuelPriceStatusInput) {
  try {
    const session = await requireAuthorization('admin', 'toggle-fuel-price-status.ts', 'toggleFuelPriceStatus');

    const validatedData = toggleFuelPriceStatusSchema.parse(data);

    // Check if fuel price exists
    const existingFuelPrice = await prisma.fuelPrice.findUnique({
      where: { id: validatedData.id },
    });

    if (!existingFuelPrice) {
      throw ServerActionError.NotFound(
        'toggle-fuel-price-status.ts',
        'toggleFuelPriceStatus',
        'Precio de combustible no encontrado'
      );
    }

    const updatedFuelPrice = await prisma.fuelPrice.update({
      where: { id: validatedData.id },
      data: {
        isActive: validatedData.isActive,
      },
    });

    const action = validatedData.isActive
      ? TipoAccionUsuario.ADMIN_ACTIVATE_FUEL_PRICE
      : TipoAccionUsuario.ADMIN_DEACTIVATE_FUEL_PRICE;

    await logActionWithErrorHandling(
      {
        userId: session.user.id,
        action,
        status: 'SUCCESS',
        details: {
          fuelPriceId: updatedFuelPrice.id,
          name: updatedFuelPrice.name,
          fuelType: updatedFuelPrice.fuelType,
          isActive: updatedFuelPrice.isActive,
        },
      },
      {
        fileName: 'toggle-fuel-price-status.ts',
        functionName: 'toggleFuelPriceStatus',
      }
    );

    const message = validatedData.isActive
      ? 'Precio de combustible activado exitosamente'
      : 'Precio de combustible desactivado exitosamente';

    return ApiHandler.handleSuccess(updatedFuelPrice, message);
  } catch (error) {
    return ApiHandler.handleError(error);
  }
}
