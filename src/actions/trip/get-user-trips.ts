'use server'

import prisma from "@/lib/prisma";
import { ServerActionError } from "@/lib/exceptions/server-action-error";
import { requireAuthentication } from "@/utils/helpers/auth-helper";

export async function getUserTrips() {
  try {
    // 1. Autenticación
    const session = await requireAuthentication('get-user-trips.ts', 'getUserTrips');
    const userId = session.user.id;

    // 2. Obtener información del usuario
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        driver: true,
        passenger: true
      }
    });

    if (!user) {
      throw ServerActionError.UserNotFound('get-user-trips.ts', 'getUserTrips');
    }

    // 3. Viajes activos como conductor
    const activeDriverTrips = user.driver ? await prisma.trip.findMany({
      where: {
        driverCar: {
          driverId: user.driver.id
        },
        status: { in: ['PENDING', 'ACTIVE'] }
      },
      orderBy: {
        departureTime: 'asc'
      },
      include: {
        driverCar: {
          include: {
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
        },
        passengers: {
          include: {
            passenger: {
              include: {
                user: true
              }
            },
            payment: {
              select: {
                status: true,
                totalAmount: true
              }
            }
          }
        }
      }
    }) : [];

    // 4. Viajes completados/cancelados como conductor
    const completedDriverTrips = user.driver ? await prisma.trip.findMany({
      where: {
        driverCar: {
          driverId: user.driver.id
        },
        status: { in: ['COMPLETED', 'CANCELLED'] }
      },
      orderBy: {
        departureTime: 'desc'
      },
      include: {
        driverCar: {
          include: {
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
        },
        passengers: {
          include: {
            passenger: {
              include: {
                user: true
              }
            },
            payment: {
              select: {
                status: true,
                totalAmount: true
              }
            }
          }
        }
      }
    }) : [];

    // 5. Viajes activos como pasajero (solo aprobados y confirmados)
    const activePassengerTrips = user.passenger ? await prisma.tripPassenger.findMany({
      where: {
        passengerId: user.passenger.id,
        reservationStatus: {
          in: ['PENDING_APPROVAL', 'APPROVED', 'CONFIRMED', 'WAITLISTED']
        },
        trip: {
          status: { in: ['PENDING', 'ACTIVE'] }
        }
      },
      orderBy: {
        trip: {
          departureTime: 'asc'
        }
      },
      include: {
        trip: {
          include: {
            driverCar: {
              include: {
                driver: {
                  include: {
                    user: true
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
            totalAmount: true
          }
        }
      }
    }) : [];

    // 6. Viajes completados/cancelados como pasajero
    const completedPassengerTrips = user.passenger ? await prisma.tripPassenger.findMany({
      where: {
        passengerId: user.passenger.id,
        OR: [
          {
            reservationStatus: 'COMPLETED',
            trip: {
              status: 'COMPLETED'
            }
          },
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
      include: {
        trip: {
          include: {
            driverCar: {
              include: {
                driver: {
                  include: {
                    user: true
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
            totalAmount: true
          }
        }
      }
    }) : [];

    return {
      activeDriverTrips,
      completedDriverTrips,
      activePassengerTrips: activePassengerTrips.map(tp => ({ ...tp.trip, passengerData: tp })),
      completedPassengerTrips: completedPassengerTrips.map(tp => ({ ...tp.trip, passengerData: tp }))
    };
  } catch (error) {
    throw error;
  }
}
