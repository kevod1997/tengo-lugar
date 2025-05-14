type VehicleStatus = "PENDING" | "FAILED" | "VERIFIED" | null;

export function getVehicleStatus(cars: Array<any> = []): VehicleStatus {
  if (!cars?.length) return null;
  // Tercer chequeo: Estado de la información de combustible
  const carFuelStatus: VehicleStatus = cars.some(car => 
    car.fuelType === null || car.averageFuelConsume === null
  ) ? "PENDING" : "VERIFIED";
  
  if (carFuelStatus === "PENDING") return carFuelStatus;

  // Primer chequeo: Estado del seguro
  const insuranceStatus: VehicleStatus = 
    cars.some(car => car.insurance?.status === "PENDING") ? "PENDING" :
    cars.some(car => car.insurance?.status === "FAILED") ? "FAILED" :
    "VERIFIED";

  // Si el seguro no está verificado, retornamos su estado
  if (insuranceStatus !== "VERIFIED" && cars.some(car => car.insurance)) {
    return insuranceStatus;
  }

  // Segundo chequeo: Estado de la tarjeta
  const cardStatus: VehicleStatus = 
    cars.some(car => car.vehicleCard?.status === "PENDING") ? "PENDING" :
    cars.some(car => car.vehicleCard?.status === "FAILED") ? "FAILED" :
    "VERIFIED";

  return cardStatus;
}
