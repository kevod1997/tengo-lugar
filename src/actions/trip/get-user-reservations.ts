// src/actions/trip/get-user-reservations.ts
'use server'

import prisma from "@/lib/prisma";
import { requireAuthentication } from "@/utils/helpers/auth-helper";

export async function getUserReservations() {
  try {
    // 1. Autenticación
    const session = await requireAuthentication('get-user-reservations.ts', 'getUserReservations');
    const userId = session.user.id;

    // 2. Obtener registro de pasajero
    const passenger = await prisma.passenger.findUnique({
      where: { userId },
      select: { id: true }
    });

    if (!passenger) {
      // No reservations since user is not a passenger yet
      return {
        activeReservations: [],
        completedReservations: [],
        cancelledReservations: []
      };
    }

    // 3. Opciones de include para datos completos
    const includeOptions = {
      trip: {
        include: {
          driverCar: {
            include: {
              driver: {
                include: {
                  user: {
                    select: {
                      name: true,
                      profileImageKey: true
                    }
                  }
                }
              },
              car: {
                include: {
                  carModel: {
                    include: {
                      brand: true
                    }
                  }
                }
              }
            }
          }
        }
      },
      payment: {
        select: {
          status: true,
          amount: true
        }
      }
    };

    // 4. Reservas activas (pendientes, aprobadas, confirmadas)
    const activeReservations = await prisma.tripPassenger.findMany({
      where: {
        passengerId: passenger.id,
        reservationStatus: {
          in: ['PENDING_APPROVAL', 'APPROVED', 'CONFIRMED', 'WAITLISTED']
        },
        trip: {
          status: {
            in: ['PENDING', 'ACTIVE']
          }
        }
      },
      orderBy: {
        trip: {
          departureTime: 'asc'
        }
      },
      include: includeOptions
    });

    // 5. Reservas completadas
    const completedReservations = await prisma.tripPassenger.findMany({
      where: {
        passengerId: passenger.id,
        reservationStatus: 'COMPLETED',
        trip: {
          status: 'COMPLETED'
        }
      },
      orderBy: {
        trip: {
          departureTime: 'desc'
        }
      },
      include: includeOptions
    });

    // 6. Reservas canceladas (incluye todos los estados de cancelación)
    const cancelledReservations = await prisma.tripPassenger.findMany({
      where: {
        passengerId: passenger.id,
        OR: [
          {
            reservationStatus: {
              in: [
                'CANCELLED_EARLY',
                'CANCELLED_MEDIUM',
                'CANCELLED_LATE',
                'CANCELLED_BY_DRIVER_EARLY',
                'CANCELLED_BY_DRIVER_LATE',
                'NO_SHOW',
                'EXPIRED',
                'REJECTED'
              ]
            }
          },
          {
            trip: {
              status: 'CANCELLED'
            }
          }
        ]
      },
      orderBy: {
        trip: {
          departureTime: 'desc'
        }
      },
      include: includeOptions
    });

    return {
      activeReservations,
      completedReservations,
      cancelledReservations
    };
  } catch (error) {
    throw error;
  }
}
