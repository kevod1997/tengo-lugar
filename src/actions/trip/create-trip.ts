// 'use server'

// import { auth } from "@/lib/auth"
// import { headers } from "next/headers"
// import prisma from "@/lib/prisma"
// import { ApiHandler } from "@/lib/api-handler"
// import { ServerActionError } from "@/lib/exceptions/server-action-error"
// import { findDriver } from "../driver/find-driver"
// import { tripCreationSchema } from "@/schemas/validation/trip-schema"
// import { TripData } from "@/types/trip-types"

// // Función para crear la sala de chat
// async function createChatRoom(tripId: string): Promise<string | null> {
//     try {
//         const chatApiUrl = process.env.CHAT_API_URL;
//         if (!chatApiUrl) {
//             console.warn('CHAT_API_URL not configured, skipping chat room creation');
//             return null;
//         }

//         // Obtener JWT token directamente aquí
//         const tokenResponse = await auth.api.getToken({
//             headers: await headers(),
//         });
//         console.log('Token response:', tokenResponse);

//         if (!tokenResponse) {
//             console.warn('Failed to obtain JWT token for chat API');
//             return null;
//         }

//         const response = await fetch(`${chatApiUrl}/chat/create/${tripId}`, {
//             method: 'POST',
//             headers: {
//                 'Authorization': `Bearer ${tokenResponse}`,
//                 'Content-Type': 'application/json',
//             },
//         });

//         if (!response.ok) {
//             console.error(`Failed to create chat room: ${response.status} ${response.statusText}`);
//             return null;
//         }

//         const data = await response.json();
//         return data.room_id || null;
//     } catch (error) {
//         console.error('Error creating chat room:', error);
//         return null;
//     }
// }


// export async function createTrip(tripData: TripData) {
//     try {
//         // Authentication check
//         const session = await auth.api.getSession({
//             headers: await headers(),
//         })

//         if (!session) {
//             throw ServerActionError.AuthenticationFailed('create-trip.ts', 'createTrip')
//         }

//         // Validate input data with Zod
//         const validatedData = tripCreationSchema.parse(tripData)

//         // Run in transaction to ensure data consistency
//         return await prisma.$transaction(async (tx) => {
//             // Find driver
//             const driver = await findDriver(session.user.id, tx)

//             // Check if driver has selected car
//             const driverCar = await tx.driverCar.findFirst({
//                 where: {
//                     carId: validatedData.driverCarId,
//                     driverId: driver.id
//                 }
//             })

//             if (!driverCar) {
//                 throw ServerActionError.ValidationFailed(
//                     'create-trip.ts',
//                     'createTrip',
//                     'El vehículo seleccionado no pertenece al conductor'
//                 )
//             }

//             // Create the trip
//             const trip = await tx.trip.create({
//                 data: {
//                     driverCarId: driverCar.id,
//                     status: 'ACTIVE',

//                     // Origin details
//                     originAddress: validatedData.originAddress,
//                     originCity: validatedData.originCity,
//                     originProvince: validatedData.originProvince,
//                     originLatitude: validatedData.originCoords.latitude,
//                     originLongitude: validatedData.originCoords.longitude,

//                     // Destination details
//                     destinationAddress: validatedData.destinationAddress,
//                     destinationCity: validatedData.destinationCity,
//                     destinationProvince: validatedData.destinationProvince,
//                     destinationLatitude: validatedData.destinationCoords.latitude,
//                     destinationLongitude: validatedData.destinationCoords.longitude,

//                     // Route information
//                     googleMapsUrl: validatedData.googleMapsUrl,
//                     date: validatedData.date,
//                     serviceFee: 10,
//                     departureTime: validatedData.departureTime,
//                     price: Math.round(validatedData.price), 
//                     priceGuide: Math.round(validatedData.priceGuide), 
//                     distance: validatedData.distance,
//                     duration: validatedData.duration,
//                     durationSeconds: validatedData.durationSeconds,

//                     // Toll information
//                     hasTolls: validatedData.hasTolls,
//                     tollEstimatedPrice: validatedData.tollEstimatedPrice,

//                     // Preferences
//                     availableSeats: validatedData.availableSeats,
//                     remainingSeats: validatedData.availableSeats,
//                     autoApproveReservations: validatedData.autoApproveReservations,
//                     luggageAllowance: validatedData.luggageAllowance,
//                     allowPets: validatedData.allowPets,
//                     allowChildren: validatedData.allowChildren,
//                     smokingAllowed: validatedData.smokingAllowed,
//                     additionalNotes: validatedData.additionalNotes,
//                 },
//                 include: {
//                     driverCar: {
//                         include: {
//                             car: {
//                                 include: {
//                                     carModel: {
//                                         include: {
//                                             brand: true
//                                         }
//                                     }
//                                 }
//                             }
//                         }
//                     }
//                 }
//             })

//              // Try to create chat room
//             let chatRoomId: string | null = null;
//             chatRoomId = await createChatRoom(trip.id);
                
//                 // Update trip with chat room ID if successful
//                 if (chatRoomId) {
//                     await tx.trip.update({
//                         where: { id: trip.id },
//                         data: { chatRoomId }
//                     });
//                 }

//             return ApiHandler.handleSuccess(trip, 'Viaje creado exitosamente')
//         })
//     } catch (error) {
//         return ApiHandler.handleError(error)
//     }
// }

'use server'

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import prisma from "@/lib/prisma"
import { ApiHandler } from "@/lib/api-handler"
import { ServerActionError } from "@/lib/exceptions/server-action-error"
import { findDriver } from "../driver/find-driver"
import { tripCreationSchema } from "@/schemas/validation/trip-schema"
import { TripData } from "@/types/trip-types"

// Función para crear la sala de chat
async function createChatRoom(tripId: string): Promise<string> {
    //todo tipar bien los errores por lo que ya tenemos en exceptions
    const chatApiUrl = process.env.NEXT_PUBLIC_CHAT_API_URL;
    if (!chatApiUrl) {
        throw new Error('CHAT_API_URL not configured');
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
            throw new Error(`Failed to obtain JWT token: ${tokenResponse.status} ${tokenResponse.statusText}`);
        }

        const tokenData = await tokenResponse.json();
        const token = tokenData.token;

        if (!token) {
            throw new Error('JWT token not found in response');
        }
        console.log('Token obtained successfully:', tokenData);

        // Crear la sala de chat
        const response = await fetch(`${chatApiUrl}/chat/create/${tripId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to create chat room: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        if (!data.room_id) {
            throw new Error('Chat room ID not returned from API');
        }

        return data.room_id;
    } catch (error) {
        console.error('Error creating chat room:', error);
        throw new Error(`Chat room creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

// export async function createTrip(tripData: TripData) {
//     try {
//         // Authentication check
//         const session = await auth.api.getSession({
//             headers: await headers(),
//         })

//         if (!session) {
//             throw ServerActionError.AuthenticationFailed('create-trip.ts', 'createTrip')
//         }

//         // Validate input data with Zod
//         const validatedData = tripCreationSchema.parse(tripData)

//         // Run in transaction to ensure data consistency
//         return await prisma.$transaction(async (tx) => {
//             // Find driver
//             const driver = await findDriver(session.user.id, tx)

//             // Check if driver has selected car
//             const driverCar = await tx.driverCar.findFirst({
//                 where: {
//                     carId: validatedData.driverCarId,
//                     driverId: driver.id
//                 }
//             })

//             if (!driverCar) {
//                 throw ServerActionError.ValidationFailed(
//                     'create-trip.ts',
//                     'createTrip',
//                     'El vehículo seleccionado no pertenece al conductor'
//                 )
//             }

//             // Create the trip
//             const trip = await tx.trip.create({
//                 data: {
//                     driverCarId: driverCar.id,
//                     status: 'ACTIVE',

//                     // Origin details
//                     originAddress: validatedData.originAddress,
//                     originCity: validatedData.originCity,
//                     originProvince: validatedData.originProvince,
//                     originLatitude: validatedData.originCoords.latitude,
//                     originLongitude: validatedData.originCoords.longitude,

//                     // Destination details
//                     destinationAddress: validatedData.destinationAddress,
//                     destinationCity: validatedData.destinationCity,
//                     destinationProvince: validatedData.destinationProvince,
//                     destinationLatitude: validatedData.destinationCoords.latitude,
//                     destinationLongitude: validatedData.destinationCoords.longitude,

//                     // Route information
//                     googleMapsUrl: validatedData.googleMapsUrl,
//                     date: validatedData.date,
//                     serviceFee: 10,
//                     departureTime: validatedData.departureTime,
//                     price: Math.round(validatedData.price), 
//                     priceGuide: Math.round(validatedData.priceGuide), 
//                     distance: validatedData.distance,
//                     duration: validatedData.duration,
//                     durationSeconds: validatedData.durationSeconds,

//                     // Toll information
//                     hasTolls: validatedData.hasTolls,
//                     tollEstimatedPrice: validatedData.tollEstimatedPrice,

//                     // Preferences
//                     availableSeats: validatedData.availableSeats,
//                     remainingSeats: validatedData.availableSeats,
//                     autoApproveReservations: validatedData.autoApproveReservations,
//                     luggageAllowance: validatedData.luggageAllowance,
//                     allowPets: validatedData.allowPets,
//                     allowChildren: validatedData.allowChildren,
//                     smokingAllowed: validatedData.smokingAllowed,
//                     additionalNotes: validatedData.additionalNotes,
//                 },
//                 include: {
//                     driverCar: {
//                         include: {
//                             car: {
//                                 include: {
//                                     carModel: {
//                                         include: {
//                                             brand: true
//                                         }
//                                     }
//                                 }
//                             }
//                         }
//                     }
//                 }
//             })

//             // Crear la sala de chat (esto lanzará un error si falla, provocando rollback)
//             const chatRoomId = await createChatRoom(trip.id);
                
//             // Actualizar el trip con el chat room ID
//             await tx.trip.update({
//                 where: { id: trip.id },
//                 data: { chatRoomId }
//             });

//             return ApiHandler.handleSuccess(trip, 'Viaje creado exitosamente')
//         })
//     } catch (error) {
//         return ApiHandler.handleError(error)
//     }
// }

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
            // Log el error pero no fallar todo el proceso
            console.log('Failed to create chat room:', chatError);
            // El viaje se creó exitosamente, solo falló el chat
        }

        return ApiHandler.handleSuccess(tripResult, 'Viaje creado exitosamente')

    } catch (error) {
        return ApiHandler.handleError(error)
    }
}