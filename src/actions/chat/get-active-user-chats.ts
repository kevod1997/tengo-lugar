// src/actions/chat/get-active-user-chats.ts
'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';
import { ServerActionError } from '@/lib/exceptions/server-action-error';
import type { Trip, TripStatus, ReservationStatus } from '@prisma/client';

export interface ActiveChatInfo {
    tripId: string;
    tripName: string;
    roomId: string;   // Se asume que siempre estará presente
    createdAt: Date;  // Se asume que siempre estará presente (para el chat)
}

type FetchedTripDataForChat = Pick<
    Trip,
    'id' | 'originCity' | 'destinationCity' | 'status' | 'createdAt' | 'departureTime'
>;

export async function getActiveUserChats(): Promise<ActiveChatInfo[]> {
    const session = await auth.api.getSession({ headers: await headers() });
    const actionName = 'getActiveUserChats';
    const originFile = 'src/actions/chat/get-active-user-chats.ts';

    if (!session) {
        throw ServerActionError.AuthenticationFailed(
            'submit-card-car-info.ts',
            'submitCardCarInfo'
        )
    }
    const userId = session.user.id;

    try {
        const userWithRoles = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                driver: { select: { id: true } },
                passenger: { select: { id: true } },
            },
        });

        if (!userWithRoles) {
            throw ServerActionError.NotFound(
                originFile,
                actionName,
                'Usuario no encontrado'
            );
        }

        const activeTripStatusesForQuery: TripStatus[] = ['PENDING', 'ACTIVE'];
        const activePassengerReservationStatusesForQuery: ReservationStatus[] = ['APPROVED', 'CONFIRMED'];

        const tripsForChatMap = new Map<string, FetchedTripDataForChat>();

        // 1. Obtener viajes activos donde el usuario es el conductor
        if (userWithRoles.driver?.id) {
            const driverTrips = await prisma.trip.findMany({
                where: {
                    driverCar: {
                        driverId: userWithRoles.driver.id,
                    },
                    status: { in: activeTripStatusesForQuery },
                },
                select: {
                    id: true,
                    originCity: true,
                    destinationCity: true,
                    status: true,
                    createdAt: true,
                    departureTime: true,
                },
                orderBy: {
                    departureTime: 'asc',
                },
            });
            driverTrips.forEach(trip => tripsForChatMap.set(trip.id, trip));
        }

        // 2. Obtener viajes activos donde el usuario es un pasajero
        if (userWithRoles.passenger?.id) {
            const passengerTripLinks = await prisma.tripPassenger.findMany({
                where: {
                    passengerId: userWithRoles.passenger.id,
                    reservationStatus: { in: activePassengerReservationStatusesForQuery },
                    trip: {
                        status: { in: activeTripStatusesForQuery },
                    },
                },
                select: {
                    trip: {
                        select: {
                            id: true,
                            originCity: true,
                            destinationCity: true,
                            status: true,
                            createdAt: true,
                            departureTime: true,
                        },
                    },
                },
                orderBy: {
                    trip: { departureTime: 'asc' },
                },
            });

            passengerTripLinks.forEach(link => {
                if (link.trip) { // Aseguramos que link.trip no sea null
                    const tripData: FetchedTripDataForChat = {
                        id: link.trip.id,
                        originCity: link.trip.originCity,
                        destinationCity: link.trip.destinationCity,
                        status: link.trip.status,
                        createdAt: link.trip.createdAt,
                        departureTime: link.trip.departureTime,
                    };
                    if (!tripsForChatMap.has(link.trip.id)) {
                        tripsForChatMap.set(link.trip.id, tripData);
                    }
                }
            });
        }

        // 3. Mapear a la estructura ActiveChatInfo
        const activeChatsResult: ActiveChatInfo[] = [];
        for (const trip of tripsForChatMap.values()) {
            const tripName = `Viaje de ${trip.originCity} a ${trip.destinationCity}`;
            const roomIdPlaceholder = trip.id;
            const chatCreatedAtPlaceholder = trip.createdAt;

            activeChatsResult.push({
                tripId: trip.id,
                tripName: tripName,
                roomId: roomIdPlaceholder,
                createdAt: chatCreatedAtPlaceholder,
            });
        }

        activeChatsResult.sort((a, b) => {
            const tripA_departureTime = tripsForChatMap.get(a.tripId)?.departureTime;
            const tripB_departureTime = tripsForChatMap.get(b.tripId)?.departureTime;
            if (tripA_departureTime && tripB_departureTime) {
                return new Date(tripA_departureTime).getTime() - new Date(tripB_departureTime).getTime();
            }
            if (tripA_departureTime) return -1;
            if (tripB_departureTime) return 1;
            return 0;
        });

        return activeChatsResult;

    } catch (error) {
        let errorMessage = 'Error inesperado al obtener los chats del usuario.';
        let errorCode = 'UNEXPECTED_ERROR';
        let errorDetails: unknown = error;

        if (error instanceof ServerActionError) {
            errorMessage = error.message;
            errorCode = error.code || 'SERVER_ACTION_ERROR';
            errorDetails = { originFunction: error.fileName, originalMessage: error.message, code: error.code };
        } else if (error instanceof Error) {
            errorMessage = error.message;
            errorDetails = { name: error.name, message: error.message, stack: error.stack };
        }
        //todo acomodar 
        console.log('Error en getActiveUserChats:', {
            originFile,
            actionName,
            userId,
            errorMessage,
            errorCode,
            errorDetails
        });
        return [];
    }
}
