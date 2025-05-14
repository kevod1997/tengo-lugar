// src/actions/user/get-user-profile.ts
'use server'

import prisma from "@/lib/prisma";
import { ServerActionError } from "@/lib/exceptions/server-action-error";
import { splitFullName } from "@/utils/format/user-formatter";
import { VerificationStatus } from "@prisma/client";

export interface UserProfileData {
  id: string;
  firstName: string;
  age: number | null;
  profileImage: string | null;
  gender: string | null;
  memberSince: string;
  isDriver: boolean;
  isPassenger: boolean;
  isVerified: boolean;  // Added verification status
  driverRating: number | null;
  passengerRating: number | null;
  totalTripsAsDriver: number;
  totalTripsAsPassenger: number;
  totalReviews: number;
  activeTrips: { // Added active trips info
    id: string;
    from: string;
    to: string;
    date: string;
    availableSeats: number;
  }[];
  reviews: {
    id: string;
    reviewerId: string;
    reviewerName: string;
    reviewerImage: string | null;
    rating: number;
    comment: string | null;
    createdAt: string;
    isDriver: boolean;
  }[];
}

export async function getUserProfileById(userId: string): Promise<UserProfileData | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        identityCard: true, // Added identity card for verification status
        driver: {
          include: {
            cars: {
              select: {
                id: true
              }
            }
          }
        },
        passenger: true,
        reviewsReceived: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 5,
          include: {
            reviewer: {
              select: {
                id: true,
                name: true,
                profileImageKey: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      return null;
    }

    // Extract first name
    const { firstName } = splitFullName(user.name);

    // Calculate age if birth date is available
    let age: number | null = null;
    if (user.birthDate) {
      const today = new Date();
      const birthDate = new Date(user.birthDate);
      age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    }

    // Count trips as driver and passenger
    const totalTripsAsDriver = user.driver ? await prisma.trip.count({
      where: {
        driverCar: {
          driverId: user.driver.id
        },
        status: {
          in: ['COMPLETED', 'ACTIVE']
        }
      }
    }) : 0;

    const totalTripsAsPassenger = user.passenger ? await prisma.tripPassenger.count({
      where: {
        passengerId: user.passenger.id,
        reservationStatus: 'CONFIRMED'
      }
    }) : 0;

    // Get active trips with available seats for drivers
    let activeTrips: {
      id: string;
      from: string;
      to: string;
      date: string;
      availableSeats: number;
    }[] = [];
    if (user.driver) {
      const trips = await prisma.trip.findMany({
        where: {
          driverCar: {
            driverId: user.driver.id
          },
          status: 'ACTIVE',
          availableSeats: {
            gt: 0 // Only trips with available seats
          },
          date: {
            gte: new Date() // Only future trips
          }
        },
        select: {
          id: true,
          originCity: true,
          destinationCity: true,
          date: true,
          availableSeats: true
        },
        orderBy: {
          date: 'asc'
        },
        take: 3 // Limit to a few upcoming trips
      });
      
      activeTrips = trips.map(trip => ({
        id: trip.id,
        from: trip.originCity,
        to: trip.destinationCity,
        date: trip.date.toISOString(),
        availableSeats: trip.availableSeats
      }));
    }

    // Format reviews
    const reviews = user.reviewsReceived.map(review => {
      const { firstName: reviewerFirstName } = splitFullName(review.reviewer.name);
      
      return {
        id: review.id,
        reviewerId: review.reviewerId,
        reviewerName: reviewerFirstName,
        reviewerImage: review.reviewer.profileImageKey,
        rating: review.rating,
        comment: review.comments,
        createdAt: review.createdAt.toISOString(),
        isDriver: review.revieweeType === 'DRIVER'
      };
    });

    return {
      id: user.id,
      firstName,
      age,
      profileImage: user.profileImageKey,
      gender: user.gender,
      memberSince: user.createdAt.toISOString(),
      isDriver: !!user.driver,
      isPassenger: !!user.passenger,
      isVerified: user.identityCard?.status === VerificationStatus.VERIFIED,
      driverRating: user.driver?.averageRating || null,
      passengerRating: user.passenger?.averageRating || null,
      totalTripsAsDriver,
      totalTripsAsPassenger,
      totalReviews: (user.driver?.totalReviews || 0) + (user.passenger?.totalReviews || 0),
      activeTrips,
      reviews
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw ServerActionError.FetchingFailed(
      'get-user-profile.ts',
      'getUserProfileById',
      error instanceof Error ? error.message : String(error)
    );
  }
}