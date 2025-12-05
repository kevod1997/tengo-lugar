'use server'

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { ServerActionError } from "@/lib/exceptions/server-action-error";
import prisma from "@/lib/prisma";


export async function getTripById(tripId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw ServerActionError.AuthenticationFailed('get-trip-by-id.ts', 'getTripById');
    }

    const userId = session.user.id;

    // Fetch the trip with all its details
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
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
                },
                insuredCar: {
                  include: {
                    currentPolicy: {
                      include: {
                        insurance: true
                      }
                    }
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
            payment: true
          }
        }
      }
    });

    if (!trip) {
      return null; // O lanzar un error si prefieres
    }

    // Determinar el rol del usuario actual en este viaje
    const isDriver = trip.driverCar.driver.userId === userId;
    const userPassenger = trip.passengers.find(p => p.passenger.userId === userId);
    const isPassenger = !!userPassenger;

    // Añadir esta información al objeto del viaje
    return {
      ...trip,
      userRole: {
        isDriver,
        isPassenger,
        passengerInfo: userPassenger // Incluir la info del pasajero si aplica
      }
    };
  } catch (error) {
    throw error;
  }
}

// Helper function to check if user can reserve trip
export async function canUserReserveTrip(tripId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { canReserve: false, reason: 'auth' };
    }

    const userId = session.user.id;

    // Get trip info
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      select: {
        id: true,
        status: true,
        remainingSeats: true,
        isFull: true,
        driverCar: {
          select: {
            driver: {
              select: {
                userId: true
              }
            }
          }
        },
        passengers: {
          where: {
            passenger: {
              userId
            }
          },
          select: {
            reservationStatus: true
          }
        }
      }
    });

    if (!trip) {
      return { canReserve: false, reason: 'not_found' };
    }

    // User can't reserve their own trip
    if (trip.driverCar.driver.userId === userId) {
      return { canReserve: false, reason: 'is_driver' };
    }

    // User already has a reservation
    if (trip.passengers.length > 0) {
      const status = trip.passengers[0].reservationStatus;
      // Solo permite re-reservar en casos sin penalización
      const canReReserveStatuses = [
        'REJECTED',                  // Conductor rechazó - puede reintentar
        'CANCELLED_EARLY',           // Canceló >24h - sin penalización
        'CANCELLED_BY_DRIVER_EARLY'  // Conductor canceló >48h - sin penalización
      ];

      if (!canReReserveStatuses.includes(status)) {
        return { canReserve: false, reason: 'already_reserved' };
      }
    }

    // Trip is not active or pending
    if (trip.status !== 'ACTIVE' && trip.status !== 'PENDING') {
      return { canReserve: false, reason: 'trip_not_available' };
    }

    // Trip is full
    if (trip.isFull) {
      return { canReserve: false, reason: 'trip_full' };
    }

    return { 
      canReserve: true,
      remainingSeats: trip.remainingSeats
    };
  } catch (error) {
    console.error('Error checking reservation eligibility:', error);
    return { canReserve: false, reason: 'error' };
  }
}