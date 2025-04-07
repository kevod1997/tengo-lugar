'use server'

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import prisma from "@/lib/prisma"
import { ApiHandler } from "@/lib/api-handler"
import { ServerActionError } from "@/lib/exceptions/server-action-error"
import { findDriver } from "../driver/find-driver"
import { tripCreationSchema } from "@/schemas/validation/trip-schema"
import { TripData } from "@/types/trip-types"

export async function createTrip(tripData: TripData) {
    try {
        // Authentication check
        const session = await auth.api.getSession({
            headers: await headers(),
        })

        if (!session) {
            throw ServerActionError.AuthenticationFailed('create-trip.ts', 'createTrip')
        }

        // Validate input data with Zod
        const validatedData = tripCreationSchema.parse(tripData)

        // Run in transaction to ensure data consistency
        return await prisma.$transaction(async (tx) => {
            // Find driver
            const driver = await findDriver(session.user.id, tx)

            // Check if driver has selected car
            const driverCar = await tx.driverCar.findFirst({
                where: {
                    carId: validatedData.driverCarId,
                    driverId: driver.id
                }
            })

            if (!driverCar) {
                throw ServerActionError.ValidationFailed(
                    'create-trip.ts',
                    'createTrip',
                    'El vehículo seleccionado no pertenece al conductor'
                )
            }

            // Create the trip
            const trip = await tx.trip.create({
                data: {
                    driverCarId: driverCar.id,
                    status: 'ACTIVE',

                    // Origin details
                    originAddress: validatedData.originAddress,
                    originCity: validatedData.originCity,
                    originProvince: validatedData.originProvince,
                    originLatitude: validatedData.originCoords.latitude,
                    originLongitude: validatedData.originCoords.longitude,

                    // Destination details
                    destinationAddress: validatedData.destinationAddress,
                    destinationCity: validatedData.destinationCity,
                    destinationProvince: validatedData.destinationProvince,
                    destinationLatitude: validatedData.destinationCoords.latitude,
                    destinationLongitude: validatedData.destinationCoords.longitude,

                    // Route information
                    googleMapsUrl: validatedData.googleMapsUrl,
                    date: validatedData.date,
                    serviceFee: 10,
                    departureTime: validatedData.departureTime,
                    price: Math.round(validatedData.price), 
                    priceGuide: Math.round(validatedData.priceGuide), 
                    distance: validatedData.distance,
                    duration: validatedData.duration,
                    durationSeconds: validatedData.durationSeconds,

                    // Toll information
                    hasTolls: validatedData.hasTolls,
                    tollEstimatedPrice: validatedData.tollEstimatedPrice,

                    // Preferences
                    availableSeats: validatedData.availableSeats,
                    autoApproveReservations: validatedData.autoApproveReservations,
                    luggageAllowance: validatedData.luggageAllowance,
                    allowPets: validatedData.allowPets,
                    allowChildren: validatedData.allowChildren,
                    smokingAllowed: validatedData.smokingAllowed,
                    additionalNotes: validatedData.additionalNotes,

                    // Auto-create a chat room for the trip
                    //   chatRoom: {
                    //     create: {}
                    //   }
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
                    }
                }
            })

            return ApiHandler.handleSuccess(trip, 'Viaje creado exitosamente')
        })
    } catch (error) {
        return ApiHandler.handleError(error)
    }
}