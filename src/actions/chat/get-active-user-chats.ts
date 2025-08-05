// src/actions/chat/get-active-user-chats.ts
'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';
import { ServerActionError } from '@/lib/exceptions/server-action-error';
import { ApiHandler } from '@/lib/api-handler';
import { ApiResponse } from '@/types/api-types';
import type { Trip, TripStatus, ReservationStatus } from '@prisma/client';

export interface ActiveChatInfo {
    tripId: string;
    tripName: string;
    chatRoomId: string | null;
    createdAt: Date;
}

type FetchedTripDataForChat = Pick<
    Trip,
    'id' | 'originCity' | 'destinationCity' | 'status' | 'createdAt' | 'departureTime' | 'chatRoomId' 
>;

export async function getActiveUserChats(): Promise<ApiResponse<ActiveChatInfo[]>> {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        const actionName = 'getActiveUserChats';
        const originFile = 'get-active-user-chats.ts';

        if (!session) {
            throw ServerActionError.AuthenticationFailed(originFile, actionName);
        }

        const userId = session.user.id;

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
                    chatRoomId: true, 
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
                            chatRoomId: true, 
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
                        chatRoomId: link.trip.chatRoomId,
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

            activeChatsResult.push({
                tripId: trip.id,
                tripName: tripName,
                chatRoomId: trip.chatRoomId,
                createdAt: trip.createdAt,
            });
        }

        // Ordenar por fecha de salida
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

        return ApiHandler.handleSuccess(
            activeChatsResult,
            activeChatsResult.length > 0 
                ? `Se encontraron ${activeChatsResult.length} chats activos`
                : 'No tienes chats activos en este momento'
        );

    } catch (error) {
        return ApiHandler.handleError(error);
    }
}