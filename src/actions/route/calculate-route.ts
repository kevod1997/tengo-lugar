'use server'

import { ApiHandler } from "@/lib/api-handler";
import { RoutesService } from "@/services/routes/routes-service";

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface RouteCalculationRequest {
  origin: Coordinates;
  destination: Coordinates;
  vehicleType?: 'GASOLINE' | 'ELECTRIC' | 'HYBRID' | 'DIESEL';
  tollPasses?: string[];
}

export async function calculateRoute(routeData: RouteCalculationRequest) {
  const routesService = new RoutesService();
  
  try {
    const result = await routesService.calculateRoute({
      origin: routeData.origin,
      destination: routeData.destination,
      vehicleInfo: {
        emissionType: routeData.vehicleType || 'GASOLINE'
      },
      tollPasses: routeData.tollPasses
    });

    return ApiHandler.handleSuccess(result);
  } catch (error) {
    return ApiHandler.handleError(error);
  }
}