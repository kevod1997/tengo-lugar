'use server'

import { ApiHandler } from "@/lib/api-handler"
import { handlePrismaError } from "@/lib/exceptions/prisma-error-handler"
import { ServerActionError } from "@/lib/exceptions/server-action-error"
import prisma from "@/lib/prisma"
import { fetchFromCarApi } from "@/services/car-api/car-api-service"
import { FuelType } from "@prisma/client"

interface UpdateFuelInfoInput {
    carModel: string
    fuelType: FuelType
    averageFuelConsume: number
}

export async function updateFuelInfo(data: UpdateFuelInfoInput) {
    try {
        // Obtener el modelo con sus relaciones
        const carModel = await prisma.carModel.findFirst({
            where: { model: data.carModel },
            include: { brand: true }
        }).catch(error => {
            throw handlePrismaError(error, 'updateFuelInfo.findFirst', 'update-fuel-info.ts')
        });

        if (!carModel) {
            throw ServerActionError.NotFound('update-fuel-info.ts', 'updateFuelInfo', 'Modelo no encontrado');
        }

        // Actualizar en la base de datos local
        const updatedCarModel = await prisma.carModel.update({
            where: { id: carModel.id },
            data: {
                fuelType: data.fuelType,
                averageFuelConsume: data.averageFuelConsume
            }
        }).catch(error => {
            throw handlePrismaError(error, 'updateFuelInfo.update', 'update-fuel-info.ts')
        });

        // Intentar actualizar en la API externa
        try {
            // Buscar el modelo en la API externa
            const searchResponse = await fetchFromCarApi(
                `/search/models?brand=${encodeURIComponent(carModel.brand.name.toLocaleUpperCase())}&model=${encodeURIComponent(carModel.model.toLocaleUpperCase())}`
            );

            if (searchResponse.success && searchResponse.data?.length > 0) {
                const externalModel = searchResponse.data[0];

                // Actualizar en la API externa
                await fetchFromCarApi(
                    `/models/${externalModel.id}?fuelType=${data.fuelType}&fuelEfficiency=${data.averageFuelConsume}`,
                    'POST'
                );
            }
        } catch (apiError) {
            //todo acomodar aca errores de la api
            // Log el error pero no interrumpir el flujo principal
            console.error('Error al actualizar API externa:', apiError);
        }

        return ApiHandler.handleSuccess(
            updatedCarModel,
            'Información de combustible actualizada exitosamente'
        );

    } catch (error) {
        return ApiHandler.handleError(error);
    }
}