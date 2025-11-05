'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { UserProfileModal } from '@/components/user-profile-modal/UserProfileModal'
import { calculateAge } from '@/utils/helpers/calculate-age'
import { UserIcon, Star } from 'lucide-react'
import Image from 'next/image'

interface CoPassengerCardProps {
  passenger: {
    id: string
    passenger: {
      userId: string
      averageRating?: number
      totalReviews?: number
      totalTrips?: number
      user: {
        name: string
        profileImageKey?: string
        image?: string
        birthDate?: string
        gender?: string
      }
    }
  }
}

export function CoPassengerCard({ passenger }: CoPassengerCardProps) {
  const firstName = passenger.passenger.user.name.split(' ')[0]
  const profileImage = passenger.passenger.user.profileImageKey || passenger.passenger.user.image
  const age = passenger.passenger.user.birthDate
    ? calculateAge(passenger.passenger.user.birthDate)
    : undefined
  const gender = passenger.passenger.user.gender as "MASCULINO" | "FEMENINO" | "NO_BINARIO" | undefined

  return (
    <UserProfileModal
      userId={passenger.passenger.userId}
      name={firstName}
      profileImage={profileImage}
      age={age}
      gender={gender}
      primaryRole="passenger"
      tripStats={{
        asPassenger: {
          tripsCompleted: passenger.passenger.totalTrips || 0,
          rating: passenger.passenger.averageRating || 0,
          reviewCount: passenger.passenger.totalReviews || 0
        }
      }}
    >
      <div className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
        <Avatar className="h-12 w-12 sm:h-14 sm:w-14 border-2 border-white shadow-sm hover:scale-105 transition-transform">
          {profileImage ? (
            <AvatarImage asChild>
              <Image
                src={profileImage}
                alt={firstName}
                width={56}
                height={56}
                className="object-cover"
              />
            </AvatarImage>
          ) : (
            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white">
              <UserIcon className="h-5 w-5" />
            </AvatarFallback>
          )}
        </Avatar>

        <div className="text-center">
          <p className="text-xs sm:text-sm font-medium text-slate-900 truncate max-w-[80px]">
            {firstName}
          </p>
          {passenger.passenger.averageRating !== undefined && passenger.passenger.averageRating > 0 && (
            <div className="flex items-center justify-center gap-0.5 text-xs text-amber-600">
              <Star className="h-3 w-3 fill-amber-500" />
              <span className="font-medium">{passenger.passenger.averageRating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    </UserProfileModal>
  )
}
