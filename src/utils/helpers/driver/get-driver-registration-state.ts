import { FormattedUser } from "@/types/user-types";

interface DriverRegistrationState {
  isButtonDisabled: boolean;
  buttonText: string;
  statusMessage: string;
}

export function getDriverRegistrationState(user: FormattedUser): DriverRegistrationState {
  const allVerified = 
    user.identityStatus === 'VERIFIED' &&
    user.licenseStatus === 'VERIFIED' &&
    user.hasRegisteredCar &&
    user.allCarsInsured &&
    user.hasAllRequiredCards;

  const allPending = 
    user.identityStatus === 'PENDING' &&
    user.licenseStatus === 'PENDING' &&
    user.hasRegisteredCar &&
    user.hasPendingInsurance &&
    user.hasPendingCards;

  const mixedPendingAndVerified = 
    (user.identityStatus === 'PENDING' || user.identityStatus === 'VERIFIED') &&
    (user.licenseStatus === 'PENDING' || user.licenseStatus === 'VERIFIED') &&
    user.hasRegisteredCar &&
    (user.hasPendingInsurance || user.allCarsInsured) &&
    (user.hasPendingCards || user.hasAllRequiredCards);

  if (allVerified) {
    return {
      isButtonDisabled: true,
      buttonText: 'Registro Completado',
      statusMessage: 'Has completado todos los pasos del registro como conductor.'
    };
  }

  if (allPending) {
    return {
      isButtonDisabled: true,
      buttonText: 'Verificación en Proceso',
      statusMessage: 'Todos tus documentos están siendo verificados. Te notificaremos cuando estén listos.'
    };
  }

  if (mixedPendingAndVerified) {
    const pendingItems = [];
    if (user.identityStatus === 'PENDING') pendingItems.push('documento de identidad');
    if (user.licenseStatus === 'PENDING') pendingItems.push('licencia de conducir');
    if (user.hasPendingInsurance) pendingItems.push('seguro del vehículo');
    if (user.hasPendingCards) pendingItems.push('tarjeta vehicular');

    return {
      isButtonDisabled: true,
      buttonText: 'Verificación en Proceso',
      statusMessage: pendingItems.length > 0 
        ? `Se está verificando: ${pendingItems.join(', ')}. Te notificaremos cuando estén listos.`
        : 'Documentos en proceso de verificación.'
    };
  }

  // Si la identidad falló
  if (user.identityStatus === 'FAILED') {
    return {
      isButtonDisabled: false,
      buttonText: 'Volver a cargar Documento de Identidad',
      statusMessage: `Verificación fallida: ${user.identityFailureReason || 'Por favor, intente nuevamente'}`
    };
  }

  // Si la licencia falló
  if (user.licenseStatus === 'FAILED') {
    return {
      isButtonDisabled: false,
      buttonText: 'Volver a cargar Licencia de Conducir',
      statusMessage: `Verificación fallida: ${user.licenseFailureReason || 'Por favor, intente nuevamente'}`
    };
  }

  // Si falta registrar el vehículo
  if (!user.hasRegisteredCar) {
    return {
      isButtonDisabled: false,
      buttonText: 'Registrar Información del Vehículo',
      statusMessage: ''
    };
  }

  // Si falta el seguro
  if (user.hasRegisteredCar && !user.allCarsInsured && !user.hasPendingInsurance) {
    return {
      isButtonDisabled: false,
      buttonText: 'Cargar Seguro del Vehículo',
      statusMessage: ''
    };
  }

  // Si faltan las tarjetas vehiculares
  if (user.hasRegisteredCar && !user.hasAllRequiredCards && !user.hasPendingCards) {
    return {
      isButtonDisabled: false,
      buttonText: 'Cargar Tarjeta Vehicular',
      statusMessage: ''
    };
  }

  // Estado por defecto
  return {
    isButtonDisabled: false,
    buttonText: 'Continuar Registro de Conductor',
    statusMessage: ''
  };
}