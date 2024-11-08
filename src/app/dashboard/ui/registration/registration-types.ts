import { IdentityCard, User, UserTermsAcceptance } from '@prisma/client'

export type UserRole = 'traveler' | 'driver'

export type Step = {
  id: string
  title: string
  component: React.ComponentType<any>
}

export type FormData = {
  role: UserRole | null
  personalInfo: any | null
  identityCard: any | null
  driverLicense?: any | null
}

export type UserFromDb = User & {
  identityCard: IdentityCard | null;
  termsAcceptance: UserTermsAcceptance[];
}