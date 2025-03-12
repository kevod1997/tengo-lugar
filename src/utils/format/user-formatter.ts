import { FormattedUser, FormattedUserForAdminDashboard, UserCar } from "@/types/user-types";


export function getCars(user: any): UserCar[] {
  const cars = user.driver?.Car.map((driverCar: any) => ({
    id: driverCar.car.id,
    plate: driverCar.car.plate,
    brand: driverCar.car.carModel?.brand?.name || '',
    model: driverCar.car.carModel?.model || '',
    fuelType: driverCar.car.carModel?.fuelType || null,
    averageFuelConsume: driverCar.car.carModel?.averageFuelConsume || null,
    year: driverCar.car.carModel?.year || null,
    insurance: {
      status: driverCar.car.insuredCar?.currentPolicy?.status || null,
      failureReason: driverCar.car.insuredCar?.currentPolicy?.failureReason || null,
      hasFileKey: Boolean(driverCar.car.insuredCar?.currentPolicy?.fileKey),
    },
    vehicleCard: driverCar.vehicleCards?.[0] ? {
      id: driverCar.vehicleCards[0].id,
      cardType: driverCar.vehicleCards[0].cardType,
      status: driverCar.vehicleCards[0].status,
      failureReason: driverCar.vehicleCards[0].failureReason,
      hasFileKey: Boolean(driverCar.vehicleCards[0].fileKey),
      expirationDate: driverCar.vehicleCards[0].expirationDate,
    } : null,
    hasGreenCard: driverCar.vehicleCards?.[0]?.cardType === 'GREEN' &&
      driverCar.vehicleCards[0].status === 'VERIFIED' || false,
    hasBlueCard: driverCar.vehicleCards?.[0]?.cardType === 'BLUE' &&
      driverCar.vehicleCards[0].status === 'VERIFIED' || false,
    hasPendingCards: driverCar.vehicleCards?.[0]?.status === 'PENDING' || false
  })) || [];
  return cars;
}

export function splitFullName(fullName: string): { firstName: string; lastName: string } {
  // Eliminar espacios extras y dividir por espacios
  const nameParts = fullName.trim().split(/\s+/);

  // Si hay solo una palabra, es el nombre y no hay apellido
  if (nameParts.length === 1) {
    return {
      firstName: nameParts[0],
      lastName: ''
    };
  }

  // Si hay 2 palabras: la primera es nombre, la segunda apellido
  if (nameParts.length === 2) {
    return {
      firstName: nameParts[0],
      lastName: nameParts[1]
    };
  }

  // Si hay 3 palabras: las 2 primeras son nombre, la tercera apellido
  if (nameParts.length === 3) {
    return {
      firstName: `${nameParts[0]} ${nameParts[1]}`,
      lastName: nameParts[2]
    };
  }

  // Si hay 4 o más palabras: las 2 primeras son nombre, el resto apellido
  const firstName = `${nameParts[0]} ${nameParts[1]}`;
  const lastName = nameParts.slice(2).join(' ');

  return { firstName, lastName };
}

export function getUserAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const now = new Date();
  const age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    return age - 1;
  }
  return age;

}

export function formatUserResponse(user: any): FormattedUser {
  const cars = getCars(user);
  const { firstName, lastName } = splitFullName(user.name);
  const age = getUserAge(user.birthDate);

  return {
    id: user.id,
    firstName,
    lastName,
    birthDate: user.birthDate,
    age: age,
    email: user.email,
    gender: user.gender,
    phoneNumber: user.phoneNumber,
    phoneNumberVerified: user.phoneNumberVerified,
    profileImageKey: user.profileImageKey,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    identityStatus: user.identityCard?.status || null,
    licenseStatus: user.driver?.licence?.status || null,
    identityFailureReason: user.identityCard?.failureReason || null,
    licenseFailureReason: user.driver?.licence?.failureReason || null,
    hasIdentityCardFrontkey: user.identityCard?.frontFileKey ? true : false,
    hasIdentityCardBackKey: user.identityCard?.backFileKey ? true : false,
    hasLicenseCardFrontkey: user.driver?.licence?.frontFileKey ? true : false,
    hasLicenseCardBackKey: user.driver?.licence?.backFileKey ? true : false,
    termsAccepted: Array.isArray(user.termsAcceptance) && user.termsAcceptance.length > 0,
    cars,
    hasRegisteredCar: cars.length > 0,
    allCarsInsured: cars.length > 0 && cars.every((car: UserCar) => car.insurance.status === 'VERIFIED'),
    hasPendingInsurance: cars.some((car: UserCar) => car.insurance.status === 'PENDING'),
    hasAllRequiredCards: cars.length > 0 && cars.every((car: UserCar) =>
      car.hasGreenCard && car.hasBlueCard
    ),
    hasPendingCards: cars.some((car: UserCar) =>
      car.hasPendingCards
    )
  };
}

export function formatUserForAdminDashboard(user: any): FormattedUserForAdminDashboard {
  const cars = getCars(user);
  const { firstName, lastName } = splitFullName(user.name);
  return {
    id: user.id,
    profileImageUrl: user.profileImageKey || `${firstName.charAt(0)}${lastName.charAt(0) || ''}`,
    fullName: user.name,
    email: user.email,
    phone: user.phone,
    createdAt: user.createdAt,
    identityStatus: user.identityCard?.status || null,
    licenseStatus: user.driver?.licence?.status || null,
    cars: cars
  };
}