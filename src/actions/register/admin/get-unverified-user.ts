// 'use server'

// import { handlePrismaError } from "@/lib/exceptions/prisma-error-handler";
// import prisma from "@/lib/prisma";
// import { formatUserForAdminDashboard } from "@/utils/format/user-formatter";
// import { Prisma } from "@prisma/client";

// type GetUsersParams = {
//   page?: number;
//   pageSize?: number;
// }

// export async function getUnverifiedUsers({
//   page = 1,
//   pageSize = 10
// }: GetUsersParams = {}) {
//   try {
//     const skip = (page - 1) * pageSize;

//     const where: Prisma.UserWhereInput = {
//       OR: [
//         {
//           identityCard: {
//             AND: [
//               { 
//                 status: { 
//                   in: ['FAILED', 'PENDING'] 
//                 } 
//               },
//               {
//                 AND: [
//                   { 
//                     frontFileKey: {
//                       not: ''
//                     }
//                   },
//                   { 
//                     backFileKey: {
//                       not: ''
//                     }
//                   }
//                 ]
//               }
//             ]
//           }
//         },
//         {
//           driver: {
//             licence: {
//               AND: [
//                 { 
//                   status: { 
//                     in: ['FAILED', 'PENDING'] 
//                   } 
//                 },
//                 {
//                   AND: [
//                     { 
//                       frontFileKey: {
//                         not: '',
//                       }
//                     },
//                     { 
//                       backFileKey: {
//                         not: '',
//                       }
//                     }
//                   ]
//                 }
//               ]
//             }
//           }
//         }
//       ]
//     };

//     const [users, total] = await Promise.all([
//       prisma.user.findMany({
//         skip,
//         take: pageSize,
//         where,
//         orderBy: {
//           createdAt: 'desc'
//         },
//         select: {
//           id: true,
//           firstName: true,
//           lastName: true,
//           email: true,
//           phone: true,
//           createdAt: true,
//           identityCard: {
//             select: {
//               status: true
//             }
//           },
//           driver: {
//             select: {
//               licence: {
//                 select: {
//                   status: true
//                 }
//               }
//             }
//           }
//         }
//       }),
//       prisma.user.count({ where })
//     ]);

//     return {
//       users: users.map(formatUserForAdminDashboard),
//       pagination: {
//         total,
//         pageCount: Math.ceil(total / pageSize),
//         currentPage: page,
//         pageSize
//       }
//     };
//   } catch (error) {
//     throw handlePrismaError(error, 'getUsers', 'get-unverified-user.ts');
//   }
// }

'use server'

import { handlePrismaError } from "@/lib/exceptions/prisma-error-handler";
import prisma from "@/lib/prisma";
import { formatUserForAdminDashboard } from "@/utils/format/user-formatter";
import { Prisma } from "@prisma/client";

type GetUsersParams = {
  page?: number;
  pageSize?: number;
}

export async function getUnverifiedUsers({
  page = 1,
  pageSize = 10
}: GetUsersParams = {}) {
  try {
    const skip = (page - 1) * pageSize;

    const where: Prisma.UserWhereInput = {
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
                  { 
                    frontFileKey: {
                      not: ''
                    }
                  },
                  { 
                    backFileKey: {
                      not: ''
                    }
                  }
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
                    { 
                      frontFileKey: {
                        not: '',
                      }
                    },
                    { 
                      backFileKey: {
                        not: '',
                      }
                    }
                  ]
                }
              ]
            }
          }
        }
      ]
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: pageSize,
        where,
        orderBy: {
          createdAt: 'desc'
        },
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
    throw handlePrismaError(error, 'getUsers', 'get-unverified-user.ts');
  }
}