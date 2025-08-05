'use server'

import { ApiHandler } from "@/lib/api-handler";
import { RoutesService } from "@/services/routes/routes-service";
import { RouteCalculationRequest } from "@/types/route-types";


export async function calculateRoute(routeData: RouteCalculationRequest) {
  const routesService = new RoutesService();

  try {
    const result = await routesService.calculateRoute({
      origin: routeData.origin,
      destination: routeData.destination,
      departureTime: routeData.departureTime,
      vehicleType: routeData.vehicleType,
    });

    return ApiHandler.handleSuccess(result);
  } catch (error) {
    return ApiHandler.handleError(error);
  }
}