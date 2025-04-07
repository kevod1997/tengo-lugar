// src/actions/trip/create-trip-reservation.ts
'use server'

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import prisma from "@/lib/prisma"
import { ApiHandler } from "@/lib/api-handler"
import { ServerActionError } from "@/lib/exceptions/server-action-error"
// import { ReservationStatus } from "@prisma/client"
import { z } from "zod"

const reservationSchema = z.object({
  tripId: z.string().uuid("ID de viaje inválido"),
  seatsReserved: z.number().int().min(1).max(4),
  reservationMessage: z.string().max(500).optional(),
  totalPrice: z.number().positive("El precio debe ser positivo")
})

export async function createTripReservation(formData: z.infer<typeof reservationSchema>) {
  try {
    // Validate input data
    const validatedData = reservationSchema.parse(formData)

    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      throw ServerActionError.AuthenticationFailed('create-trip-reservation.ts', 'createTripReservation')
    }

    // Run all operations in a transaction
    return await prisma.$transaction(async (tx) => {
      // Get user's passenger record or create if it doesn't exist
      const passenger = await tx.passenger.findUnique({
        where: { userId: session.user.id },
      })

      if (!passenger) {
        throw ServerActionError.ValidationFailed(
          'create-trip-reservation.ts',
          'createTripReservation',
          'No se encontró el perfil de pasajero para este usuario'
        )
      }

      // Get trip details and verify availability
      const trip = await tx.trip.findUnique({
        where: { id: validatedData.tripId },
        include: { 
          driverCar: {
            include: {
              driver: true
            }
          },
          passengers: true
        }
      })

      if (!trip) {
        throw ServerActionError.NotFound(
          'create-trip-reservation.ts', 
          'createTripReservation',
          'Viaje no encontrado'
        )
      }

      if(trip.driverCar.driver.userId === session.user.id) {
        throw ServerActionError.ValidationFailed(
            'create-trip-reservation.ts',
            'createTripReservation',
            'No puedes reservar tu propio viaje'
            )
        }

      // Check if trip is active
      if (trip.status !== 'ACTIVE' && trip.status !== 'PENDING') {
        throw ServerActionError.ValidationFailed(
          'create-trip-reservation.ts',
          'createTripReservation',
          'Este viaje no está disponible para reservas'
        )
      }

      // Check if there are enough seats available
      const seatsReserved = trip.passengers.reduce(
        (sum, p) => sum + (p.reservationStatus !== 'REJECTED' && p.reservationStatus !== 'CANCELLED_BY_PASSENGER' ? p.seatsReserved : 0),
        0
      )
      
      const remainingSeats = trip.availableSeats - seatsReserved
      
      if (remainingSeats < validatedData.seatsReserved) {
        throw ServerActionError.ValidationFailed(
          'create-trip-reservation.ts',
          'createTripReservation',
          `Solo hay ${remainingSeats} asientos disponibles`
        )
      }

      // Check if user already has a reservation for this trip
      const existingReservation = await tx.tripPassenger.findFirst({
        where: {
          tripId: validatedData.tripId,
          passengerId: passenger.id,
          reservationStatus: {
            notIn: ['REJECTED', 'CANCELLED_BY_PASSENGER']
          }
        }
      })

      if (existingReservation) {
        throw ServerActionError.ValidationFailed(
          'create-trip-reservation.ts',
          'createTripReservation',
          'Ya tienes una reserva activa para este viaje'
        )
      }

      // Create the reservation
      const reservation = await tx.tripPassenger.create({
        data: {
          tripId: validatedData.tripId,
          passengerId: passenger.id,
          reservationStatus: trip.autoApproveReservations ? 'APPROVED' : 'PENDING_APPROVAL',
          seatsReserved: validatedData.seatsReserved,
          totalPrice: validatedData.totalPrice,
          reservationMessage: validatedData.reservationMessage
        }
      })

      return ApiHandler.handleSuccess(
        { 
          reservationId: reservation.id,
          status: reservation.reservationStatus
        },
        trip.autoApproveReservations 
          ? 'Reserva aprobada automáticamente. Por favor, complete el pago.'
          : 'Solicitud de reserva enviada. Espere la confirmación del conductor.'
      )
    })
  } catch (error) {
    return ApiHandler.handleError(error)
  }
}