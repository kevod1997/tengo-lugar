// src/actions/trip/get-user-reservations.ts
'use server'

import prisma from "@/lib/prisma";
import { ServerActionError } from "@/lib/exceptions/server-action-error";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getUserReservations() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw ServerActionError.AuthenticationFailed('get-user-reservations.ts', 'getUserReservations');
    }

    const userId = session.user.id;
    
    // Get the user's passenger record
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
    
    // Include options for the trip to get complete info
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
      }
    };
    
    // Get active reservations (pending, approved, confirmed)
    const activeReservations = await prisma.tripPassenger.findMany({
      where: {
        passengerId: passenger.id,
        reservationStatus: {
          in: ['PENDING_APPROVAL', 'APPROVED', 'CONFIRMED']
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
    
    // Get completed reservations
    const completedReservations = await prisma.tripPassenger.findMany({
      where: {
        passengerId: passenger.id,
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
    
    // Get cancelled reservations
    const cancelledReservations = await prisma.tripPassenger.findMany({
      where: {
        passengerId: passenger.id,
        OR: [
          {
            reservationStatus: {
              in: ['CANCELLED_BY_DRIVER', 'CANCELLED_BY_PASSENGER']
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