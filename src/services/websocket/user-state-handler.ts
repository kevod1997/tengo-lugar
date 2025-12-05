'use client'


import type { UserCarForStore } from "@/types/user-types"
import type { EventType } from "@/types/websocket-events"

import type { VerificationStatus } from "@prisma/client"

/**
 * Helper function to recalculate aggregated fields based on updated cars array
 */
function calculateAggregatedFields(cars: UserCarForStore[]) {
  return {
    hasRegisteredCar: cars.length > 0,
    allCarsInsured: cars.length > 0 && cars.every(car => car.insurance?.status === 'VERIFIED'),
    hasPendingInsurance: cars.some(car => car.insurance?.status === 'PENDING'),
    hasAllRequiredCards: cars.length > 0 && cars.every(car => car.hasGreenCard || car.hasBlueCard),
    hasPendingCards: cars.some(car => car.hasPendingCards || (car.vehicleCard?.status === 'PENDING')),
  }
}

/**
 * Helper function to update a specific car by plate and recalculate aggregated fields
 */
function updateCarByPlate(
  currentUser: any,
  carPlate: string,
  carUpdates: Partial<UserCarForStore>,
  updateUser: (userData: any) => void
) {
  if (!currentUser?.cars || !Array.isArray(currentUser.cars)) {
    console.warn('[WS USER HANDLER] No cars array found in user data');
    return;
  }

  const updatedCars = currentUser.cars.map((car: UserCarForStore) => {
    if (car.plate === carPlate) {
      return { ...car, ...carUpdates };
    }
    return car;
  });

  const aggregatedFields = calculateAggregatedFields(updatedCars);

  updateUser({
    cars: updatedCars,
    ...aggregatedFields
  });
}

/**
 * Handle WebSocket events that update user state
 * Called from WebSocketProvider to update Zustand user store
 */
export function handleUserStateUpdate(data: any, updateUser: (userData: any) => void, currentUser?: any) {
  console.log('[WS USER HANDLER] Received data:', data);
  if (!data.EventType || !data.payload) {
    console.warn('[WS USER HANDLER] Missing EventType or payload:', data);
    return
  }

  switch (data.EventType as EventType) {
    // 📄 Document Verification Events
    case 'identity_card_verified':
      updateUser({
        identityStatus: 'VERIFIED' as VerificationStatus,
      })
      break

    case 'identity_card_rejected':
      updateUser({
        identityStatus: 'FAILED' as VerificationStatus,
        identityFailureReason: data.payload.additionalData?.failureReason || 'Documento rechazado',
        hasIdentityCardFrontkey: !!data.payload.additionalData?.frontKey,
        hasIdentityCardBackKey: !!data.payload.additionalData?.backKey,
      })
      break

    case 'license_verified':
      updateUser({
        licenseStatus: 'VERIFIED' as VerificationStatus,
      })
      break

    case 'license_rejected':
      updateUser({
        licenseStatus: 'FAILED' as VerificationStatus,
        licenseFailureReason: data.payload.additionalData?.failureReason || 'Licencia rechazada',
        hasLicenseCardFrontkey: data.payload.additionalData?.frontKey,
        hasLicenseCardBackKey: data.payload.additionalData?.backKey,
      })
      break

    // 🚗 Vehicle Insurance Events
    case 'car_insurance_verified':
      {
        const carPlate = data.payload.additionalData?.carPlate;
        if (!carPlate) {
          console.warn('[WS USER HANDLER] Missing carPlate for car_insurance_verified');
          break;
        }

        updateCarByPlate(currentUser, carPlate, {
          insurance: {
            ...currentUser?.cars?.find((car: UserCarForStore) => car.plate === carPlate)?.insurance,
            status: 'VERIFIED' as VerificationStatus,
            failureReason: null,
            hasFileKey: true
          }
        }, updateUser);
      }
      break

    case 'car_insurance_rejected':
      {
        const carPlate = data.payload.additionalData?.carPlate;
        const failureReason = data.payload.additionalData?.failureReason;

        if (!carPlate) {
          console.warn('[WS USER HANDLER] Missing carPlate for car_insurance_rejected');
          break;
        }

        updateCarByPlate(currentUser, carPlate, {
          insurance: {
            ...currentUser?.cars?.find((car: UserCarForStore) => car.plate === carPlate)?.insurance,
            status: 'FAILED' as VerificationStatus,
            failureReason: failureReason || 'Seguro rechazado',
            hasFileKey: false
          }
        }, updateUser);
      }
      break

    // 🎫 Vehicle Card Events
    case 'vehicle_card_verified':
      {
        const carPlate = data.payload.additionalData?.carPlate;
        if (!carPlate) {
          console.warn('[WS USER HANDLER] Missing carPlate for vehicle_card_verified');
          break;
        }

        const currentCar = currentUser?.cars?.find((car: UserCarForStore) => car.plate === carPlate);
        const currentVehicleCard = currentCar?.vehicleCard;

        // Determine which card type was verified to update the correct hasXCard flag
        const cardType = currentVehicleCard?.cardType;
        const hasGreenCard = cardType === 'GREEN' ? true : currentCar?.hasGreenCard || false;
        const hasBlueCard = cardType === 'BLUE' ? true : currentCar?.hasBlueCard || false;

        updateCarByPlate(currentUser, carPlate, {
          vehicleCard: {
            ...currentVehicleCard,
            status: 'VERIFIED' as VerificationStatus,
            failureReason: null,
            hasFileKey: true
          } as any,
          hasGreenCard,
          hasBlueCard,
          hasPendingCards: false
        }, updateUser);
      }
      break

    case 'vehicle_card_rejected':
      {
        const carPlate = data.payload.additionalData?.carPlate;
        const failureReason = data.payload.additionalData?.failureReason;

        if (!carPlate) {
          console.warn('[WS USER HANDLER] Missing carPlate for vehicle_card_rejected');
          break;
        }

        const currentCar = currentUser?.cars?.find((car: UserCarForStore) => car.plate === carPlate);
        const currentVehicleCard = currentCar?.vehicleCard;

        updateCarByPlate(currentUser, carPlate, {
          vehicleCard: {
            ...currentVehicleCard,
            status: 'FAILED' as VerificationStatus,
            failureReason: failureReason || 'Tarjeta vehicular rechazada',
            hasFileKey: false
          } as any,
          hasPendingCards: false
        }, updateUser);
      }
      break

    default:
      console.warn(`[WS USER HANDLER] Unhandled event type: ${data.EventType}`)
      break
  }
}