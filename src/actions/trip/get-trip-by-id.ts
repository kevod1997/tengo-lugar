'use server'

import prisma from "@/lib/prisma"

export async function getTripById(id: string) {
    try {
        const trip = await prisma.trip.findUnique({
            where: { id },
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
                                        brand: true,
                                    }
                                }
                            }
                        }
                    },
                },
            }
        })

        return trip
    } catch (error) {
        console.error('Error fetching trip:', error)
        throw new Error('Failed to fetch trip')
    }
}