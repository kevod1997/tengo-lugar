import { ServiceError } from "@/lib/exceptions/service-error";

interface RouteRequest {
  origin: {
    latitude: number;
    longitude: number;
  };
  destination: {
    latitude: number;
    longitude: number;
  };
  vehicleInfo?: {
    emissionType: 'GASOLINE' | 'ELECTRIC' | 'HYBRID' | 'DIESEL';
  };
  tollPasses?: string[];
}

export class RoutesService {
  private readonly baseUrl = 'https://routes.googleapis.com/directions/v2:computeRoutes';

  constructor() {
    if (!process.env.GOOGLE_MAPS_API_KEY) {
      throw ServiceError.ConfigError('Google Maps API key is required', 'routes-service.ts', 'constructor');
    }
  }

  async calculateRoute(request: RouteRequest) {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY!,
          'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.travelAdvisory.tollInfo'
        },
        body: JSON.stringify({
          origin: {
            location: {
              latLng: {
                latitude: request.origin.latitude,
                longitude: request.origin.longitude
              }
            }
          },
          destination: {
            location: {
              latLng: {
                latitude: request.destination.latitude,
                longitude: request.destination.longitude
              }
            }
          },
          travelMode: "DRIVE",
          extraComputations: ["TOLLS"],
          routeModifiers: {
            vehicleInfo: request.vehicleInfo,
            tollPasses: request.tollPasses
          }
        })
      });

      if (!response.ok) {
        throw ServiceError.ExternalApiError('Failed to calculate route', 'routes-service.ts', 'calculateRoute');
      }

      return await response.json();
    } catch (error) {
      throw ServiceError.ExternalApiError(
        error instanceof Error ? error.message : 'Unknown error calculating route', 'routes-service.ts', 'calculateRoute'
      );
    }
  }
}