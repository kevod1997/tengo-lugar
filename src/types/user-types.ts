import { Gender, VerificationStatus } from "@prisma/client"

interface CarInsurance {
  status: VerificationStatus | null;
  failureReason: string | null;
  hasFileKey: boolean;
  url?: string ;
  policy?: any;
}

export interface UserCar {
  id: string;
  plate: string;
  insurance: CarInsurance;
  brand: string;
  model: string;
  year: number ;
}

export interface FormattedUser {
  id: string;
  clerkId: string;
  firstName: string;
  lastName: string;
  birthDate: string | Date;
  age: number;
  email: string;
  gender: Gender;
  phone: string;
  profileImageKey: string | null;
  createdAt: string;
  updatedAt: string;
  identityStatus: VerificationStatus | null;
  licenseStatus: VerificationStatus | null;
  identityFailureReason: string | null;
  licenseFailureReason: string | null;
  hasIdentityCardFrontkey: boolean;
  hasIdentityCardBackKey: boolean;
  hasLicenseCardFrontkey: boolean;
  hasLicenseCardBackKey: boolean;
  termsAccepted: boolean;
  // Nuevos campos para los autos
  cars: UserCar[];
  hasRegisteredCar: boolean;
  allCarsInsured: boolean;
  hasPendingInsurance: boolean;
}

  export type FormattedUserForAdminDashboard = {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    createdAt: string
    identityStatus: VerificationStatus | null
    licenseStatus: VerificationStatus | null
    cars: UserCar[]
  }