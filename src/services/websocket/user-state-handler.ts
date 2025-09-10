'use client'

import { VerificationStatus } from "@prisma/client"
import { eventType } from "@/types/websocket-events"

/**
 * Handle WebSocket events that update user state
 * Called from WebSocketProvider to update Zustand user store
 */
export function handleUserStateUpdate(data: any, updateUser: (userData: any) => void) {
  if (!data.eventType || !data.payload) {
    return
  }

  switch (data.eventType as eventType) {
    // 📄 Document Verification Events
    case 'identity_card_verified':
      updateUser({
        identityStatus: 'VERIFIED' as VerificationStatus,
        identityFailureReason: null
      })
      break

    case 'identity_card_rejected':
      updateUser({
        identityStatus: 'REJECTED' as VerificationStatus,
        identityFailureReason: data.payload.reason || 'Documento rechazado'
      })
      break

    case 'license_verified':
      updateUser({
        licenseStatus: 'VERIFIED' as VerificationStatus,
        licenseFailureReason: null,
        licenseExpireDate: data.payload.expireDate ? new Date(data.payload.expireDate) : null
      })
      break

    case 'license_rejected':
      updateUser({
        licenseStatus: 'REJECTED' as VerificationStatus,
        licenseFailureReason: data.payload.reason || 'Licencia rechazada'
      })
      break

    // 🚗 Vehicle Insurance Events
    case 'car_insurance_verified':
      if (data.payload.carId) {
        updateUser((currentUser: any) => ({
          cars: currentUser?.cars?.map((car: any) => 
            car.id === data.payload.carId
              ? {
                  ...car,
                  insurance: {
                    ...car.insurance,
                    status: 'VERIFIED' as VerificationStatus,
                    failureReason: null,
                    expireDate: data.payload.expireDate ? new Date(data.payload.expireDate) : null
                  }
                }
              : car
          ) || []
        }))
      }
      break

    case 'car_insurance_rejected':
      if (data.payload.carId) {
        updateUser((currentUser: any) => ({
          cars: currentUser?.cars?.map((car: any) => 
            car.id === data.payload.carId
              ? {
                  ...car,
                  insurance: {
                    ...car.insurance,
                    status: 'REJECTED' as VerificationStatus,
                    failureReason: data.payload.reason || 'Seguro rechazado'
                  }
                }
              : car
          ) || []
        }))
      }
      break

    // 🎫 Vehicle Card Events
    case 'vehicle_card_verified':
      if (data.payload.carId) {
        updateUser((currentUser: any) => ({
          cars: currentUser?.cars?.map((car: any) => 
            car.id === data.payload.carId && car.vehicleCard
              ? {
                  ...car,
                  vehicleCard: {
                    ...car.vehicleCard,
                    status: 'VERIFIED' as VerificationStatus,
                    failureReason: null
                  }
                }
              : car
          ) || []
        }))
      }
      break

    case 'vehicle_card_rejected':
      if (data.payload.carId) {
        updateUser((currentUser: any) => ({
          cars: currentUser?.cars?.map((car: any) => 
            car.id === data.payload.carId && car.vehicleCard
              ? {
                  ...car,
                  vehicleCard: {
                    ...car.vehicleCard,
                    status: 'REJECTED' as VerificationStatus,
                    failureReason: data.payload.reason || 'Tarjeta de circulación rechazada'
                  }
                }
              : car
          ) || []
        }))
      }
      break

    // 📞 Phone Verification Events
    case 'phone_verified':
      updateUser({
        phoneNumberVerified: true
      })
      break

    case 'phone_verification_failed':
      updateUser({
        phoneNumberVerified: false
      })
      break

    // 👤 Profile Update Events
    case 'profile_updated':
      if (data.payload.updatedFields) {
        updateUser(data.payload.updatedFields)
      }
      break

    // 📸 Profile Image Events
    case 'profile_image_updated':
      if (data.payload.profileImageKey) {
        updateUser({
          profileImageKey: data.payload.profileImageKey
        })
      }
      break

    // 🚗 Car Management Events
    case 'car_added':
      if (data.payload.car) {
        updateUser((currentUser: any) => ({
          cars: [...(currentUser?.cars || []), data.payload.car],
          hasRegisteredCar: true
        }))
      }
      break

    case 'car_removed':
      if (data.payload.carId) {
        updateUser((currentUser: any) => {
          const updatedCars = currentUser?.cars?.filter((car: any) => car.id !== data.payload.carId) || []
          return {
            cars: updatedCars,
            hasRegisteredCar: updatedCars.length > 0
          }
        })
      }
      break

    case 'car_updated':
      if (data.payload.carId && data.payload.updatedFields) {
        updateUser((currentUser: any) => ({
          cars: currentUser?.cars?.map((car: any) => 
            car.id === data.payload.carId
              ? { ...car, ...data.payload.updatedFields }
              : car
          ) || []
        }))
      }
      break

    // 📋 Terms and Conditions Events
    case 'terms_accepted':
      updateUser({
        termsAccepted: true
      })
      break

    default:
      console.warn(`[WS USER HANDLER] Unhandled event type: ${data.eventType}`)
      break
  }
}