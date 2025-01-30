'use server'

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { formatUserResponse } from "@/utils/format/user-formatter";
import { ServerActionError } from "@/lib/exceptions/server-action-error";
import { handlePrismaError } from "@/lib/exceptions/prisma-error-handler";

export async function getUserByClerkId(clerkId?: string) {
    const { userId }: { userId: string | null } = await auth()
  
    if (!userId && !clerkId) {
      throw ServerActionError.AuthenticationFailed('user-register.ts', 'getUserByClerkId');
    }
  
    if (!clerkId) {
      clerkId = userId!;
    }
  
    try {
      const user = await prisma.user.findFirst({
        where: { clerkId },
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
              Car: {
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
        return null
      }
  
      return formatUserResponse(user)
  
    } catch (error) {
      throw handlePrismaError(error, 'getUserByClerkId', 'user-register.ts');
    }
  }
  