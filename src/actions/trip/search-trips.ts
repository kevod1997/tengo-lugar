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
            // El usuario busca una fecha en hora Argentina (UTC-3)
            // Necesitamos ajustar el rango de búsqueda para consultar correctamente en UTC
            const ARGENTINA_OFFSET_HOURS = 3;

            // Crear fecha en hora local Argentina (00:00:00)
            const selectedDateLocal = new Date(date + 'T00:00:00');

            // Convertir a UTC agregando el offset (00:00 Argentina = 03:00 UTC)
            const selectedDateUTC = new Date(selectedDateLocal);
            selectedDateUTC.setHours(selectedDateUTC.getHours() + ARGENTINA_OFFSET_HOURS);

            // El día siguiente en UTC (23:59:59 Argentina = 02:59:59 UTC del día siguiente)
            const nextDayUTC = new Date(selectedDateUTC);
            nextDayUTC.setDate(nextDayUTC.getDate() + 1);

            // Verificar si la búsqueda es para el día actual
            const now = new Date();
            const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const isToday = selectedDateLocal.getTime() === todayLocal.getTime();

            if (isToday) {
                // Si busca para HOY, solo mostrar viajes que salgan en más de 3h 30min
                const minDepartureTime = new Date();
                minDepartureTime.setSeconds(
                    minDepartureTime.getSeconds() + TRIP_COMPLETION_CONFIG.MINIMUM_BOOKING_TIME_SECONDS
                );

                // Convertir el tiempo mínimo a UTC
                const minDepartureTimeUTC = new Date(minDepartureTime);
                minDepartureTimeUTC.setHours(minDepartureTimeUTC.getHours() + ARGENTINA_OFFSET_HOURS);

                where.departureTime = {
                    gte: minDepartureTimeUTC,
                    lt: nextDayUTC
                };
            } else {
                // Para búsquedas de fechas futuras, usar el rango completo del día en UTC
                where.departureTime = {
                    gte: selectedDateUTC,
                    lt: nextDayUTC
                };
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
                    departureTime: 'asc'
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