'use server'

import { ApiHandler } from "@/lib/api-handler";
import { ServiceError } from "@/lib/exceptions/service-error";
import prisma from "@/lib/prisma";
import { AdminDocumentService } from "@/services/registration/admin/user-service";
import { ApiResponse } from "@/types/api-types";

export async function getUserDocuments(userId: string): Promise<ApiResponse<any>> {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        identityCard: true,
        driver: {
          select: {
            licence: true,
            cars: {
              select: {
                id: true, // DriverCar id
                car: {
                  select: {
                    id: true,
                    plate: true,
                    insuredCar: {
                      select: {
                        currentPolicy: {
                          include: {
                            insurance: true
                          }
                        }
                      }
                    },
                    carModel: {
                      select: {
                        model: true,
                        year: true,
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
                // Get vehicle cards through DriverCar relation
                vehicleCards: {
                  select: {
                    id: true,
                    cardType: true,
                    fileKey: true,
                    status: true,
                    failureReason: true,
                    expirationDate: true,
                    fileType: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user) {
      return ApiHandler.handleError(
        ServiceError.ErrorGettingUser('get-unverifed-user-document.ts', 'getUserDocuments')
      );
    }
    return await AdminDocumentService.getUserDocuments(user);

  } catch (error) {
    //todo ver que aca manejamos mal el error
    return ApiHandler.handleError(error);
  }
}