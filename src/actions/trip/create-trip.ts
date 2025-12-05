'use server'

import { headers } from "next/headers"

import { z } from "zod"

import { ApiHandler } from "@/lib/api-handler"
import type { Session } from "@/lib/auth";
import { auth } from "@/lib/auth"
import { ServerActionError } from "@/lib/exceptions/server-action-error"
import { ServiceError } from "@/lib/exceptions/service-error"
import prisma from "@/lib/prisma"
import { tripCreationSchema } from "@/schemas/validation/trip-schema"
import { logError } from "@/services/logging/logging-service"
import type { TripData } from "@/types/trip-types"

import { updateDriverStatus } from "../driver/driver-eligibility"
import { findDriver } from "../driver/find-driver"


// Función para crear la sala de chat
async function createChatRoom(tripId: string): Promise<string> {
    const chatApiUrl = process.env.NEXT_PUBLIC_CHAT_API_URL;
    if (!chatApiUrl) {
        throw ServiceError.ConfigError(
            'Chat API URL no está configurada en las variables de entorno',
            'create-trip.ts',
            'createChatRoom'
        );
    }

    const baseUrl = process.env.NEXT_PUBLIC_CLIENT_URL || 'https://localhost:3000';

    try {
        // Obtener el token del endpoint /api/auth/token con la URL completa y cookies
        const tokenResponse = await fetch(`${baseUrl}/api/auth/token`, {
            method: 'GET',
            headers: {
                // Pasar las cookies del request original
                'cookie': (await headers()).get('cookie') || '',
                'Content-Type': 'application/json',
            },
        });

        if (!tokenResponse.ok) {
            throw ServiceError.ExternalApiError(
                `Error al obtener el token JWT: ${tokenResponse.status} ${tokenResponse.statusText}`,
                'create-trip.ts',
                'createChatRoom'
            );
        }

        const tokenData = await tokenResponse.json();
        const token = tokenData.token;

        if (!token) {
            throw ServiceError.ExternalApiError(
                'Token JWT no encontrado en la respuesta del servidor',
                'create-trip.ts',
                'createChatRoom'
            );
        }

        // Crear la sala de chat
        const response = await fetch(`${chatApiUrl}/chat/create/${tripId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Error desconocido');
            throw ServiceError.ExternalApiError(
                `Error al crear la sala de chat: ${response.status} ${response.statusText}. ${errorText}`,
                'create-trip.ts',
                'createChatRoom'
            );
        }

        const data = await response.json();

        if (!data.room_id) {
            throw ServiceError.ExternalApiError(
                'La API de chat no devolvió un ID de sala válido',
                'create-trip.ts',
                'createChatRoom'
            );
        }

        return data.room_id;
    } catch (error) {
        throw error;
    }
}

export async function createTrip(tripData: TripData) {
    try {
        // Authentication check
        const session: Session | null = await auth.api.getSession({
            headers: await headers(),
        })

        if (!session) {
            throw ServerActionError.AuthenticationFailed('create-trip.ts', 'createTrip')
        }

        const driver = await prisma.driver.findFirst({
            where: { userId: session.user.id }
        });

        if (!driver?.isEnabled) {
            // Si no está habilitado O necesita recheck, validar en tiempo real
            const eligibility = await updateDriverStatus(session.user.id);
            if (!eligibility.isEnabled) {
                throw ServerActionError.ValidationFailed(
                    'create-trip.ts',
                    'createTrip',
                    `No puedes crear viajes: ${eligibility.reason}`
                );
            }
        }

        // Validate input data with Zod
        const validatedData = tripCreationSchema.parse(tripData)

        // PASO 1: Crear el trip en la transacción (SIN el chat room)
        const tripResult = await prisma.$transaction(async (tx) => {
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

            // Create the trip (SIN chatRoomId inicialmente)
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
                    originalDepartureTime: validatedData.departureTime,
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
                    remainingSeats: validatedData.availableSeats,
                    autoApproveReservations: validatedData.autoApproveReservations,
                    luggageAllowance: validatedData.luggageAllowance,
                    allowPets: validatedData.allowPets,
                    allowChildren: validatedData.allowChildren,
                    smokingAllowed: validatedData.smokingAllowed,
                    additionalNotes: validatedData.additionalNotes,
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

            return trip
        })

        // PASO 2: DESPUÉS de que la transacción se commitee, crear el chat room
        let chatRoomId: string | null = null;
        try {
            chatRoomId = await createChatRoom(tripResult.id);

            // PASO 3: Actualizar el trip con el chatRoomId (transacción separada)
            await prisma.trip.update({
                where: { id: tripResult.id },
                data: { chatRoomId }
            });

        } catch (chatError) {
            await logError({
                origin: 'Chat API',
                code: 'CHAT_API_ERROR',
                message: 'Error al crear la sala de chat para el viaje',
                details: chatError instanceof Error ? chatError.message : String(chatError),
                fileName: 'create-trip.ts',
                functionName: 'createTrip'
            });
            tripResult.chatRoomId = null;
        }

        return ApiHandler.handleSuccess(tripResult, 'Viaje creado exitosamente')

    } catch (error) {
        // Handle Zod validation errors specifically
        if (error instanceof z.ZodError) {
            const errorMessage = error.errors
                .map(err => err.message)
                .join(', ');

            return ApiHandler.handleError(
                ServerActionError.ValidationFailed(
                    'create-trip.ts',
                    'createTrip',
                    errorMessage
                )
            );
        }

        return ApiHandler.handleError(error)
    }
}