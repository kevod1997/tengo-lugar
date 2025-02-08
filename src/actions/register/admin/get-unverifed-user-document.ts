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
        //Query para los pending
        // OR: [
        //   {
        //     identityCard: {
        //       OR: [{ status: 'PENDING' }, { status: 'FAILED' }]
        //     }
        //   },
        //   {
        //     driver: {
        //       licence: {
        //         OR: [{ status: 'PENDING' }, { status: 'FAILED' }]
        //       }
        //     }
        //   },
        //   {
        //     driver: {
        //       Car: {
        //         some: {
        //           car: {
        //             insuredCar: {
        //               currentPolicy: {
        //                 OR: [{ status: 'PENDING' }, { status: 'FAILED' }]
        //               }
        //             }
        //           }
        //         }
        //       }
        //     }
        //   }
        // ]
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        identityCard: true,
        driver: {
          select: {
            licence: true,
            Car: {
              select: {
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
                        brand: {
                          select: {
                            name: true
                          }
                        }
                      }
                    }
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
    return ApiHandler.handleError(error);
  }
}