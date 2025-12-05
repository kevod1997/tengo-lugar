import type { CardType, FileType, FuelType, Gender, VerificationStatus } from "@prisma/client"

interface CarInsurance {
  status: VerificationStatus | null;
  expireDate: Date | null;
  failureReason: string | null;
  hasFileKey: boolean;
  url?: string;
  policy?: any;
}

interface VehicleCardInfo {
  id: string;
  cardType: CardType;
  status: VerificationStatus;
  failureReason: string | null;
  hasFileKey: boolean;
  expirationDate: string | Date;
  fileType: FileType;
  url?: string;
}

export interface UserCar {
  id: string;
  plate: string;
  insurance: CarInsurance;
  brand: string;
  model: string;
  fuelType: FuelType | null;
  averageFuelConsume: number | null;
  year: number | null;
  vehicleCard: VehicleCardInfo | null;
  hasGreenCard: boolean;
  hasBlueCard: boolean;
  hasPendingCards: boolean;
  isFullyEnabled?: boolean;
}

// Simplified car type for Zustand store (removes sensitive/unnecessary data)
export interface UserCarForStore {
  plate: string;  // Primary identifier (no UUID)
  brand: string;
  model: string;
  year: number | null;
  insurance: {
    status: VerificationStatus | null;
    expireDate: Date | null;
    failureReason: string | null;
    hasFileKey: boolean;  // Needed for registration UX
  };
  vehicleCard: {
    cardType: CardType;
    status: VerificationStatus;
    failureReason: string | null;
    expirationDate: Date | null | undefined;
    hasFileKey: boolean;  // Needed for registration UX
  } | null;
  hasGreenCard: boolean;
  hasBlueCard: boolean;
  hasPendingCards: boolean;
}

export interface FormattedUser {
  hasBirthDate: boolean;
  age: number | null;
  gender: Gender | null;
  hasPhoneNumber: boolean;
  phoneNumberVerified: boolean;
  profileImageKey: string | null;
  createdAt: string;
  updatedAt: string;
  identityStatus: VerificationStatus | null;
  licenseStatus: VerificationStatus | null;
  licenseExpireDate: Date | null;
  identityFailureReason: string | null;
  licenseFailureReason: string | null;
  hasIdentityCardFrontkey: boolean;
  hasIdentityCardBackKey: boolean;
  hasLicenseCardFrontkey: boolean;
  hasLicenseCardBackKey: boolean;
  termsAccepted: boolean;
  cars: UserCarForStore[];  
  hasRegisteredCar: boolean;
  allCarsInsured: boolean;
  hasPendingInsurance: boolean;
  hasAllRequiredCards: boolean;
  hasPendingCards: boolean;
}

export type FormattedUserForAdminDashboard = {
  id: string;
  profileImageUrl: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
  identityStatus: VerificationStatus | null;
  licenseStatus: VerificationStatus | null;
  cars: UserCar[];
}
