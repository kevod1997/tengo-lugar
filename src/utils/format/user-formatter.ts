import { FormattedUser, FormattedUserForAdminDashboard, UserCar } from "@/types/user-types";


export function getCars(user: any): UserCar[] {
  const cars = user.driver?.Car.map((driverCar: any) => ({
    id: driverCar.car.id,
    plate: driverCar.car.plate,
    brand: driverCar.car.carModel?.brand?.name || '',
    model: driverCar.car.carModel?.model || '',
    year: driverCar.car.carModel?.year || null,
    insurance: {
      status: driverCar.car.insuredCar?.currentPolicy?.status || null,
      failureReason: driverCar.car.insuredCar?.currentPolicy?.failureReason || null,
      hasFileKey: Boolean(driverCar.car.insuredCar?.currentPolicy?.fileKey),
      
    }
  })) || [];
  return cars;
}


export function formatUserResponse(user: any): FormattedUser {
  const cars = getCars(user);
  return {
    id: user.id,
    clerkId: user.clerkId,
    firstName: user.firstName,
    lastName: user.lastName,
    birthDate: user.birthDate,
    age: user.age,
    email: user.email,
    gender: user.gender,
    phone: user.phone,
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
    hasPendingInsurance: cars.some((car: UserCar) => car.insurance.status === 'PENDING')
  };
}

export function formatUserForAdminDashboard(user: any): FormattedUserForAdminDashboard {
  const cars = getCars(user);
  return {
    id: user.id,
    fullName: user.firstName + ' ' + user.lastName,
    email: user.email,
    phone: user.phone,
    createdAt: user.createdAt,
    identityStatus: user.identityCard?.status || null,
    licenseStatus: user.driver?.licence?.status || null,
    cars: cars
  };
}