// Tipos básicos de coordenadas
export interface Coordinates {
  latitude: number;
  longitude: number;
}

// Tipos específicos del vehículo
export type VehicleEmissionType = 'GASOLINE' | 'ELECTRIC' | 'HYBRID' | 'DIESEL';


// Tipos para información de ubicación
export interface LocationInfo {
  address: string;
  city: string;
  province: string;
}

// Tipos para solicitudes a la API
export interface RouteCalculationRequest {
  origin: Coordinates;
  destination: Coordinates;
  vehicleType: VehicleEmissionType;
  departureTime: Date;
}

// Tipos para respuestas de la API
export interface TollPrice {
  currencyCode: string;
  units: string;
  nanos: number;
}

export interface TollInfo {
  estimatedPrice: TollPrice[];
}

export interface RouteResponse {
  routes: Array<{
    duration: string;
    distanceMeters: number;
    travelAdvisory?: {
      tollInfo?: {
        estimatedPrice?: TollPrice[];
      };
    };
  }>;
}