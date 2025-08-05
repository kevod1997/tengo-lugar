// src/schemas/validation/trip-schema.ts
import { z } from 'zod'
import { LuggageAllowance } from '@prisma/client'

// Base coordinates validation
const coordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180)
})

// Schema for trip creation
export const tripCreationSchema = z.object({
  // Car selection
  driverCarId: z.string().uuid('ID de vehículo inválido'),
  
  // Location details
  originAddress: z.string().optional(),
  originCity: z.string().min(2, 'Ciudad de origen requerida'),
  originProvince: z.string().min(2, 'Provincia de origen requerida'),
  originCoords: coordinatesSchema,
  
  destinationAddress: z.string().optional(),
  destinationCity: z.string().min(2, 'Ciudad de destino requerida'),
  destinationProvince: z.string().min(2, 'Provincia de destino requerida'),
  destinationCoords: coordinatesSchema,
  
  // Route details
  googleMapsUrl: z.string().url().optional(),
  distance: z.number().positive('Distancia debe ser positiva'),
  duration: z.string().optional(),
  durationSeconds: z.number().int().positive().optional(),
  
  // Date and time - with additional validation for future date
  date: z.date().refine(date => date > new Date(), 'La fecha debe ser en el futuro'),
  departureTime: z.date().refine(date => date > new Date(), 'La hora debe ser en el futuro'),
  
  // Pricing
  price: z.number().positive('El precio debe ser positivo'),
  priceGuide: z.number().positive('El precio guía debe ser positivo'),
  hasTolls: z.boolean().default(false),
  tollEstimatedPrice: z.number().optional(),
  
  // Trip preferences
  availableSeats: z.number().int().min(1).max(4),
  autoApproveReservations: z.boolean().default(false),
  luggageAllowance: z.nativeEnum(LuggageAllowance).default('MEDIUM'),
  allowPets: z.boolean().default(false),
  allowChildren: z.boolean().default(true),
  smokingAllowed: z.boolean().default(false),
  additionalNotes: z.string().max(500).optional()
})

export type TripCreationInput = z.input<typeof tripCreationSchema>
export type TripCreationOutput = z.output<typeof tripCreationSchema>