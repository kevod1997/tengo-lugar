'use server'

import prisma from "@/lib/prisma";
import { formatUserResponse } from "@/utils/format/user-formatter";
import { ServerActionError } from "@/lib/exceptions/server-action-error";
import { handlePrismaError } from "@/lib/exceptions/prisma-error-handler";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getUserById(userId?: string) {

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!userId) {
    userId = session?.user.id
  }

  if (!userId) {
    throw ServerActionError.AuthenticationFailed('user-register.ts', 'getUserById');
  }

  try {
    const user = await prisma.user.findFirst({
      where: { id: userId },
      include: {
        identityCard: {
          select: {
            status: true,
            failureReason: true,
            frontFileKey: true,
            backFileKey: true
          }
        },
        driver: {
          include: {
            licence: {
              select: {
                status: true,
                failureReason: true,
                frontFileKey: true,
                backFileKey: true
              }
            },
            cars: {
              include: {
                car: {
                  select: {
                    id: true,
                    plate: true,
                    insuredCar: {
                      include: {
                        currentPolicy: {
                          select: {
                            status: true,
                            failureReason: true,
                            fileKey: true
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
                vehicleCards: {
                  select: {
                    id: true,
                    cardType: true,
                    status: true,
                    failureReason: true,
                    fileKey: true,
                    expirationDate: true
                  }
                }
              }
            }
          }
        },
        termsAcceptance: {
          orderBy: { acceptedAt: 'desc' },
          take: 1,
          select: {
            acceptedAt: true
          }
        }
      }
    })

    if (!user) {
      throw ServerActionError.UserNotFound('user-register.ts', 'getUserById');
    }

    return formatUserResponse(user)

  } catch (error) {
    throw handlePrismaError(error, 'getUserById', 'user-register.ts');
  }
}
