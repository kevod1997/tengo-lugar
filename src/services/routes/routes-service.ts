import { ServiceError } from "@/lib/exceptions/service-error";
import { RouteCalculationRequest, RouteResponse } from "@/types/route-types";

export class RoutesService {
  private readonly baseUrl = 'https://routes.googleapis.com/directions/v2:computeRoutes';
  private readonly apiKey: string;

  constructor() {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      throw ServiceError.ConfigError(
        'Google Maps API key is required',
        'routes-service.ts',
        'constructor'
      );
    }

    this.apiKey = apiKey;
  }



  async calculateRoute(request: RouteCalculationRequest): Promise<RouteResponse> {
    console.log('Calculating route with request:', JSON.stringify(request, null, 2));
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': this.apiKey,
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
          routingPreference: "TRAFFIC_AWARE",
          departureTime: request.departureTime,
          extraComputations: ["TOLLS"],
          routeModifiers: {
            vehicleInfo: {
              "emissionType": request.vehicleType,
            }
          }
        }),
        cache: 'no-store'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw ServiceError.ExternalApiError(
          `Failed to calculate route: ${response.status} ${errorText}`,
          'routes-service.ts',
          'calculateRoute'
        );
      }

      const data = await response.json();
      console.log('Route API response:', JSON.stringify(data, null, 2));

      return data;
    } catch (error) {
      console.log('Error calculating route:', error);
      if (error instanceof ServiceError) {
        throw error;
      }

      throw ServiceError.ExternalApiError(
        error instanceof Error ? error.message : 'Unknown error calculating route',
        'routes-service.ts',
        'calculateRoute'
      );
    }
  }
}