// src/actions/trip/check-trip-access.ts
'use server'

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function checkTripAccess(tripId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { authorized: false };
    }

    const userId = session.user.id;

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        driver: true,
        passenger: true
      }
    });

    if (!user) {
      return { authorized: false };
    }

    // Check if user is driver of this trip
    let isDriver = false;
    if (user.driver) {
      const driverTrip = await prisma.trip.findFirst({
        where: {
          id: tripId,
          driverCar: {
            driverId: user.driver.id
          }
        }
      });
      isDriver = !!driverTrip;
    }

    // Check if user is passenger in this trip
    let isPassenger = false;
    if (user.passenger) {
      const passengerTrip = await prisma.tripPassenger.findFirst({
        where: {
          tripId,
          passengerId: user.passenger.id
        }
      });
      isPassenger = !!passengerTrip;
    }

    return {
      authorized: isDriver || isPassenger,
      isDriver,
      isPassenger
    };
  } catch (error) {
    console.error('Error checking trip access:', error);
    return { authorized: false };
  }
}