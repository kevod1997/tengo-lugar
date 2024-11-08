import { FormattedUser } from '@/types/user'

export function formatUserResponse(user: any): FormattedUser {
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
    termsAccepted: Array.isArray(user.termsAcceptance) && user.termsAcceptance.length > 0
  }
}