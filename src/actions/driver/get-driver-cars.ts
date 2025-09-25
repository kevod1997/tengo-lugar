'use server'

import { requireAuthentication } from "@/utils/helpers/auth-helper";
import { ServerActionError } from "@/lib/exceptions/server-action-error";
import { ApiHandler } from "@/lib/api-handler";
import { logActionWithErrorHandling } from "@/services/logging/logging-service";
import { TipoAccionUsuario } from "@/types/actions-logs";
import prisma from "@/lib/prisma";
import { UserCar } from "@/types/user-types";

function formatDriverCars(driverCars: any[]): UserCar[] {
  return driverCars.map((driverCar) => {
    const car = driverCar.car;
    const carModel = car.carModel;

    // Determinar si tiene tarjetas verificadas
    const hasGreenCard = driverCar.vehicleCards.some((card: any) =>
      card.cardType === 'GREEN' && card.status === 'VERIFIED'
    );
    const hasBlueCard = driverCar.vehicleCards.some((card: any) =>
      card.cardType === 'BLUE' && card.status === 'VERIFIED'
    );
    const hasValidCard = hasGreenCard || hasBlueCard;

    // Verificar seguro
    const hasValidInsurance = car.insuredCar?.currentPolicy?.status === 'VERIFIED';

    // Verificar especificaciones de combustible
    const hasSpecs = carModel?.fuelType && carModel?.averageFuelConsume;

    // Determinar si está completamente habilitado
    const isFullyEnabled = hasValidCard && hasValidInsurance && !!hasSpecs;

    return {
      id: car.id,
      plate: car.plate,
      brand: carModel?.brand?.name || '',
      model: carModel?.model || '',
      fuelType: carModel?.fuelType || null,
      averageFuelConsume: carModel?.averageFuelConsume || null,
      year: car.year || null,
      insurance: {
        status: car.insuredCar?.currentPolicy?.status || null,
        expireDate: car.insuredCar?.currentPolicy?.expireDate || null,
        failureReason: car.insuredCar?.currentPolicy?.failureReason || null,
        hasFileKey: Boolean(car.insuredCar?.currentPolicy?.fileKey),
      },
      vehicleCard: driverCar.vehicleCards?.[0] ? {
        id: driverCar.vehicleCards[0].id,
        cardType: driverCar.vehicleCards[0].cardType,
        status: driverCar.vehicleCards[0].status,
        failureReason: driverCar.vehicleCards[0].failureReason,
        hasFileKey: Boolean(driverCar.vehicleCards[0].fileKey),
        expirationDate: driverCar.vehicleCards[0].expirationDate,
        fileType: driverCar.vehicleCards[0].fileType,
      } : null,
      hasGreenCard,
      hasBlueCard,
      hasPendingCards: driverCar.vehicleCards.some((card: any) => card.status === 'PENDING'),
      isFullyEnabled
    };
  });
}

export async function getDriverCars() {
  try {
    const session = await requireAuthentication('get-driver-cars.ts', 'getDriverCars');

    const driver = await prisma.driver.findFirst({
      where: { userId: session.user.id },
      include: {
        cars: {
          include: {
            car: {
              select: {
                id: true,
                plate: true,
                year: true,
                insuredCar: {
                  include: {
                    currentPolicy: {
                      select: {
                        status: true,
                        expireDate: true,
                        failureReason: true,
                        fileKey: true
                      }
                    }
                  }
                },
                carModel: {
                  select: {
                    model: true,
                    fuelType: true,
                    averageFuelConsume: true,
                    brand: {
                      select: {
                        name: true
                      }
                    }
                  }
                }
              }
            },
            vehicleCards: {
              select: {
                id: true,
                cardType: true,
                status: true,
                failureReason: true,
                fileKey: true,
                expirationDate: true,
                fileType: true
              }
            }
          }
        }
      }
    });

    if (!driver) {
      throw ServerActionError.NotFound('get-driver-cars.ts', 'getDriverCars', 'Conductor no encontrado');
    }

    const formattedCars = formatDriverCars(driver.cars);

    await logActionWithErrorHandling({
      userId: session.user.id,
      action: TipoAccionUsuario.ACTUALIZACION_VEHICULO,
      status: 'SUCCESS',
    }, { fileName: 'get-driver-cars.ts', functionName: 'getDriverCars' });

    return ApiHandler.handleSuccess(formattedCars, 'Vehículos obtenidos exitosamente');

  } catch (error) {
    return ApiHandler.handleError(error);
  }
}

export async function getEnabledDriverCars() {
  try {
    const result = await getDriverCars();

    if (!result.success || !result.data) {
      return result;
    }

    const enabledCars = result.data.filter((car: UserCar) => car.isFullyEnabled);

    return ApiHandler.handleSuccess(enabledCars, 'Vehículos habilitados obtenidos exitosamente');

  } catch (error) {
    return ApiHandler.handleError(error);
  }
}