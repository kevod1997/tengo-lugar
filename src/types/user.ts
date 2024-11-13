import { Gender, VerificationStatus } from "@prisma/client"

export interface FormattedUser {
    id: string
    clerkId: string
    firstName: string
    lastName: string
    birthDate: string | Date
    age: number
    email: string
    gender: Gender
    phone: string
    profileImageKey: string | null
    createdAt: string
    updatedAt: string
    identityStatus: VerificationStatus | null
    licenseStatus: VerificationStatus | null
    termsAccepted: boolean
  }