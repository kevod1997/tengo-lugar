'use client';

import { useEffect, useRef } from 'react';
import { useUserStore } from '@/store/user-store'; 
import { authClient } from '@/lib/auth-client';
import { FormattedUser, UserCar } from '@/types/user-types';
import { SseEventData, DocumentVerificationUpdatePayload, ProfileImageUpdatePayload, GenericUserUpdatePayload } from '@/types/sse-types';
import { toast } from 'sonner';

// Funciones de utilidad (recalculateCarDerivedFields, recalculateUserCarAggregates)
// (Asegúrate de que la lógica interna de estas funciones sea correcta y coincida con tus necesidades)
function recalculateCarDerivedFields(car: UserCar): UserCar {
  const updatedCar = { ...car };
  const hasVerifiedGreenCard = updatedCar.vehicleCard?.cardType === 'GREEN' && updatedCar.vehicleCard?.status === 'VERIFIED';
  const hasVerifiedBlueCard = updatedCar.vehicleCard?.cardType === 'BLUE' && updatedCar.vehicleCard?.status === 'VERIFIED';
  updatedCar.hasGreenCard = hasVerifiedGreenCard;
  updatedCar.hasBlueCard = hasVerifiedBlueCard;
  const hasRequiredCard = hasVerifiedGreenCard || hasVerifiedBlueCard;
  const hasRequiredFuelInfo = updatedCar.fuelType !== null && updatedCar.averageFuelConsume !== null;
  const hasVerifiedInsurance = updatedCar.insurance.status === 'VERIFIED';
  const noPendingCards = !(updatedCar.vehicleCard?.status === 'PENDING');
  updatedCar.isFullyEnabled = hasRequiredCard && hasRequiredFuelInfo && hasVerifiedInsurance && noPendingCards;
  updatedCar.hasPendingCards = updatedCar.vehicleCard?.status === 'PENDING' || false;
  return updatedCar;
}

function recalculateUserCarAggregates(user: FormattedUser): FormattedUser {
  const updatedUser = { ...user };
  if (updatedUser.cars && updatedUser.cars.length > 0) {
    updatedUser.allCarsInsured = updatedUser.cars.every(car => car.insurance.status === 'VERIFIED');
    updatedUser.hasPendingInsurance = updatedUser.cars.some(car => car.insurance.status === 'PENDING');
    updatedUser.hasAllRequiredCards = updatedUser.cars.every(car => car.hasGreenCard || car.hasBlueCard);
    updatedUser.hasPendingCards = updatedUser.cars.some(car => car.hasPendingCards);
    updatedUser.hasEnabledCar = updatedUser.cars.some(car => car.isFullyEnabled);
  } else {
    updatedUser.allCarsInsured = false;
    updatedUser.hasPendingInsurance = false;
    updatedUser.hasAllRequiredCards = false;
    updatedUser.hasPendingCards = false;
    updatedUser.hasEnabledCar = false;
  }
  return updatedUser;
}


export function UserUpdatesListener() {
  const { data: session, isPending: isSessionLoading } = authClient.useSession();
  const { updateUser, setUser } = useUserStore();
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (isSessionLoading) return;

    const currentSessionUserId = session?.user?.id;

    if (currentSessionUserId && !eventSourceRef.current) {
      const es = new EventSource('/api/sse/user-updates');
      eventSourceRef.current = es;

      es.onopen = () => { console.log('UserUpdatesListener: SSE connection established.'); };
      //todo ver estos porque no funcionan puede ser que falte codigo
      // es.addEventListener('connection_established', (event: MessageEvent) => { /* ... */ });
      // es.addEventListener('ping', (event: MessageEvent) => { /* ... */ });

      // --- DEFINICIÓN DE HANDLERS DENTRO DEL USEEFFECT ---
      const handleUserVerificationUpdateInternal = (eventData: DocumentVerificationUpdatePayload) => {
        // La verificación de eventData.userId !== currentSessionUserId ya se hace en el listener genérico
        
        const baseUser = useUserStore.getState().user;
        if (!baseUser) {
            console.warn("UserUpdatesListener: No user in store for verification update.");
            return;
        }

        const partialUpdate: Partial<FormattedUser> = {};
        let notificationMessage = '';
        const notificationTitle = 'Actualización de Documento';
        let carsNeedRecalculation = false;

        // El switch ya se encarga de que eventData sea del tipo correcto para cada caso
        // porque los eventos SSE ya vienen con un 'eventName' específico.
        // El 'dataType' dentro del payload es para la lógica interna del handler.
        switch (eventData.dataType) {
          case 'IDENTITY':
            partialUpdate.identityStatus = eventData.status;
            partialUpdate.identityFailureReason = eventData.failureReason || null;
            partialUpdate.hasIdentityCardFrontkey = !!eventData.frontFileKey;
            partialUpdate.hasIdentityCardBackKey = !!eventData.backFileKey;
            notificationMessage = `Tu DNI ha sido ${eventData.status === 'VERIFIED' ? 'verificado' : 'rechazado'}.`;
            break;
          case 'LICENCE':
            partialUpdate.licenseStatus = eventData.status;
            partialUpdate.licenseFailureReason = eventData.failureReason || null;
            partialUpdate.hasLicenseCardFrontkey = !!eventData.frontFileKey;
            partialUpdate.hasLicenseCardBackKey = !!eventData.backFileKey;
            notificationMessage = `Tu licencia de conducir ha sido ${eventData.status === 'VERIFIED' ? 'verificada' : 'rechazada'}.`;
            break;
          case 'INSURANCE':
            if (eventData.carId && baseUser.cars) {
              const carIndex = baseUser.cars.findIndex(c => c.id === eventData.carId);
              if (carIndex > -1) {
                const updatedCars = JSON.parse(JSON.stringify(baseUser.cars));
                const carToUpdate = updatedCars[carIndex];
                carToUpdate.insurance.status = eventData.status;
                carToUpdate.insurance.failureReason = eventData.failureReason || null;
                carToUpdate.insurance.hasFileKey = !!eventData.frontFileKey;
                updatedCars[carIndex] = recalculateCarDerivedFields(carToUpdate);
                partialUpdate.cars = updatedCars;
                carsNeedRecalculation = true;
              }
            }
            notificationMessage = `El seguro de un vehículo ha sido ${eventData.status === 'VERIFIED' ? 'verificado' : 'rechazado'}.`;
            break;
          case 'CARD':
            if (eventData.carId && eventData.cardId && baseUser.cars) {
              const carIndex = baseUser.cars.findIndex(c => c.id === eventData.carId);
              if (carIndex > -1 && baseUser.cars[carIndex].vehicleCard?.id === eventData.cardId) {
                const updatedCars = JSON.parse(JSON.stringify(baseUser.cars));
                const carToUpdate = updatedCars[carIndex];
                const vehicleCardToUpdate = carToUpdate.vehicleCard!;
                vehicleCardToUpdate.status = eventData.status;
                vehicleCardToUpdate.failureReason = eventData.failureReason || null;
                vehicleCardToUpdate.hasFileKey = !!eventData.frontFileKey;
                carToUpdate.vehicleCard = vehicleCardToUpdate;
                updatedCars[carIndex] = recalculateCarDerivedFields(carToUpdate);
                partialUpdate.cars = updatedCars;
                carsNeedRecalculation = true;
              }
            }
            notificationMessage = `Una tarjeta de vehículo ha sido ${eventData.status === 'VERIFIED' ? 'verificada' : 'rechazada'}.`;
            break;
          // No necesitamos un default aquí porque el type guard ya lo manejó
        }

        if (Object.keys(partialUpdate).length > 0) {
          const finalUpdatePayload = { ...partialUpdate };
          if (carsNeedRecalculation && partialUpdate.cars) {
            const tempUserForRecalculation = { ...baseUser, ...partialUpdate }; // Aplicar cambios antes de recalcular agregados
            const userWithRecalculatedAggregates = recalculateUserCarAggregates(tempUserForRecalculation);
            finalUpdatePayload.allCarsInsured = userWithRecalculatedAggregates.allCarsInsured;
            finalUpdatePayload.hasPendingInsurance = userWithRecalculatedAggregates.hasPendingInsurance;
            finalUpdatePayload.hasAllRequiredCards = userWithRecalculatedAggregates.hasAllRequiredCards;
            finalUpdatePayload.hasPendingCards = userWithRecalculatedAggregates.hasPendingCards;
            finalUpdatePayload.hasEnabledCar = userWithRecalculatedAggregates.hasEnabledCar;
          }
          updateUser(finalUpdatePayload);
          toast.info(notificationTitle, { description: notificationMessage });
          console.log("UserUpdatesListener: Store updated for verification event", finalUpdatePayload);
        }
      };

      const handleProfileImageUpdateInternal = (eventData: ProfileImageUpdatePayload) => {
        // La verificación de eventData.userId !== currentSessionUserId ya se hace en el listener genérico
        updateUser({ profileImageKey: eventData.profileImageKey });
        toast.info('Perfil Actualizado', { description: 'Tu imagen de perfil ha cambiado.' });
        console.log("UserUpdatesListener: Store updated for profile image event", { profileImageKey: eventData.profileImageKey });
      };

      const handleGenericUserUpdateInternal = async (eventData: GenericUserUpdatePayload) => {
        // La verificación de eventData.userId !== currentSessionUserId ya se hace en el listener genérico
         if (eventData.updatedArea) {
            console.warn("UserUpdatesListener: Re-fetch logic for generic update needs to be implemented with setUser.");
            if(eventData.message) toast.info('Notificación Adicional', { description: eventData.message });
         } else if (eventData.message) {
            toast.info('Notificación', { description: eventData.message });
        }
      };

      // --- REGISTRO DE LISTENERS ---
      // El listener recibe el MessageEvent, parsea y luego llama al handler apropiado
      // haciendo un type assertion o usando type guards.

      const masterEventHandler = (event: MessageEvent, eventName: string) => {
        try {
          const parsedData = JSON.parse(event.data) as SseEventData;

          // Verificar que el evento sea para el usuario actual
          if (parsedData.userId !== currentSessionUserId) {
            console.warn(`SSE Listener (${eventName}): Event received for other user. Ignoring.`, { eventUserId: parsedData.userId, currentSessionUserId });
            return;
          }

          // Delegar al handler específico basado en el eventName (que coincide con el tipo esperado)
          // o basado en parsedData.dataType si siempre usas un eventName genérico como 'message'
          // Asumiendo que tus eventName coinciden con los que discriminan SseEventData
          if (eventName === 'user_verification_update' && 'dataType' in parsedData && 
              (parsedData.dataType === 'IDENTITY' || parsedData.dataType === 'LICENCE' || parsedData.dataType === 'INSURANCE' || parsedData.dataType === 'CARD')) {
            handleUserVerificationUpdateInternal(parsedData as DocumentVerificationUpdatePayload);
          } else if (eventName === 'profile_image_update' && 'dataType' in parsedData && parsedData.dataType === 'PROFILE_IMAGE') {
            handleProfileImageUpdateInternal(parsedData as ProfileImageUpdatePayload);
          } else if (eventName === 'generic_user_update' && 'dataType' in parsedData && parsedData.dataType === 'GENERIC_USER_DATA_UPDATE') {
            handleGenericUserUpdateInternal(parsedData as GenericUserUpdatePayload);
          } else {
            console.warn(`SSE Listener: Unhandled event name or mismatched data type for event '${eventName}'`, parsedData);
          }
        } catch (e) {
          console.error(`Error parsing or handling SSE event '${eventName}':`, e, "Raw Data:", event.data);
        }
      };
      
      if (eventSourceRef.current) {
        eventSourceRef.current.addEventListener('user_verification_update', (event) => masterEventHandler(event, 'user_verification_update'));
        eventSourceRef.current.addEventListener('profile_image_update', (event) => masterEventHandler(event, 'profile_image_update'));
        eventSourceRef.current.addEventListener('generic_user_update', (event) => masterEventHandler(event, 'generic_user_update'));
      }
      // --- FIN REGISTRO DE LISTENERS ---

      es.onerror = (error) => { console.error('UserUpdatesListener: SSE error:', error);};

    } else if (!isSessionLoading && !currentSessionUserId && eventSourceRef.current) {
      console.log('UserUpdatesListener: Session lost or user unauthenticated. Closing SSE connection.');
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    return () => {
      if (eventSourceRef.current) {
        console.log('UserUpdatesListener: useEffect cleanup. Closing SSE connection.');
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [isSessionLoading, session, updateUser, setUser]);

  return null;
}