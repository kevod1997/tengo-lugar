import { CardType, FileType, FuelType, Gender, VerificationStatus } from "@prisma/client"

interface CarInsurance {
  status: VerificationStatus | null;
  failureReason: string | null;
  hasFileKey: boolean;
  url?: string ;
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
  year: number ;
  vehicleCard: VehicleCardInfo | null;
  hasGreenCard: boolean;  
  hasBlueCard: boolean;  
  hasPendingCards: boolean;
}

export interface FormattedUser {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string | Date;
  age: number;
  email: string;
  gender: Gender;
  phoneNumber: string;
  phoneNumberVerified: boolean;
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
  hasAllRequiredCards: boolean;
  hasPendingCards: boolean; 
}

  export type FormattedUserForAdminDashboard = {
    id: string;
    profileImageUrl: string;
    fullName: string;
    email: string;
    phone: string;
    createdAt: string
    identityStatus: VerificationStatus | null
    licenseStatus: VerificationStatus | null
    cars: UserCar[]
  }