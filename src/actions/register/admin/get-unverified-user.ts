'use server'

import { handlePrismaError } from "@/lib/exceptions/prisma-error-handler";
import prisma from "@/lib/prisma";
import { formatUserForAdminDashboard } from "@/utils/format/user-formatter";
import { Prisma } from "@prisma/client";

type GetUsersParams = {
  page?: number;
  pageSize?: number;
  filter?: 'all' | 'pending';
}

export async function getUsers({
  page = 1,
  pageSize = 10,
  filter = 'all'
}: GetUsersParams = {}) {
  try {
    const skip = (page - 1) * pageSize;

    // Base query for including related data
    const include = {
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
          cars: { // This matches your schema's "cars" relation in Driver model
            include: {
              car: { // This gets the Car object from the DriverCar relation
                select: {
                  id: true,
                  plate: true,
                  year: true,
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
              vehicleCards: { // This gets the VehicleCards from DriverCar
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
        orderBy: { acceptedAt: Prisma.SortOrder.desc },
        take: 1,
        select: {
          acceptedAt: true
        }
      }
    };

    // Define where clause based on filter
    let where: Prisma.UserWhereInput = {};

    if (filter === 'pending') {
      where = {
        OR: [
          {
            identityCard: {
              AND: [
                { 
                  status: { 
                    in: ['FAILED', 'PENDING'] 
                  } 
                },
                {
                  AND: [
                    { frontFileKey: { not: '' } },
                    { backFileKey: { not: '' } }
                  ]
                }
              ]
            }
          },
          {
            driver: {
              licence: {
                AND: [
                  { 
                    status: { 
                      in: ['FAILED', 'PENDING'] 
                    } 
                  },
                  {
                    AND: [
                      { frontFileKey: { not: '' } },
                      { backFileKey: { not: '' } }
                    ]
                  }
                ]
              }
            }
          }
        ]
      };
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: pageSize,
        where,
        orderBy: {
          createdAt: 'desc'
        },
        include
      }),
      prisma.user.count({ where })
    ]);

    return {
      users: users.map(formatUserForAdminDashboard),
      pagination: {
        total,
        pageCount: Math.ceil(total / pageSize),
        currentPage: page,
        pageSize
      }
    };
  } catch (error) {
    throw handlePrismaError(error, 'getUsers', 'get-users.ts');
  }
}