'use server'

import prisma from "@/lib/prisma";
import { ServerActionError } from "@/lib/exceptions/server-action-error";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getUserTrips() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw ServerActionError.AuthenticationFailed('get-user-trips.ts', 'getUserTrips');
    }

    const userId = session.user.id;

    // Fetch user's driver and passenger information
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

    // Fetch active trips as a driver
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
            }
          }
        }
      }
    }) : [];

    // Fetch completed trips as a driver
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
            }
          }
        }
      }
    }) : [];

    // Fetch active trips as a passenger
    const activePassengerTrips = user.passenger ? await prisma.tripPassenger.findMany({
      where: {
        passengerId: user.passenger.id,
        reservationStatus: { 
          in: ['APPROVED', 'CONFIRMED'] 
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
        }
      }
    }) : [];

    // Fetch completed trips as a passenger
    const completedPassengerTrips = user.passenger ? await prisma.tripPassenger.findMany({
      where: {
        passengerId: user.passenger.id,
        reservationStatus: { 
          in: ['CONFIRMED', 'COMPLETED', 'CANCELLED_BY_DRIVER', 'CANCELLED_BY_PASSENGER']
        },
        trip: {
          status: { in: ['COMPLETED', 'CANCELLED'] }
        }
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