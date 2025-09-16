// src/actions/trip/create-trip-reservation.ts
'use server'

import prisma from "@/lib/prisma";
import { ApiHandler } from "@/lib/api-handler";
import { ServerActionError } from "@/lib/exceptions/server-action-error";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";
import { logActionWithErrorHandling } from "@/services/logging/logging-service";
import { TipoAccionUsuario } from "@/types/actions-logs";

// Schema for validation
const reservationSchema = z.object({
  tripId: z.string().uuid("ID de viaje inválido"),
  seatsReserved: z.number().int().min(1, "Mínimo 1 asiento").max(4, "Máximo 4 asientos"),
  reservationMessage: z.string().max(500, "Mensaje demasiado largo").optional(),
  totalPrice: z.number().positive("El precio debe ser positivo")
});

export async function createTripReservation(data: {
  tripId: string;
  seatsReserved: number;
  reservationMessage?: string;
  totalPrice: number;
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw ServerActionError.AuthenticationFailed('create-trip-reservation.ts', 'createTripReservation');
    }

    const userId = session.user.id;
    
    // Validate input data
    const validatedData = reservationSchema.parse(data);
    
    // Get the user's passenger record or create one if needed
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { passenger: true }
    });

    if (!user) {
      throw ServerActionError.UserNotFound('create-trip-reservation.ts', 'createTripReservation');
    }

    let passengerId = user.passenger?.id;

    if (!passengerId) {
      // Create passenger record if it doesn't exist
      const newPassenger = await prisma.passenger.create({
        data: { userId }
      });
      passengerId = newPassenger.id;
    }

    // Get the trip to check availability
    const trip = await prisma.trip.findUnique({
      where: { id: validatedData.tripId },
      include: {
        driverCar: {
          include: {
            driver: true
          }
        },
        passengers: {
          where: {
            reservationStatus: {
              in: ['CONFIRMED', 'APPROVED', 'PENDING_APPROVAL']
            }
          },
          select: { 
            seatsReserved: true,
            passenger: {
              select: { userId: true }
            }
          }
        }
      }
    });

    if (!trip) {
      throw ServerActionError.NotFound('create-trip-reservation.ts', 'createTripReservation', 'Viaje no encontrado');
    }

    // Cannot reserve your own trip
    if (trip.driverCar.driver.userId === userId) {
      throw ServerActionError.ValidationFailed(
        'create-trip-reservation.ts',
        'createTripReservation',
        'No puedes reservar tu propio viaje'
      );
    }

    // Check if trip is available
    if (trip.status !== 'PENDING' && trip.status !== 'ACTIVE') {
      throw ServerActionError.ValidationFailed(
        'create-trip-reservation.ts',
        'createTripReservation',
        'Este viaje no está disponible para reservaciones'
      );
    }

    // Calculate already reserved seats
    const reservedSeats = trip.passengers.reduce((total, p) => total + p.seatsReserved, 0);
    const availableSeats = trip.availableSeats - reservedSeats;

    if (validatedData.seatsReserved > availableSeats) {
      throw ServerActionError.ValidationFailed(
        'create-trip-reservation.ts',
        'createTripReservation',
        `Solo hay ${availableSeats} asientos disponibles`
      );
    }

    // Check for existing reservation (including cancelled ones)
    const existingReservation = await prisma.tripPassenger.findFirst({
      where: {
        tripId: validatedData.tripId,
        passenger: {
          userId
        }
      }
    });

    // Create the reservation
    const initialStatus = trip.autoApproveReservations ? 'APPROVED' : 'PENDING_APPROVAL';
    
    let reservation;
    
    if (existingReservation) {
      // If there's an existing reservation that was cancelled, update it instead of creating a new one
      if (['CANCELLED_BY_DRIVER', 'CANCELLED_BY_PASSENGER'].includes(existingReservation.reservationStatus)) {
        reservation = await prisma.tripPassenger.update({
          where: { id: existingReservation.id },
          data: {
            seatsReserved: validatedData.seatsReserved,
            totalPrice: validatedData.totalPrice,
            reservationMessage: validatedData.reservationMessage,
            reservationStatus: initialStatus
          }
        });
      } else {
        // The reservation exists and is not cancelled
        throw ServerActionError.ValidationFailed(
          'create-trip-reservation.ts',
          'createTripReservation',
          'Ya tienes una reservación para este viaje'
        );
      }
    } else {
      // Create a new reservation
      reservation = await prisma.tripPassenger.create({
        data: {
          tripId: validatedData.tripId,
          passengerId,
          seatsReserved: validatedData.seatsReserved,
          totalPrice: validatedData.totalPrice,
          reservationMessage: validatedData.reservationMessage,
          reservationStatus: initialStatus
        }
      });
    }

    // Check if the trip is now full and update its status if needed
    const newReservedSeats = reservedSeats + validatedData.seatsReserved;
    if (newReservedSeats >= trip.availableSeats) {
      await prisma.trip.update({
        where: { id: validatedData.tripId },
        data: { isFull: true }
      });
    }

    await logActionWithErrorHandling(
      {
        userId,
        action: TipoAccionUsuario.CREACION_VIAJE, // O crear un tipo específico para reservas
        status: 'SUCCESS',
        details: { 
          tripId: validatedData.tripId, 
          seatsReserved: validatedData.seatsReserved, 
          totalPrice: validatedData.totalPrice,
          reservationStatus: initialStatus
        }
      },
      {
        fileName: 'create-trip-reservation.ts',
        functionName: 'createTripReservation'
      }
    );

    return ApiHandler.handleSuccess(
      { reservationId: reservation.id },
      initialStatus === 'APPROVED' 
        ? 'Reservación aprobada automáticamente. Procede con el pago.'
        : 'Reservación enviada. Espera la aprobación del conductor.'
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      throw ServerActionError.ValidationFailed(
        'create-trip-reservation.ts',
        'createTripReservation',
        errorMessages
      );
    }
    
    throw error;
  }
}