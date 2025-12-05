'use client'

import { useState, useEffect } from 'react'

import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronDown, ChevronUp, Users, Calendar, DollarSign, Star } from 'lucide-react'

import { getReviewsForUser } from '@/actions/review/get-reviews-for-user'
import { ReviewCard } from '@/components/reviews/ReviewCard'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

import { QuickActions } from './QuickActions'



interface DriverTripHubProps {
  trip: {
    id: string
    status: string
    departureTime: Date
    origin: string
    destination: string
    chatRoomId?: string
    pricePerSeat: number
    confirmedPassengersCount: number
    availableSeats: number
  }
  googleMapsUrl: string
  userId: string
  autoOpenReview?: boolean
}

export function DriverTripHub({
  trip,
  googleMapsUrl,
  userId,
  autoOpenReview = false
}: DriverTripHubProps) {
  // Desktop (≥768px) should be open by default, mobile collapsed
  const [isOpen, setIsOpen] = useState(false)

  // Fetch driver's reviews for this trip (if completed)
  const { data: myReviews, isLoading: isLoadingReviews } = useQuery({
    queryKey: ['myReviews', trip.id, userId],
    queryFn: async () => {
      const result = await getReviewsForUser({
        userId,
        revieweeType: 'DRIVER',
      })

      if (!result.success || !result.data) {
        return []
      }

      // Filter reviews for this specific trip
      return result.data.reviews.filter((review: any) => review.trip.id === trip.id)
    },
    enabled: trip.status === 'COMPLETED',
  })

  // Set initial state based on screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsOpen(window.innerWidth >= 768)
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)

    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const isActive = ['PENDING', 'ACTIVE'].includes(trip.status)
  const showChat = isActive

  // Status badge configuration
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return {
          label: 'Completado',
          variant: 'default' as const,
          className: 'bg-green-500 hover:bg-green-600'
        }
      case 'ACTIVE':
        return {
          label: 'En curso',
          variant: 'default' as const,
          className: 'bg-blue-500 hover:bg-blue-600'
        }
      case 'PENDING':
        return {
          label: 'Pendiente',
          variant: 'secondary' as const,
          className: 'bg-amber-500 hover:bg-amber-600 text-white'
        }
      case 'CANCELLED':
        return {
          label: 'Cancelado',
          variant: 'destructive' as const,
          className: ''
        }
      default:
        return {
          label: status,
          variant: 'outline' as const,
          className: ''
        }
    }
  }

  const statusConfig = getStatusConfig(trip.status)

  // Calculate total earnings
  const totalEarnings = trip.pricePerSeat * trip.confirmedPassengersCount

  return (
    <Card className="border-slate-200 shadow-sm bg-blue-50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-blue-100 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900">
                    Tu viaje
                  </h3>
                  <Badge
                    variant={statusConfig.variant}
                    className={statusConfig.className}
                  >
                    {statusConfig.label}
                  </Badge>
                </div>

                {/* Collapsed summary info */}
                <div className="flex items-center gap-3 sm:gap-4 flex-wrap text-xs sm:text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span>{trip.confirmedPassengersCount}/{trip.availableSeats} pasajeros</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span>{format(new Date(trip.departureTime), "d 'de' MMMM, HH:mm", { locale: es })}</span>
                  </div>
                  <div className="flex items-center gap-1 font-semibold text-slate-900">
                    <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span>${totalEarnings.toLocaleString()} total</span>
                  </div>
                </div>
              </div>

              {/* Expand/Collapse icon */}
              <div className="ml-2">
                {isOpen ? (
                  <ChevronUp className="h-5 w-5 text-slate-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-slate-400" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-6">
            <Separator />

            {/* Trip Summary Section */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-900">Resumen del viaje</h4>
              <div className="bg-white rounded-lg p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Precio por asiento:</span>
                  <span className="font-semibold">${trip.pricePerSeat}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Pasajeros confirmados:</span>
                  <span className="font-semibold">{trip.confirmedPassengersCount} de {trip.availableSeats}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-900">Ingresos totales:</span>
                  <span className="font-bold text-green-600 text-lg">
                    ${totalEarnings.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Quick Actions */}
            <QuickActions
              tripStatus={trip.status}
              chatRoomId={trip.chatRoomId}
              googleMapsUrl={googleMapsUrl}
              tripId={trip.id}
              showChat={showChat}
              autoOpenReview={autoOpenReview}
            />

            {/* My Reviews Section - Only if trip is completed and driver has reviews */}
            {trip.status === 'COMPLETED' && myReviews && myReviews.length > 0 && (
              <>
                <Separator />
                <div id="mis-calificaciones" className="space-y-4 scroll-mt-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                    Tus calificaciones
                  </div>

                  {isLoadingReviews ? (
                    <div className="space-y-3">
                      <Skeleton className="h-32 w-full" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {myReviews.map((review: any) => (
                        <ReviewCard key={review.id} review={review} />
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
