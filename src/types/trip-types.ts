// src/types/trip-types.ts
import { LuggageAllowance } from '@prisma/client'

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface TripData {
  driverCarId: string;
  
  // Location info
  originAddress?: string;
  originCity: string;
  originProvince: string;
  originCoords: Coordinates;
  
  destinationAddress?: string;
  destinationCity: string; 
  destinationProvince: string;
  destinationCoords: Coordinates;
  
  // Route info
  googleMapsUrl?: string;
  date: Date;
  departureTime: Date;
  price: number;
  priceGuide: number;
  distance: number;
  duration?: string;
  durationSeconds?: number;
  
  // Toll info
  hasTolls: boolean;
  tollEstimatedPrice?: number;
  
  // Trip preferences
  availableSeats: number;
  autoApproveReservations: boolean;
  luggageAllowance: LuggageAllowance;
  allowPets: boolean; 
  allowChildren: boolean;
  smokingAllowed: boolean;
  additionalNotes?: string;
}