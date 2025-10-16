'use server'

import { ApiHandler } from "@/lib/api-handler"
import prisma from "@/lib/prisma"
import { TRIP_COMPLETION_CONFIG } from "@/lib/constants/trip-completion-config"
import { TripStatus } from "@prisma/client"

export interface TripSearchParams {
    page?: number
    pageSize?: number
    originCity?: string
    destinationCity?: string
    date?: string
    minPrice?: number
    maxPrice?: number
    status?: TripStatus
}

export async function searchTrips({
    page = 1,
    pageSize = 10,
    originCity,
    destinationCity,
    date,
    minPrice,
    maxPrice,
    status = 'ACTIVE'
}: TripSearchParams) {
    try {
        // Construct the where clause based on filters
        const where: any = {
            status
        }

        // Add optional filters if they exist
        if (originCity) {
            where.originCity = {
                contains: originCity,
                mode: 'insensitive'
            }
        }

        if (destinationCity) {
            where.destinationCity = {
                contains: destinationCity,
                mode: 'insensitive'
            }
        }

        if (date) {
            const selectedDate = new Date(date)
            const nextDay = new Date(selectedDate)
            nextDay.setDate(nextDay.getDate() + 1)

            // Verificar si la búsqueda es para el día actual
            const now = new Date()
            const isToday = selectedDate.toDateString() === now.toDateString()

            if (isToday) {
                // Si busca para HOY, solo mostrar viajes que salgan en más de 3h 30min
                const minDepartureTime = new Date()
                minDepartureTime.setSeconds(
                    minDepartureTime.getSeconds() + TRIP_COMPLETION_CONFIG.MINIMUM_BOOKING_TIME_SECONDS
                )

                where.date = {
                    gte: minDepartureTime,
                    lt: nextDay
                }
            } else {
                // Para búsquedas de fechas futuras, usar lógica original
                where.date = {
                    gte: selectedDate,
                    lt: nextDay
                }
            }
        }

        if (minPrice !== undefined) {
            where.price = {
                ...where.price,
                gte: minPrice * 100 // Convert to cents
            }
        }

        if (maxPrice !== undefined) {
            where.price = {
                ...where.price,
                lte: maxPrice * 100 // Convert to cents
            }
        }

        // Calculate pagination values
        const skip = (page - 1) * pageSize
        // Fetch trips and total count in parallel
        const [trips, total] = await Promise.all([
            prisma.trip.findMany({
                where,
                orderBy: {
                    date: 'asc'
                },
                skip,
                take: pageSize,
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
                    },
                    passengers: {
                        select: {
                            id: true,
                            reservationStatus: true,
                            seatsReserved: true
                        }
                    }
                }
            }),
            prisma.trip.count({ where })
        ])

        // Transform trips to include derived data
        const formattedTrips = trips.map(trip => {
            // Calculate available seats considering reservations
            const confirmedSeats = trip.passengers
                .filter(p => ['APPROVED', 'CONFIRMED'].includes(p.reservationStatus))
                .reduce((sum, p) => sum + p.seatsReserved, 0)
            const availableSeats = trip.availableSeats - confirmedSeats

            return {
                ...trip,
                price: trip.price, // Convert from cents to actual currency
                priceGuide: trip.priceGuide,
                availableSeats,
                driverName: trip.driverCar.driver.user.name,
                driverProfileImage: trip.driverCar.driver.user.profileImageKey,
                carInfo: {
                    brand: trip.driverCar.car.carModel.brand.name,
                    model: trip.driverCar.car.carModel.model,
                    year: trip.driverCar.car.year
                }
            }
        })
        
        return ApiHandler.handleSuccess({
            trips: formattedTrips,
            pagination: {
                total,
                pageCount: Math.ceil(total / pageSize),
                currentPage: page,
                pageSize
            }
        })
    } catch (error) {
        return ApiHandler.handleError(error)
    }
}